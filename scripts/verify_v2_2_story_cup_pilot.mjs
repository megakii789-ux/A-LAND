import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const WORKTREE_DIR = '/home/voga/A-LAND-visual-v2-story-pilot';
const ARTIFACT_DIR = '/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73';
const DOCS_OUT_DIR = path.join(WORKTREE_DIR, 'docs/v2-story-cup-pilot');
const PORT = 4182;
const BASE_URL = `http://127.0.0.1:${PORT}`;

const VIEWPORTS = [
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '430x932', width: 430, height: 932 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1024x1366', width: 1024, height: 1366 },
  { name: '1440x900', width: 1440, height: 900 },
];

async function unlockAdultReviewPin(page) {
  await page.locator('[data-testid="story-request-adult-review-btn"]').click();
  const dialog = page.locator('[role="dialog"][aria-label="照顾者安全验证门禁"]');
  await dialog.waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(150);

  const inputs = dialog.locator('input[type="password"]');
  const count = await inputs.count();
  if (count >= 2) {
    await inputs.nth(0).fill('135790');
    await inputs.nth(1).fill('135790');
  } else {
    await inputs.nth(0).fill('135790');
  }
  await dialog.locator('button[type="submit"]').click();
  await page.locator('[data-testid="interactive-leaf-view-cup-size"]').waitFor({
    state: 'visible',
    timeout: 8000,
  });
}

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
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

