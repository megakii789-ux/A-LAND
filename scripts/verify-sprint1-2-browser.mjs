import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 4180;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.resolve(process.cwd(), 'docs/evidence/sprint1_2');

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

async function touchTap(page, selector) {
  const loc = page.locator(selector).first();
  await loc.waitFor({ state: 'visible', timeout: 5000 });
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(80);
  const box = await loc.boundingBox();
  if (!box) {
    throw new Error(`No boundingBox for selector: ${selector}`);
  }
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(150);
}

async function readPlaytestMetrics(page) {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem('qingyu_experience_metrics_playtest_v1');
    return raw ? JSON.parse(raw) : null;
  });
}

async function readChildMetrics(page) {
  return page.evaluate(() => {
    const raw = window.localStorage.getItem('qingyu_experience_metrics_child_v1');
    return raw ? JSON.parse(raw) : null;
  });
}

async function openGamesHubAndUnlockPlaytest(page) {
  await touchTap(page, 'button[aria-label="打开真实动动手探险游戏集"]');
  await page.waitForSelector('[data-testid="enable-internal-playtest-btn"]', { timeout: 5000 });
  await touchTap(page, '[data-testid="enable-internal-playtest-btn"]');

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
  await page.waitForSelector('[data-testid="detective-case-status-badge"]', { timeout: 6000 });
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
    // 1. Mobile 390x844 Real Touch Verification (Tasks 1, 2, 5 & Negative Tests 1, 2, 6)
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

    // Verify 390px single current goal pill & scene-first layout
    const mobileLayout = await mobilePage.evaluate(() => {
      const sceneEl = document.querySelector('[aria-label="侦探探索小房间全景"]');
      const goalEl = document.querySelector('[data-testid="detective-current-goal-pill"]');
      const rect = sceneEl ? sceneEl.getBoundingClientRect() : null;
      return {
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        goalText: goalEl ? goalEl.textContent?.trim() : null,
        sceneTop: rect ? Math.round(rect.top) : null,
        sceneBottom: rect ? Math.round(rect.bottom) : null,
      };
    });
    if (mobileLayout.scrollWidth > mobileLayout.innerWidth) {
      throw new Error(`Mobile 390 overflow: ${mobileLayout.scrollWidth} > ${mobileLayout.innerWidth}`);
    }
    report.checks.mobile390LayoutAndGoalPill = mobileLayout;

    // -------------------------------------------------------------------------
    // Negative Test 1A: Real Touch Tap on Curtain (hs_curtain)
    // 1st touch tap ONLY lifts curtain, does NOT acquire clue or show quick-sort
    // -------------------------------------------------------------------------
    await touchTap(mobilePage, '[data-testid="scene-hotspot-hs_curtain"]');
    const curtainTap1State = await mobilePage.evaluate(() => {
      const btn = document.querySelector('[data-testid="scene-hotspot-hs_curtain"]');
      const quickSort = document.querySelector('[data-testid="quick-sort-hs_curtain-EYES_OBSERVED"]');
      const revealBadge = document.querySelector('[data-testid="popover-reveal-only-badge"]');
      return {
        revealed: btn?.getAttribute('data-revealed'),
        discovered: btn?.getAttribute('data-discovered'),
        hasQuickSort: Boolean(quickSort),
        hasRevealOnlyBadge: Boolean(revealBadge),
      };
    });
    if (
      curtainTap1State.revealed !== 'true' ||
      curtainTap1State.discovered !== 'false' ||
      curtainTap1State.hasQuickSort
    ) {
      throw new Error(`Curtain 1st touch tap failed two-step guard: ${JSON.stringify(curtainTap1State)}`);
    }

    const shotCurtainTap1 = path.join(OUT_DIR, 'sprint1_2-mobile-390-curtain-tap1-reveal-only.png');
    await mobilePage.screenshot({ path: shotCurtainTap1, fullPage: false });
    report.screenshots.push(shotCurtainTap1);

    // 2nd touch tap on Curtain -> acquires green crayon clue & unlocks quick-sort
    await touchTap(mobilePage, '[data-testid="scene-hotspot-hs_curtain"]');
    const curtainTap2State = await mobilePage.evaluate(() => {
      const btn = document.querySelector('[data-testid="scene-hotspot-hs_curtain"]');
      const quickSort = document.querySelector('[data-testid="quick-sort-hs_curtain-EYES_OBSERVED"]');
      return {
        revealed: btn?.getAttribute('data-revealed'),
        discovered: btn?.getAttribute('data-discovered'),
        hasQuickSort: Boolean(quickSort),
      };
    });
    if (
      curtainTap2State.revealed !== 'true' ||
      curtainTap2State.discovered !== 'true' ||
      !curtainTap2State.hasQuickSort
    ) {
      throw new Error(`Curtain 2nd touch tap did not acquire clue: ${JSON.stringify(curtainTap2State)}`);
    }

    const shotCurtainTap2 = path.join(OUT_DIR, 'sprint1_2-mobile-390-curtain-tap2-clue-acquired.png');
    await mobilePage.screenshot({ path: shotCurtainTap2, fullPage: false });
    report.screenshots.push(shotCurtainTap2);

    report.checks.negativeTest1A_CurtainRealTouch = {
      passed: true,
      afterTap1: curtainTap1State,
      afterTap2: curtainTap2State,
    };

    // -------------------------------------------------------------------------
    // Negative Test 2: Reset -> 2 non-key hotspots + initial hypothesis + action -> NOT completed
    // -------------------------------------------------------------------------
    await touchTap(mobilePage, 'button:has-text("重来")');
    await touchTap(mobilePage, '[data-testid="initial-hypothesis-hyp_peer_took"]');
    await touchTap(mobilePage, '[data-testid="scene-hotspot-hs_qiqi_thought"]');
    await touchTap(mobilePage, '[data-testid="scene-hotspot-hs_backpack"]');
    await touchTap(mobilePage, '[data-testid="next-action-act_pickup_and_apologize"]');

    const negTest2Status = await mobilePage
      .locator('[data-testid="detective-case-status-badge"]')
      .getAttribute('data-status');
    const negTest2Metrics = await readPlaytestMetrics(mobilePage);
    if (
      negTest2Status === 'COMPLETED' ||
      (negTest2Metrics?.completedDetectiveCaseIds ?? []).includes('scenario_detective_drawing_v1')
    ) {
      throw new Error(`Negative Test 2 failed: case completed without key evidence/sorting/revision!`);
    }
    report.checks.negativeTest2_LooseCompletionBlocked = {
      passed: true,
      status: negTest2Status,
      completedDetectiveCaseIds: negTest2Metrics?.completedDetectiveCaseIds ?? [],
    };

    // -------------------------------------------------------------------------
    // Negative Test 6: Peek at reference ending early -> then finish all steps -> COMPLETED_AFTER_REFERENCE
    // -------------------------------------------------------------------------
    await touchTap(mobilePage, '[data-testid="open-detective-synthesis-btn"]');
    await mobilePage.waitForSelector('[data-testid="synthesis-early-peek-banner"]', { timeout: 3000 });
    await touchTap(mobilePage, 'button:has-text("返回现场继续探索")');

    // Now complete all remaining steps for Case A (reveal & collect curtain, inspect cat tracks, sort clue, revise hypothesis, select action)
    await touchTap(mobilePage, '[data-testid="scene-hotspot-hs_cat_tracks"]');
    await touchTap(mobilePage, '[data-testid="scene-hotspot-hs_curtain"]');
    await touchTap(mobilePage, '[data-testid="scene-hotspot-hs_curtain"]');
    await touchTap(mobilePage, '[data-testid="quick-sort-hs_curtain-EYES_OBSERVED"]');
    await touchTap(mobilePage, '[data-testid="revise-hypothesis-hyp_rolled_away"]');
    await touchTap(mobilePage, '[data-testid="next-action-act_pickup_and_apologize"]');

    const negTest6Status = await mobilePage
      .locator('[data-testid="detective-case-status-badge"]')
      .getAttribute('data-status');
    const negTest6Metrics = await readPlaytestMetrics(mobilePage);
    if (
      negTest6Status !== 'COMPLETED_AFTER_REFERENCE' ||
      (negTest6Metrics?.independentDetectiveCaseIds ?? []).includes('scenario_detective_drawing_v1') ||
      !(negTest6Metrics?.assistedDetectiveCaseIds ?? []).includes('scenario_detective_drawing_v1')
    ) {
      throw new Error(
        `Negative Test 6 failed: status=${negTest6Status}, metrics=${JSON.stringify(negTest6Metrics)}`
      );
    }
    report.checks.negativeTest6_EarlyReferenceSeparatedFromIndependent = {
      passed: true,
      status: negTest6Status,
      independentDetectiveCaseIds: negTest6Metrics?.independentDetectiveCaseIds ?? [],
      assistedDetectiveCaseIds: negTest6Metrics?.assistedDetectiveCaseIds ?? [],
    };

    await mobileContext.close();

    // =========================================================================
    // 2. Desktop 1440x900 Touch-Enabled Verification (Task 3 Forest Case, Task 4 Transfer Lab)
    // =========================================================================
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      hasTouch: true,
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(BASE_URL, { waitUntil: 'networkidle' });

    await openGamesHubAndUnlockPlaytest(desktopPage);

    // Switch to Forest Case B (自然与小动物)
    await touchTap(desktopPage, 'button[aria-label="切换为自然与小动物主题"]');

    // -------------------------------------------------------------------------
    // Negative Test 3: Only 2 ordinary clues in Forest case -> INSUFFICIENT_EVIDENCE & no spoilers
    // -------------------------------------------------------------------------
    await touchTap(desktopPage, '[data-testid="scene-hotspot-hs_nature_tree_moss"]');
    await touchTap(desktopPage, '[data-testid="scene-hotspot-hs_nature_wind_trail"]');
    await touchTap(desktopPage, '[data-testid="revise-hypothesis-hyp_nat_unknown"]');

    const forestEarlyEval = await desktopPage.evaluate(() => {
      const badge = document.querySelector('[data-testid="hypothesis-evaluation-badge"]');
      const feedback = document.querySelector('[data-testid="hypothesis-evaluation-feedback"]');
      return {
        relation: badge?.getAttribute('data-relation'),
        findingState: badge?.getAttribute('data-finding-state'),
        feedbackText: feedback?.textContent?.trim() || '',
      };
    });
    if (
      forestEarlyEval.relation !== 'INSUFFICIENT_EVIDENCE' ||
      forestEarlyEval.feedbackText.includes('空帽壳') ||
      forestEarlyEval.feedbackText.includes('黑漆漆')
    ) {
      throw new Error(`Negative Test 3 failed: ${JSON.stringify(forestEarlyEval)}`);
    }
    report.checks.negativeTest3_ForestOrdinaryCluesInsufficient = {
      passed: true,
      ...forestEarlyEval,
    };

    // -------------------------------------------------------------------------
    // Negative Test 1B: Real Touch Tap on Maple Leaf Pile (hs_nature_leaf_pile)
    // -------------------------------------------------------------------------
    await touchTap(desktopPage, '[data-testid="scene-hotspot-hs_nature_leaf_pile"]');
    const mapleTap1 = await desktopPage.evaluate(() => {
      const btn = document.querySelector('[data-testid="scene-hotspot-hs_nature_leaf_pile"]');
      const quickSort = document.querySelector('[data-testid="quick-sort-hs_nature_leaf_pile-EYES_OBSERVED"]');
      return {
        revealed: btn?.getAttribute('data-revealed'),
        discovered: btn?.getAttribute('data-discovered'),
        hasQuickSort: Boolean(quickSort),
      };
    });
    if (mapleTap1.revealed !== 'true' || mapleTap1.discovered !== 'false' || mapleTap1.hasQuickSort) {
      throw new Error(`Maple Leaf Pile 1st touch tap failed: ${JSON.stringify(mapleTap1)}`);
    }

    // 2nd touch tap on Maple Leaf Pile -> acquires empty acorn cap clue
    await touchTap(desktopPage, '[data-testid="scene-hotspot-hs_nature_leaf_pile"]');
    const mapleTap2 = await desktopPage.evaluate(() => {
      const btn = document.querySelector('[data-testid="scene-hotspot-hs_nature_leaf_pile"]');
      const quickSort = document.querySelector('[data-testid="quick-sort-hs_nature_leaf_pile-EYES_OBSERVED"]');
      return {
        revealed: btn?.getAttribute('data-revealed'),
        discovered: btn?.getAttribute('data-discovered'),
        hasQuickSort: Boolean(quickSort),
      };
    });
    if (mapleTap2.revealed !== 'true' || mapleTap2.discovered !== 'true' || !mapleTap2.hasQuickSort) {
      throw new Error(`Maple Leaf Pile 2nd touch tap failed: ${JSON.stringify(mapleTap2)}`);
    }
    report.checks.negativeTest1B_MaplePileRealTouch = {
      passed: true,
      afterTap1: mapleTap1,
      afterTap2: mapleTap2,
    };

    // Sort maple leaf clue, inspect deep burrow, verify INCONCLUSIVE_AFTER_KEY_EVIDENCE -> complete Forest Case independently!
    await touchTap(desktopPage, '[data-testid="quick-sort-hs_nature_leaf_pile-EYES_OBSERVED"]');
    await touchTap(desktopPage, '[data-testid="scene-hotspot-hs_nature_deep_burrow"]');
    await touchTap(desktopPage, '[data-testid="revise-hypothesis-hyp_nat_unknown"]');

    const forestKeyEval = await desktopPage.evaluate(() => {
      const badge = document.querySelector('[data-testid="hypothesis-evaluation-badge"]');
      return {
        relation: badge?.getAttribute('data-relation'),
        findingState: badge?.getAttribute('data-finding-state'),
        badgeText: badge?.textContent?.trim(),
      };
    });
    if (
      forestKeyEval.relation !== 'SUPPORTED_BY_EVIDENCE' ||
      forestKeyEval.findingState !== 'INCONCLUSIVE_AFTER_KEY_EVIDENCE'
    ) {
      throw new Error(`Forest key evidence evaluation mismatch: ${JSON.stringify(forestKeyEval)}`);
    }

    await touchTap(desktopPage, '[data-testid="next-action-act_nat_pickup_wave"]');
    const forestCompleteStatus = await desktopPage
      .locator('[data-testid="detective-case-status-badge"]')
      .getAttribute('data-status');
    const forestCompleteMetrics = await readPlaytestMetrics(desktopPage);
    if (
      forestCompleteStatus !== 'COMPLETED' ||
      !(forestCompleteMetrics?.independentDetectiveCaseIds ?? []).includes('scenario_detective_nature_v1')
    ) {
      throw new Error(`Forest case independent completion failed: ${JSON.stringify(forestCompleteMetrics)}`);
    }

    const shotDesktopForest = path.join(OUT_DIR, 'sprint1_2-desktop-1440-forest-key-evidence-complete.png');
    await desktopPage.screenshot({ path: shotDesktopForest, fullPage: false });
    report.screenshots.push(shotDesktopForest);

    // -------------------------------------------------------------------------
    // Negative Tests 4 & 5: Transfer Lab Pseudo-Independent Completion Guard
    // -------------------------------------------------------------------------
    await touchTap(desktopPage, '[data-testid="open-detective-synthesis-btn"]');
    await touchTap(desktopPage, '[data-testid="open-transfer-from-detective"]');
    await desktopPage.waitForSelector('[data-testid="transfer-task-status-badge"]', { timeout: 4000 });

    // Negative Test 4: Select only 1 ordinary FACT item (t1_crumbs) and submit -> NOT completed
    await touchTap(desktopPage, '[data-testid="transfer-option-t1_crumbs"]');
    await touchTap(desktopPage, '[data-testid="transfer-submit-or-view-btn"]');

    const transferNeg4Status = await desktopPage
      .locator('[data-testid="transfer-task-status-badge"]')
      .getAttribute('data-status');
    const transferNeg4Metrics = await readPlaytestMetrics(desktopPage);
    if (
      transferNeg4Status !== 'ATTEMPTED' ||
      (transferNeg4Metrics?.completedTransferScenarioIds ?? []).length > 0
    ) {
      throw new Error(
        `Negative Test 4 failed: status=${transferNeg4Status}, metrics=${JSON.stringify(transferNeg4Metrics)}`
      );
    }
    report.checks.negativeTest4_TransferSingleFactRejected = {
      passed: true,
      status: transferNeg4Status,
      completedTransferScenarioIds: transferNeg4Metrics?.completedTransferScenarioIds ?? [],
    };

    // Negative Test 5: Since error explanation was already triggered on Scenario 1, redoing to pass records COMPLETED_WITH_PROMPT
    await touchTap(desktopPage, 'button:has-text("重置选择")');
    await touchTap(desktopPage, '[data-testid="transfer-option-t1_crumbs"]');
    await touchTap(desktopPage, '[data-testid="transfer-option-t5_unknown_who"]');
    await touchTap(desktopPage, '[data-testid="transfer-submit-or-view-btn"]');

    const transferNeg5Status = await desktopPage
      .locator('[data-testid="transfer-task-status-badge"]')
      .getAttribute('data-status');
    const transferNeg5Metrics = await readPlaytestMetrics(desktopPage);
    if (
      transferNeg5Status !== 'COMPLETED_WITH_PROMPT' ||
      transferNeg5Metrics?.independentTransferCount !== 0 ||
      transferNeg5Metrics?.promptedTransferCount !== 1
    ) {
      throw new Error(
        `Negative Test 5 failed: status=${transferNeg5Status}, metrics=${JSON.stringify(transferNeg5Metrics)}`
      );
    }
    report.checks.negativeTest5_TransferRedoNotIndependent = {
      passed: true,
      status: transferNeg5Status,
      independentTransferCount: transferNeg5Metrics?.independentTransferCount,
      promptedTransferCount: transferNeg5Metrics?.promptedTransferCount,
    };

    // Also verify Scenario 3 (Uncertainty task) allows "现在还不知道" (u4_retain_uncertainty) as a true first-try COMPLETED_INDEPENDENT
    await touchTap(desktopPage, '[data-testid="transfer-scenario-tab-3"]');
    await touchTap(desktopPage, '[data-testid="transfer-option-u4_retain_uncertainty"]');
    await touchTap(desktopPage, '[data-testid="transfer-submit-or-view-btn"]');

    const transferScen3Status = await desktopPage
      .locator('[data-testid="transfer-task-status-badge"]')
      .getAttribute('data-status');
    const finalPlaytestMetrics = await readPlaytestMetrics(desktopPage);
    const finalChildMetrics = await readChildMetrics(desktopPage);
    if (
      transferScen3Status !== 'COMPLETED_INDEPENDENT' ||
      finalPlaytestMetrics?.independentTransferCount !== 1
    ) {
      throw new Error(
        `Scenario 3 Uncertainty independent completion failed: status=${transferScen3Status}`
      );
    }

    const shotDesktopTransfer = path.join(OUT_DIR, 'sprint1_2-desktop-1440-transfer-goal-verified.png');
    await desktopPage.screenshot({ path: shotDesktopTransfer, fullPage: false });
    report.screenshots.push(shotDesktopTransfer);

    report.checks.playtestVsChildStorageIsolation = {
      playtestStorageKey: 'qingyu_experience_metrics_playtest_v1',
      playtestMetrics: finalPlaytestMetrics,
      childStorageKey: 'qingyu_experience_metrics_child_v1',
      childMetrics: finalChildMetrics,
    };

    await desktopContext.close();
    await browser.close();

    const reportPath = path.join(OUT_DIR, 'verification-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log('SPRINT 1.2 REAL-TOUCH BROWSER VERIFICATION PASSED:', reportPath);
  } finally {
    previewProc.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('SPRINT 1.2 BROWSER VERIFICATION FAILED:', err);
  process.exit(1);
});
