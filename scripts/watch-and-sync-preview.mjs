#!/usr/bin/env node
/**
 * A-LAND｜Gate D7-04 受控文件监听器与防抖自动同步守卫 (scripts/watch-and-sync-preview.mjs)
 *
 * D7-04 要求：
 *   1. 提供可复用的单命令同步与部署流程 (scripts/sync-gdrive-to-git.sh --apply --commit <msg> --push)。
 *   2. 如需持续自动同步，提供受控文件监听器及防抖 (Debounce) 机制，合并高频保存事件，严禁按每次文件保存直接上线。
 *   3. 只有完整质量门禁 (TypeScript + Vitest + Pages 503 契约 + Vite Build + 密钥扫描) 100% 通过的版本才允许自动提交并推送到 preview。
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

export class DebouncedGatedSyncController {
  constructor(options = {}) {
    this.debounceMs = options.debounceMs ?? 15000;
    this.executor = options.executor;
    this.onLog = options.onLog ?? ((msg) => console.log(msg));
    this.timer = null;
    this.isRunning = false;
    this.pendingChanges = new Set();
    this.completedRuns = [];
    this.rejectedRuns = [];
  }

  recordFileChange(relativePath) {
    if (this.shouldIgnore(relativePath)) {
      return false;
    }
    this.pendingChanges.add(relativePath);
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.onLog(
      `[watch-preview] 捕获变更 (${relativePath})，已重置防抖计时器 (${this.debounceMs}ms 内无新保存才触发门禁)...`,
    );
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.flush();
    }, this.debounceMs);
    return true;
  }

  shouldIgnore(relativePath) {
    const norm = relativePath.replace(/\\/g, '/');
    if (
      norm.startsWith('.git/') ||
      norm.startsWith('node_modules/') ||
      norm.startsWith('dist/') ||
      norm.startsWith('test-results/') ||
      norm.startsWith('playwright-report/') ||
      norm.endsWith('.swp') ||
      norm.endsWith('~') ||
      norm.includes('.DS_Store')
    ) {
      return true;
    }
    return false;
  }

  async flush() {
    if (this.isRunning || this.pendingChanges.size === 0) {
      return;
    }
    this.isRunning = true;
    const batchFiles = Array.from(this.pendingChanges);
    this.pendingChanges.clear();

    this.onLog(
      `[watch-preview] 防抖窗口结束，合并 ${batchFiles.length} 个文件变更，开始执行全量质量门禁与受控同步...`,
    );

    try {
      const result = await this.executor(batchFiles);
      if (result && result.exitCode === 0) {
        this.completedRuns.push({ files: batchFiles, timestamp: new Date().toISOString() });
        this.onLog(`[watch-preview] [PASS] 门禁全部通过，已完成 preview 受控同步。`);
      } else {
        this.rejectedRuns.push({
          files: batchFiles,
          exitCode: result?.exitCode ?? 1,
          timestamp: new Date().toISOString(),
        });
        this.onLog(
          `[watch-preview] [BLOCKED] 质量门禁未通过 (exit=${result?.exitCode ?? 1})，已阻断自动提交与 preview 推送！`,
        );
      }
    } catch (err) {
      this.rejectedRuns.push({
        files: batchFiles,
        exitCode: 1,
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
      });
      this.onLog(`[watch-preview] [BLOCKED] 门禁执行异常，已阻断上线: ${err}`);
    } finally {
      this.isRunning = false;
      if (this.pendingChanges.size > 0) {
        this.timer = setTimeout(() => {
          this.timer = null;
          void this.flush();
        }, this.debounceMs);
      }
    }
  }
}

function runSyncPipeline(sourceDir, doPush) {
  return new Promise((resolve) => {
    const scriptPath = path.resolve(sourceDir, 'scripts/sync-gdrive-to-git.sh');
    const commitMsg = `chore(preview): debounced gated sync (${new Date().toISOString()})`;
    const cmdArgs = [scriptPath, '--apply', '--commit', commitMsg];
    if (doPush) {
      cmdArgs.push('--push');
    }

    const child = spawn('bash', cmdArgs, {
      cwd: sourceDir,
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      resolve({ exitCode: code ?? 1 });
    });
    child.on('error', () => {
      resolve({ exitCode: 1 });
    });
  });
}

// CLI Entrypoint
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  let debounceMs = Number(process.env.A_LAND_WATCH_DEBOUNCE_MS || 15000);
  let doPush = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--debounce-ms' && args[i + 1]) {
      debounceMs = Number(args[++i]);
    } else if (args[i] === '--push') {
      doPush = true;
    }
  }

  const sourceDir =
    process.env.A_LAND_SOURCE_DIR || '/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间';

  const controller = new DebouncedGatedSyncController({
    debounceMs,
    executor: () => runSyncPipeline(sourceDir, doPush),
  });

  const watchDirs = ['src', 'functions', 'public', 'scripts', 'tests'];
  console.log('==================================================================');
  console.log(' A-LAND Gate D7-04 受控文件监听与防抖门禁同步守护进程');
  console.log(` 监听源目录 : ${sourceDir}`);
  console.log(` 防抖窗口   : ${debounceMs} ms (严禁按每次保存直接上线)`);
  console.log(` 自动推送   : ${doPush ? 'ENABLED (仅全门禁通过后推送 preview)' : 'LOCAL_ONLY (加 --push 启用远端推送)'}`);
  console.log('==================================================================');

  for (const dir of watchDirs) {
    const absDir = path.resolve(sourceDir, dir);
    if (fs.existsSync(absDir)) {
      fs.watch(absDir, { recursive: true }, (_eventType, filename) => {
        if (filename) {
          controller.recordFileChange(path.join(dir, filename));
        }
      });
    }
  }
}
