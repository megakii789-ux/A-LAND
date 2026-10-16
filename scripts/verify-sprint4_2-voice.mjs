import { chromium } from 'playwright';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const BASE_URL = process.env.VERIFY_BASE_URL || 'http://127.0.0.1:4179';
const ARTIFACT_DIR =
  process.env.ARTIFACT_DIR ||
  '/home/voga/.gemini/antigravity/brain/14e51dfc-628e-475c-bb64-37e80b5c7d73';

const COMPANIONS = [
  {
    id: 'guoguo_squirrel',
    name: '果果',
    profile: 'playful-buddy',
    voice: 'zh-CN-XiaoyiNeural',
  },
  {
    id: 'beibei_otter',
    name: '贝贝',
    profile: 'warm-sister',
    voice: 'zh-CN-XiaoxiaoNeural',
  },
  {
    id: 'tiantian_raccoon',
    name: '天天',
    profile: 'gentle-guide',
    voice: 'zh-CN-YunxiNeural',
  },
  {
    id: 'qiqi_deer',
    name: '奇奇',
    profile: 'starlight-companion',
    voice: 'zh-CN-YunxiaNeural',
  },
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
}

async function unlockPlaytestIfNeeded(page) {
  const playtestBtn = page.getByTestId('enable-internal-playtest-btn');
  if ((await playtestBtn.count()) > 0 && (await playtestBtn.isVisible())) {
    await playtestBtn.click();
    await page.waitForTimeout(150);
    const pwInputs = page.locator('input[type="password"]');
    const count = await pwInputs.count();
    if (count >= 2) {
      await pwInputs.nth(0).fill('202608');
      await pwInputs.nth(1).fill('202608');
      await page.getByRole('button', { name: '确认并进入' }).click();
    } else if (count === 1) {
      await pwInputs.nth(0).fill('202608');
      await page.getByRole('button', { name: '校验进入' }).click();
    }
    await page.waitForTimeout(350);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const matrixResults = [];

  try {
    // 1. Desktop 1440x900: 4 Companions x 6 Core Scenes Matrix + Audio Binary Hash Verification
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();

    const consoleErrors = [];
    page.on('pageerror', (err) => consoleErrors.push(String(err)));

    await page.goto(`${BASE_URL}/?playtest=1`, { waitUntil: 'networkidle' });

    // Unlock internal playtest once via Games Hub so all 6 scenes are accessible
    await page.getByRole('button', { name: '打开真实动动手探险游戏集' }).click();
    await page.waitForTimeout(150);
    await unlockPlaytestIfNeeded(page);
    await page.getByRole('button', { name: '关闭游戏集' }).click();
    await page.waitForTimeout(150);

    for (const comp of COMPANIONS) {
      // Scene 1: Switch companion via PersonalizationSettingsModal & verify Greeting
      await page.getByRole('button', { name: '打开小岛偏好设置' }).click();
      await page.waitForTimeout(150);

      await page.locator('button', { hasText: comp.name }).first().click();
      await page.waitForTimeout(150);

      const diagGreeting = await page.evaluate(() => window.__SPEECH_NARRATOR_DIAGNOSTICS__);
      assert(
        diagGreeting &&
          diagGreeting.companionId === comp.id &&
          diagGreeting.requestedVoiceProfile === comp.profile &&
          diagGreeting.actualSourceProfile === comp.profile &&
          diagGreeting.sourceType === 'prebaked-mp3' &&
          diagGreeting.neuralVoiceName === comp.voice,
        `[${comp.name}] Scene 1 Companion Greeting mismatch: ${JSON.stringify(diagGreeting)}`
      );
      matrixResults.push({
        companion: comp.name,
        scene: '1. 首页伙伴问候',
        ...diagGreeting,
      });

      await page.getByRole('button', { name: '关闭设置面板' }).click();
      await page.waitForTimeout(120);

      // Verify ChildAudioBar badge displays current companion
      const badgeText = await page.getByTestId('audio-bar-companion-voice-badge').textContent();
      assert(
        badgeText && badgeText.includes(comp.name),
        `[${comp.name}] ChildAudioBar badge mismatch: ${badgeText}`
      );

      // Scene 2: Calm Corner (呼吸平静角)
      await page
        .getByRole('button', { name: /进入绿草平静角|慢慢深呼吸，放松身体/ })
        .first()
        .click();
      await page.waitForTimeout(150);
      await page
        .getByRole('button', { name: /通过语音朗读当前呼吸引导提示/ })
        .first()
        .click();
      await page.waitForTimeout(120);
      const diagCalm = await page.evaluate(() => window.__SPEECH_NARRATOR_DIAGNOSTICS__);
      assert(
        diagCalm &&
          diagCalm.companionId === comp.id &&
          diagCalm.actualSourceProfile === comp.profile &&
          diagCalm.sourceType === 'prebaked-mp3' &&
          diagCalm.neuralVoiceName === comp.voice,
        `[${comp.name}] Scene 2 Calm Corner mismatch: ${JSON.stringify(diagCalm)}`
      );
      matrixResults.push({
        companion: comp.name,
        scene: '2. 呼吸平静角',
        ...diagCalm,
      });
      await page.getByRole('button', { name: '关闭冷静空间，返回主页' }).click();
      await page.waitForTimeout(120);

      // Scenes 3, 4, 5: Interactive Games Hub (蜡笔侦探 / 朋友问起家里事 / 轮流玩小船)
      await page.getByRole('button', { name: '打开真实动动手探险游戏集' }).click();
      await page.waitForTimeout(180);

      // Scene 3: 蜡笔侦探
      await page.locator('button', { hasText: '蜡笔侦探' }).first().click();
      await page.waitForTimeout(180);
      const diagDetective = await page.evaluate(() => window.__SPEECH_NARRATOR_DIAGNOSTICS__);
      assert(
        diagDetective &&
          diagDetective.companionId === comp.id &&
          diagDetective.actualSourceProfile === comp.profile &&
          diagDetective.sourceType === 'prebaked-mp3' &&
          diagDetective.neuralVoiceName === comp.voice &&
          diagDetective.text.includes('绿色小蜡笔'),
        `[${comp.name}] Scene 3 Crayon Detective mismatch: ${JSON.stringify(diagDetective)}`
      );
      matrixResults.push({
        companion: comp.name,
        scene: '3. 蜡笔侦探',
        ...diagDetective,
      });

      // Scene 4: 朋友问起家里事
      await page.locator('button', { hasText: '问起我的家' }).first().click();
      await page.waitForTimeout(180);
      const diagFriend = await page.evaluate(() => window.__SPEECH_NARRATOR_DIAGNOSTICS__);
      assert(
        diagFriend &&
          diagFriend.companionId === comp.id &&
          diagFriend.actualSourceProfile === comp.profile &&
          diagFriend.sourceType === 'prebaked-mp3' &&
          diagFriend.neuralVoiceName === comp.voice,
        `[${comp.name}] Scene 4 Friend Asks Home mismatch: ${JSON.stringify(diagFriend)}`
      );
      matrixResults.push({
        companion: comp.name,
        scene: '4. 朋友问起家里事',
        ...diagFriend,
      });

      // Scene 5: 轮流玩小船
      await page.locator('button', { hasText: '小船协商' }).first().click();
      await page.waitForTimeout(180);
      const diagBoat = await page.evaluate(() => window.__SPEECH_NARRATOR_DIAGNOSTICS__);
      assert(
        diagBoat &&
          diagBoat.companionId === comp.id &&
          diagBoat.actualSourceProfile === comp.profile &&
          diagBoat.sourceType === 'prebaked-mp3' &&
          diagBoat.neuralVoiceName === comp.voice,
        `[${comp.name}] Scene 5 Toy Boat mismatch: ${JSON.stringify(diagBoat)}`
      );
      matrixResults.push({
        companion: comp.name,
        scene: '5. 轮流玩小船',
        ...diagBoat,
      });

      await page.getByRole('button', { name: '关闭游戏集' }).click();
      await page.waitForTimeout(120);

      // Scene 6: 故事森林与树屋露营夜 (StoryGroveModal)
      await page
        .getByRole('button', { name: /进入故事森林/ })
        .first()
        .click();
      await page.waitForTimeout(180);
      await unlockPlaytestIfNeeded(page);

      await page.getByTestId('story-catalog-leaf-cup-size').click();
      await page.waitForTimeout(180);
      const diagStory = await page.evaluate(() => window.__SPEECH_NARRATOR_DIAGNOSTICS__);
      assert(
        diagStory &&
          diagStory.companionId === comp.id &&
          diagStory.actualSourceProfile === comp.profile &&
          diagStory.sourceType === 'prebaked-mp3' &&
          diagStory.neuralVoiceName === comp.voice,
        `[${comp.name}] Scene 6 Story Grove Cup Size mismatch: ${JSON.stringify(diagStory)}`
      );
      matrixResults.push({
        companion: comp.name,
        scene: '6. 故事森林与露营夜',
        ...diagStory,
      });

      await page.locator('button', { hasText: '返回目录' }).first().click();
      await page.waitForTimeout(120);
      await page.getByTestId('open-camp-transfer-challenge').click();
      await page.waitForTimeout(180);
      const diagCamp = await page.evaluate(() => window.__SPEECH_NARRATOR_DIAGNOSTICS__);
      assert(
        diagCamp &&
          diagCamp.companionId === comp.id &&
          diagCamp.actualSourceProfile === comp.profile &&
          diagCamp.sourceType === 'prebaked-mp3' &&
          diagCamp.neuralVoiceName === comp.voice,
        `[${comp.name}] Scene 6 Camp Transfer mismatch: ${JSON.stringify(diagCamp)}`
      );

      await page.getByRole('button', { name: '离开故事林' }).click();
      await page.waitForTimeout(120);
    }

    // 2. Verify distinct audio binary SHA256 & byte lengths across the 4 companions for the same mainline sentence
    const sharedSentenceClips = matrixResults.filter(
      (r) => r.scene === '6. 故事森林与露营夜'
    );
    assert(sharedSentenceClips.length === 4, 'Expected 4 companion clips for Scene 6');
    const hashes = new Set();
    const audioDetails = [];
    for (const clip of sharedSentenceClips) {
      const resp = await page.request.get(`${BASE_URL}${clip.audioUrl}`);
      assert(resp.status() === 200, `Expected HTTP 200 for ${clip.audioUrl}`);
      const buf = await resp.body();
      assert(buf.length > 2000, `Expected non-empty MP3 (>2KB) for ${clip.audioUrl}`);
      const sha = crypto.createHash('sha256').update(buf).digest('hex');
      hashes.add(sha);
      audioDetails.push({
        companion: clip.companion,
        voice: clip.neuralVoiceName,
        audioUrl: clip.audioUrl,
        bytes: buf.length,
        sha256Prefix: sha.slice(0, 16),
      });
    }
    assert(
      hashes.size === 4,
      `Expected 4 distinct SHA256 audio binaries across 4 companions, got ${hashes.size}`
    );

    // 3. Verify VoiceSystemAuditionModal temporary audition vs confirmed global switch + screenshot
    await page.getByRole('button', { name: '打开小岛偏好设置' }).click();
    await page.waitForTimeout(150);
    await page.locator('button', { hasText: '贝贝' }).first().click();
    await page.waitForTimeout(120);
    await page.getByRole('button', { name: '打开角色配音试听与声线信息面板' }).click();
    await page.waitForTimeout(180);

    // Temporary audition Qiqi (starlight-companion)
    await page.getByTestId('audition-profile-card-starlight-companion').click();
    await page.waitForTimeout(150);
    const diagPreview = await page.evaluate(() => window.__SPEECH_NARRATOR_DIAGNOSTICS__);
    assert(
      diagPreview && diagPreview.requestedVoiceProfile === 'starlight-companion',
      'Expected temporary audition to preview starlight-companion'
    );

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'sprint4_2-desktop-1440-audition-modal-preview.png'),
    });

    // Cancel without confirming -> must restore Beibei (warm-sister)
    await page.getByTestId('audition-cancel-restore-btn').click();
    await page.waitForTimeout(150);
    await page.getByRole('button', { name: '关闭设置面板' }).click();
    await page.waitForTimeout(120);

    await page.getByRole('button', { name: '听贝贝问候' }).first().click();
    await page.waitForTimeout(150);
    const diagRestored = await page.evaluate(() => window.__SPEECH_NARRATOR_DIAGNOSTICS__);
    assert(
      diagRestored &&
        diagRestored.companionId === 'beibei_otter' &&
        diagRestored.requestedVoiceProfile === 'warm-sister' &&
        diagRestored.neuralVoiceName === 'zh-CN-XiaoxiaoNeural',
      `Expected cancel audition to restore Beibei warm-sister, got ${JSON.stringify(diagRestored)}`
    );

    // 4. Verify SFX Mute Decoupling on ChildAudioBar + screenshot
    await page.getByTestId('audio-bar-sfx-toggle').click();
    await page.waitForTimeout(120);
    await page.getByRole('button', { name: '听贝贝问候' }).first().click();
    await page.waitForTimeout(150);
    const diagSfxMuted = await page.evaluate(() => window.__SPEECH_NARRATOR_DIAGNOSTICS__);
    assert(
      diagSfxMuted &&
        diagSfxMuted.sourceType === 'prebaked-mp3' &&
        diagSfxMuted.companionId === 'beibei_otter',
      `Expected partner speech to remain active when SFX is muted: ${JSON.stringify(diagSfxMuted)}`
    );

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'sprint4_2-desktop-1440-sfx-muted-voice-active.png'),
    });

    assert(consoleErrors.length === 0, `Unexpected page errors: ${consoleErrors.join('; ')}`);
    await context.close();

    // 5. Mobile 390x844 Verification & Screenshot
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${BASE_URL}/?playtest=1`, { waitUntil: 'networkidle' });

    await mobilePage.getByRole('button', { name: '打开小岛偏好设置' }).click();
    await mobilePage.waitForTimeout(150);
    await mobilePage.locator('button', { hasText: '奇奇' }).first().click();
    await mobilePage.waitForTimeout(150);
    await mobilePage.getByRole('button', { name: '关闭设置面板' }).click();
    await mobilePage.waitForTimeout(150);

    const mobileOverflow = await mobilePage.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    );
    assert(mobileOverflow, 'Expected zero horizontal overflow on 390x844 mobile viewport');

    await mobilePage.screenshot({
      path: path.join(ARTIFACT_DIR, 'sprint4_2-mobile-390-qiqi-voice-synced.png'),
    });
    await mobileContext.close();

    const summaryPath = path.join(ARTIFACT_DIR, 'sprint4_2-voice-matrix-summary.json');
    fs.writeFileSync(
      summaryPath,
      JSON.stringify({ matrixResults, audioDetails }, null, 2),
      'utf-8'
    );
    console.log(
      `PASS: Verified ${matrixResults.length} companion-scene combinations (4 companions x 6 scenes) + 4 distinct SHA256 MP3 binaries + audition preview/restore + SFX/speech decoupling!`
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
