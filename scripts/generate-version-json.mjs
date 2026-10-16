#!/usr/bin/env node
/**
 * A-LAND｜Gate D7 真实版本溯源与内容审核运行时统计生成器 (scripts/generate-version-json.mjs)
 *
 * D7-03 核心要求：
 *   1. 以 CF_PAGES_COMMIT_SHA / GITHUB_SHA 作为构建提交身份，确保部署版本 commitSha 与本次构建提交严格一致。
 *   2. 构建状态 (buildStatus) 只能在实际测试与构建全部通过后 (--mode runtime --gates-passed) 标记为 VERIFIED_QUALITY_GATE_PASSED。
 *   3. 内容审核统计必须来自真实运行逻辑 (实时加载并执行 ContentAuditRegistry.ts 的 getAllRecords / validateAuditRecord / canRenderContent)，
 *      严禁使用正则表达式统计源代码字符串数量。
 *   4. 严禁尝试把包含自身 SHA 的 version.json 反复 amend 进同一个 Git 提交。
 *   5. 明确区分 Git 提交中的模板元数据 (metadataKind: 'GIT_COMMIT_TEMPLATE', 位于 public/version.json)
 *      与实际部署时生成的运行元数据 (metadataKind: 'RUNTIME_DEPLOYMENT_METADATA', 位于 dist/version.json)。
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const args = process.argv.slice(2);

let mode = 'template'; // 'template' | 'runtime'
let gatesPassed = false;
let outFile = '';
let explicitCommitSha = '';
let rollbackFromSha = '';
let rollbackToSha = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--mode' && args[i + 1]) {
    mode = args[++i];
  } else if (args[i] === '--gates-passed') {
    gatesPassed = true;
  } else if (args[i] === '--out' && args[i + 1]) {
    outFile = args[++i];
  } else if (args[i] === '--commit-sha' && args[i + 1]) {
    explicitCommitSha = args[++i];
  } else if (args[i] === '--rollback-from' && args[i + 1]) {
    rollbackFromSha = args[++i];
  } else if (args[i] === '--rollback-to' && args[i + 1]) {
    rollbackToSha = args[++i];
  }
}

const rootDir = process.cwd();
const fallbackGitDir = process.env.A_LAND_GIT_WORKDIR || '/home/voga/A-LAND';

function tryExec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

/**
 * D7-03: 以 CF_PAGES_COMMIT_SHA / GITHUB_SHA 作为权威构建提交身份
 */
function resolveRuntimeCommitIdentity() {
  if (explicitCommitSha && /^[0-9a-f]{40}$/i.test(explicitCommitSha)) {
    return { sha: explicitCommitSha.toLowerCase(), source: 'EXPLICIT_ARG' };
  }
  if (process.env.CF_PAGES_COMMIT_SHA && /^[0-9a-f]{40}$/i.test(process.env.CF_PAGES_COMMIT_SHA)) {
    return { sha: process.env.CF_PAGES_COMMIT_SHA.toLowerCase(), source: 'CF_PAGES_COMMIT_SHA' };
  }
  if (process.env.GITHUB_SHA && /^[0-9a-f]{40}$/i.test(process.env.GITHUB_SHA)) {
    return { sha: process.env.GITHUB_SHA.toLowerCase(), source: 'GITHUB_SHA' };
  }
  const localHead = tryExec('git rev-parse HEAD');
  if (localHead && /^[0-9a-f]{40}$/i.test(localHead)) {
    return { sha: localHead.toLowerCase(), source: 'GIT_HEAD' };
  }
  const mirrorHead = tryExec(`git -C "${fallbackGitDir}" rev-parse HEAD`);
  if (mirrorHead && /^[0-9a-f]{40}$/i.test(mirrorHead)) {
    return { sha: mirrorHead.toLowerCase(), source: 'GIT_WORKDIR_HEAD' };
  }
  throw new Error('[generate-version-json] 无法解析有效的 40 位构建提交 SHA！');
}

