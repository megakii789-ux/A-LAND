import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const WORKTREE_DIR = process.cwd();
const GIT_COMMIT_SHA = execSync('git rev-parse HEAD', { cwd: WORKTREE_DIR }).toString().trim();
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || '';
const DOCS_OUT_DIR = path.join(WORKTREE_DIR, 'docs/v2-3-batch01r-art-remediation/evidence');
const DOCS_SCREENSHOTS_DIR = path.join(DOCS_OUT_DIR, 'screenshots');
const UX_CLOSEOUT_DIR = path.join(WORKTREE_DIR, 'docs/v2-3-batch01r-ux-closeout/evidence');
const UX_CLOSEOUT_SCREENSHOTS_DIR = path.join(UX_CLOSEOUT_DIR, 'screenshots');
const PORT = 4186;
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
  const uxFullPath = path.join(UX_CLOSEOUT_SCREENSHOTS_DIR, fileName);
  fs.copyFileSync(repoFullPath, uxFullPath);
  if (ARTIFACT_DIR && fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(repoFullPath, path.join(ARTIFACT_DIR, fileName));
  }
  return `docs/v2-3-batch01r-ux-closeout/evidence/screenshots/${fileName}`;
}

async function captureHotspotOverlayScreenshot(page, selectorList, fileName, titleText) {
  await page.evaluate(
    ({ selectors, bannerTitle }) => {
      const existing = document.getElementById('__ux_hotspot_audit_overlay__');
      if (existing) existing.remove();
      const overlay = document.createElement('div');
      overlay.id = '__ux_hotspot_audit_overlay__';
      overlay.style.cssText =
        'position:fixed;inset:0;pointer-events:none;z-index:999999;font-family:monospace;';

      const banner = document.createElement('div');
      banner.style.cssText =
        'position:fixed;top:6px;left:6px;right:6px;background:rgba(15,23,42,0.9);color:#38BDF8;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:bold;border:1px solid #38BDF8;';
      banner.textContent = bannerTitle;
      overlay.appendChild(banner);

      selectors.forEach((sel, idx) => {
        const el = document.querySelector(sel);
        if (!el) return;
        const r = el.getBoundingClientRect();
        const box = document.createElement('div');
        box.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border:2px dashed #22C55E;background:rgba(34,197,94,0.14);border-radius:8px;box-sizing:border-box;`;
        const tag = document.createElement('span');
        tag.style.cssText =
          'position:absolute;top:-16px;left:0;background:#15803D;color:#fff;font-size:9px;padding:1px 4px;border-radius:4px;white-space:nowrap;font-weight:bold;';
        tag.textContent = `#${idx + 1} ${Math.round(r.width)}x${Math.round(r.height)}px`;
        box.appendChild(tag);
        overlay.appendChild(box);
      });

      document.body.appendChild(overlay);
    },
    { selectors: selectorList, bannerTitle: titleText }
  );
  await page.waitForTimeout(80);
  const savedPath = await saveScreenshot(page, fileName);
  await page.evaluate(() => {
    const existing = document.getElementById('__ux_hotspot_audit_overlay__');
    if (existing) existing.remove();
  });
  return savedPath;
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

function getDistBundleStats() {
  const distAssetsDir = path.join(WORKTREE_DIR, 'dist/assets');
  if (!fs.existsSync(distAssetsDir)) return [];
  return fs.readdirSync(distAssetsDir).map((name) => {
    const stat = fs.statSync(path.join(distAssetsDir, name));
    return {
      file: `dist/assets/${name}`,
      bytes: stat.size,
      kilobytes: Math.round((stat.size / 1024) * 100) / 100,
    };
  });
}

async function main() {
  fs.mkdirSync(DOCS_SCREENSHOTS_DIR, { recursive: true });
  fs.mkdirSync(UX_CLOSEOUT_SCREENSHOTS_DIR, { recursive: true });

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

      // 1A. Original (`/`) Weather Station
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      await page.locator('[role="button"][aria-label*="进入情绪天气站"]').first().click();
      await page.locator('[data-testid="weather-station-modal"]').waitFor({ state: 'visible' });
      await page.locator('[aria-label="看今天头顶的天气"]').click();
      await page.waitForTimeout(250);

      const origWeatherShot = `v2_3_batch01r_${vp.name}_original_weather_station.png`;
      const origWeatherRepoPath = await saveScreenshot(page, origWeatherShot);
      screenshots.push({
        viewport: vp.name,
        scene: 'weather_station',
        mode: 'original',
        file: origWeatherShot,
        repoPath: origWeatherRepoPath,
      });

      // Close Weather Station and open Original (`/`) Calm Space
      await page.locator('[aria-label="关闭天气站"]').click();
      await page.locator('button[aria-label*="进入绿草平静角呼吸练习"]').first().click();
      await page.locator('[data-testid="calm-space-modal"]').waitFor({ state: 'visible' });
      await page.waitForTimeout(250);

      const origCalmShot = `v2_3_batch01r_${vp.name}_original_calm_corner.png`;
      const origCalmRepoPath = await saveScreenshot(page, origCalmShot);
      screenshots.push({
        viewport: vp.name,
        scene: 'calm_corner',
        mode: 'original',
        file: origCalmShot,
        repoPath: origCalmRepoPath,
      });

      // 2A. V2 Batch01R Weather Station (`/visual-v2-review/weather-station-pilot`)
      await page.goto(`${BASE_URL}/visual-v2-review/weather-station-pilot`, {
        waitUntil: 'networkidle',
      });
      await page.locator('[data-testid="v2-weather-station-modal"]').waitFor({ state: 'visible' });
      await page.locator('[aria-label="看今天头顶的天气"]').click();
      await page.waitForTimeout(300);

      const v2WeatherShot = `v2_3_batch01r_${vp.name}_v2_weather_station.png`;
      const v2WeatherRepoPath = await saveScreenshot(page, v2WeatherShot);
      screenshots.push({
        viewport: vp.name,
        scene: 'weather_station',
        mode: 'v2_batch01r',
        file: v2WeatherShot,
        repoPath: v2WeatherRepoPath,
      });

      if (vp.width <= 430) {
        const overlayFile = `v2_3_batch01r_${vp.name}_v2_weather_hotspot_overlay.png`;
        const overlayPath = await captureHotspotOverlayScreenshot(
          page,
          [
            '[data-testid="v2-weather-svg-token-sunny"]',
            '[data-testid="v2-weather-svg-token-cloudy"]',
            '[data-testid="v2-weather-svg-token-rainy"]',
            '[data-testid="v2-weather-svg-token-stormy"]',
            '[data-testid="v2-weather-svg-token-foggy"]',
            '[data-testid="v2-weather-svg-token-opt_out"]',
          ],
          overlayFile,
          `Gate U1+U2 Weather Hotspots (${vp.name}) — 0% Crop / Single Selector`
        );
        screenshots.push({
          viewport: vp.name,
          scene: 'weather_station',
          mode: 'v2_hotspot_overlay',
          file: overlayFile,
          repoPath: overlayPath,
        });
      }

      const weatherMetrics = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const horizontalOverflow = scrollWidth > innerWidth;

        const stageEl = document.querySelector('[data-testid="v2-weather-station-stage"]');
        const stageRect = stageEl ? stageEl.getBoundingClientRect() : null;
        const debugContainer = document.querySelector(
          '[data-testid="v2-weather-debug-drawer-container"]'
        );
        const qaTopStrip = document.querySelector('[data-testid="v2-review-top-strip"]');

        // Gate U1: Verify single primary weather selector (zero legacy duplicate cards)
        const legacyPrimaryCards = document.querySelectorAll('button[aria-label^="天气选择："]');
        const phraseBar = document.querySelector('[data-testid="v2-weather-selected-phrase-bar"]');
        const readAloudBtn = document.querySelector(
          '[data-testid="v2-weather-selected-phrase-read-aloud"]'
        );
        const readAloudRect = readAloudBtn ? readAloudBtn.getBoundingClientRect() : null;

        // Gate U3: Header title typography & non-truncation check
        const titleEl = document.querySelector('[data-testid="v2-weather-header-title"]');
        const titleRect = titleEl ? titleEl.getBoundingClientRect() : null;
        const titleStyle = titleEl ? window.getComputedStyle(titleEl) : null;
        const titleLineHeight = titleStyle ? parseFloat(titleStyle.lineHeight) || 28 : 28;
        const closeBtn = document.querySelector('[aria-label="关闭天气站"]');
        const closeBtnRect = closeBtn ? closeBtn.getBoundingClientRect() : null;

        // Gate U2: Layer geometry & zero-crop verification
        const layers = ['backplate', 'weather_actor', 'front_effect'].map((part) => {
          const img = document.querySelector(`[data-testid="v2-weather-layer-${part}"]`);
          const rect = img ? img.getBoundingClientRect() : null;
          const style = img ? window.getComputedStyle(img) : null;
          const nw = img ? img.naturalWidth : 0;
          const nh = img ? img.naturalHeight : 0;
          const cw = rect ? rect.width : 0;
          const ch = rect ? rect.height : 0;
          const visibleHeightRatio =
            nw > 0 && nh > 0 && cw > 0 && ch > 0
              ? Math.min(1, Math.round(((ch / cw) / (nh / nw)) * 10000) / 10000)
              : 0;
          const visibleWidthRatio =
            nw > 0 && nh > 0 && cw > 0 && ch > 0
              ? Math.min(1, Math.round(((cw / ch) / (nw / nh)) * 10000) / 10000)
              : 0;
          return {
            part,
            exists: Boolean(img),
            loaded: Boolean(img && img.complete && nw > 0),
            naturalWidth: nw,
            naturalHeight: nh,
            clientWidth: Math.round(cw * 10) / 10,
            clientHeight: Math.round(ch * 10) / 10,
            objectFit: style ? style.objectFit : '',
            visibleHeightRatio,
            visibleWidthRatio,
            verticalCropLossPct: Math.round((1 - visibleHeightRatio) * 10000) / 100,
            horizontalCropLossPct: Math.round((1 - visibleWidthRatio) * 10000) / 100,
            fallbackActive: img?.getAttribute('data-fallback-active') === 'true',
          };
        });

        const companionRig = document.querySelector('[data-testid="v2-weather-companion-rig"]');
        const companionCutout = document.querySelector(
          '[data-testid="v2-weather-companion-rig-3d-cutout"]'
        );
        const companionParts = [
          'ears_or_tail',
          'far_arm',
          'torso',
          'head',
          'eyes',
          'mouth',
          'near_arm',
        ].map((part) => {
          const img = document.querySelector(
            `[data-testid="v2-weather-companion-rig-part-${part}"]`
          );
          return {
            part,
            loaded: Boolean(img && img.complete && img.naturalWidth > 0),
          };
        });

        const svgTokens = [
          'sunny',
          'cloudy',
          'rainy',
          'stormy',
          'foggy',
          'opt_out',
        ].map((type) => {
          const el = document.querySelector(`[data-testid="v2-weather-svg-token-${type}"]`);
          const rect = el ? el.getBoundingClientRect() : null;
          return {
            type,
            width: rect ? Math.round(rect.width * 10) / 10 : 0,
            height: rect ? Math.round(rect.height * 10) / 10 : 0,
            meets56px: Boolean(rect && rect.width >= 55.5 && rect.height >= 55.5),
          };
        });

        return {
          scrollWidth,
          innerWidth,
          horizontalOverflow,
          stageLayout: stageEl?.getAttribute('data-stage-layout') || '',
          stageClientWidth: stageRect ? Math.round(stageRect.width * 10) / 10 : 0,
          stageClientHeight: stageRect ? Math.round(stageRect.height * 10) / 10 : 0,
          childUiFreeOfDebugDrawer: !debugContainer && !qaTopStrip,
          gateU1SinglePrimarySelectorPass:
            svgTokens.length === 6 &&
            legacyPrimaryCards.length === 0 &&
            Boolean(phraseBar) &&
            Boolean(readAloudRect && readAloudRect.width >= 55.5 && readAloudRect.height >= 55.5),
          legacyDuplicatePrimaryCardCount: legacyPrimaryCards.length,
          gateU2ZeroCropPass: layers.every(
            (l) =>
              l.visibleHeightRatio >= 0.995 &&
              l.visibleWidthRatio >= 0.995 &&
              l.objectFit !== 'fill'
          ),
          gateU3HeaderTypographyPass: Boolean(
            titleEl &&
              titleEl.textContent?.trim() === '情绪天气站' &&
              titleEl.scrollWidth <= titleEl.clientWidth + 1 &&
              titleRect &&
              titleRect.height <= titleLineHeight * 1.45 &&
              closeBtnRect &&
              closeBtnRect.width >= 55.5 &&
              closeBtnRect.height >= 55.5
          ),
          headerTitleMetrics: {
            text: titleEl?.textContent?.trim() || '',
            clientWidth: titleEl ? titleEl.clientWidth : 0,
            scrollWidth: titleEl ? titleEl.scrollWidth : 0,
            height: titleRect ? Math.round(titleRect.height * 10) / 10 : 0,
            lineHeight: Math.round(titleLineHeight * 10) / 10,
          },
          layers,
          allLayersLoaded: layers.every((l) => l.loaded && !l.fallbackActive),
          companionId: companionRig?.getAttribute('data-companion-id') || '',
          companionCutoutLoaded: Boolean(
            companionCutout && companionCutout.complete && companionCutout.naturalWidth > 0
          ),
          mouthActiveIdle: companionRig?.getAttribute('data-mouth-active') === 'true',
          allCompanionPartsLoaded: companionParts.every((p) => p.loaded),
          svgTokens,
          allSvgTokensMeet56px: svgTokens.every((t) => t.meets56px),
          mediaMetrics: window.__ALAND_V2_3_MEDIA_METRICS__ || {},
        };
      });

      // 2B. V2 Batch01R Calm Corner (`/visual-v2-review/calm-corner-pilot`)
      await page.goto(`${BASE_URL}/visual-v2-review/calm-corner-pilot`, {
        waitUntil: 'networkidle',
      });
      await page.locator('[data-testid="v2-calm-space-modal"]').waitFor({ state: 'visible' });
      await page.waitForTimeout(300);

      const v2CalmShot = `v2_3_batch01r_${vp.name}_v2_calm_corner.png`;
      const v2CalmRepoPath = await saveScreenshot(page, v2CalmShot);
      screenshots.push({
        viewport: vp.name,
        scene: 'calm_corner',
        mode: 'v2_batch01r',
        file: v2CalmShot,
        repoPath: v2CalmRepoPath,
      });

      if (vp.width <= 430) {
        const overlayFile = `v2_3_batch01r_${vp.name}_v2_calm_hotspot_overlay.png`;
        const overlayPath = await captureHotspotOverlayScreenshot(
          page,
          [
            '[data-testid="v2-calm-svg-breathe-orb"]',
            '[data-testid="v2-calm-svg-color-red"]',
            '[data-testid="v2-calm-svg-color-yellow"]',
            '[data-testid="v2-calm-svg-color-blue"]',
          ],
          overlayFile,
          `Gate U2+U3 Calm Hotspots (${vp.name}) — 0% Crop / Coaxial Orb`
        );
        screenshots.push({
          viewport: vp.name,
          scene: 'calm_corner',
          mode: 'v2_hotspot_overlay',
          file: overlayFile,
          repoPath: overlayPath,
        });
      }

      const calmMetrics = await page.evaluate(() => {
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const horizontalOverflow = scrollWidth > innerWidth;

        const stageEl = document.querySelector('[data-testid="v2-calm-corner-stage"]');
        const stageRect = stageEl ? stageEl.getBoundingClientRect() : null;
        const debugContainer = document.querySelector(
          '[data-testid="v2-calm-debug-drawer-container"]'
        );
        const qaTopStrip = document.querySelector('[data-testid="v2-review-top-strip"]');
        const duplicateColorButton = document.querySelector(
          '[aria-label*="红色物品感知练习：请在周围房间里找到一件红色的东西"]'
        );

        // Gate U3: Header title typography & non-truncation check
        const titleEl = document.querySelector('[data-testid="v2-calm-header-title"]');
        const titleRect = titleEl ? titleEl.getBoundingClientRect() : null;
        const titleStyle = titleEl ? window.getComputedStyle(titleEl) : null;
        const titleLineHeight = titleStyle ? parseFloat(titleStyle.lineHeight) || 28 : 28;
        const closeBtn = document.querySelector('[aria-label="关闭冷静空间，返回主页"]');
        const closeBtnRect = closeBtn ? closeBtn.getBoundingClientRect() : null;

        // Gate U2: Layer geometry & zero-crop verification
        const layers = ['room', 'breathing_visual'].map((part) => {
          const img = document.querySelector(`[data-testid="v2-calm-layer-${part}"]`);
          const rect = img ? img.getBoundingClientRect() : null;
          const style = img ? window.getComputedStyle(img) : null;
          const nw = img ? img.naturalWidth : 0;
          const nh = img ? img.naturalHeight : 0;
          const cw = rect ? rect.width : 0;
          const ch = rect ? rect.height : 0;
          const visibleHeightRatio =
            nw > 0 && nh > 0 && cw > 0 && ch > 0
              ? Math.min(1, Math.round(((ch / cw) / (nh / nw)) * 10000) / 10000)
              : 0;
          const visibleWidthRatio =
            nw > 0 && nh > 0 && cw > 0 && ch > 0
              ? Math.min(1, Math.round(((cw / ch) / (nw / nh)) * 10000) / 10000)
              : 0;
          return {
            part,
            exists: Boolean(img),
            loaded: Boolean(img && img.complete && nw > 0),
            naturalWidth: nw,
            naturalHeight: nh,
            clientWidth: Math.round(cw * 10) / 10,
            clientHeight: Math.round(ch * 10) / 10,
            objectFit: style ? style.objectFit : '',
            visibleHeightRatio,
            visibleWidthRatio,
            verticalCropLossPct: Math.round((1 - visibleHeightRatio) * 10000) / 100,
            horizontalCropLossPct: Math.round((1 - visibleWidthRatio) * 10000) / 100,
            fallbackActive: img?.getAttribute('data-fallback-active') === 'true',
          };
        });

        const companionRig = document.querySelector('[data-testid="v2-calm-companion-rig"]');
        const companionCutout = document.querySelector(
          '[data-testid="v2-calm-companion-rig-3d-cutout"]'
        );
        const companionParts = [
          'ears_or_tail',
          'far_arm',
          'torso',
          'head',
          'eyes',
          'mouth',
          'near_arm',
        ].map((part) => {
          const img = document.querySelector(
            `[data-testid="v2-calm-companion-rig-part-${part}"]`
          );
          return {
            part,
            loaded: Boolean(img && img.complete && img.naturalWidth > 0),
          };
        });

        const orbEl = document.querySelector('[data-testid="v2-calm-svg-breathe-orb"]');
        const orbRect = orbEl ? orbEl.getBoundingClientRect() : null;
        const stageCenterX = stageRect ? stageRect.left + stageRect.width / 2 : 0;
        const orbCenterX = orbRect ? orbRect.left + orbRect.width / 2 : 0;
        const orbHorizontalCenterDeltaPx = Math.round(Math.abs(stageCenterX - orbCenterX) * 10) / 10;

        const svgTargets = [
          'v2-calm-svg-breathe-orb',
          'v2-calm-svg-color-red',
          'v2-calm-svg-color-yellow',
          'v2-calm-svg-color-blue',
        ].map((testId) => {
          const el = document.querySelector(`[data-testid="${testId}"]`);
          const rect = el ? el.getBoundingClientRect() : null;
          return {
            testId,
            width: rect ? Math.round(rect.width * 10) / 10 : 0,
            height: rect ? Math.round(rect.height * 10) / 10 : 0,
            meets56px: Boolean(rect && rect.width >= 55.5 && rect.height >= 55.5),
          };
        });

        return {
          scrollWidth,
          innerWidth,
          horizontalOverflow,
          stageLayout: stageEl?.getAttribute('data-stage-layout') || '',
          stageClientWidth: stageRect ? Math.round(stageRect.width * 10) / 10 : 0,
          stageClientHeight: stageRect ? Math.round(stageRect.height * 10) / 10 : 0,
          childUiFreeOfDebugDrawer: !debugContainer && !qaTopStrip,
          zeroDuplicateColorButtons: !duplicateColorButton,
          gateU2ZeroCropPass:
            layers.every(
              (l) =>
                l.visibleHeightRatio >= 0.995 &&
                l.visibleWidthRatio >= 0.995 &&
                l.objectFit !== 'fill'
            ) && orbHorizontalCenterDeltaPx <= 2,
          orbHorizontalCenterDeltaPx,
          gateU3HeaderTypographyPass: Boolean(
            titleEl &&
              titleEl.textContent?.trim() === '绿草冷静空间' &&
              titleEl.scrollWidth <= titleEl.clientWidth + 1 &&
              titleRect &&
              titleRect.height <= titleLineHeight * 1.45 &&
              closeBtnRect &&
              closeBtnRect.width >= 55.5 &&
              closeBtnRect.height >= 55.5
          ),
          headerTitleMetrics: {
            text: titleEl?.textContent?.trim() || '',
            clientWidth: titleEl ? titleEl.clientWidth : 0,
            scrollWidth: titleEl ? titleEl.scrollWidth : 0,
            height: titleRect ? Math.round(titleRect.height * 10) / 10 : 0,
            lineHeight: Math.round(titleLineHeight * 10) / 10,
          },
          layers,
          allLayersLoaded: layers.every((l) => l.loaded && !l.fallbackActive),
          companionId: companionRig?.getAttribute('data-companion-id') || '',
          companionCutoutLoaded: Boolean(
            companionCutout && companionCutout.complete && companionCutout.naturalWidth > 0
          ),
          mouthActiveIdle: companionRig?.getAttribute('data-mouth-active') === 'true',
          allCompanionPartsLoaded: companionParts.every((p) => p.loaded),
          svgTargets,
          allSvgTargetsMeet56px: svgTargets.every((t) => t.meets56px),
          mediaMetrics: window.__ALAND_V2_3_MEDIA_METRICS__ || {},
        };
      });

      viewportResults.push({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        weatherStationV2: weatherMetrics,
        calmCornerV2: calmMetrics,
      });

      await context.close();
    }

    // ============================================================================
    // Deep State Transitions, 4-Companion Switching, Media Tracker Reset, Keyboard Focus & Regression
    // ============================================================================
    console.log('Running deep functional state transitions, 4-companion switching & QA verification...');
    const e2eContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const e2ePage = await e2eContext.newPage();

    // 1. Weather Station Step 1 (camera) -> Step 2 (sunny, cloudy, rainy, foggy+dual+sensation, stormy+intensity5) -> Step 3 (heavyHolding) -> opt_out
    await e2ePage.goto(`${BASE_URL}/visual-v2-review/weather-station-pilot`, {
      waitUntil: 'networkidle',
    });
    await e2ePage.locator('[data-testid="v2-weather-station-modal"]').waitFor({ state: 'visible' });
    await e2ePage.waitForTimeout(250);
    await saveScreenshot(e2ePage, 'v2_3_batch01r_weather_step1_camera.png');

    // Step 2: sunny
    await e2ePage.locator('[aria-label="看今天头顶的天气"]').click();
    await e2ePage.waitForTimeout(250);
    await saveScreenshot(e2ePage, 'v2_3_batch01r_weather_state_sunny.png');

    // Test 4-Companion Switching in Weather Station (guoguo -> beibei -> tiantian -> qiqi)
    const companionSwitchResults = [];
    for (const compId of ['beibei_otter', 'tiantian_raccoon', 'qiqi_deer', 'guoguo_squirrel']) {
      await e2ePage.locator(`[data-testid="v2-weather-switch-companion-${compId}"]`).click();
      await e2ePage.waitForTimeout(150);
      const activeComp = await e2ePage
        .locator('[data-testid="v2-weather-station-stage-wrapper"]')
        .getAttribute('data-companion-id');
      companionSwitchResults.push({ requested: compId, active: activeComp });
    }
    await saveScreenshot(e2ePage, 'v2_3_batch01r_weather_4companions_switched.png');

    // Keyboard focus & Enter selection on SVG token `rainy`
    const rainyToken = e2ePage.locator('[data-testid="v2-weather-svg-token-rainy"]');
    await rainyToken.focus();
    await e2ePage.waitForTimeout(150);
    const weatherSvgKeyboardFocusRing = await e2ePage.evaluate(() => {
      const el = document.querySelector('[data-testid="v2-weather-svg-token-rainy"]');
      const rectEl = el ? el.querySelector('rect') : null;
      const computed = rectEl ? window.getComputedStyle(rectEl) : null;
      return {
        isActiveElement: document.activeElement === el,
        stroke: computed ? computed.stroke : '',
        strokeWidth: computed ? computed.strokeWidth : '',
        filter: computed ? computed.filter : '',
      };
    });
    await saveScreenshot(e2ePage, 'v2_3_batch01r_weather_keyboard_focus_svg_token.png');

    // Activate rainy via Enter key and check dynamic phrase bar update
    await e2ePage.keyboard.press('Enter');
    await e2ePage.waitForTimeout(250);
    const rainyDynamicPhraseState = await e2ePage.evaluate(() => ({
      selectedWeatherAttr: document
        .querySelector('[data-testid="v2-weather-selected-phrase-bar"]')
        ?.getAttribute('data-selected-weather'),
      phraseText:
        document.querySelector('[data-testid="v2-weather-dynamic-phrase"]')?.textContent?.trim() ||
        '',
    }));
    await saveScreenshot(e2ePage, 'v2_3_batch01r_weather_state_rainy.png');

    // Foggy + Dual Weather + Body Sensation
    await e2ePage.locator('[data-testid="v2-weather-svg-token-foggy"]').click();
    await e2ePage.locator('[aria-label="勾选是否有两种天气同时存在"]').check();
    await e2ePage.locator('[aria-label="第二种天气：雨天"]').click();
    await e2ePage.locator('[aria-label="身体感觉：胸口堵堵的"]').click();
    await e2ePage.waitForTimeout(250);
    const foggyDualState = await e2ePage.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="v2-weather-station-stage-wrapper"]');
      return {
        weatherState: wrapper?.getAttribute('data-weather-state'),
        dualWeather: wrapper?.getAttribute('data-dual-weather'),
        fogOverlayVisible: Boolean(document.querySelector('[data-testid="v2-weather-fog-overlay"]')),
        secondaryBadgeVisible: Boolean(
          document.querySelector('[data-testid="v2-weather-secondary-badge"]')
        ),
        sensationsBadgeVisible: Boolean(
          document.querySelector('[data-testid="v2-weather-stage-sensations"]')
        ),
      };
    });
    await saveScreenshot(e2ePage, 'v2_3_batch01r_weather_state_foggy_dual_sensation.png');

    // Opt-out preview
    await e2ePage.locator('[data-testid="v2-weather-svg-token-opt_out"]').click();
    await e2ePage.waitForTimeout(200);
    const optOutVeilVisible = await e2ePage
      .locator('[data-testid="v2-weather-optout-veil"]')
      .isVisible();
    await saveScreenshot(e2ePage, 'v2_3_batch01r_weather_state_opt_out.png');

    // Stormy + Intensity 5 -> Submit -> Step 3 heavyHolding
    await e2ePage.locator('[data-testid="v2-weather-svg-token-stormy"]').click();
    await e2ePage.locator('[aria-label="感觉程度：强烈"]').click();
    await e2ePage.waitForTimeout(200);
    await saveScreenshot(e2ePage, 'v2_3_batch01r_weather_state_stormy_intensity5.png');

    await e2ePage.locator('[aria-label="记下今天的天气"]').click();
    await e2ePage.waitForTimeout(300);
    const heavyHoldingStep = await e2ePage
      .locator('[data-testid="v2-weather-station-stage-wrapper"]')
      .getAttribute('data-weather-step');
    await saveScreenshot(e2ePage, 'v2_3_batch01r_weather_step3_heavy_holding.png');

    // Jump from Heavy Weather Holding directly into V2 Calm Corner (`CalmSpace`)
    await e2ePage.locator('[aria-label="去绿草平静角深呼吸"]').click();
    await e2ePage.locator('[data-testid="v2-calm-space-modal"]').waitFor({ state: 'visible' });
    await e2ePage.waitForTimeout(300);
    await saveScreenshot(e2ePage, 'v2_3_batch01r_calm_space_inhale_active.png');

    // Keyboard focus on Calm Corner SVG breathe orb
    const breatheOrb = e2ePage.locator('[data-testid="v2-calm-svg-breathe-orb"]');
    await breatheOrb.focus();
    await e2ePage.waitForTimeout(150);
    const calmSvgKeyboardFocusRing = await e2ePage.evaluate(() => {
      const el = document.querySelector('[data-testid="v2-calm-svg-breathe-orb"]');
      const rectEl = el ? el.querySelector('rect') : null;
      const computed = rectEl ? window.getComputedStyle(rectEl) : null;
      return {
        isActiveElement: document.activeElement === el,
        stroke: computed ? computed.stroke : '',
        strokeWidth: computed ? computed.strokeWidth : '',
        filter: computed ? computed.filter : '',
      };
    });
    await saveScreenshot(e2ePage, 'v2_3_batch01r_calm_space_keyboard_focus_svg_orb.png');

    // Activate pause via Enter key on SVG breathe orb -> verify immediate pause freeze
    await e2ePage.keyboard.press('Enter');
    await e2ePage.waitForTimeout(250);
    const calmPausedState = await e2ePage.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="v2-calm-corner-stage-wrapper"]');
      const ringImg = document.querySelector('[data-testid="v2-calm-layer-breathing_visual"]');
      return {
        calmAssetState: wrapper?.getAttribute('data-calm-asset-state'),
        isPaused: wrapper?.getAttribute('data-is-paused'),
        ringTransform: ringImg ? ringImg.style.transform : '',
        ringTransition: ringImg ? ringImg.style.transition : '',
      };
    });
    await saveScreenshot(e2ePage, 'v2_3_batch01r_calm_space_paused_freeze.png');

    // Resume breathing, complete 3-colors grounding via SVG stones, and expand Adult Co-Regulation tips
    await e2ePage.locator('[data-testid="v2-calm-svg-breathe-orb"]').click();
    await e2ePage.locator('[data-testid="v2-calm-svg-color-red"]').click();
    await e2ePage.locator('[data-testid="v2-calm-svg-color-yellow"]').click();
    await e2ePage.locator('[data-testid="v2-calm-svg-color-blue"]').click();
    await e2ePage.locator('[aria-label="展开查看给身旁大人的共同调节卡陪伴建议"]').click();
    await e2ePage.waitForTimeout(250);
    const calmGroundingAndAdultState = await e2ePage.evaluate(() => ({
      redPressed:
        document
          .querySelector('[data-testid="v2-calm-svg-color-red"]')
          ?.getAttribute('aria-pressed') === 'true',
      yellowPressed:
        document
          .querySelector('[data-testid="v2-calm-svg-color-yellow"]')
          ?.getAttribute('aria-pressed') === 'true',
      bluePressed:
        document
          .querySelector('[data-testid="v2-calm-svg-color-blue"]')
          ?.getAttribute('aria-pressed') === 'true',
      adultTipsExpanded: Boolean(
        document.querySelector('[aria-label="收起给身旁大人的共同调节卡陪伴建议"]')
      ),
    }));
    await saveScreenshot(e2ePage, 'v2_3_batch01r_calm_space_3colors_adult_tips.png');

    // Safe exit from CalmSpace back to Island Home, then re-open Weather Station to verify state recovery
    await e2ePage.locator('[aria-label="我已经感觉平静好点了，安全返回晴雨小岛主页"]').click();
    await e2ePage.waitForTimeout(200);

    // Explicit ?qa=1 Reviewer Debug Drawer & Layer Toggle + Media Load Tracker Reset Check
    await e2ePage.goto(`${BASE_URL}/visual-v2-review/weather-station-pilot?qa=1`, {
      waitUntil: 'networkidle',
    });
    await e2ePage.locator('[data-testid="v2-weather-station-modal"]').waitFor({ state: 'visible' });
    await e2ePage.locator('[aria-label="看今天头顶的天气"]').click();
    await e2ePage.waitForTimeout(250);

    await e2ePage.locator('[data-testid="v2-weather-debug-drawer-toggle"]').click();
    await e2ePage.locator('[data-testid="v2-weather-inspector-panel"]').waitFor({ state: 'visible' });
    await e2ePage.locator('[data-testid="v2-weather-layer-toggle-weather_actor"]').click();
    await e2ePage.waitForTimeout(200);
    const weatherLayerToggleResult = await e2ePage.evaluate(() => ({
      drawerOpen:
        document
          .querySelector('[data-testid="v2-weather-debug-drawer-container"]')
          ?.getAttribute('data-drawer-open') === 'true',
      actorLayerPresentWhenDisabled: Boolean(
        document.querySelector('[data-testid="v2-weather-layer-weather_actor"]')
      ),
    }));
    await saveScreenshot(e2ePage, 'v2_3_batch01r_weather_qa_param_debug_drawer.png');
    await e2ePage.locator('[data-testid="v2-weather-layer-toggle-reset"]').click();

    // Test Media Load Tracker across 2 switching sequences in real browser
    const mediaTrackerSequenceA = [];
    for (const st of ['sunny', 'rainy', 'stormy']) {
      await e2ePage.locator(`[data-testid="v2-weather-svg-token-${st}"]`).click();
      await e2ePage.waitForTimeout(250);
      const snap = await e2ePage.evaluate((stateKey) => {
        const m = (window.__ALAND_V2_3_MEDIA_METRICS__ || {})[`weather_station:${stateKey}`];
        return m
          ? {
              sceneId: m.sceneId,
              totalExpected: m.totalExpected,
              loadedCount: m.loadedCount,
              fallbackCount: m.fallbackCount,
              assetKeys: Object.keys(m.assets),
            }
          : null;
      }, st);
      mediaTrackerSequenceA.push(snap);
    }

    const mediaTrackerSequenceB = [];
    for (const st of ['stormy', 'foggy', 'sunny']) {
      await e2ePage.locator(`[data-testid="v2-weather-svg-token-${st}"]`).click();
      await e2ePage.waitForTimeout(250);
      const snap = await e2ePage.evaluate((stateKey) => {
        const m = (window.__ALAND_V2_3_MEDIA_METRICS__ || {})[`weather_station:${stateKey}`];
        return m
          ? {
              sceneId: m.sceneId,
              totalExpected: m.totalExpected,
              loadedCount: m.loadedCount,
              fallbackCount: m.fallbackCount,
              assetKeys: Object.keys(m.assets),
            }
          : null;
      }, st);
      mediaTrackerSequenceB.push(snap);
    }

    // Verify StoryCup V2.2 regression
    await e2ePage.goto(`${BASE_URL}/visual-v2-review/story-cup-pilot`, {
      waitUntil: 'networkidle',
    });
    await e2ePage.locator('[data-testid="story-catalog-leaf-cup-size"]').click();
    await unlockAdultReviewPin(e2ePage);
    await e2ePage.waitForTimeout(300);
    const storyCupRegressionPass = await e2ePage
      .locator('[data-testid="v2-story-cup-art-backdrop"]')
      .isVisible();
    await saveScreenshot(e2ePage, 'v2_3_batch01r_story_cup_regression_check.png');

    // Verify `CalmCornerModal` V2 route (`/visual-v2-review/calm-corner-modal-pilot`)
    await e2ePage.goto(`${BASE_URL}/visual-v2-review/calm-corner-modal-pilot`, {
      waitUntil: 'networkidle',
    });
    await e2ePage.locator('[data-testid="v2-calm-corner-modal"]').waitFor({ state: 'visible' });
    await e2ePage.locator('[data-testid="v2-calm-svg-color-red"]').click();
    await e2ePage.locator('[data-testid="v2-calm-svg-color-yellow"]').click();
    await e2ePage.locator('[data-testid="v2-calm-svg-color-green"]').click();
    await e2ePage.waitForTimeout(250);
    const calmCornerModalVerified = await e2ePage.evaluate(() => ({
      modalVisible: Boolean(document.querySelector('[data-testid="v2-calm-corner-modal"]')),
      stageVisible: Boolean(document.querySelector('[data-testid="v2-calm-corner-stage"]')),
      greenActive:
        document
          .querySelector('[data-testid="v2-calm-svg-color-green"]')
          ?.getAttribute('aria-pressed') === 'true',
      noDebugDrawerInChildUi: !document.querySelector(
        '[data-testid="v2-calm-debug-drawer-container"]'
      ),
    }));
    await saveScreenshot(e2ePage, 'v2_3_batch01r_calm_corner_modal_v2.png');
    await e2eContext.close();

    // Verify `prefers-reduced-motion: reduce`
    const rmContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const rmPage = await rmContext.newPage();
    await rmPage.goto(`${BASE_URL}/visual-v2-review/calm-corner-pilot`, {
      waitUntil: 'networkidle',
    });
    await rmPage.locator('[data-testid="v2-calm-space-modal"]').waitFor({ state: 'visible' });
    await rmPage.waitForTimeout(250);
    const reducedMotionResult = await rmPage.evaluate(() => {
      const wrapper = document.querySelector('[data-testid="v2-calm-corner-stage-wrapper"]');
      const companion = document.querySelector('[data-testid="v2-calm-companion-rig"]');
      const ringImg = document.querySelector('[data-testid="v2-calm-layer-breathing_visual"]');
      return {
        stageReducedMotion: wrapper?.getAttribute('data-reduced-motion') === 'true',
        companionReducedMotion: companion?.getAttribute('data-reduced-motion') === 'true',
        companionMouthActive: companion?.getAttribute('data-mouth-active') === 'true',
        ringScaleFrozenAtOne: ringImg?.style.transform === 'scale(1)',
      };
    });
    await saveScreenshot(rmPage, 'v2_3_batch01r_prefers_reduced_motion.png');
    await rmContext.close();

    const distBundles = getDistBundleStats();

    const gateU1AllPass =
      viewportResults.every((v) => v.weatherStationV2.gateU1SinglePrimarySelectorPass) &&
      rainyDynamicPhraseState.selectedWeatherAttr === 'rainy' &&
      rainyDynamicPhraseState.phraseText.includes('我现在像下雨天');

    const gateU2AllPass = viewportResults.every(
      (v) => v.weatherStationV2.gateU2ZeroCropPass && v.calmCornerV2.gateU2ZeroCropPass
    );

    const gateU3AllPass = viewportResults.every(
      (v) =>
        v.weatherStationV2.gateU3HeaderTypographyPass && v.calmCornerV2.gateU3HeaderTypographyPass
    );

    const allViewportsPass = viewportResults.every(
      (v) =>
        !v.weatherStationV2.horizontalOverflow &&
        v.weatherStationV2.childUiFreeOfDebugDrawer &&
        v.weatherStationV2.gateU1SinglePrimarySelectorPass &&
        v.weatherStationV2.gateU2ZeroCropPass &&
        v.weatherStationV2.gateU3HeaderTypographyPass &&
        v.weatherStationV2.allLayersLoaded &&
        v.weatherStationV2.companionCutoutLoaded &&
        v.weatherStationV2.allCompanionPartsLoaded &&
        !v.weatherStationV2.mouthActiveIdle &&
        v.weatherStationV2.allSvgTokensMeet56px &&
        !v.calmCornerV2.horizontalOverflow &&
        v.calmCornerV2.childUiFreeOfDebugDrawer &&
        v.calmCornerV2.zeroDuplicateColorButtons &&
        v.calmCornerV2.gateU2ZeroCropPass &&
        v.calmCornerV2.gateU3HeaderTypographyPass &&
        v.calmCornerV2.allLayersLoaded &&
        v.calmCornerV2.companionCutoutLoaded &&
        v.calmCornerV2.allCompanionPartsLoaded &&
        !v.calmCornerV2.mouthActiveIdle &&
        v.calmCornerV2.allSvgTargetsMeet56px
    );

    const all4CompanionsSwitchedPass = companionSwitchResults.every(
      (r) => r.requested === r.active
    );

    const mediaTrackerResetPass =
      mediaTrackerSequenceA.every(
        (m) =>
          m &&
          m.loadedCount === 3 &&
          m.fallbackCount === 0 &&
          m.assetKeys.length === 3 &&
          m.assetKeys.every((k) => k.startsWith(m.sceneId.replace(':', '/')))
      ) &&
      mediaTrackerSequenceB.every(
        (m) =>
          m &&
          m.loadedCount === 3 &&
          m.fallbackCount === 0 &&
          m.assetKeys.length === 3 &&
          m.assetKeys.every((k) => k.startsWith(m.sceneId.replace(':', '/')))
      );

    const report = {
      generatedAt: new Date().toISOString(),
      gitCommitSha: GIT_COMMIT_SHA,
      branch: 'ui/visual-v2-batch01r-ux-closeout',
      packageVersion: 'A_LAND_BATCH01R_VISUAL_CORRECTION_HANDOFF_20261017',
      packageZipSha256: '1914661b9592e0efc754ad409da905f6428f81e530966ba739754059580b4a8d',
      mandatoryHoldFlags: {
        ASSET_ARTWORK_BLOCKED: true,
        ART_DIRECTOR_QA_HOLD: true,
        TECH_PREVIEW_NOT_ART_APPROVED: true,
        CONTENT_QA_REVIEW: true,
        PRODUCTION_RELEASE_HOLD: true,
        V2_3_BATCH01_TECH_INTEGRATION_AUTHORIZED: true,
        ENGINEERING_PILOT_AUDIT_PASS_STORY_CUP_ONLY: true,
        productionQualityApproved: 0,
      },
      summary: {
        gateU1SinglePrimaryWeatherSelectorPass: gateU1AllPass,
        gateU2ZeroCropStageGeometryPass: gateU2AllPass,
        gateU3HeaderTypographyPass: gateU3AllPass,
        all6ViewportsPass: allViewportsPass,
        all4CompanionsSwitchedPass,
        mediaTrackerResetPass,
        consoleErrorsCount: consoleErrors.length,
        pageErrorsCount: pageErrors.length,
        http404sCount: http404s.length,
        weatherSvgKeyboardFocusPass:
          weatherSvgKeyboardFocusRing.isActiveElement &&
          weatherSvgKeyboardFocusRing.stroke === 'rgb(2, 132, 199)',
        calmSvgKeyboardFocusPass:
          calmSvgKeyboardFocusRing.isActiveElement &&
          calmSvgKeyboardFocusRing.stroke === 'rgb(2, 132, 199)',
        foggyDualSensationPass:
          foggyDualState.weatherState === 'foggy' &&
          foggyDualState.dualWeather === 'rainy' &&
          foggyDualState.fogOverlayVisible &&
          foggyDualState.secondaryBadgeVisible &&
          foggyDualState.sensationsBadgeVisible,
        weatherQaDrawerLayerTogglePass:
          weatherLayerToggleResult.drawerOpen &&
          !weatherLayerToggleResult.actorLayerPresentWhenDisabled,
        optOutPass: optOutVeilVisible,
        heavyHoldingPass: heavyHoldingStep === 'heavyHolding',
        calmPausedFreezePass:
          calmPausedState.calmAssetState === 'paused' &&
          calmPausedState.isPaused === 'true' &&
          calmPausedState.ringTransform === 'scale(1)',
        calmGroundingAndAdultPass:
          calmGroundingAndAdultState.redPressed &&
          calmGroundingAndAdultState.yellowPressed &&
          calmGroundingAndAdultState.bluePressed &&
          calmGroundingAndAdultState.adultTipsExpanded,
        calmCornerModalPass:
          calmCornerModalVerified.modalVisible &&
          calmCornerModalVerified.stageVisible &&
          calmCornerModalVerified.greenActive &&
          calmCornerModalVerified.noDebugDrawerInChildUi,
        reducedMotionPass:
          reducedMotionResult.stageReducedMotion &&
          reducedMotionResult.companionReducedMotion &&
          !reducedMotionResult.companionMouthActive &&
          reducedMotionResult.ringScaleFrozenAtOne,
        storyCupRegressionPass,
      },
      e2eDetails: {
        rainyDynamicPhraseState,
        companionSwitchResults,
        mediaTrackerSequenceA,
        mediaTrackerSequenceB,
        weatherSvgKeyboardFocusRing,
        calmSvgKeyboardFocusRing,
        foggyDualState,
        weatherLayerToggleResult,
        calmPausedState,
        calmGroundingAndAdultState,
        calmCornerModalVerified,
        reducedMotionResult,
      },
      distBundles,
      viewportResults,
      screenshots,
      consoleErrors,
      pageErrors,
      http404s,
    };

    const reportPath = path.join(DOCS_OUT_DIR, 'GATE_C_6VIEWPORT_AND_E2E_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
    const uxReportPath = path.join(UX_CLOSEOUT_DIR, 'GATE_U4_UX_CLOSEOUT_REPORT.json');
    fs.writeFileSync(uxReportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
    console.log('Saved Gate U4 UX Closeout report ->', uxReportPath);

    const failedChecks = Object.entries(report.summary).filter(
      ([k, v]) =>
        (typeof v === 'boolean' && !v) ||
        (typeof v === 'number' && k.endsWith('Count') && v > 0)
    );
    if (failedChecks.length > 0) {
      console.error('Gate U4 verification had failing checks:', failedChecks);
      process.exitCode = 1;
    } else {
      console.log('ALL GATES U1–U4 6-VIEWPORT & E2E CHECKS PASSED!');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    serverProc.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
