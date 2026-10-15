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
  await blockedGate.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
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

async function runVerification() {
  const browser = await chromium.launch({ headless: true });
  const results = {};

  try {
    // =========================================================================
    // 1. Mobile 390x844 Full Path 1 (Showcase A: Cup Prop) & Path 2 (Showcase B: Camp Flashlight)
    // =========================================================================
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
    });
    const mPage = await mobileContext.newPage();
    await mPage.goto(BASE_URL, { waitUntil: 'networkidle' });

    // Open Story Grove from Island Map
    await mPage.getByRole('button', { name: /进入故事森林/ }).first().click();

    // Path 1: Open cup-size interactive scene
    await mPage.locator('[data-testid="story-catalog-leaf-cup-size"]').click();
    await unlockAdultPreviewIfBlocked(mPage);
    await mPage.locator('[data-testid="interactive-leaf-view-cup-size"]').waitFor();

    // Verify Counterexample 4: clicking revise button alone after first action does NOT show revised badge
    await mPage.locator('[data-testid="story-action-act_only_look_squirrel"]').click();
    await mPage.locator('[data-testid="story-revise-action-btn"]').click();
    const prematureReviseBadge = await mPage.locator('[data-testid="story-revised-badge"]').count();

    // Verify Counterexample 3: 2 unrelated observations (blue cup + twig ruler) do NOT complete dual-comparison
    await mPage.locator('[data-testid="story-hotspot-obj_blue_cup"]').click();
    await mPage.locator('[data-testid="story-hotspot-obj_twig_ruler"]').click();
    await mPage.locator('[data-testid="story-action-act_compare_both_sides"]').click();
    const missingPromptVisible = await mPage
      .locator('[data-testid="story-missing-evidence-prompt"]')
      .isVisible();
    const prematureCompleteBanner = await mPage
      .locator('[data-testid="story-island-linkage-banner"]')
      .count();

    // Direct Cup Manipulation: move cup to block, then move cup to bucket, then compare both sides
    await mPage.locator('[data-testid="move-cup-to-block"]').click();
    const cupPosBlock = await mPage
      .locator('[data-testid="movable-blue-cup-prop"]')
      .getAttribute('data-cup-position');
    const blockVisualBadge = await mPage
      .locator('[data-testid="cup-vs-block-visual-badge"]')
      .count();

    await mPage.locator('[data-testid="move-cup-to-bucket"]').click();
    const cupPosBucket = await mPage
      .locator('[data-testid="movable-blue-cup-prop"]')
      .getAttribute('data-cup-position');
    const bucketVisualBadge = await mPage
      .locator('[data-testid="cup-vs-bucket-visual-badge"]')
      .count();

    await mPage.locator('[data-testid="story-action-act_compare_both_sides"]').click();
    await mPage.locator('[data-testid="story-island-linkage-banner"]').waitFor();
    const genuineReviseBadge = await mPage
      .locator('[data-testid="story-revised-badge"]')
      .isVisible();

    const mobileOverflowCup = await mPage.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );

    await mPage.evaluate(() => {
      document.querySelectorAll('.overflow-y-auto').forEach((el) => {
        el.scrollTop = 0;
      });
    });
    const shotMobileCup = await mPage.screenshot({ fullPage: false });
    saveScreenshotEverywhere('sprint4-mobile-390-showcaseA-cup-prop-manipulation.png', shotMobileCup);

    results.mobilePath1Cup = {
      missingPromptVisible,
      prematureCompleteBanner,
      prematureReviseBadge,
      cupPosBlock,
      blockVisualBadge,
      cupPosBucket,
      bucketVisualBadge,
      genuineReviseBadge,
      mobileOverflowCup,
    };

    // Path 2 on 390px: Return to catalog and open Camp Night Transfer Challenge
    await mPage.getByRole('button', { name: /返回目录/ }).click();
    await mPage.locator('[data-testid="open-camp-transfer-challenge"]').click();
    await unlockAdultPreviewIfBlocked(mPage);
    await mPage.locator('[data-testid="story-grove-transfer-challenge-view"]').waitFor();

    // Verify FIX-05: Uninspected branch hotspot uses neutral label without "松果"
    const branchLabelBefore = await mPage
      .locator('[data-testid="camp-hotspot-camp_obj_pinecone_branch"]')
      .innerText();

    // Aim flashlight at peer (TENT_INSIDE) and complete ONLY PERSONAL_BOUNDARY
    await mPage.locator('[data-testid="aim-flashlight-TENT_INSIDE"]').click();
    await mPage.locator('[data-testid="camp-action-camp_act_state_comfort_boundary"]').click();

    const boundaryGoalDone = await mPage
      .locator('[data-testid="camp-goal-badge-PERSONAL_BOUNDARY"]')
      .getAttribute('data-completed');
    const shadowGoalDone = await mPage
      .locator('[data-testid="camp-goal-badge-SHADOW_INVESTIGATION"]')
      .getAttribute('data-completed');
    const sharedGoalDone = await mPage
      .locator('[data-testid="camp-goal-badge-SHARED_RESOURCE"]')
      .getAttribute('data-completed');

    // Aim flashlight at OUTSIDE_BRANCH to reveal pinecone branch
    await mPage.locator('[data-testid="aim-flashlight-OUTSIDE_BRANCH"]').click();
    const branchLabelAfter = await mPage
      .locator('[data-testid="camp-hotspot-camp_obj_pinecone_branch"]')
      .innerText();
    const beamTargetAttr = await mPage
      .locator('[data-testid="camp-transfer-svg-scene"]')
      .getAttribute('data-beam-target');

    const mobileOverflowCamp = await mPage.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );

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

    results.mobilePath2Camp = {
      branchLabelBefore: branchLabelBefore.trim(),
      branchLabelAfter: branchLabelAfter.trim(),
      boundaryGoalDone,
      shadowGoalDone,
      sharedGoalDone,
      beamTargetAttr,
      mobileOverflowCamp,
    };

    await mobileContext.close();

    // =========================================================================
    // 2. Desktop 1440x900 Full Path 1 & Path 2 + FIX-04 Historical Lantern Persistence
    // =========================================================================
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const dPage = await desktopContext.newPage();
    await dPage.goto(BASE_URL, { waitUntil: 'networkidle' });

    await dPage.getByRole('button', { name: /进入故事森林/ }).first().click();

    // Path 1 on Desktop: Cup manipulation
    await dPage.locator('[data-testid="story-catalog-leaf-cup-size"]').click();
    await unlockAdultPreviewIfBlocked(dPage);
    await dPage.locator('[data-testid="interactive-leaf-view-cup-size"]').waitFor();
    await dPage.locator('[data-testid="move-cup-to-block"]').click();
    await dPage.locator('[data-testid="move-cup-to-bucket"]').click();
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

    // Path 2 on Desktop: Complete all 3 Camp Night goals -> verify Island Lantern -> Re-enter & fail -> verify Lantern stays lit
    await dPage.getByRole('button', { name: /返回目录/ }).click();
    await dPage.locator('[data-testid="open-camp-transfer-challenge"]').click();
    await unlockAdultPreviewIfBlocked(dPage);
    await dPage.locator('[data-testid="story-grove-transfer-challenge-view"]').waitFor();

    // Goal 1: Shadow investigation
    await dPage.locator('[data-testid="aim-flashlight-SHADOW_CURTAIN"]').click();
    await dPage.locator('[data-testid="aim-flashlight-OUTSIDE_BRANCH"]').click();
    await dPage.locator('[data-testid="camp-action-camp_act_shine_light_check_branch"]').click();

    // Goal 2: Personal boundary
    await dPage.locator('[data-testid="aim-flashlight-TENT_INSIDE"]').click();
    await dPage.locator('[data-testid="camp-action-camp_act_state_comfort_boundary"]').click();

    // Goal 3: Shared flashlight resource
    await dPage.locator('[data-testid="aim-flashlight-LANTERN_DIFFUSER"]').click();
    await dPage.locator('[data-testid="camp-action-camp_act_share_flashlight_roles"]').click();

    const allThreeGoalsDone = {
      shadow: await dPage
        .locator('[data-testid="camp-goal-badge-SHADOW_INVESTIGATION"]')
        .getAttribute('data-completed'),
      boundary: await dPage
        .locator('[data-testid="camp-goal-badge-PERSONAL_BOUNDARY"]')
        .getAttribute('data-completed'),
      shared: await dPage
        .locator('[data-testid="camp-goal-badge-SHARED_RESOURCE"]')
        .getAttribute('data-completed'),
    };

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

    // FIX-04 Verification: Re-enter Story Grove -> Camp Night -> execute unsuccessful panic action -> return to Island
    await dPage.getByRole('button', { name: /进入故事森林/ }).first().click();
    await dPage.locator('[data-testid="open-camp-transfer-challenge"]').click();
    await unlockAdultPreviewIfBlocked(dPage);
    await dPage.locator('[data-testid="camp-historical-lantern-badge"]').waitFor();
    await dPage.locator('[data-testid="camp-action-camp_act_guess_monster_scream"]').click();
    await dPage.getByRole('button', { name: '离开故事林' }).click();

    const lanternStillLitAfterFailedReplay = await dPage
      .locator('[data-testid="island-svg-camp-transfer-lantern"]')
      .count();
    const islandStoryBadgeText = await dPage
      .locator('[data-testid="island-story-grove-progress-badge"]')
      .innerText();

    const shotDesktopIsland = await dPage.screenshot({ fullPage: false });
    saveScreenshotEverywhere(
      'sprint4-desktop-1440-fix04-island-lantern-persisted.png',
      shotDesktopIsland
    );

    results.desktopPath2AndFix04 = {
      allThreeGoalsDone,
      lanternLitAfterFirstComplete,
      lanternStillLitAfterFailedReplay,
      islandStoryBadgeText: islandStoryBadgeText.trim(),
    };

    await desktopContext.close();
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
  }
}

runVerification().catch((err) => {
  console.error(err);
  process.exit(1);
});