function resolveBranch() {
  if (process.env.CF_PAGES_BRANCH) return process.env.CF_PAGES_BRANCH;
  if (process.env.GITHUB_REF_NAME) return process.env.GITHUB_REF_NAME;
  const localBranch = tryExec('git rev-parse --abbrev-ref HEAD');
  if (localBranch && localBranch !== 'HEAD') return localBranch;
  const mirrorBranch = tryExec(`git -C "${fallbackGitDir}" rev-parse --abbrev-ref HEAD`);
  if (mirrorBranch && mirrorBranch !== 'HEAD') return mirrorBranch;
  return 'preview';
}

/**
 * D7-03: 通过真实运行逻辑执行 ContentAuditRegistry.ts，严禁通过源码字符串正则计数
 */
function evaluateContentAuditAtRuntime() {
  let esbuild;
  try {
    esbuild = require('esbuild');
  } catch {
    esbuild = require('/tmp/qingyu_deps/node_modules/esbuild');
  }

  const entryPoint = path.resolve(rootDir, 'src/domain/cognitive/ContentAuditRegistry.ts');
  const buildResult = esbuild.buildSync({
    entryPoints: [entryPoint],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    logLevel: 'silent',
  });

  const bundledCode = buildResult.outputFiles[0].text;
  const mod = { exports: {} };
  const sandbox = {
    module: mod,
    exports: mod.exports,
    require,
    process,
    Buffer,
    TextEncoder,
    TextDecoder,
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(bundledCode, sandbox);

  const { ContentAuditRegistry, validateAuditRecord } = mod.exports;
  if (!ContentAuditRegistry || typeof ContentAuditRegistry.getAllRecords !== 'function') {
    throw new Error('[generate-version-json] 无法从 ContentAuditRegistry 运行时实例获取 getAllRecords()');
  }

  // 重置为生产默认种子状态后读取真实运行态记录
  ContentAuditRegistry.resetToDefault();
  const records = ContentAuditRegistry.getAllRecords();

  let pendingCount = 0;
  let verifiedPassedCount = 0;
  let rejectedOrRevokedCount = 0;
  let renderableInChildModeCount = 0;
  const riskTierBreakdown = {
    LOW_EXPLORATION: 0,
    MEDIUM_FAMILY_PEER_PRIVACY: 0,
    HIGH_SAFETY_CRISIS: 0,
  };

  for (const rec of records) {
    const validation = validateAuditRecord(rec, rec.versionSha256, rec.sceneVersion);
    const canRender = ContentAuditRegistry.canRenderContent(
      { contentId: rec.contentId, sceneVersion: rec.sceneVersion },
      rec.versionSha256,
      rec.sceneVersion,
    );

    if (canRender) {
      renderableInChildModeCount++;
    }
    if (rec.isRevoked || rec.auditStatus === 'REJECTED') {
      rejectedOrRevokedCount++;
    } else if (rec.auditStatus === 'PASSED' && validation.isValid) {
      verifiedPassedCount++;
    } else if (rec.auditStatus === 'PENDING') {
      pendingCount++;
    }

    if (rec.riskTier && Object.prototype.hasOwnProperty.call(riskTierBreakdown, rec.riskTier)) {
      riskTierBreakdown[rec.riskTier]++;
    }
  }

  const gateStatus =
    verifiedPassedCount === 0 && renderableInChildModeCount === 0
      ? 'FAIL_CLOSED_PENDING_AUDIT'
      : 'PARTIAL_OR_CUSTOM';

  return {
    gateStatus,
    summary: {
      evaluationMethod: 'RUNTIME_REGISTRY_EXECUTION',
      totalRegisteredItems: records.length,
      pendingReviewCount: pendingCount,
      passedCount: verifiedPassedCount,
      rejectedOrRevokedCount,
      renderableInChildModeCount,
      riskTierBreakdown,
      defaultChildModePolicy: 'FAIL_CLOSED_BLOCK_UNAPPROVED',
    },
  };
}

function resolveSafeRollbackTarget() {
  const whitelistPath = path.resolve(rootDir, 'scripts/rollback-whitelist.json');
  if (fs.existsSync(whitelistPath)) {
    try {
      const wl = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
      const approved = wl.approvedSafeTargets || [];
      if (approved.length > 0) {
        const latestApproved = approved[approved.length - 1];
        return typeof latestApproved === 'string' ? latestApproved : latestApproved.sha;
      }
    } catch {
      // ignore parse error
    }
  }
  throw new Error('[generate-version-json] scripts/rollback-whitelist.json 中无可用安全回滚白名单目标！');
}

const branch = resolveBranch();
const auditRuntime = evaluateContentAuditAtRuntime();
const safeRollbackSha = resolveSafeRollbackTarget();

if (mode === 'template') {
  const templateOutputPath = outFile
    ? path.resolve(rootDir, outFile)
    : path.resolve(rootDir, 'public/version.json');

  const templateMetadata = {
    project: 'qingyu-island-preview',
    repository: 'megakii789-ux/A-LAND',
    metadataKind: 'GIT_COMMIT_TEMPLATE',
    branch,
    productionHoldBranch: 'public-hold',
    commitSha: 'RESOLVED_AT_BUILD_TIME_VIA_CF_PAGES_OR_GITHUB_SHA',
    shortCommitSha: 'TEMPLATE',
    commitIdentitySource: 'CF_PAGES_COMMIT_SHA | GITHUB_SHA | GIT_HEAD',
    deploymentTimestamp: null,
    buildStatus: 'TEMPLATE_PENDING_GATE_VERIFICATION',
    releaseGateStatus: 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
    releaseApprovalStatus: 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
    contentAuditGate: auditRuntime.gateStatus,
    contentAuditSummary: auditRuntime.summary,
    remoteHelpRelayStatus: 'FAIL_CLOSED_503',
    mode: 'local-only-verified',
    remoteRelayEnabled: false,
    cloudSyncEnabled: false,
    accessControlRequired: true,
    pwaPrivatePreviewHtmlCache: 'DISABLED_BY_GATE_D6',
    rollbackPolicy: 'WHITELIST_ONLY_F8C74019_REVOKED',
    rollbackTargetSha: safeRollbackSha,
    ...(rollbackFromSha && rollbackToSha
      ? {
          rollbackLineage: {
            rolledBackFromSha: rollbackFromSha,
            rolledBackToVerifiedSha: rollbackToSha,
          },
        }
      : {}),
    previewDomainSuggested: 'https://preview.qingyu-island-preview.pages.dev',
    buildToolchain: {
      node: 'v20.20.2',
      vite: '8.3.4',
      typescript: '7.0.2',
      vitest: '5.0.4',
      esbuild: '0.28.2',
    },
  };

  fs.mkdirSync(path.dirname(templateOutputPath), { recursive: true });
  fs.writeFileSync(templateOutputPath, JSON.stringify(templateMetadata, null, 2) + '\n', 'utf8');
  console.log(
    `[generate-version-json] Wrote GIT_COMMIT_TEMPLATE -> ${path.relative(rootDir, templateOutputPath)} (audit=${auditRuntime.gateStatus}, total=${auditRuntime.summary.totalRegisteredItems}, pending=${auditRuntime.summary.pendingReviewCount}, renderable=${auditRuntime.summary.renderableInChildModeCount})`,
  );
} else if (mode === 'runtime') {
  if (!gatesPassed) {
    console.error(
      '[FATAL] D7-03 违规拦截：--mode runtime 必须在 TypeScript、Vitest 与 Vite 构建全部通过后携带 --gates-passed 调用！',
    );
    process.exit(1);
  }

  const runtimeOutputPath = outFile
    ? path.resolve(rootDir, outFile)
    : path.resolve(rootDir, 'dist/version.json');

  // 如果输出到 dist/version.json，确保 dist/index.html 已由 vite build 成功生成
  if (runtimeOutputPath.endsWith(path.join('dist', 'version.json'))) {
    const distIndex = path.resolve(path.dirname(runtimeOutputPath), 'index.html');
    if (!fs.existsSync(distIndex)) {
      console.error(
        `[FATAL] D7-03 违规拦截：未检测到构建产物 ${distIndex}，严禁在 vite build 完成前标记构建成功！`,
      );
      process.exit(1);
    }
  }

  const identity = resolveRuntimeCommitIdentity();
  const nowIso = new Date().toISOString();

  // Preserve rollbackLineage from template if present
  let existingRollbackLineage;
  const templatePath = path.resolve(rootDir, 'public/version.json');
  if (fs.existsSync(templatePath)) {
    try {
      const tpl = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
      if (tpl.rollbackLineage) {
        existingRollbackLineage = tpl.rollbackLineage;
      }
    } catch {
      // ignore
    }
  }

  const runtimeMetadata = {
    project: 'qingyu-island-preview',
    repository: 'megakii789-ux/A-LAND',
    metadataKind: 'RUNTIME_DEPLOYMENT_METADATA',
    branch,
    productionHoldBranch: 'public-hold',
    commitSha: identity.sha,
    shortCommitSha: identity.sha.slice(0, 12),
    commitIdentitySource: identity.source,
    deploymentTimestamp: nowIso,
    buildStatus: 'VERIFIED_QUALITY_GATE_PASSED',
    releaseGateStatus: 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
    releaseApprovalStatus: 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
    artDirectorQaGate: 'ART_DIRECTOR_QA_HOLD',
    engineeringPilotGate: 'ENGINEERING_PILOT_PASS',
    contentQaReviewFlag: 'CONTENT_QA_REVIEW',
    visualAssetFactoryVersion: 'A_LAND_V2_ASSET_FACTORY_V0_1_20261016',
    visualPilotVersion: 'A_LAND_V2_2_STORY_CUP_ENGINEERING_ASSETS_AND_STAGE_COMMANDS_20261016',
    visualPilotModule: 'StoryGrove::cup-size',
    visualReviewRoute: '/visual-v2-review',
    visualPilotRoute: '/visual-v2-review/story-cup-pilot',
    contentAuditGate: auditRuntime.gateStatus,
    contentAuditSummary: auditRuntime.summary,
    remoteHelpRelayStatus: 'FAIL_CLOSED_503',
    mode: 'local-only-verified',
    remoteRelayEnabled: false,
    cloudSyncEnabled: false,
    accessControlRequired: true,
    pwaPrivatePreviewHtmlCache: 'DISABLED_BY_GATE_D6',
    rollbackPolicy: 'WHITELIST_ONLY_F8C74019_REVOKED',
    rollbackTargetSha: safeRollbackSha,
    ...(rollbackFromSha && rollbackToSha
      ? {
          rollbackLineage: {
            rolledBackFromSha: rollbackFromSha,
            rolledBackToVerifiedSha: rollbackToSha,
            rolledBackAt: nowIso,
          },
        }
      : existingRollbackLineage
        ? { rollbackLineage: existingRollbackLineage }
        : {}),
    previewDomainSuggested: 'https://preview.qingyu-island-preview.pages.dev',
    buildToolchain: {
      node: process.version,
      vite: '8.3.4',
      typescript: '7.0.2',
      vitest: '5.0.4',
      esbuild: '0.28.2',
    },
    updatedAt: nowIso,
  };

  fs.mkdirSync(path.dirname(runtimeOutputPath), { recursive: true });
  fs.writeFileSync(runtimeOutputPath, JSON.stringify(runtimeMetadata, null, 2) + '\n', 'utf8');
  console.log(
    `[generate-version-json] Wrote RUNTIME_DEPLOYMENT_METADATA -> ${path.relative(rootDir, runtimeOutputPath)} commitSha=${identity.sha} (source=${identity.source}) audit=${auditRuntime.gateStatus} (${auditRuntime.summary.pendingReviewCount}/${auditRuntime.summary.totalRegisteredItems} PENDING, renderable=${auditRuntime.summary.renderableInChildModeCount})`,
  );
} else {
  console.error(`[ERROR] 未知的 --mode 参数: ${mode} (仅支持 template 或 runtime)`);
  process.exit(1);
}
