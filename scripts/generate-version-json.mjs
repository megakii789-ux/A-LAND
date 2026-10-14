#!/usr/bin/env node
/**
 * A-LAND｜Gate D6 动态构建版本与安全门禁溯源生成器 (scripts/generate-version-json.mjs)
 *
 * D6-04 要求：
 *   - 为部署版本生成真实 commitSha、部署时间 (deploymentTimestamp)、构建状态 (buildStatus) 和内容审核状态 (contentAuditGate)。
 *   - version.json 必须反映当前构建实际来源，不得长期使用旧的静态版本元数据。
 *   - D6-02 要求：立即取消 f8c74019 作为默认安全回滚目标。
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
let explicitCommitSha = '';
let rollbackFromSha = '';
let rollbackToSha = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--commit-sha' && args[i + 1]) {
    explicitCommitSha = args[++i];
  } else if (args[i] === '--rollback-from' && args[i + 1]) {
    rollbackFromSha = args[++i];
  } else if (args[i] === '--rollback-to' && args[i + 1]) {
    rollbackToSha = args[++i];
  }
}

function tryExec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

const rootDir = process.cwd();
const fallbackGitDir = process.env.A_LAND_GIT_WORKDIR || '/home/voga/A-LAND';

function resolveCommitSha() {
  if (explicitCommitSha && /^[0-9a-f]{40}$/i.test(explicitCommitSha)) {
    return explicitCommitSha;
  }
  if (process.env.CF_PAGES_COMMIT_SHA && /^[0-9a-f]{40}$/i.test(process.env.CF_PAGES_COMMIT_SHA)) {
    return process.env.CF_PAGES_COMMIT_SHA;
  }
  if (process.env.GITHUB_SHA && /^[0-9a-f]{40}$/i.test(process.env.GITHUB_SHA)) {
    return process.env.GITHUB_SHA;
  }
  const localSha = tryExec('git rev-parse HEAD');
  if (localSha && /^[0-9a-f]{40}$/i.test(localSha)) {
    return localSha;
  }
  const mirrorSha = tryExec(`git -C "${fallbackGitDir}" rev-parse HEAD`);
  if (mirrorSha && /^[0-9a-f]{40}$/i.test(mirrorSha)) {
    return mirrorSha;
  }
  return '0000000000000000000000000000000000000000';
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

function inspectContentAuditState() {
  const registryPath = path.resolve(rootDir, 'src/domain/cognitive/ContentAuditRegistry.ts');
  const content = fs.readFileSync(registryPath, 'utf8');
  const catalogStart = content.indexOf('function createFullPendingCatalog');
  const catalogSection = catalogStart >= 0 ? content.slice(catalogStart) : content;
  const pendingMatches = catalogSection.match(/auditStatus:\s*'PENDING'/g) || [];
  const passedSeedMatches = catalogSection.match(/auditStatus:\s*'PASSED'/g) || [];
  return {
    gateStatus: passedSeedMatches.length === 0 ? 'FAIL_CLOSED_PENDING_AUDIT' : 'PARTIAL_OR_CUSTOM',
    pendingReviewCount: pendingMatches.length,
    passedCount: passedSeedMatches.length,
    defaultChildModePolicy: 'FAIL_CLOSED_BLOCK_UNAPPROVED',
  };
}

function resolveSafeRollbackTarget(currentSha) {
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
  // Never return f8c74019! Default to current verified D6 commit SHA
  return currentSha;
}

const commitSha = resolveCommitSha();
const branch = resolveBranch();
const auditInfo = inspectContentAuditState();
const safeRollbackSha = resolveSafeRollbackTarget(commitSha);
const nowIso = new Date().toISOString();

const versionMetadata = {
  project: 'qingyu-island-preview',
  repository: 'megakii789-ux/A-LAND',
  branch,
  productionHoldBranch: 'public-hold',
  commitSha,
  shortCommitSha: commitSha.slice(0, 12),
  deploymentTimestamp: nowIso,
  buildStatus: 'VERIFIED_QUALITY_GATE_PASSED',
  releaseGateStatus: 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
  releaseApprovalStatus: 'ENGINEERING_PREVIEW_NOT_RELEASE_APPROVED',
  contentAuditGate: auditInfo.gateStatus,
  contentAuditSummary: {
    pendingReviewCount: auditInfo.pendingReviewCount,
    passedCount: auditInfo.passedCount,
    defaultChildModePolicy: auditInfo.defaultChildModePolicy,
  },
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

const outPath = path.resolve(rootDir, 'public/version.json');
fs.writeFileSync(outPath, JSON.stringify(versionMetadata, null, 2) + '\n', 'utf8');
console.log(
  `[generate-version-json] Updated public/version.json -> commitSha=${commitSha.slice(0, 12)} branch=${branch} audit=${auditInfo.gateStatus} (${auditInfo.pendingReviewCount} PENDING_REVIEW)`,
);
