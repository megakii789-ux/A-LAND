import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 4179;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.resolve(process.cwd(), 'docs/evidence/sprint1_1');

fs.mkdirSync(OUT_DIR, { recursive: true });

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function openGamesHubAndUnlockPlaytest(page) {
  const hubBtn = page.locator('button[aria-label="打开真实动动手探险游戏集"]');
  await hubBtn.scrollIntoViewIfNeeded();
  await hubBtn.click();
  await page.waitForSelector('[data-testid="enable-internal-playtest-btn"]', { timeout: 5000 });
  await page.click('[data-testid="enable-internal-playtest-btn"]');

  const gateDialog = page.locator('[role="dialog"][aria-label="照顾者安全验证门禁"]');
  await gateDialog.waitFor({ state: 'visible', timeout: 5000 });
  await gateDialog
    .locator('input[placeholder="请再次输入相同数字"]')
    .waitFor({ state: 'visible', timeout: 2000 })
    .catch(() => {});

  const pwdInputs = gateDialog.locator('input[type="password"]');
  const count = await pwdInputs.count();
  if (count >= 2) {
    await pwdInputs.nth(0).fill('135790');
    await pwdInputs.nth(1).fill('135790');
  } else {
    await pwdInputs.nth(0).fill('135790');
  }
  await gateDialog.locator('button[type="submit"]').click();
  try {
    await page.waitForSelector('[data-testid="detective-case-status-badge"]', { timeout: 6000 });
  } catch (err) {
    const bodyText = await page.locator('body').innerText();
    console.error('DEBUG PAGE TEXT TAIL AFTER SUBMIT:\n', bodyText.slice(-800));
    throw err;
  }
}

