import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.VERIFY_URL || 'http://127.0.0.1:4178';
const REPO_OUT_DIR = path.resolve(
  '/home/voga/GoogleDrive/晴雨小岛-·-6岁儿童思考方法成长空间/docs/verification/sprint4'
);
const MIRROR_OUT_DIR = path.resolve('/home/voga/A-LAND/docs/verification/sprint4');
const BRAIN_DIR = '/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73';

fs.mkdirSync(REPO_OUT_DIR, { recursive: true });
fs.mkdirSync(MIRROR_OUT_DIR, { recursive: true });

function saveScreenshotEverywhere(filename, buffer) {
  fs.writeFileSync(path.join(REPO_OUT_DIR, filename), buffer);
  fs.writeFileSync(path.join(MIRROR_OUT_DIR, filename), buffer);
  if (fs.existsSync(BRAIN_DIR)) {
    fs.writeFileSync(path.join(BRAIN_DIR, filename), buffer);
  }
}

async function unlockAdultPreviewIfBlocked(page) {
  const blockedGate = page.locator('[data-testid="story-leaf-audit-gate-blocked"]');
  await blockedGate.waitFor({ state: 'visible', timeout: 2500 }).catch(() => {});
  if (await blockedGate.isVisible().catch(() => false)) {
    await page.getByRole('button', { name: /家长 \/ 审阅人验证后预览/ }).click();
    const dialog = page.locator('[aria-label="照顾者安全验证门禁"]');
    await dialog.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(100);
    const inputs = dialog.locator('input[type="password"]');
    const count = await inputs.count();
    await inputs.nth(0).fill('135792');
    if (count > 1) {
      await inputs.nth(1).fill('135792');
    }
    await dialog.locator('button[type="submit"]').click();
    await dialog.waitFor({ state: 'hidden', timeout: 5000 });
  }
}

async function dragFromElementToElement(page, sourceSelector, targetSelector) {
  const source = page.locator(sourceSelector);
  const target = page.locator(targetSelector);
  await source.scrollIntoViewIfNeeded();
  const srcBox = await source.boundingBox();
  const dstBox = await target.boundingBox();
  assert.ok(srcBox, `Missing boundingBox for source: ${sourceSelector}`);
  assert.ok(dstBox, `Missing boundingBox for target: ${targetSelector}`);

  const startX = srcBox.x + srcBox.width / 2;
  const startY = srcBox.y + srcBox.height / 2;
  const endX = dstBox.x + dstBox.width / 2;
  const endY = dstBox.y + dstBox.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(80);
}

async function getStoredMetrics(page) {
  return page.evaluate(() => {
    const raw =
      window.localStorage.getItem('qingyu_experience_metrics_playtest_v1') ||
      window.localStorage.getItem('qingyu_experience_metrics_v1');
    return raw ? JSON.parse(raw) : null;
  });
}

