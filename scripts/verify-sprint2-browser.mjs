import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PORT = 4182;
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUT_DIR = path.resolve(process.cwd(), 'docs/evidence/sprint2');

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

async function openGamesHubAndUnlockPlaytest(page, useTouch = false) {
  if (useTouch) {
    await touchTap(page, 'button[aria-label="打开真实动动手探险游戏集"]');
    await page.waitForSelector('[data-testid="enable-internal-playtest-btn"]', { timeout: 5000 });
    await touchTap(page, '[data-testid="enable-internal-playtest-btn"]');
  } else {
    await page.locator('button[aria-label="打开真实动动手探险游戏集"]').first().click();
    await page.waitForSelector('[data-testid="enable-internal-playtest-btn"]', { timeout: 5000 });
    await page.locator('[data-testid="enable-internal-playtest-btn"]').click();
  }

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
    sprintVersion: 'Sprint 2.1',
    checks: {},
    actionSequences: {},
    screenshots: [],
    honestObservationDisclosure:
      '未进行真实儿童观察（本次全部数据来自自动化真实浏览器触控与端到端交互验证，未虚构真实儿童反应）',
  };

  try {
    await waitForServer(BASE_URL);
    const browser = await chromium.launch({ headless: true });

    // =========================================================================
    // 1. Mobile 390x844 Real Touch Verification
    //    - P1-C & P1-D: FriendAsksHomeGame Framing Selector, Composer, A -> B -> A state preservation, Voluntary Pause
    //    - P0-A, P0-B, P1-A: ToyBoatNegotiationGame 3s Real Timer Completion, No Premature Result, Task 1 -> Task 2 Negative Check
    // =========================================================================
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });

    await openGamesHubAndUnlockPlaytest(mobilePage, true);

    // 1A. Switch to 《问起我的家》 on 390px mobile
    await touchTap(mobilePage, 'button:has-text("问起我的家")');
    await mobilePage.waitForSelector('[data-testid="friend-asks-home-game"]', { timeout: 5000 });

    // Verify P1-C framing selector: switch to OWN_EXPRESSION -> neutral family copy
    await touchTap(mobilePage, '[data-testid="framing-mode-OWN_EXPRESSION"]');
    const ownExpressionOptionText = await mobilePage
      .locator('[data-testid="dialogue-option-opt_c1_direct"]')
      .textContent();
    await touchTap(mobilePage, '[data-testid="framing-mode-STORY_CHILD"]');

    // Scenario 1: Curious friend asking -> Round 1 choose DIRECT_ANSWER -> advances to Round 2
    const round1Text = await mobilePage.locator('[data-testid="peer-current-speech"]').textContent();
    await touchTap(mobilePage, '[data-testid="dialogue-option-opt_c1_direct"]');
    const round2ProbingText = await mobilePage
      .locator('[data-testid="peer-current-speech"]')
      .textContent();

    // Verify P1-C per-scenario state preservation: Switch Scenario 1 (Round 2) -> Scenario 2 (Round 1) -> back to Scenario 1 (still Round 2!)
    await touchTap(mobilePage, '[data-testid="friend-scenario-tab-scenario_probing_classmate_drawing"]');
    const s2InitialRoundBadge = await mobilePage
      .locator('[data-testid="friend-dialogue-round-badge"]')
      .textContent();
    await touchTap(mobilePage, '[data-testid="friend-scenario-tab-scenario_curious_friend_pickup"]');
    const s1RestoredRoundBadge = await mobilePage
      .locator('[data-testid="friend-dialogue-round-badge"]')
      .textContent();

    const s1Shot = path.join(OUT_DIR, 'sprint2-mobile-390-friend-home-multiturn.png');
    await mobilePage.screenshot({ path: s1Shot });
    report.screenshots.push(s1Shot);

    // Round 2 -> choose STATE_BOUNDARY -> reaches Round 3 terminal card
    await touchTap(mobilePage, '[data-testid="dialogue-option-opt_c1_r2_boundary"]');
    const s1TerminalVisible = await mobilePage
      .locator('[data-testid="friend-scenario-terminal-card"]')
      .isVisible();

    // Scenario 2: Classmate Doudou repeatedly probing privacy -> state boundary -> Doudou grumbles -> pause conversation anytime
    await touchTap(mobilePage, '[data-testid="friend-scenario-tab-scenario_probing_classmate_drawing"]');
    await touchTap(mobilePage, '[data-testid="dialogue-option-opt_p1_boundary"]');
    const round2GrumbleText = await mobilePage
      .locator('[data-testid="peer-current-speech"]')
      .textContent();
    await touchTap(mobilePage, '[data-testid="pause-conversation-anytime-btn"]');
    const pauseAffirmationVisible = await mobilePage
      .locator('[data-testid="voluntary-pause-affirmation"]')
      .isVisible();

    const s2Shot = path.join(OUT_DIR, 'sprint2-mobile-390-friend-home-boundary-pause.png');
    await mobilePage.screenshot({ path: s2Shot });
    report.screenshots.push(s2Shot);

    const mobileFriendOverflow = await mobilePage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));

    report.checks.mobileFriendAsksHome = {
      scrollWidth: mobileFriendOverflow.scrollWidth,
      innerWidth: mobileFriendOverflow.innerWidth,
      ownExpressionNeutralCopy: ownExpressionOptionText?.includes('因为我们家每天接送的安排不一样'),
      s2InitialRoundBadge: s2InitialRoundBadge?.trim(),
      s1RestoredRoundBadge: s1RestoredRoundBadge?.trim(),
      round1Text: round1Text?.trim(),
      round2ProbingText: round2ProbingText?.trim(),
      s1TerminalVisible,
      round2GrumbleText: round2GrumbleText?.trim(),
      pauseAffirmationVisible,
    };

    if (
      mobileFriendOverflow.innerWidth !== 390 ||
      mobileFriendOverflow.scrollWidth > 390 ||
      !ownExpressionOptionText?.includes('因为我们家每天接送的安排不一样') ||
      !s1RestoredRoundBadge?.includes('第 2 轮互动') ||
      !round2ProbingText?.includes('那你的玩具和画笔放哪边呀') ||
      !s1TerminalVisible ||
      !round2GrumbleText?.includes('小气鬼') ||
      !pauseAffirmationVisible
    ) {
      throw new Error(
        `Mobile 390px FriendAsksHomeGame check failed: ${JSON.stringify(report.checks.mobileFriendAsksHome)}`
      );
    }

    // 1B. Switch to 《小船协商》 on 390px mobile — Verify P1-A (no premature result), P0-A (3s real timer wait), and P0-B (Task 1 -> Task 2 negative check)
    await touchTap(mobilePage, 'button:has-text("小船协商")');
    await mobilePage.waitForSelector('[data-testid="toy-boat-negotiation-game"]', { timeout: 5000 });

    // P1-A: Result panel must NOT exist in PLANNING phase
    const resultCountInPlanning = await mobilePage
      .locator('[data-testid="negotiation-result-observation"]')
      .count();

    // Move boat to BEAR_DOCK, arrange Bear first + 5s duration + empty-handed wait -> Rabbit is LOW_FRUSTRATED
    await touchTap(mobilePage, '[data-testid="move-boat-zone-BEAR_DOCK"]');
    const boatAtBearDock = await mobilePage
      .locator('[data-testid="move-boat-zone-BEAR_DOCK"]')
      .getAttribute('data-has-boat');

    await touchTap(mobilePage, '[data-testid="order-actor-bear"]');
    await touchTap(mobilePage, '[data-testid="duration-seconds-5"]');
    await touchTap(mobilePage, '[data-testid="waiting-activity-wait_empty_hands"]');
    const rabbitImpatientState = await mobilePage
      .locator('[data-testid="rabbit-reaction-card"]')
      .getAttribute('data-satisfaction');

    // Re-negotiate to 3s duration + sand digger exchange -> both HIGH_SATISFIED
    await touchTap(mobilePage, '[data-testid="duration-seconds-3"]');
    await touchTap(mobilePage, '[data-testid="strategy-option-EXCHANGE_ALT"]');
    const rabbitSatisfiedState = await mobilePage
      .locator('[data-testid="rabbit-reaction-card"]')
      .getAttribute('data-satisfaction');
    const bearSatisfiedState = await mobilePage
      .locator('[data-testid="bear-reaction-card"]')
      .getAttribute('data-satisfaction');

    // P0-A: Tap execute and wait for REAL 3s * 2 rounds = ~6.5s countdown without manual button click!
    await touchTap(mobilePage, '[data-testid="execute-negotiation-plan-btn"]');
    const metricsWhileRunning = await readPlaytestMetrics(mobilePage);
    const companionStageWhileRunning = metricsWhileRunning?.latestCompanionMemory?.eventStage;

    // Wait for natural countdown completion (2 rounds x 3s = 6s)
    await mobilePage.waitForSelector('[data-testid="negotiation-observed-complete-badge"]', {
      timeout: 9000,
    });

    const task1CompletionMode = await mobilePage
      .locator('[data-testid="negotiation-observed-complete-badge"]')
      .getAttribute('data-completion-mode');
    const metricsAfterTask1Timer = await readPlaytestMetrics(mobilePage);

    const s3Shot = path.join(OUT_DIR, 'sprint2-mobile-390-toy-boat-executed.png');
    await mobilePage.screenshot({ path: s3Shot });
    report.screenshots.push(s3Shot);

    // P0-B Negative Check: Switch from completed Task 1 to Task 2 without executing Task 2
    await touchTap(mobilePage, '[data-testid="boat-task-tab-task_limited_resource_coop"]');
    const task2PhaseAfterSwitch = await mobilePage
      .locator('[data-testid="boat-execution-status-badge"]')
      .getAttribute('data-phase');
    const metricsAfterSwitchToTask2 = await readPlaytestMetrics(mobilePage);

    const mobileBoatOverflow = await mobilePage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));

    report.checks.mobileToyBoatNegotiation = {
      scrollWidth: mobileBoatOverflow.scrollWidth,
      innerWidth: mobileBoatOverflow.innerWidth,
      resultCountInPlanning,
      boatAtBearDock,
      rabbitImpatientState,
      rabbitSatisfiedState,
      bearSatisfiedState,
      companionStageWhileRunning,
      task1CompletionMode,
      completedAfterTask1Timer: metricsAfterTask1Timer?.completedToyBoatTaskIds,
      task2PhaseAfterSwitch,
      completedAfterSwitchToTask2: metricsAfterSwitchToTask2?.completedToyBoatTaskIds,
    };

    if (
      mobileBoatOverflow.innerWidth !== 390 ||
      mobileBoatOverflow.scrollWidth > 390 ||
      resultCountInPlanning !== 0 ||
      boatAtBearDock !== 'true' ||
      rabbitImpatientState !== 'LOW_FRUSTRATED' ||
      rabbitSatisfiedState !== 'HIGH_SATISFIED' ||
      bearSatisfiedState !== 'HIGH_SATISFIED' ||
      companionStageWhileRunning !== 'ARRANGED_OR_STARTED' ||
      task1CompletionMode !== 'FULL_WAIT_TIMER' ||
      !metricsAfterTask1Timer?.completedToyBoatTaskIds?.includes('task_turn_and_waiting') ||
      task2PhaseAfterSwitch !== 'PLANNING' ||
      metricsAfterSwitchToTask2?.completedToyBoatTaskIds?.includes('task_limited_resource_coop')
    ) {
      throw new Error(
        `Mobile 390px ToyBoatNegotiationGame check failed: ${JSON.stringify(report.checks.mobileToyBoatNegotiation)}`
      );
    }

    await mobileContext.close();

    // =========================================================================
    // 2. Desktop 1440x900 Verification
    //    - S2-FIX01 & S2-FIX02
    //    - P0-A: Manual Early Handoff vs 5-second Real Countdown Wait + Re-open Persistence
    //    - P1-E: SVG Island Map visual elements & Companion Memory stage
    // =========================================================================
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(BASE_URL, { waitUntil: 'networkidle' });

    await openGamesHubAndUnlockPlaytest(desktopPage, false);

    // 2A. Verify S2-FIX01 & S2-FIX02 on Crayon Detective Case A
    await desktopPage.locator('[data-testid="initial-hypothesis-hyp_unknown_yet"]').click();
    await desktopPage.locator('[data-testid="scene-hotspot-hs_curtain"]').click();
    await desktopPage.locator('[data-testid="scene-hotspot-hs_curtain"]').click();
    await desktopPage.locator('[data-testid="quick-sort-hs_curtain-EYES_OBSERVED"]').click();
    await desktopPage.locator('[data-testid="scene-hotspot-hs_cat_tracks"]').click();
    await desktopPage.locator('[data-testid="quick-sort-hs_cat_tracks-EYES_OBSERVED"]').click();

    await desktopPage.locator('[data-testid="revise-hypothesis-hyp_peer_took"]').click();
    const pipiFindingState = await desktopPage
      .locator('[data-testid="hypothesis-evaluation-badge"]')
      .getAttribute('data-finding-state');
    const pipiBadgeText = await desktopPage
      .locator('[data-testid="hypothesis-evaluation-badge"]')
      .textContent();

    await desktopPage.locator('[data-testid="revise-hypothesis-hyp_rolled_away"]').click();
    await desktopPage.locator('[data-testid="next-action-act_pickup_and_apologize"]').click();
    await desktopPage.locator('[data-testid="open-detective-synthesis-btn"]').click();
    await desktopPage.locator('button:has-text("返回现场继续探索")').click();
    await desktopPage.locator('[data-testid="open-detective-synthesis-btn"]').click();
    await desktopPage.locator('button:has-text("返回现场继续探索")').click();
    await desktopPage.locator('[data-testid="open-detective-synthesis-btn"]').click();
    await desktopPage.locator('button:has-text("返回现场继续探索")').click();

    const metricsAfterS2Fix = await readPlaytestMetrics(desktopPage);
    const caseAParticipationCount =
      metricsAfterS2Fix?.taskParticipationCounts?.['scenario_detective_drawing_v1'] ?? 0;

    report.checks.s2Fix01And02 = {
      pipiFindingState,
      pipiBadgeText: pipiBadgeText?.trim(),
      caseAParticipationCount,
      completedDetectiveCaseIds: metricsAfterS2Fix?.completedDetectiveCaseIds,
    };

    if (
      pipiFindingState !== 'LACK_OF_SUPPORTING_EVIDENCE' ||
      caseAParticipationCount !== 1
    ) {
      throw new Error(
        `S2-FIX01 / S2-FIX02 verification failed: ${JSON.stringify(report.checks.s2Fix01And02)}`
      );
    }

    // 2B. Desktop FriendAsksHomeGame Scenario 4 (Crowd Bullying -> Safety Protection)
    await desktopPage.locator('button:has-text("问起我的家")').click();
    await desktopPage.waitForSelector('[data-testid="friend-asks-home-game"]', { timeout: 5000 });
    await desktopPage
      .locator('[data-testid="friend-scenario-tab-scenario_bullying_crowd_corridor"]')
      .click();
    await desktopPage.locator('[data-testid="dialogue-option-opt_b1_state_boundary"]').click();
    const bullyingRound2Speech = await desktopPage
      .locator('[data-testid="peer-current-speech"]')
      .textContent();
    await desktopPage.locator('[data-testid="dialogue-option-opt_b2_seek_teacher"]').click();

    const s4Shot = path.join(OUT_DIR, 'sprint2-desktop-1440-friend-home-safety.png');
    await desktopPage.screenshot({ path: s4Shot });
    report.screenshots.push(s4Shot);

    // 2C. Desktop ToyBoatNegotiationGame:
    // First test manual early handoff on Task 1 -> MANUAL_EARLY_HANDOFF
    await desktopPage.locator('button:has-text("小船协商")').click();
    await desktopPage.waitForSelector('[data-testid="toy-boat-negotiation-game"]', { timeout: 5000 });
    await desktopPage.locator('[data-testid="execute-negotiation-plan-btn"]').click();
    await desktopPage.locator('[data-testid="advance-negotiation-round-btn"]').click();
    await desktopPage.locator('[data-testid="advance-negotiation-round-btn"]').click();
    const manualEarlyMode = await desktopPage
      .locator('[data-testid="negotiation-observed-complete-badge"]')
      .getAttribute('data-completion-mode');

    // Next switch to Task 2, select 5s duration, and let the REAL 5s * 2 rounds = 10s countdown finish naturally!
    await desktopPage.locator('[data-testid="boat-task-tab-task_limited_resource_coop"]').click();
    await desktopPage.locator('[data-testid="duration-seconds-5"]').click();
    await desktopPage.locator('[data-testid="execute-negotiation-plan-btn"]').click();
    await desktopPage.waitForSelector('[data-testid="negotiation-observed-complete-badge"]', {
      timeout: 13000,
    });
    const task2FiveSecTimerMode = await desktopPage
      .locator('[data-testid="negotiation-observed-complete-badge"]')
      .getAttribute('data-completion-mode');

    const s5Shot = path.join(OUT_DIR, 'sprint2-desktop-1440-toy-boat-task2-coop.png');
    await desktopPage.screenshot({ path: s5Shot });
    report.screenshots.push(s5Shot);

    // 2D. Return to Child Island Home & Verify Map SVG Elements + Companion Memory Linkage
    await desktopPage.locator('button[aria-label="关闭游戏集"]').click();
    await desktopPage.waitForSelector('[data-testid="companion-session-memory"]', { timeout: 5000 });
    await desktopPage.evaluate(() => window.scrollTo(0, 0));
    await desktopPage.waitForTimeout(150);

    const companionMemoryText = await desktopPage
      .locator('[data-testid="companion-session-memory"]')
      .textContent();
    const companionMemoryStage = await desktopPage
      .locator('[data-testid="companion-session-memory"]')
      .getAttribute('data-event-stage');
    const friendBadgeText = await desktopPage
      .locator('[data-testid="island-friend-home-progress-badge"]')
      .textContent();
    const boatBadgeText = await desktopPage
      .locator('[data-testid="island-toy-boat-progress-badge"]')
      .textContent();
    const svgFlowerCount = await desktopPage
      .locator('[data-testid="island-svg-courage-boundary-flower"]')
      .count();
    const svgBoatCount = await desktopPage
      .locator('[data-testid="island-svg-bridge-sailing-boat"]')
      .count();
    const desktopOverflow = await desktopPage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));

    const s6Shot = path.join(OUT_DIR, 'sprint2-desktop-1440-island-companion-memory.png');
    await desktopPage.screenshot({ path: s6Shot });
    report.screenshots.push(s6Shot);

    report.checks.islandAndCompanionLinkage = {
      desktopScrollWidth: desktopOverflow.scrollWidth,
      desktopInnerWidth: desktopOverflow.innerWidth,
      manualEarlyMode,
      task2FiveSecTimerMode,
      bullyingRound2Speech: bullyingRound2Speech?.trim(),
      companionMemoryText: companionMemoryText?.trim(),
      companionMemoryStage,
      friendBadgeText: friendBadgeText?.trim(),
      boatBadgeText: boatBadgeText?.trim(),
      svgFlowerCount,
      svgBoatCount,
    };

    if (
      desktopOverflow.scrollWidth > desktopOverflow.innerWidth ||
      manualEarlyMode !== 'MANUAL_EARLY_HANDOFF' ||
      task2FiveSecTimerMode !== 'FULL_WAIT_TIMER' ||
      companionMemoryStage !== 'COMPLETED_OBSERVED' ||
      !companionMemoryText?.includes('浅水溪湾的松果渡船挑战') ||
      !friendBadgeText?.includes('边界表达 1 幕') ||
      !boatBadgeText?.includes('小船协商 2 项') ||
      svgFlowerCount < 1 ||
      svgBoatCount < 1
    ) {
      throw new Error(
        `Desktop 1440px & Island linkage check failed: ${JSON.stringify(report.checks.islandAndCompanionLinkage)}`
      );
    }

    await desktopContext.close();
    await browser.close();

    const reportPath = path.join(OUT_DIR, 'sprint2_verification_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log('Sprint 2.1 Browser Verification PASSED! Report written to:', reportPath);
  } finally {
    previewProc.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('Sprint 2.1 Browser Verification FAILED:', err);
  process.exit(1);
});