async function main() {
  const previewProc = spawn(
    './node_modules/.bin/vite',
    ['preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'],
    { stdio: 'pipe' }
  );

  const report = {
    timestamp: new Date().toISOString(),
    checks: {},
    screenshots: [],
  };

  try {
    await waitForServer(BASE_URL);
    const browser = await chromium.launch({ headless: true });

    // =========================================================================
    // 1. Mobile 390x844 Verification: Scene-First Layout & Zero-Exploration Guard
    // =========================================================================
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });

    await openGamesHubAndUnlockPlaytest(mobilePage);

    // Verify 390x844 Scene-First layout metrics
    const mobileLayout = await mobilePage.evaluate(() => {
      const sceneEl = document.querySelector('[aria-label="侦探探索小房间全景"]');
      const rect = sceneEl ? sceneEl.getBoundingClientRect() : null;
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        sceneTop: rect ? Math.round(rect.top) : null,
        sceneBottom: rect ? Math.round(rect.bottom) : null,
        sceneHeight: rect ? Math.round(rect.height) : null,
      };
    });

    if (mobileLayout.scrollWidth > mobileLayout.innerWidth) {
      throw new Error(`Mobile horizontal overflow: ${mobileLayout.scrollWidth} > ${mobileLayout.innerWidth}`);
    }
    if (!mobileLayout.sceneTop || mobileLayout.sceneTop > 420) {
      throw new Error(`Scene canvas not Scene-First on 390x844 mobile: sceneTop=${mobileLayout.sceneTop}`);
    }
    report.checks.mobile390SceneFirstLayout = mobileLayout;

    const mobileShot1 = path.join(OUT_DIR, 'sprint1_1-detective-mobile-390-scene-first.png');
    await mobilePage.screenshot({ path: mobileShot1, fullPage: false });
    report.screenshots.push(mobileShot1);

    // Negative Check 1: Zero exploration -> click "查看侦探破案手册" -> ENDED_EARLY & 0 completed
    await mobilePage.click('[data-testid="open-detective-synthesis-btn"]');
    await mobilePage.waitForSelector('[data-testid="synthesis-early-peek-banner"]', { timeout: 3000 });
    const zeroExploreMetrics = await mobilePage.evaluate(() => {
      const raw = window.localStorage.getItem('qy_product_experience_metrics_playtest_v1');
      return raw ? JSON.parse(raw) : null;
    });
    if (zeroExploreMetrics?.completedDetectiveCaseIds?.length > 0) {
      throw new Error('Zero exploration falsely recorded completedDetectiveCaseIds!');
    }
    report.checks.negativeZeroExplorationBlocked = {
      passed: true,
      statusAfterEarlyPeek: await mobilePage.locator('[data-testid="detective-case-status-badge"]').textContent(),
      completedDetectiveCaseIds: zeroExploreMetrics?.completedDetectiveCaseIds ?? [],
    };

    // Close early-peek synthesis modal
    await mobilePage.click('button[aria-label="关闭总结"]');
    await mobilePage.waitForTimeout(200);

    // Tap curtain twice on mobile to reveal green crayon & open in-scene popover
    await mobilePage.click('[data-testid="scene-hotspot-hs_curtain"]');
    await mobilePage.waitForTimeout(200);
    await mobilePage.click('[data-testid="scene-hotspot-hs_curtain"]');
    await mobilePage.waitForSelector('[data-testid="scene-object-popover"]', { timeout: 3000 });

    const mobileShot2 = path.join(OUT_DIR, 'sprint1_1-detective-mobile-390-curtain-reveal-popover.png');
    await mobilePage.screenshot({ path: mobileShot2, fullPage: false });
    report.screenshots.push(mobileShot2);

    await mobileContext.close();

    // =========================================================================
    // 2. Desktop 1440x900 Verification: Evidence Evaluation, Action Consequence,
    //    Case B (Nature), Transfer Guard, and Playtest vs Child Metrics Isolation
    // =========================================================================
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(BASE_URL, { waitUntil: 'networkidle' });

    await openGamesHubAndUnlockPlaytest(desktopPage);

    // Step 1: Select initial hypothesis "肯定是皮皮偷偷拿走了"
    await desktopPage.click('[data-testid="initial-hypothesis-hyp_peer_took"]');

    // Step 2: Click lead "掀开窗帘底下看看" -> highlights curtain without auto-claiming
    await desktopPage.click('[data-testid="investigation-lead-lead_check_curtain"]');
    const isHighlightedOnly = await desktopPage
      .locator('[data-testid="scene-hotspot-hs_curtain"]')
      .getAttribute('data-highlighted');
    if (isHighlightedOnly !== 'true') {
      throw new Error('Lead click did not highlight target hotspot');
    }

    // Tap curtain twice -> discover green crayon -> sort into EYES_OBSERVED
    await desktopPage.click('[data-testid="scene-hotspot-hs_curtain"]');
    await desktopPage.click('[data-testid="scene-hotspot-hs_curtain"]');
    await desktopPage.click('[data-testid="quick-sort-hs_curtain-EYES_OBSERVED"]');

    // Tap easel -> sort into EYES_OBSERVED
    await desktopPage.click('[data-testid="scene-hotspot-hs_easel"]');
    await desktopPage.click('[data-testid="quick-sort-hs_easel-EYES_OBSERVED"]');

    // Step 3: Select contradicted hypothesis "肯定是皮皮偷偷拿走了"
    await desktopPage.click('[data-testid="revise-hypothesis-hyp_peer_took"]');
    await desktopPage.waitForSelector('[data-testid="hypothesis-evaluation-feedback"]', { timeout: 3000 });
    const contradictedRelation = await desktopPage
      .locator('[data-testid="hypothesis-evaluation-badge"]')
      .getAttribute('data-relation');
    const contradictedText = await desktopPage
      .locator('[data-testid="hypothesis-evaluation-feedback"]')
      .textContent();
    if (contradictedRelation !== 'CONTRADICTED_BY_EVIDENCE') {
      throw new Error(`Expected CONTRADICTED_BY_EVIDENCE, got ${contradictedRelation}`);
    }
    report.checks.evidenceContradictionFeedback = {
      relation: contradictedRelation,
      feedback: contradictedText?.trim(),
    };

    const desktopShotContradicted = path.join(OUT_DIR, 'sprint1_1-detective-desktop-1440-contradicted-feedback.png');
    await desktopPage.screenshot({ path: desktopShotContradicted, fullPage: false });
    report.screenshots.push(desktopShotContradicted);

    // Revise to supported hypothesis "可能被小动物或什么东西碰滚走了"
    await desktopPage.click('[data-testid="revise-hypothesis-hyp_rolled_away"]');
    const supportedRelation = await desktopPage
      .locator('[data-testid="hypothesis-evaluation-badge"]')
      .getAttribute('data-relation');
    if (supportedRelation !== 'SUPPORTED_BY_EVIDENCE') {
      throw new Error(`Expected SUPPORTED_BY_EVIDENCE, got ${supportedRelation}`);
    }

    // Step 4: Select next action and observe consequence
    await desktopPage.click('[data-testid="next-action-act_pickup_and_apologize"]');
    await desktopPage.waitForSelector('[data-testid="detective-action-consequence"]', { timeout: 3000 });

    const desktopShotCompleted = path.join(OUT_DIR, 'sprint1_1-detective-desktop-1440-action-consequence.png');
    await desktopPage.screenshot({ path: desktopShotCompleted, fullPage: false });
    report.screenshots.push(desktopShotCompleted);

    // Step 5: Open synthesis modal -> records COMPLETED
    await desktopPage.click('[data-testid="open-detective-synthesis-btn"]');
    await desktopPage.waitForTimeout(250);
    const statusAfterComplete = await desktopPage
      .locator('[data-testid="detective-case-status-badge"]')
      .getAttribute('data-status');
    if (statusAfterComplete !== 'COMPLETED') {
      throw new Error(`Expected COMPLETED status, got ${statusAfterComplete}`);
    }
    await desktopPage.click('button[aria-label="关闭总结"]');

    // Switch to Case B (Nature theme: 森林落叶坚果侦探)
    await desktopPage.click('button[aria-label="切换为自然与小动物主题"]');
    await desktopPage.waitForTimeout(250);
    await desktopPage.click('[data-testid="scene-hotspot-hs_nature_leaf_pile"]');
    await desktopPage.click('[data-testid="scene-hotspot-hs_nature_leaf_pile"]');
    await desktopPage.click('[data-testid="scene-hotspot-hs_nature_deep_burrow"]');
    await desktopPage.click('[data-testid="revise-hypothesis-hyp_nat_unknown"]');
    const natureUnknownRelation = await desktopPage
      .locator('[data-testid="hypothesis-evaluation-badge"]')
      .getAttribute('data-relation');
    if (natureUnknownRelation !== 'SUPPORTED_BY_EVIDENCE') {
      throw new Error(`Expected Case B hyp_nat_unknown to be SUPPORTED_BY_EVIDENCE, got ${natureUnknownRelation}`);
    }
    report.checks.caseBNatureUnknownSupported = {
      relation: natureUnknownRelation,
      feedback: (await desktopPage.locator('[data-testid="hypothesis-evaluation-feedback"]').textContent())?.trim(),
    };

    const desktopShotNature = path.join(OUT_DIR, 'sprint1_1-detective-desktop-1440-case-b-nature.png');
    await desktopPage.screenshot({ path: desktopShotNature, fullPage: false });
    report.screenshots.push(desktopShotNature);

    // Check Transfer Lab 0-selection reference guard
    await desktopPage.click('button:has-text("独立迁移")');
    await desktopPage.waitForSelector('[data-testid="transfer-submit-or-view-btn"]', { timeout: 3000 });
    await desktopPage.click('[data-testid="transfer-submit-or-view-btn"]');
    await desktopPage.waitForSelector('[data-testid="transfer-reference-only-badge"]', { timeout: 3000 });
    const transferMetricsAfterZero = await desktopPage.evaluate(() => {
      const raw = window.localStorage.getItem('qy_product_experience_metrics_playtest_v1');
      return raw ? JSON.parse(raw) : null;
    });
    if ((transferMetricsAfterZero?.independentTransferCount ?? 0) !== 0) {
      throw new Error('Zero-selection transfer view falsely incremented independentTransferCount!');
    }
    report.checks.negativeTransferZeroSelectionBlocked = {
      passed: true,
      independentTransferCount: transferMetricsAfterZero?.independentTransferCount ?? 0,
    };

    const desktopShotTransfer = path.join(OUT_DIR, 'sprint1_1-transfer-desktop-1440-reference-guard.png');
    await desktopPage.screenshot({ path: desktopShotTransfer, fullPage: false });
    report.screenshots.push(desktopShotTransfer);

    await desktopContext.close();
    await browser.close();

    const reportPath = path.join(OUT_DIR, 'verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('Sprint 1.1 Playwright Verification PASSED:', JSON.stringify(report.checks, null, 2));
  } finally {
    previewProc.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('Sprint 1.1 Playwright Verification FAILED:', err);
  process.exit(1);
});