async function runVerification() {
  const browser = await chromium.launch({ headless: true });
  const results = {};

  try {
    // =========================================================================
    // 1. Mobile 390x844 Verification:
    //    - Assertion 1 (FIX-01): Action before observation never reveals final truth
    //    - Assertion 6 (FIX-04): Direct Cup Drag updates position & reference observations
    //    - Assertion 5 (FIX-03): Autonomous trial-and-error / self-revision stays UNPROMPTED_AUTONOMOUS_COMPLETION
    //    - Assertion 7 (FIX-04): Direct Flashlight Beam Drag illuminates targets & updates observations
    //    - Assertion 2 (FIX-02): Partial goal completion only lights that sub-goal
    //    - Assertion 3 (FIX-02): 3 separate partial runs accumulate 3/3 history while hasEverCompletedFullCampRun === false
    // =========================================================================
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const mPage = await mobileContext.newPage();
    await mPage.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Open Story Grove from Island Map
    await mPage.getByRole('button', { name: /进入故事森林/ }).first().click();

    // Open cup-size interactive scene
    await mPage.locator('[data-testid="story-catalog-leaf-cup-size"]').click();
    await unlockAdultPreviewIfBlocked(mPage);
    await mPage.locator('[data-testid="interactive-leaf-view-cup-size"]').waitFor();

    // First click a one-sided action and click the revise button alone -> verify revisionCount stays 0
    await mPage.locator('[data-testid="story-action-act_only_look_squirrel"]').click();
    await mPage.locator('[data-testid="story-revise-action-btn"]').click();
    assert.equal(
      await mPage.locator('[data-testid="story-revised-badge"]').count(),
      0,
      'Clicking revise button alone before changing action must not show revised badge'
    );

    // Assertion 1A (FIX-01 on Cup-Size): Clicking positive action before observing both references does NOT reveal final truth
    await mPage.locator('[data-testid="story-action-act_compare_both_sides"]').click();
    const cupSceneConsequenceBefore = await mPage
      .locator('[data-testid="story-action-outcome-panel"]')
      .innerText();
    const cupHasEvidenceBefore = await mPage
      .locator('[data-testid="story-action-outcome-panel"]')
      .getAttribute('data-has-required-evidence');
    assert.equal(
      cupHasEvidenceBefore,
      'false',
      'FIX-01: Cup comparison without evidence must have data-has-required-evidence="false"'
    );
    assert.ok(
      !cupSceneConsequenceBefore.includes('比积木高、又比水桶矮'),
      'FIX-01: Cup comparison without evidence must not prematurely reveal the dual-reference truth'
    );

    // Assertion 6 (FIX-04): Drag movable blue cup onto NEXT_TO_BLOCK and NEXT_TO_BUCKET dropzones
    await dragFromElementToElement(
      mPage,
      '[data-testid="movable-blue-cup-prop"]',
      '[data-testid="cup-dropzone-NEXT_TO_BLOCK"]'
    );
    const cupPosBlock = await mPage
      .locator('[data-testid="movable-blue-cup-prop"]')
      .getAttribute('data-cup-position');
    assert.equal(cupPosBlock, 'NEXT_TO_BLOCK', 'FIX-04: Dragging cup to block dropzone must set position to NEXT_TO_BLOCK');
    assert.equal(
      await mPage.locator('[data-testid="cup-vs-block-visual-badge"]').count(),
      1,
      'FIX-04: Dragging cup to block must display visual comparison badge'
    );

    await dragFromElementToElement(
      mPage,
      '[data-testid="movable-blue-cup-prop"]',
      '[data-testid="cup-dropzone-NEXT_TO_BUCKET"]'
    );
    const cupPosBucket = await mPage
      .locator('[data-testid="movable-blue-cup-prop"]')
      .getAttribute('data-cup-position');
    assert.equal(cupPosBucket, 'NEXT_TO_BUCKET', 'FIX-04: Dragging cup to bucket dropzone must set position to NEXT_TO_BUCKET');
    assert.equal(
      await mPage.locator('[data-testid="cup-vs-bucket-visual-badge"]').count(),
      1,
      'FIX-04: Dragging cup to bucket must display visual comparison badge'
    );

    // Now select the dual-comparison action and verify full evidence & genuine revision
    await mPage.locator('[data-testid="story-action-act_compare_both_sides"]').click();
    await mPage.locator('[data-testid="story-island-linkage-banner"]').waitFor();
    const cupHasEvidenceAfter = await mPage
      .locator('[data-testid="story-action-outcome-panel"]')
      .getAttribute('data-has-required-evidence');
    assert.equal(cupHasEvidenceAfter, 'true', 'FIX-01/04: Cup comparison after dragging to both references must have required evidence');
    assert.equal(
      await mPage.locator('[data-testid="story-revised-badge"]').isVisible(),
      true,
      'Genuine behavioral revision must show revised badge'
    );

    const mobileOverflowCup = await mPage.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    assert.equal(mobileOverflowCup, true, 'Mobile 390px cup-size view must not overflow horizontally');

    await mPage.evaluate(() => {
      document.querySelectorAll('.overflow-y-auto').forEach((el) => {
        el.scrollTop = 0;
      });
    });
    const shotMobileCup = await mPage.screenshot({ fullPage: false });
    saveScreenshotEverywhere('sprint4-mobile-390-showcaseA-cup-prop-manipulation.png', shotMobileCup);

    results.mobilePath1Cup = {
      cupHasEvidenceBefore,
      cupPosBlock,
      cupPosBucket,
      cupHasEvidenceAfter,
      mobileOverflowCup,
    };

    // Now test Camp Night on Mobile 390px:
    // Verify Assertion 1B (FIX-01 on Camp Night), Assertion 7 (FIX-04 Flashlight Beam Drag),
    // Assertion 2 (FIX-02 Single Goal), and Assertion 3 (FIX-02 Three Separate Partial Runs Counterexample)
    await mPage.getByRole('button', { name: /返回目录/ }).click();
    await mPage.locator('[data-testid="open-camp-transfer-challenge"]').click();
    await unlockAdultPreviewIfBlocked(mPage);
    await mPage.locator('[data-testid="story-grove-transfer-challenge-view"]').waitFor();

    // Assertion 1B (FIX-01 Counterexample): Directly click "照亮窗外核实黑影" without illuminating outside objects
    await mPage.locator('[data-testid="camp-action-camp_act_shine_light_check_branch"]').click();
    const campOutcomeBeforeLight = await mPage
      .locator('[data-testid="camp-transfer-svg-scene"]')
      .getAttribute('data-camp-outcome');
    const campPanelBeforeLight = await mPage
      .locator('[data-testid="camp-action-consequence-panel"]')
      .innerText();
    const campHasEvidenceBeforeLight = await mPage
      .locator('[data-testid="camp-action-consequence-panel"]')
      .getAttribute('data-has-required-evidence');
    assert.equal(
      campOutcomeBeforeLight,
      'PENDING_OBSERVATION',
      'FIX-01: Selecting check_branch without illuminating outside objects must stay PENDING_OBSERVATION'
    );
    assert.equal(
      campHasEvidenceBeforeLight,
      'false',
      'FIX-01: Selecting check_branch without illuminating outside objects must have data-has-required-evidence="false"'
    );
    assert.ok(
      !campPanelBeforeLight.includes('两颗松果的树枝'),
      'FIX-01: Selecting check_branch without illuminating outside objects must NOT prematurely reveal pinecone truth'
    );

    // Assertion 7 (FIX-04): Drag flashlight beam across SVG canvas onto SHADOW_CURTAIN and OUTSIDE_BRANCH
    await dragFromElementToElement(
      mPage,
      '[data-testid="camp-draggable-flashlight"]',
      '[data-testid="camp-region-SHADOW_CURTAIN"]'
    );
    assert.equal(
      await mPage.locator('[data-testid="camp-transfer-svg-scene"]').getAttribute('data-beam-target'),
      'SHADOW_CURTAIN',
      'FIX-04: Dragging flashlight beam to SHADOW_CURTAIN zone must aim beam at SHADOW_CURTAIN'
    );

    await dragFromElementToElement(
      mPage,
      '[data-testid="camp-region-SHADOW_CURTAIN"]',
      '[data-testid="camp-region-OUTSIDE_BRANCH"]'
    );
    assert.equal(
      await mPage.locator('[data-testid="camp-transfer-svg-scene"]').getAttribute('data-beam-target'),
      'OUTSIDE_BRANCH',
      'FIX-04: Dragging flashlight beam to OUTSIDE_BRANCH zone must aim beam at OUTSIDE_BRANCH'
    );

    // Now that both outside targets are illuminated via beam drag, SHADOW_INVESTIGATION is verified!
    const campOutcomeAfterLight = await mPage
      .locator('[data-testid="camp-transfer-svg-scene"]')
      .getAttribute('data-camp-outcome');
    assert.equal(
      campOutcomeAfterLight,
      'SHADOW_REVEALED',
      'FIX-01/04: After illuminating SHADOW_CURTAIN and OUTSIDE_BRANCH, camp outcome must update to SHADOW_REVEALED'
    );

    // Assertion 2 (FIX-02): Partial goal completion lights ONLY SHADOW_INVESTIGATION (1/3)
    const run1ShadowDone = await mPage
      .locator('[data-testid="camp-goal-badge-SHADOW_INVESTIGATION"]')
      .getAttribute('data-completed');
    const run1BoundaryDone = await mPage
      .locator('[data-testid="camp-goal-badge-PERSONAL_BOUNDARY"]')
      .getAttribute('data-completed');
    const run1SharedDone = await mPage
      .locator('[data-testid="camp-goal-badge-SHARED_RESOURCE"]')
      .getAttribute('data-completed');
    assert.equal(run1ShadowDone, 'true', 'FIX-02: SHADOW_INVESTIGATION must be completed in Run 1');
    assert.equal(run1BoundaryDone, 'false', 'FIX-02: PERSONAL_BOUNDARY must remain false in Run 1');
    assert.equal(run1SharedDone, 'false', 'FIX-02: SHARED_RESOURCE must remain false in Run 1');

    const mobileOverflowCamp = await mPage.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    assert.equal(mobileOverflowCamp, true, 'Mobile 390px camp transfer view must not overflow horizontally');

    await mPage.evaluate(() => {
      document.querySelectorAll('.overflow-y-auto').forEach((el) => {
        el.scrollTop = 0;
      });
    });
    const shotMobileCamp = await mPage.screenshot({ fullPage: false });
    saveScreenshotEverywhere(
      'sprint4-mobile-390-showcaseB-camp-beam-and-multigoal.png',
      shotMobileCamp
    );

    // Complete Run 2 (ONLY PERSONAL_BOUNDARY) and Run 3 (ONLY SHARED_RESOURCE) to verify Assertion 3 (FIX-02 Counterexample)
    await mPage.getByRole('button', { name: /返回目录/ }).click();
    await mPage.locator('[data-testid="open-camp-transfer-challenge"]').click();
    await unlockAdultPreviewIfBlocked(mPage);
    await mPage.locator('[data-testid="story-grove-transfer-challenge-view"]').waitFor();
    await dragFromElementToElement(
      mPage,
      '[data-testid="camp-draggable-flashlight"]',
      '[data-testid="camp-region-TENT_INSIDE"]'
    );
    await mPage.locator('[data-testid="camp-action-camp_act_state_comfort_boundary"]').click();

    await mPage.getByRole('button', { name: /返回目录/ }).click();
    await mPage.locator('[data-testid="open-camp-transfer-challenge"]').click();
    await unlockAdultPreviewIfBlocked(mPage);
    await mPage.locator('[data-testid="story-grove-transfer-challenge-view"]').waitFor();
    await dragFromElementToElement(
      mPage,
      '[data-testid="camp-draggable-flashlight"]',
      '[data-testid="camp-region-LANTERN_DIFFUSER"]'
    );
    await mPage.locator('[data-testid="camp-action-camp_act_share_flashlight_roles"]').click();

    const metricsAfterThreePartialRuns = await getStoredMetrics(mPage);
    assert.equal(
      metricsAfterThreePartialRuns.historicalCompletedCampGoals.length,
      3,
      'FIX-02 Counterexample: 3 separate partial runs must accumulate 3/3 in historicalCompletedCampGoals'
    );
    assert.equal(
      metricsAfterThreePartialRuns.latestCampTransferAttempt.isCompleted,
      false,
      'FIX-02 Counterexample: latestCampTransferAttempt.isCompleted must be false when only 1/3 was completed in Run 3'
    );
    assert.equal(
      metricsAfterThreePartialRuns.hasEverCompletedFullCampRun,
      false,
      'FIX-02 Counterexample: hasEverCompletedFullCampRun MUST remain false after 3 separate partial runs!'
    );

    results.mobilePath2CampAndFix02Counterexample = {
      campOutcomeBeforeLight,
      campOutcomeAfterLight,
      historicalGoalsCount: metricsAfterThreePartialRuns.historicalCompletedCampGoals.length,
      latestAttemptCompleted: metricsAfterThreePartialRuns.latestCampTransferAttempt.isCompleted,
      hasEverCompletedFullCampRun: metricsAfterThreePartialRuns.hasEverCompletedFullCampRun,
      mobileOverflowCamp,
    };

    await mobileContext.close();

    // =========================================================================
    // 2. Desktop 1440x900 Verification:
    //    - Cup drag on 1440x900
    //    - Assertion 5 (FIX-03): Autonomous trial-and-error + self-revision without hint records UNPROMPTED_AUTONOMOUS_COMPLETION
    //    - Full 3/3 single-run completion sets hasEverCompletedFullCampRun === true & lights Island Lantern
    //    - Assertion 4 (FIX-02): Re-entering and executing a failed/conflict action preserves historical lantern while marking current attempt incomplete & conflict
    // =========================================================================
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const dPage = await desktopContext.newPage();
    await dPage.goto(BASE_URL, { waitUntil: 'networkidle' });

    await dPage.getByRole('button', { name: /进入故事森林/ }).first().click();

    // Showcase A on Desktop 1440px: Drag cup to block and bucket
    await dPage.locator('[data-testid="story-catalog-leaf-cup-size"]').click();
    await unlockAdultPreviewIfBlocked(dPage);
    await dPage.locator('[data-testid="interactive-leaf-view-cup-size"]').waitFor();
    await dragFromElementToElement(
      dPage,
      '[data-testid="movable-blue-cup-prop"]',
      '[data-testid="cup-dropzone-NEXT_TO_BLOCK"]'
    );
    await dragFromElementToElement(
      dPage,
      '[data-testid="movable-blue-cup-prop"]',
      '[data-testid="cup-dropzone-NEXT_TO_BUCKET"]'
    );
    await dPage.locator('[data-testid="story-action-act_compare_both_sides"]').click();
    await dPage.locator('[data-testid="story-island-linkage-banner"]').waitFor();

    await dPage.evaluate(() => {
      document.querySelectorAll('.overflow-y-auto').forEach((el) => {
        el.scrollTop = 0;
      });
    });
    const shotDesktopCup = await dPage.screenshot({ fullPage: false });
    saveScreenshotEverywhere(
      'sprint4-desktop-1440-showcaseA-cup-prop-manipulation.png',
      shotDesktopCup
    );

    // Showcase B on Desktop 1440px:
    // First try an unverified/conflict action (autonomous trial-and-error WITHOUT clicking external hint),
    // then complete all 3 Camp Night goals via beam drag + actions -> verify UNPROMPTED_AUTONOMOUS_COMPLETION!
    await dPage.getByRole('button', { name: /返回目录/ }).click();
    await dPage.locator('[data-testid="open-camp-transfer-challenge"]').click();
    await unlockAdultPreviewIfBlocked(dPage);
    await dPage.locator('[data-testid="story-grove-transfer-challenge-view"]').waitFor();

    // Autonomous trial-and-error step: try panic action first without using any hint
    await dPage.locator('[data-testid="camp-action-camp_act_guess_monster_scream"]').click();

    // Now autonomously self-revise and complete all 3 goals via beam drag + actions
    await dragFromElementToElement(
      dPage,
      '[data-testid="camp-draggable-flashlight"]',
      '[data-testid="camp-region-SHADOW_CURTAIN"]'
    );
    await dragFromElementToElement(
      dPage,
      '[data-testid="camp-region-SHADOW_CURTAIN"]',
      '[data-testid="camp-region-OUTSIDE_BRANCH"]'
    );
    await dPage.locator('[data-testid="camp-action-camp_act_shine_light_check_branch"]').click();

    await dragFromElementToElement(
      dPage,
      '[data-testid="camp-region-OUTSIDE_BRANCH"]',
      '[data-testid="camp-region-TENT_INSIDE"]'
    );
    await dPage.locator('[data-testid="camp-action-camp_act_state_comfort_boundary"]').click();

    await dragFromElementToElement(
      dPage,
      '[data-testid="camp-region-TENT_INSIDE"]',
      '[data-testid="camp-region-LANTERN_DIFFUSER"]'
    );
    await dPage.locator('[data-testid="camp-action-camp_act_share_flashlight_roles"]').click();

    const metricsFullRun = await getStoredMetrics(dPage);
    assert.equal(
      metricsFullRun.hasEverCompletedFullCampRun,
      true,
      'Completing all 3 goals in a single run must set hasEverCompletedFullCampRun === true'
    );
    assert.equal(
      metricsFullRun.latestCampTransferAttempt.isCompleted,
      true,
      'Completing all 3 goals in a single run must set latestCampTransferAttempt.isCompleted === true'
    );
    // Assertion 5 (FIX-03): Autonomous trial-and-error + self-revision without external hint MUST be UNPROMPTED_AUTONOMOUS_COMPLETION
    assert.equal(
      metricsFullRun.latestCampTransferAttempt.triedMultipleMethods,
      true,
      'FIX-03: Trying a wrong action before succeeding must record triedMultipleMethods === true'
    );
    assert.equal(
      metricsFullRun.latestCampTransferAttempt.selfRevisedAfterConsequence,
      true,
      'FIX-03: Self-revising after observing consequence must record selfRevisedAfterConsequence === true'
    );
    assert.equal(
      metricsFullRun.latestCampTransferAttempt.usedExternalHint,
      false,
      'FIX-03: Autonomous revision without clicking hint must keep usedExternalHint === false'
    );
    assert.equal(
      metricsFullRun.latestCampTransferAttempt.independenceLevel,
      'UNPROMPTED_AUTONOMOUS_COMPLETION',
      'FIX-03: Autonomous trial-and-error without external hint MUST be UNPROMPTED_AUTONOMOUS_COMPLETION'
    );

    await dPage.evaluate(() => {
      document.querySelectorAll('.overflow-y-auto').forEach((el) => {
        el.scrollTop = 0;
      });
    });
    const shotDesktopCamp = await dPage.screenshot({ fullPage: false });
    saveScreenshotEverywhere('sprint4-desktop-1440-showcaseB-camp-all-goals.png', shotDesktopCamp);

    // Return to Island -> check lantern
    await dPage.locator('[data-testid="camp-return-island-btn"]').click();
    await dPage.locator('[data-testid="island-svg-camp-transfer-lantern"]').waitFor();
    const lanternLitAfterFirstComplete = await dPage
      .locator('[data-testid="island-svg-camp-transfer-lantern"]')
      .count();
    assert.equal(lanternLitAfterFirstComplete, 1, 'Island camp lantern must be lit after full 3/3 run');

    // Assertion 4 (FIX-02): Re-enter Camp Night -> execute failed/conflict action -> verify current scene does NOT claim solved while historical lantern persists
    await dPage.getByRole('button', { name: /进入故事森林/ }).first().click();
    await dPage.locator('[data-testid="open-camp-transfer-challenge"]').click();
    await unlockAdultPreviewIfBlocked(dPage);
    await dPage.locator('[data-testid="camp-historical-lantern-badge"]').waitFor();
    await dPage.locator('[data-testid="camp-action-camp_act_guess_monster_scream"]').click();

    const conflictSceneOutcome = await dPage
      .locator('[data-testid="camp-transfer-svg-scene"]')
      .getAttribute('data-camp-outcome');
    assert.equal(
      conflictSceneOutcome,
      'PANIC_CONFLICT',
      'FIX-02: Choosing a conflict action must show PANIC_CONFLICT outcome in current scene'
    );
    assert.equal(
      await dPage.locator('[data-testid="camp-return-island-btn"]').count(),
      0,
      'FIX-02: Current conflict scene must NOT simultaneously claim all problems are currently solved'
    );

    const metricsAfterFailedReplay = await getStoredMetrics(dPage);
    assert.equal(
      metricsAfterFailedReplay.hasEverCompletedFullCampRun,
      true,
      'FIX-02: Historical full-run achievement must remain true after a failed replay'
    );
    assert.equal(
      metricsAfterFailedReplay.latestCampTransferAttempt.isCompleted,
      false,
      'FIX-02: Latest attempt after failed replay must truthfully be isCompleted === false'
    );

    await dPage.getByRole('button', { name: '离开故事林' }).click();
    const lanternStillLitAfterFailedReplay = await dPage
      .locator('[data-testid="island-svg-camp-transfer-lantern"]')
      .count();
    assert.equal(
      lanternStillLitAfterFailedReplay,
      1,
      'FIX-02: Island lantern must remain lit based on historical full-run completion'
    );

    const shotDesktopIsland = await dPage.screenshot({ fullPage: false });
    saveScreenshotEverywhere(
      'sprint4-desktop-1440-fix04-island-lantern-persisted.png',
      shotDesktopIsland
    );

    results.desktopFullAndFix03Fix04 = {
      hasEverCompletedFullCampRun: metricsFullRun.hasEverCompletedFullCampRun,
      independenceLevel: metricsFullRun.latestCampTransferAttempt.independenceLevel,
      triedMultipleMethods: metricsFullRun.latestCampTransferAttempt.triedMultipleMethods,
      selfRevisedAfterConsequence: metricsFullRun.latestCampTransferAttempt.selfRevisedAfterConsequence,
      conflictSceneOutcome,
      latestCompletedAfterFailedReplay: metricsAfterFailedReplay.latestCampTransferAttempt.isCompleted,
      lanternStillLitAfterFailedReplay,
    };

    await desktopContext.close();
    console.log('ALL 7 SPRINT 4.1 REAL BROWSER ASSERTIONS PASSED:');
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
}

runVerification().catch((err) => {
  console.error('SPRINT 4.1 BROWSER VERIFICATION FAILED:', err);
  process.exit(1);
});
