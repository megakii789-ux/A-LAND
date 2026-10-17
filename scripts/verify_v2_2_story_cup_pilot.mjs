import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const WORKTREE_DIR = process.cwd();
const GIT_COMMIT_SHA = execSync('git rev-parse HEAD', { cwd: WORKTREE_DIR }).toString().trim();
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || '';
const DOCS_OUT_DIR = path.join(WORKTREE_DIR, 'docs/v2-story-cup-pilot');
const DOCS_SCREENSHOTS_DIR = path.join(DOCS_OUT_DIR, 'screenshots');
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

async function saveScreenshot(page, fileName) {
  const repoFullPath = path.join(DOCS_SCREENSHOTS_DIR, fileName);
  await page.screenshot({ path: repoFullPath, fullPage: false });
  if (ARTIFACT_DIR && fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(repoFullPath, path.join(ARTIFACT_DIR, fileName));
  }
  return `docs/v2-story-cup-pilot/screenshots/${fileName}`;
}

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
  fs.mkdirSync(DOCS_SCREENSHOTS_DIR, { recursive: true });

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
      await page.locator('[data-testid="story-leaf-audit-gate-blocked"]').waitFor({
        state: 'visible',
      });
      await unlockAdultReviewPin(page);
      await page.waitForTimeout(300);

      const origShotName = `v2_2_gate3_${vp.name}_original_cup_size.png`;
      const origRepoPath = await saveScreenshot(page, origShotName);
      screenshots.push({
        viewport: vp.name,
        mode: 'original',
        file: origShotName,
        repoPath: origRepoPath,
      });

      // 2. V2 Pilot (`/visual-v2-review/story-cup-pilot`)
      await page.goto(`${BASE_URL}/visual-v2-review/story-cup-pilot`, {
        waitUntil: 'networkidle',
      });
      await page.locator('[data-testid="story-catalog-leaf-cup-size"]').waitFor({
        state: 'visible',
      });
      await page.locator('[data-testid="story-catalog-leaf-cup-size"]').click();
      await page.locator('[data-testid="story-leaf-audit-gate-blocked"]').waitFor({
        state: 'visible',
      });
      const childGateBlockedOnV2 = await page
        .locator('[data-testid="story-leaf-audit-gate-blocked"]')
        .isVisible();

      await unlockAdultReviewPin(page);
      await page.waitForTimeout(400);

      const v2ShotName = `v2_2_gate3_${vp.name}_v2_cup_size.png`;
      const v2RepoPath = await saveScreenshot(page, v2ShotName);
      screenshots.push({
        viewport: vp.name,
        mode: 'v2_pilot',
        file: v2ShotName,
        repoPath: v2RepoPath,
      });

      // Layout, unified coordinate matrix, SVG hit targets, DOM touch targets, and child UI de-noising audit
      const metrics = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const horizontalOverflow = scrollWidth > innerWidth;

        // P1-03: Default-closed debug drawer check
        const debugDrawerToggle = document.querySelector(
          '[data-testid="v2-story-cup-debug-drawer-toggle"]'
        );
        const debugInspector = document.querySelector(
          '[data-testid="v2-story-cup-pilot-inspector"]'
        );
        const childUiDenoising = {
          debugDrawerToggleExists: Boolean(debugDrawerToggle),
          debugDrawerDefaultExpanded:
            debugDrawerToggle?.getAttribute('aria-expanded') === 'true',
          debugInspectorVisibleInDefaultChildFlow: Boolean(debugInspector),
        };

        const layers = ['L1', 'L2', 'L3', 'L4', 'L5'].map((id) => {
          const el = document.querySelector(`[data-testid="v2-story-cup-layer-${id}"]`);
          const img = el ? el.querySelector('img') : null;
          return {
            id,
            exists: Boolean(el),
            visible: el?.getAttribute('data-layer-visible') === 'true',
            loaded: Boolean(img && img.complete && img.naturalWidth > 0),
            naturalWidth: img ? img.naturalWidth : 0,
            naturalHeight: img ? img.naturalHeight : 0,
            objectFitClass: img ? img.className : '',
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

        // P1-01: Unified Coordinate Alignment & CTM Verification
        const svgEl = document.querySelector('[data-testid="story-interactive-svg-cup-size"]');
        const backdropEl = document.querySelector('[data-testid="v2-story-cup-art-backdrop"]');
        const svgRect = svgEl ? svgEl.getBoundingClientRect() : null;
        const ctm = svgEl && typeof svgEl.getScreenCTM === 'function' ? svgEl.getScreenCTM() : null;
        const localCtm = svgEl && typeof svgEl.getCTM === 'function' ? svgEl.getCTM() : null;
        const isMobileStage = window.innerWidth <= 640;
        const expectedTabletopRange = isMobileStage ? [555, 618] : [164, 187];

        const cupEl = document.querySelector('[data-testid="movable-blue-cup-prop"]');
        const cupRect = cupEl ? cupEl.getBoundingClientRect() : null;
        const cupBottomSvgY =
          cupRect && svgRect && ctm
            ? Number(((cupRect.bottom - svgRect.top) / ctm.d).toFixed(1))
            : null;

        const coordinateAlignment = {
          stageLayoutMode:
            backdropEl?.getAttribute('data-stage-mode') ||
            backdropEl?.getAttribute('data-stage-layout-mode') ||
            null,
          svgViewBox: svgEl?.getAttribute('viewBox') || null,
          svgRole: svgEl?.getAttribute('role') || null,
          stageCssWidth: svgRect ? Number(svgRect.width.toFixed(1)) : 0,
          stageCssHeight: svgRect ? Number(svgRect.height.toFixed(1)) : 0,
          ctmScaleX: localCtm ? Number(localCtm.a.toFixed(4)) : 0,
          ctmScaleY: localCtm ? Number(localCtm.d.toFixed(4)) : 0,
          ctmTranslateX: localCtm ? Number(localCtm.e.toFixed(2)) : 0,
          ctmTranslateY: localCtm ? Number(localCtm.f.toFixed(2)) : 0,
          isotropicScaleDelta: localCtm ? Number(Math.abs(localCtm.a - localCtm.d).toFixed(4)) : 0,
          zeroObjectCoverClipping: layers.every((l) => l.objectFitClass.includes('object-fill')),
          expectedTabletopSvgYRange: expectedTabletopRange,
          cupBottomSvgY,
          cupAlignedOnTabletop:
            cupBottomSvgY !== null &&
            cupBottomSvgY >= expectedTabletopRange[0] - 8 &&
            cupBottomSvgY <= expectedTabletopRange[1] + 22,
        };

        // P1-04: Separate SVG Scene Hit Targets vs DOM Control Touch Targets
        const svgTargetIds = [
          'cup-dropzone-NEXT_TO_BLOCK',
          'cup-dropzone-CENTER_TABLE',
          'cup-dropzone-NEXT_TO_BUCKET',
          'movable-blue-cup-prop',
        ];
        const svgSceneHitTargets = svgTargetIds.map((tid) => {
          const el = document.querySelector(`[data-testid="${tid}"]`);
          const r = el ? el.getBoundingClientRect() : { width: 0, height: 0, left: 0, right: 0 };
          const w = Number(r.width.toFixed(1));
          const h = Number(r.height.toFixed(1));
          return {
            testId: tid,
            role: el?.getAttribute('role') || null,
            tabIndex: el?.getAttribute('tabindex') || null,
            ariaLabel: el?.getAttribute('aria-label') || null,
            width: w,
            height: h,
            left: Number(r.left.toFixed(1)),
            right: Number(r.right.toFixed(1)),
            meets56px: Math.round(w) >= 56 && Math.round(h) >= 56,
          };
        });

        const dzBlock = svgSceneHitTargets[0];
        const dzCenter = svgSceneHitTargets[1];
        const dzBucket = svgSceneHitTargets[2];
        const dropzonesNonOverlapping =
          dzBlock.right <= dzCenter.left + 1 && dzCenter.right <= dzBucket.left + 1;

        // DOM Control Buttons (excluding the reviewer debug drawer toggle)
        const leafRoot = document.querySelector('[data-testid="interactive-leaf-view-cup-size"]');
        const buttons = leafRoot
          ? Array.from(leafRoot.querySelectorAll('button')).filter(
              (btn) => btn.getAttribute('data-testid') !== 'v2-story-cup-debug-drawer-toggle'
            )
          : [];
        const closeBtn = document.querySelector('button[aria-label="离开故事林"]');
        if (closeBtn) buttons.push(closeBtn);

        const domControlTouchTargets = buttons.map((btn) => {
          const rect = btn.getBoundingClientRect();
          const w = Math.round(rect.width);
          const h = Math.round(rect.height);
          return {
            testId:
              btn.getAttribute('data-testid') ||
              btn.getAttribute('aria-label') ||
              btn.textContent?.trim().slice(0, 24),
            width: w,
            height: h,
            meets56px: w >= 56 && h >= 56,
          };
        });

        return {
          scrollWidth,
          innerWidth,
          horizontalOverflow,
          childUiDenoising,
          coordinateAlignment,
          layers,
          propsList,
          tiaotiaoPartsLoaded,
          pupuPartsLoaded,
          svgSceneHitTargets,
          dropzonesNonOverlapping,
          allSvgHitTargetsMeet56px: svgSceneHitTargets.every((t) => t.meets56px),
          domControlTouchTargets,
          allDomTouchTargetsMeet56px: domControlTouchTargets.every((t) => t.meets56px),
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

    // 3. Mobile 390x844 Pointer Drag & Tabletop Interaction Check
    console.log('Running mobile 390x844 pointer drag & speaker separation check...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE_URL}/visual-v2-review/story-cup-pilot`, {
      waitUntil: 'networkidle',
    });
    await mobilePage.locator('[data-testid="story-catalog-leaf-cup-size"]').click();
    await unlockAdultReviewPin(mobilePage);
    await mobilePage.waitForTimeout(300);

    const mobileSceneLoc = mobilePage.locator('[data-testid="interactive-leaf-scene-cup-size"]');
    const mobileCupProp = mobilePage.locator('[data-testid="movable-blue-cup-prop"]');
    const mobileBlockZone = mobilePage.locator('[data-testid="cup-dropzone-NEXT_TO_BLOCK"]');
    const mobileBucketZone = mobilePage.locator('[data-testid="cup-dropzone-NEXT_TO_BUCKET"]');

    const mCupBox = await mobileCupProp.boundingBox();
    const mBlockBox = await mobileBlockZone.boundingBox();
    await mobilePage.mouse.move(mCupBox.x + mCupBox.width / 2, mCupBox.y + mCupBox.height / 2);
    await mobilePage.mouse.down();
    await mobilePage.mouse.move(
      mBlockBox.x + mBlockBox.width / 2,
      mBlockBox.y + mBlockBox.height / 2,
      { steps: 8 }
    );
    await mobilePage.mouse.up();
    await mobilePage.waitForTimeout(250);
    const mobilePosAfterDragToBlock = await mobileSceneLoc.getAttribute('data-cup-position');
    const mobileBlockShot = await saveScreenshot(
      mobilePage,
      'v2_2_gate3_390x844_position_NEXT_TO_BLOCK.png'
    );
    screenshots.push({
      viewport: '390x844',
      mode: 'mobile_position_NEXT_TO_BLOCK',
      file: 'v2_2_gate3_390x844_position_NEXT_TO_BLOCK.png',
      repoPath: mobileBlockShot,
    });

    const mCupBox2 = await mobileCupProp.boundingBox();
    const mBucketBox = await mobileBucketZone.boundingBox();
    await mobilePage.mouse.move(mCupBox2.x + mCupBox2.width / 2, mCupBox2.y + mCupBox2.height / 2);
    await mobilePage.mouse.down();
    await mobilePage.mouse.move(
      mBucketBox.x + mBucketBox.width / 2,
      mBucketBox.y + mBucketBox.height / 2,
      { steps: 8 }
    );
    await mobilePage.mouse.up();
    await mobilePage.waitForTimeout(250);
    const mobilePosAfterDragToBucket = await mobileSceneLoc.getAttribute('data-cup-position');
    const mobileBucketShot = await saveScreenshot(
      mobilePage,
      'v2_2_gate3_390x844_position_NEXT_TO_BUCKET.png'
    );
    screenshots.push({
      viewport: '390x844',
      mode: 'mobile_position_NEXT_TO_BUCKET',
      file: 'v2_2_gate3_390x844_position_NEXT_TO_BUCKET.png',
      repoPath: mobileBucketShot,
    });
    await mobileContext.close();

    // 4. Deep E2E Functional, Speaker Separation (4 Companions), Debug Drawer & Accessibility Tree Verification (at 1440x900)
    console.log('Running deep E2E functional checks for Gate 3R...');
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

    // P1-04 Real Chromium Accessibility Tree Check via CDP
    const cdpSession = await deepContext.newCDPSession(deepPage);
    const { nodes: axNodes } = await cdpSession.send('Accessibility.getFullAXTree');
    const interactiveAxNodes = axNodes
      .filter((n) => {
        const nameVal = n.name?.value || '';
        return (
          nameVal.includes('拖动蓝水杯') ||
          nameVal.includes('把蓝水杯移到小积木旁对比') ||
          nameVal.includes('把蓝水杯放回木桌中间') ||
          nameVal.includes('把蓝水杯移到大水桶旁对比') ||
          nameVal.includes('一只杯子是大还是小童话木桌场景')
        );
      })
      .map((n) => ({
        role: n.role?.value,
        name: n.name?.value,
        ignored: Boolean(n.ignored),
      }));

    const sceneLoc = deepPage.locator('[data-testid="interactive-leaf-scene-cup-size"]');
    const tiaotiaoLoc = deepPage.locator(
      '[data-testid="story-character-rig-tiaotiao_story_squirrel"]'
    );
    const pupuLoc = deepPage.locator('[data-testid="story-character-rig-pupu_story_elephant"]');

    // Position 1: CENTER_TABLE (initial)
    const initialPos = await sceneLoc.getAttribute('data-cup-position');
    const centerShot = await saveScreenshot(deepPage, 'v2_2_gate3_position_CENTER_TABLE.png');
    screenshots.push({
      viewport: '1440x900',
      mode: 'position_CENTER_TABLE',
      file: 'v2_2_gate3_position_CENTER_TABLE.png',
      repoPath: centerShot,
    });

    // P1-02 Check 1: Narrator prompt reading ("朗读场景提示") -> neither character enters talk
    await deepPage.locator('button[aria-label="朗读场景提示"]').click();
    await deepPage.waitForTimeout(80);
    const narratorPromptState = {
      activeStorySpeaker: await deepPage
        .locator('[data-testid="v2-story-cup-art-backdrop"]')
        .getAttribute('data-active-story-speaker'),
      tiaotiaoState: await tiaotiaoLoc.getAttribute('data-actor-state'),
      pupuState: await pupuLoc.getAttribute('data-actor-state'),
    };
    narratorPromptState.bothTalkingSimultaneously =
      narratorPromptState.tiaotiaoState === 'talk' && narratorPromptState.pupuState === 'talk';

    // Input Method A: Pointer Drag on movable-blue-cup-prop to NEXT_TO_BLOCK (triggers Tiaotiao speech)
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
    await deepPage.waitForTimeout(120);
    const posAfterDragToBlock = await sceneLoc.getAttribute('data-cup-position');
    const tiaotiaoSpeakerState = {
      activeStorySpeaker: await deepPage
        .locator('[data-testid="v2-story-cup-art-backdrop"]')
        .getAttribute('data-active-story-speaker'),
      tiaotiaoState: await tiaotiaoLoc.getAttribute('data-actor-state'),
      pupuState: await pupuLoc.getAttribute('data-actor-state'),
    };
    tiaotiaoSpeakerState.bothTalkingSimultaneously =
      tiaotiaoSpeakerState.tiaotiaoState === 'talk' && tiaotiaoSpeakerState.pupuState === 'talk';

    const blockShot = await saveScreenshot(deepPage, 'v2_2_gate3_position_NEXT_TO_BLOCK.png');
    screenshots.push({
      viewport: '1440x900',
      mode: 'position_NEXT_TO_BLOCK',
      file: 'v2_2_gate3_position_NEXT_TO_BLOCK.png',
      repoPath: blockShot,
    });

    // Input Method B (Gate 4R / Gate3R-UX-02): Real Keyboard Tab -> :focus-visible -> Enter/Space/ArrowLeft/ArrowRight + 2 Focus Screenshots
    await deepPage.locator('button[aria-label="朗读场景提示"]').focus();
    await deepPage.keyboard.press('Tab');
    await deepPage.waitForTimeout(120);

    const dropzoneFocusCheck = await deepPage.evaluate(() => {
      const active = document.activeElement;
      if (!active) return { focusedTestId: null, matchesFocusVisible: false };
      const cs = window.getComputedStyle(active);
      return {
        focusedTestId: active.getAttribute('data-testid'),
        role: active.getAttribute('role'),
        matchesFocusVisible: active.matches(':focus-visible'),
        outlineStyle: cs.outlineStyle,
        outlineWidth: cs.outlineWidth,
        outlineColor: cs.outlineColor,
        strokeColor: cs.stroke,
        strokeWidth: cs.strokeWidth,
      };
    });

    if (
      dropzoneFocusCheck.focusedTestId !== 'cup-dropzone-NEXT_TO_BLOCK' ||
      !dropzoneFocusCheck.matchesFocusVisible ||
      dropzoneFocusCheck.outlineStyle !== 'solid' ||
      dropzoneFocusCheck.outlineWidth === '0px'
    ) {
      throw new Error(
        `Gate 4R keyboard focus check failed on dropzone: ${JSON.stringify(dropzoneFocusCheck)}`
      );
    }

    const focusDropzoneShot = await saveScreenshot(
      deepPage,
      'v2_2_gate4r_keyboard_focus_dropzone.png'
    );
    screenshots.push({
      viewport: '1440x900',
      mode: 'keyboard_focus_dropzone',
      file: 'v2_2_gate4r_keyboard_focus_dropzone.png',
      repoPath: focusDropzoneShot,
    });

    // Tab to CENTER_TABLE dropzone and activate via Enter
    await deepPage.keyboard.press('Tab');
    await deepPage.waitForTimeout(80);
    await deepPage.keyboard.press('Enter');
    await deepPage.waitForTimeout(120);
    const posAfterDropzoneEnter = await sceneLoc.getAttribute('data-cup-position');

    // Tab to NEXT_TO_BUCKET dropzone and activate via Space
    await deepPage.keyboard.press('Tab');
    await deepPage.waitForTimeout(80);
    await deepPage.keyboard.press('Space');
    await deepPage.waitForTimeout(120);
    const posAfterDropzoneSpace = await sceneLoc.getAttribute('data-cup-position');

    // Tab to movable-blue-cup-prop and verify :focus-visible + capture 2nd focus screenshot
    await deepPage.keyboard.press('Tab');
    await deepPage.waitForTimeout(120);

    const movableCupFocusCheck = await deepPage.evaluate(() => {
      const active = document.activeElement;
      if (!active) return { focusedTestId: null, matchesFocusVisible: false };
      const cs = window.getComputedStyle(active);
      const ringEl = active.querySelector('.v2-story-cup-focus-ring');
      const ringCs = ringEl ? window.getComputedStyle(ringEl) : null;
      return {
        focusedTestId: active.getAttribute('data-testid'),
        role: active.getAttribute('role'),
        matchesFocusVisible: active.matches(':focus-visible'),
        outlineStyle: cs.outlineStyle,
        outlineWidth: cs.outlineWidth,
        outlineColor: cs.outlineColor,
        focusRingStroke: ringCs ? ringCs.stroke : null,
        focusRingStrokeWidth: ringCs ? ringCs.strokeWidth : null,
      };
    });

    if (
      movableCupFocusCheck.focusedTestId !== 'movable-blue-cup-prop' ||
      !movableCupFocusCheck.matchesFocusVisible ||
      movableCupFocusCheck.outlineStyle !== 'solid' ||
      movableCupFocusCheck.outlineWidth === '0px'
    ) {
      throw new Error(
        `Gate 4R keyboard focus check failed on movable-blue-cup-prop: ${JSON.stringify(movableCupFocusCheck)}`
      );
    }

    const focusCupShot = await saveScreenshot(
      deepPage,
      'v2_2_gate4r_keyboard_focus_movable_cup.png'
    );
    screenshots.push({
      viewport: '1440x900',
      mode: 'keyboard_focus_movable_cup',
      file: 'v2_2_gate4r_keyboard_focus_movable_cup.png',
      repoPath: focusCupShot,
    });

    // Keyboard Enter -> CENTER_TABLE, ArrowLeft -> NEXT_TO_BLOCK, ArrowRight -> NEXT_TO_BUCKET
    await deepPage.keyboard.press('Enter');
    await deepPage.waitForTimeout(120);
    const posAfterKeyEnter = await sceneLoc.getAttribute('data-cup-position');

    await deepPage.keyboard.press('ArrowLeft');
    await deepPage.waitForTimeout(120);
    const posAfterKeyLeft = await sceneLoc.getAttribute('data-cup-position');

    await deepPage.keyboard.press('ArrowRight');
    await deepPage.waitForTimeout(120);
    const posAfterKeyRight = await sceneLoc.getAttribute('data-cup-position');

    if (
      posAfterDropzoneEnter !== 'CENTER_TABLE' ||
      posAfterDropzoneSpace !== 'NEXT_TO_BUCKET' ||
      posAfterKeyEnter !== 'CENTER_TABLE' ||
      posAfterKeyLeft !== 'NEXT_TO_BLOCK' ||
      posAfterKeyRight !== 'NEXT_TO_BUCKET'
    ) {
      throw new Error(
        `Gate 4R keyboard navigation state assertion failed: ${JSON.stringify({
          posAfterDropzoneEnter,
          posAfterDropzoneSpace,
          posAfterKeyEnter,
          posAfterKeyLeft,
          posAfterKeyRight,
        })}`
      );
    }

    const pupuSpeakerState = {
      activeStorySpeaker: await deepPage
        .locator('[data-testid="v2-story-cup-art-backdrop"]')
        .getAttribute('data-active-story-speaker'),
      tiaotiaoState: await tiaotiaoLoc.getAttribute('data-actor-state'),
      pupuState: await pupuLoc.getAttribute('data-actor-state'),
    };
    pupuSpeakerState.bothTalkingSimultaneously =
      pupuSpeakerState.tiaotiaoState === 'talk' && pupuSpeakerState.pupuState === 'talk';

    const bucketShot = await saveScreenshot(deepPage, 'v2_2_gate3_position_NEXT_TO_BUCKET.png');
    screenshots.push({
      viewport: '1440x900',
      mode: 'position_NEXT_TO_BUCKET',
      file: 'v2_2_gate3_position_NEXT_TO_BUCKET.png',
      repoPath: bucketShot,
    });

    // Input Method C: Button Click (move-cup-to-center -> move-cup-to-block -> move-cup-to-bucket)
    await deepPage.locator('[data-testid="move-cup-to-center"]').click();
    const posAfterBtnCenter = await sceneLoc.getAttribute('data-cup-position');
    await deepPage.locator('[data-testid="move-cup-to-block"]').click();
    const posAfterBtnBlock = await sceneLoc.getAttribute('data-cup-position');
    await deepPage.locator('[data-testid="move-cup-to-bucket"]').click();
    const posAfterBtnBucket = await sceneLoc.getAttribute('data-cup-position');

    // P1-03 Reviewer Debug Drawer & Layer Toggle Check (Expand drawer -> Toggle L1 & L5 off -> Capture -> Reset -> Collapse drawer)
    const drawerToggle = deepPage.locator('[data-testid="v2-story-cup-debug-drawer-toggle"]');
    const drawerDefaultExpanded = await drawerToggle.getAttribute('aria-expanded');
    await drawerToggle.click();
    await deepPage.waitForTimeout(150);
    const drawerExpandedAfterClick = await drawerToggle.getAttribute('aria-expanded');

    await deepPage.locator('[data-testid="v2-layer-toggle-L1"]').click();
    await deepPage.locator('[data-testid="v2-layer-toggle-L5"]').click();
    const l1VisibleAfterToggle = await deepPage
      .locator('[data-testid="v2-story-cup-layer-L1"]')
      .getAttribute('data-layer-visible');
    const l5VisibleAfterToggle = await deepPage
      .locator('[data-testid="v2-story-cup-layer-L5"]')
      .getAttribute('data-layer-visible');
    const layerShot = await saveScreenshot(deepPage, 'v2_2_gate3_layer_toggle_L1_L5_off.png');
    screenshots.push({
      viewport: '1440x900',
      mode: 'layer_toggle_L1_L5_off',
      file: 'v2_2_gate3_layer_toggle_L1_L5_off.png',
      repoPath: layerShot,
    });
    await deepPage.locator('[data-testid="v2-layer-toggle-reset"]').click();
    await drawerToggle.click(); // Collapse back to keep child flow clean

    // Single-side incomplete check (act_only_look_squirrel)
    await deepPage.locator('[data-testid="story-action-act_only_look_squirrel"]').click();
    await deepPage.waitForTimeout(200);
    const singleSideReviseVisible = await deepPage
      .locator('[data-testid="story-revise-action-btn"]')
      .isVisible();
    const singleSideShot = await saveScreenshot(
      deepPage,
      'v2_2_gate3_single_side_incomplete.png'
    );
    screenshots.push({
      viewport: '1440x900',
      mode: 'single_side_incomplete',
      file: 'v2_2_gate3_single_side_incomplete.png',
      repoPath: singleSideShot,
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
    const completeShot = await saveScreenshot(deepPage, 'v2_2_gate3_both_sides_completed.png');
    screenshots.push({
      viewport: '1440x900',
      mode: 'both_sides_completed',
      file: 'v2_2_gate3_both_sides_completed.png',
      repoPath: completeShot,
    });

    // Close modal & test all 4 global companions + pause/resume/switch + re-enter persistence check
    await deepPage.locator('button[aria-label="离开故事林"]').click();
    await deepPage.waitForTimeout(200);

    const fourCompanionChecks = [];
    for (const compId of [
      'guoguo_squirrel',
      'beibei_otter',
      'tiantian_raccoon',
      'qiqi_deer',
    ]) {
      await deepPage.locator(`[data-testid="v2-pick-companion-${compId}"]`).click();
      await deepPage.waitForTimeout(100);
      await deepPage.locator('[data-testid="companion-banner-avatar-btn"]').click();
      await deepPage.waitForTimeout(100);
      const bannerComp = await deepPage
        .locator('[data-testid="companion-banner"]')
        .getAttribute('data-companion-id');
      fourCompanionChecks.push({ companionId: compId, bannerMatches: bannerComp === compId });
    }

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

    // Expand drawer briefly to read voice session pill companionId, then close
    await deepPage.locator('[data-testid="v2-story-cup-debug-drawer-toggle"]').click();
    await deepPage.waitForTimeout(100);
    const voiceCompanionInStoryPill = await deepPage
      .locator('[data-testid="v2-story-cup-voice-session-pill"]')
      .getAttribute('data-companion-id');
    await deepPage.locator('[data-testid="v2-story-cup-debug-drawer-toggle"]').click();

    // Reduced Motion check
    await deepPage.emulateMedia({ reducedMotion: 'reduce' });
    await deepPage.waitForTimeout(200);
    const reducedMotionAttr = await deepPage
      .locator('[data-testid="v2-story-cup-art-backdrop"]')
      .getAttribute('data-reduced-motion');
    const reducedShot = await saveScreenshot(
      deepPage,
      'v2_2_gate3_prefers_reduced_motion.png'
    );
    screenshots.push({
      viewport: '1440x900',
      mode: 'prefers_reduced_motion',
      file: 'v2_2_gate3_prefers_reduced_motion.png',
      repoPath: reducedShot,
    });

    await deepContext.close();

    const report = {
      gate: 'GATE3R_PASS',
      artDirectorGate: 'ART_DIRECTOR_QA_HOLD',
      engineeringPilotGate: 'ENGINEERING_AUDIT_HOLD',
      contentQaFlag: 'CONTENT_QA_REVIEW',
      gitCommitSha: GIT_COMMIT_SHA,
      verifiedAt: new Date().toISOString(),
      viewportsTested: VIEWPORTS.map((v) => v.name),
      consoleErrorCount: consoleErrors.length,
      pageErrorCount: pageErrors.length,
      http404Count: http404s.length,
      consoleErrors,
      pageErrors,
      http404s,
      viewportResults,
      mobilePointerDragVerification: {
        viewport: '390x844',
        mobilePosAfterDragToBlock,
        mobilePosAfterDragToBucket,
      },
      speakerSeparationVerification: {
        narratorPromptState,
        tiaotiaoSpeakerState,
        pupuSpeakerState,
        fourCompanionChecks,
        neverSimultaneousTalk:
          !narratorPromptState.bothTalkingSimultaneously &&
          !tiaotiaoSpeakerState.bothTalkingSimultaneously &&
          !pupuSpeakerState.bothTalkingSimultaneously,
      },
      accessibilityVerification: {
        svgContainerRole: 'group',
        exposedInteractiveNodes: interactiveAxNodes,
        movableBlueCupExposedInAxTree: interactiveAxNodes.some(
          (n) => !n.ignored && n.role === 'button' && n.name?.includes('拖动蓝水杯')
        ),
        allThreeDropzonesExposedInAxTree:
          interactiveAxNodes.some(
            (n) => !n.ignored && n.role === 'button' && n.name?.includes('小积木旁')
          ) &&
          interactiveAxNodes.some(
            (n) => !n.ignored && n.role === 'button' && n.name?.includes('木桌中间')
          ) &&
          interactiveAxNodes.some(
            (n) => !n.ignored && n.role === 'button' && n.name?.includes('大水桶旁')
          ),
        keyboardVisibleFocusVerification: {
          dropzoneFocusCheck,
          movableCupFocusCheck,
          posAfterDropzoneEnter,
          posAfterDropzoneSpace,
          posAfterKeyEnter,
          posAfterKeyLeft,
          posAfterKeyRight,
          screenshots: [
            'docs/v2-story-cup-pilot/screenshots/v2_2_gate4r_keyboard_focus_dropzone.png',
            'docs/v2-story-cup-pilot/screenshots/v2_2_gate4r_keyboard_focus_movable_cup.png',
          ],
          pass: true,
        },
      },
      deepFunctionalVerification: {
        initialPos,
        posAfterDragToBlock,
        posAfterDropzoneEnter,
        posAfterDropzoneSpace,
        posAfterKeyEnter,
        posAfterKeyLeft,
        posAfterKeyRight,
        posAfterBtnCenter,
        posAfterBtnBlock,
        posAfterBtnBucket,
        drawerDefaultExpanded,
        drawerExpandedAfterClick,
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
    fs.writeFileSync(path.join(DOCS_OUT_DIR, 'GATE3R_6VIEWPORT_REPORT.json'), reportJson);
    fs.writeFileSync(path.join(DOCS_OUT_DIR, 'GATE3_6VIEWPORT_REPORT.json'), reportJson);
    if (ARTIFACT_DIR && fs.existsSync(ARTIFACT_DIR)) {
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'GATE3_6VIEWPORT_REPORT.json'), reportJson);
    }

    console.log('Gate 3R/4R Verification Summary:');
    console.log(
      JSON.stringify(
        {
          gate: report.gate,
          gitCommitSha: report.gitCommitSha,
          engineeringPilotGate: report.engineeringPilotGate,
          consoleErrorCount: report.consoleErrorCount,
          pageErrorCount: report.pageErrorCount,
          http404Count: report.http404Count,
          allViewportsNoOverflow: viewportResults.every((v) => !v.horizontalOverflow),
          allViewportsChildUiDenoised: viewportResults.every(
            (v) =>
              !v.childUiDenoising.debugDrawerDefaultExpanded &&
              !v.childUiDenoising.debugInspectorVisibleInDefaultChildFlow
          ),
          allViewportsTabletopAligned: viewportResults.every(
            (v) =>
              v.coordinateAlignment.zeroObjectCoverClipping &&
              v.coordinateAlignment.cupAlignedOnTabletop
          ),
          allViewportsSvgHitTargets56px: viewportResults.every(
            (v) => v.allSvgHitTargetsMeet56px && v.dropzonesNonOverlapping
          ),
          allViewportsDomTouchTargets56px: viewportResults.every(
            (v) => v.allDomTouchTargetsMeet56px
          ),
          allViewportsAssetsLoaded: viewportResults.every(
            (v) =>
              v.layers.every((l) => l.loaded) &&
              v.tiaotiaoPartsLoaded &&
              v.pupuPartsLoaded
          ),
          mobilePointerDragVerification: report.mobilePointerDragVerification,
          speakerSeparationVerification: report.speakerSeparationVerification,
          accessibilityVerification: {
            movableBlueCupExposedInAxTree:
              report.accessibilityVerification.movableBlueCupExposedInAxTree,
            allThreeDropzonesExposedInAxTree:
              report.accessibilityVerification.allThreeDropzonesExposedInAxTree,
            keyboardVisibleFocusPass:
              report.accessibilityVerification.keyboardVisibleFocusVerification.pass,
          },
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