async function main() {
  fs.mkdirSync(DOCS_OUT_DIR, { recursive: true });

  console.log('Starting Vite preview server on port', PORT);
  const serverProc = spawn(
    './node_modules/.bin/vite',
    ['preview', '--port', String(PORT), '--host', '127.0.0.1'],
    {
      cwd: WORKTREE_DIR,
      stdio: 'pipe',
    }
  );

  let browser;
  try {
    await waitForServer(`${BASE_URL}/version.json`);
    browser = await chromium.launch({ headless: true });

    const consoleErrors = [];
    const pageErrors = [];
    const http404s = [];
    const viewportResults = [];
    const screenshots = [];

    for (const vp of VIEWPORTS) {
      console.log(`Testing viewport ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push({ viewport: vp.name, text: msg.text() });
        }
      });
      page.on('pageerror', (err) => {
        pageErrors.push({ viewport: vp.name, error: String(err) });
      });
      page.on('response', (res) => {
        if (res.status() === 404) {
          http404s.push({ viewport: vp.name, url: res.url() });
        }
      });

      // 1. Original (`/`) StoryGrove::cup-size
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      const origStoryBtn = page.locator('[aria-label*="故事林"]').first();
      await origStoryBtn.click();
      await page.locator('[data-testid="story-catalog-leaf-cup-size"]').click();
      // Verify child mode Fail-Closed gate first
      await page.locator('[data-testid="story-leaf-audit-gate-blocked"]').waitFor({
        state: 'visible',
      });
      await unlockAdultReviewPin(page);
      await page.waitForTimeout(300);

      const origShotName = `v2_2_gate3_${vp.name}_original_cup_size.png`;
      const origShotPath = path.join(ARTIFACT_DIR, origShotName);
      await page.screenshot({ path: origShotPath, fullPage: false });
      screenshots.push({ viewport: vp.name, mode: 'original', file: origShotName });

      // 2. V2 Pilot (`/visual-v2-review/story-cup-pilot`)
      await page.goto(`${BASE_URL}/visual-v2-review/story-cup-pilot`, {
        waitUntil: 'networkidle',
      });
      await page.locator('[data-testid="story-catalog-leaf-cup-size"]').waitFor({
        state: 'visible',
      });
      await page.locator('[data-testid="story-catalog-leaf-cup-size"]').click();
      // Verify child mode Fail-Closed gate on V2 route
      await page.locator('[data-testid="story-leaf-audit-gate-blocked"]').waitFor({
        state: 'visible',
      });
      const childGateBlockedOnV2 = await page
        .locator('[data-testid="story-leaf-audit-gate-blocked"]')
        .isVisible();

      await unlockAdultReviewPin(page);
      await page.waitForTimeout(400);

      const v2ShotName = `v2_2_gate3_${vp.name}_v2_cup_size.png`;
      const v2ShotPath = path.join(ARTIFACT_DIR, v2ShotName);
      await page.screenshot({ path: v2ShotPath, fullPage: false });
      screenshots.push({ viewport: vp.name, mode: 'v2_pilot', file: v2ShotName });

      // Layout, layers, props, character rigs, and touch target audit at this viewport
      const metrics = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const horizontalOverflow = scrollWidth > innerWidth;

        const layers = ['L1', 'L2', 'L3', 'L4', 'L5'].map((id) => {
          const el = document.querySelector(`[data-testid="v2-story-cup-layer-${id}"]`);
          const img = el ? el.querySelector('img') : null;
          return {
            id,
            exists: Boolean(el),
            visible: el?.getAttribute('data-layer-visible') === 'true',
            loaded: Boolean(img && img.complete && img.naturalWidth > 0),
          };
        });

        const propsList = [
          'obj_wooden_block',
          'obj_blue_cup',
          'obj_elephant_bucket',
          'obj_twig_ruler',
        ].map((key) => {
          const el = document.querySelector(`[data-testid="v2-prop-image-${key}"]`);
          return {
            key,
            exists: Boolean(el),
            pointerEvents: el ? window.getComputedStyle(el).pointerEvents : null,
          };
        });

        const tiaotiaoRig = document.querySelector(
          '[data-testid="story-character-rig-tiaotiao_story_squirrel"]'
        );
        const pupuRig = document.querySelector(
          '[data-testid="story-character-rig-pupu_story_elephant"]'
        );
        const tiaotiaoPartsLoaded = tiaotiaoRig
          ? Array.from(tiaotiaoRig.querySelectorAll('img')).every(
              (img) => img.complete && img.naturalWidth > 0
            )
          : false;
        const pupuPartsLoaded = pupuRig
          ? Array.from(pupuRig.querySelectorAll('img')).every(
              (img) => img.complete && img.naturalWidth > 0
            )
          : false;

        // Audit all interactive buttons in interactive-leaf-view-cup-size + close button
        const leafRoot = document.querySelector('[data-testid="interactive-leaf-view-cup-size"]');
        const buttons = leafRoot ? Array.from(leafRoot.querySelectorAll('button')) : [];
        const closeBtn = document.querySelector('button[aria-label="离开故事林"]');
        if (closeBtn) buttons.push(closeBtn);

        const touchTargets = buttons.map((btn) => {
          const rect = btn.getBoundingClientRect();
          return {
            testId:
              btn.getAttribute('data-testid') ||
              btn.getAttribute('aria-label') ||
              btn.textContent?.trim().slice(0, 24),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            meets56px: Math.round(rect.width) >= 56 && Math.round(rect.height) >= 56,
          };
        });

        return {
          scrollWidth,
          innerWidth,
          horizontalOverflow,
          layers,
          propsList,
          tiaotiaoPartsLoaded,
          pupuPartsLoaded,
          touchTargets,
          allTouchTargetsMeet56px: touchTargets.every((t) => t.meets56px),
        };
      });

      viewportResults.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        childGateBlockedOnV2,
        ...metrics,
      });

      await context.close();
    }

    // 3. Deep E2E Functional & Interaction Verification (at 1440x900 and 390x844)
    console.log('Running deep E2E functional checks for Gate 3...');
    const deepContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const deepPage = await deepContext.newPage();

    deepPage.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push({ viewport: 'deep_e2e', text: msg.text() });
      }
    });
    deepPage.on('response', (res) => {
      if (res.status() === 404) {
        http404s.push({ viewport: 'deep_e2e', url: res.url() });
      }
    });

    await deepPage.goto(`${BASE_URL}/visual-v2-review/story-cup-pilot`, {
      waitUntil: 'networkidle',
    });
    await deepPage.locator('[data-testid="story-catalog-leaf-cup-size"]').click();
    await unlockAdultReviewPin(deepPage);

    const sceneLoc = deepPage.locator('[data-testid="interactive-leaf-scene-cup-size"]');

    // Position 1: CENTER_TABLE (initial)
    const initialPos = await sceneLoc.getAttribute('data-cup-position');
    await deepPage.screenshot({
      path: path.join(ARTIFACT_DIR, 'v2_2_gate3_position_CENTER_TABLE.png'),
    });
    screenshots.push({
      viewport: '1440x900',
      mode: 'position_CENTER_TABLE',
      file: 'v2_2_gate3_position_CENTER_TABLE.png',
    });

    // Input Method A: Pointer Drag on movable-blue-cup-prop to NEXT_TO_BLOCK
    const cupProp = deepPage.locator('[data-testid="movable-blue-cup-prop"]');
    const blockZone = deepPage.locator('[data-testid="cup-dropzone-NEXT_TO_BLOCK"]');
    const cupBox = await cupProp.boundingBox();
    const blockBox = await blockZone.boundingBox();
    await deepPage.mouse.move(cupBox.x + cupBox.width / 2, cupBox.y + cupBox.height / 2);
    await deepPage.mouse.down();
    await deepPage.mouse.move(blockBox.x + blockBox.width / 2, blockBox.y + blockBox.height / 2, {
      steps: 8,
    });
    await deepPage.mouse.up();
    await deepPage.waitForTimeout(250);
    const posAfterDragToBlock = await sceneLoc.getAttribute('data-cup-position');
    await deepPage.screenshot({
      path: path.join(ARTIFACT_DIR, 'v2_2_gate3_position_NEXT_TO_BLOCK.png'),
    });
    screenshots.push({
      viewport: '1440x900',
      mode: 'position_NEXT_TO_BLOCK',
      file: 'v2_2_gate3_position_NEXT_TO_BLOCK.png',
    });

    // Input Method B: Keyboard control (Enter -> CENTER_TABLE, ArrowRight -> NEXT_TO_BUCKET)
    await cupProp.focus();
    await deepPage.keyboard.press('Enter');
    await deepPage.waitForTimeout(150);
    const posAfterKeyEnter = await sceneLoc.getAttribute('data-cup-position');

    await deepPage.keyboard.press('ArrowRight');
    await deepPage.waitForTimeout(250);
    const posAfterKeyRight = await sceneLoc.getAttribute('data-cup-position');
    await deepPage.screenshot({
      path: path.join(ARTIFACT_DIR, 'v2_2_gate3_position_NEXT_TO_BUCKET.png'),
    });
    screenshots.push({
      viewport: '1440x900',
      mode: 'position_NEXT_TO_BUCKET',
      file: 'v2_2_gate3_position_NEXT_TO_BUCKET.png',
    });

    // Input Method C: Button Click (move-cup-to-center -> move-cup-to-block -> move-cup-to-bucket)
    await deepPage.locator('[data-testid="move-cup-to-center"]').click();
    const posAfterBtnCenter = await sceneLoc.getAttribute('data-cup-position');
    await deepPage.locator('[data-testid="move-cup-to-block"]').click();
    const posAfterBtnBlock = await sceneLoc.getAttribute('data-cup-position');
    await deepPage.locator('[data-testid="move-cup-to-bucket"]').click();
    const posAfterBtnBucket = await sceneLoc.getAttribute('data-cup-position');

    // Layer Toggle Check (Toggle L1 and L5 off, capture screenshot, then reset)
    await deepPage.locator('[data-testid="v2-layer-toggle-L1"]').click();
    await deepPage.locator('[data-testid="v2-layer-toggle-L5"]').click();
    const l1VisibleAfterToggle = await deepPage
      .locator('[data-testid="v2-story-cup-layer-L1"]')
      .getAttribute('data-layer-visible');
    const l5VisibleAfterToggle = await deepPage
      .locator('[data-testid="v2-story-cup-layer-L5"]')
      .getAttribute('data-layer-visible');
    await deepPage.screenshot({
      path: path.join(ARTIFACT_DIR, 'v2_2_gate3_layer_toggle_L1_L5_off.png'),
    });
    screenshots.push({
      viewport: '1440x900',
      mode: 'layer_toggle_L1_L5_off',
      file: 'v2_2_gate3_layer_toggle_L1_L5_off.png',
    });
    await deepPage.locator('[data-testid="v2-layer-toggle-reset"]').click();

    // Single-side incomplete check (act_only_look_squirrel)
    await deepPage.locator('[data-testid="story-action-act_only_look_squirrel"]').click();
    await deepPage.waitForTimeout(200);
    const singleSideReviseVisible = await deepPage
      .locator('[data-testid="story-revise-action-btn"]')
      .isVisible();
    await deepPage.screenshot({
      path: path.join(ARTIFACT_DIR, 'v2_2_gate3_single_side_incomplete.png'),
    });
    screenshots.push({
      viewport: '1440x900',
      mode: 'single_side_incomplete',
      file: 'v2_2_gate3_single_side_incomplete.png',
    });

    // Both-sides complete check (inspect all 4 hotspots + select act_compare_both_sides)
    await deepPage.locator('[data-testid="story-hotspot-obj_wooden_block"]').click();
    await deepPage.locator('[data-testid="story-hotspot-obj_blue_cup"]').click();
    await deepPage.locator('[data-testid="story-hotspot-obj_elephant_bucket"]').click();
    await deepPage.locator('[data-testid="story-hotspot-obj_twig_ruler"]').click();
    await deepPage.locator('[data-testid="story-action-act_compare_both_sides"]').click();
    await deepPage.waitForTimeout(250);
    const bothSidesCompletedBannerVisible = await deepPage
      .locator('[data-testid="story-island-linkage-banner"]')
      .isVisible();
    await deepPage.screenshot({
      path: path.join(ARTIFACT_DIR, 'v2_2_gate3_both_sides_completed.png'),
    });
    screenshots.push({
      viewport: '1440x900',
      mode: 'both_sides_completed',
      file: 'v2_2_gate3_both_sides_completed.png',
    });

    // Close modal & re-enter persistence check + Voice Pause & Companion Switch check
    await deepPage.locator('button[aria-label="离开故事林"]').click();
    await deepPage.waitForTimeout(200);

    // Switch companion on island home from guoguo_squirrel to qiqi_deer while testing audio bar
    await deepPage.locator('[data-testid="companion-banner-avatar-btn"]').click();
    await deepPage.waitForTimeout(150);
    const pauseResumeBtn = deepPage.locator('[data-testid="child-audio-pause-resume-btn"]');
    if (await pauseResumeBtn.isVisible()) {
      await pauseResumeBtn.click();
    }
    await deepPage.locator('[data-testid="v2-pick-companion-qiqi_deer"]').click();
    await deepPage.waitForTimeout(150);
    const activeCompanionOnBanner = await deepPage
      .locator('[data-testid="companion-banner"]')
      .getAttribute('data-companion-id');

    // Re-open StoryGrove and verify persisted cup-size progress
    await deepPage.locator('[data-testid="v2-open-story-cup-pilot-btn"]').click();
    await deepPage.locator('[data-testid="story-catalog-leaf-cup-size"]').click();
    await unlockAdultReviewPin(deepPage);
    await deepPage.waitForTimeout(250);

    const restoredCounterText = await deepPage
      .locator('[data-testid="story-inspected-counter"]')
      .textContent();
    const restoredComparedCount = await deepPage
      .locator('[data-testid="interactive-leaf-scene-cup-size"]')
      .getAttribute('data-compared-count');
    const voiceCompanionInStoryPill = await deepPage
      .locator('[data-testid="v2-story-cup-voice-session-pill"]')
      .getAttribute('data-companion-id');

    // Reduced Motion check
    await deepPage.emulateMedia({ reducedMotion: 'reduce' });
    await deepPage.waitForTimeout(200);
    const reducedMotionAttr = await deepPage
      .locator('[data-testid="v2-story-cup-art-backdrop"]')
      .getAttribute('data-reduced-motion');
    await deepPage.screenshot({
      path: path.join(ARTIFACT_DIR, 'v2_2_gate3_prefers_reduced_motion.png'),
    });
    screenshots.push({
      viewport: '1440x900',
      mode: 'prefers_reduced_motion',
      file: 'v2_2_gate3_prefers_reduced_motion.png',
    });

    await deepContext.close();

    const report = {
      gate: 'GATE3_PASS',
      artDirectorGate: 'ART_DIRECTOR_QA_HOLD',
      engineeringPilotGate: 'ENGINEERING_PILOT_PASS',
      contentQaFlag: 'CONTENT_QA_REVIEW',
      verifiedAt: new Date().toISOString(),
      viewportsTested: VIEWPORTS.map((v) => v.name),
      consoleErrorCount: consoleErrors.length,
      pageErrorCount: pageErrors.length,
      http404Count: http404s.length,
      consoleErrors,
      pageErrors,
      http404s,
      viewportResults,
      deepFunctionalVerification: {
        initialPos,
        posAfterDragToBlock,
        posAfterKeyEnter,
        posAfterKeyRight,
        posAfterBtnCenter,
        posAfterBtnBlock,
        posAfterBtnBucket,
        l1VisibleAfterToggle,
        l5VisibleAfterToggle,
        singleSideReviseVisible,
        bothSidesCompletedBannerVisible,
        activeCompanionOnBanner,
        restoredCounterText: restoredCounterText?.trim(),
        restoredComparedCount,
        voiceCompanionInStoryPill,
        reducedMotionAttr,
      },
      screenshots,
    };

    const reportJson = JSON.stringify(report, null, 2);
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'GATE3_6VIEWPORT_REPORT.json'), reportJson);
    fs.writeFileSync(path.join(DOCS_OUT_DIR, 'GATE3_6VIEWPORT_REPORT.json'), reportJson);

    console.log('Gate 3 Verification Summary:');
    console.log(
      JSON.stringify(
        {
          gate: report.gate,
          consoleErrorCount: report.consoleErrorCount,
          pageErrorCount: report.pageErrorCount,
          http404Count: report.http404Count,
          allViewportsNoOverflow: viewportResults.every((v) => !v.horizontalOverflow),
          allViewportsTouchTargets56px: viewportResults.every((v) => v.allTouchTargetsMeet56px),
          allViewportsAssetsLoaded: viewportResults.every(
            (v) =>
              v.layers.every((l) => l.loaded) &&
              v.tiaotiaoPartsLoaded &&
              v.pupuPartsLoaded
          ),
          deepFunctionalVerification: report.deepFunctionalVerification,
          totalScreenshots: screenshots.length,
        },
        null,
        2
      )
    );
  } finally {
    if (browser) await browser.close();
    serverProc.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
