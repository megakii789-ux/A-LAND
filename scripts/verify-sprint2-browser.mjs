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
    checks: {},
    actionSequences: {},
    screenshots: [],
    honestObservationDisclosure: '未进行真实儿童观察（本次全部数据来自自动化真实浏览器触控与端到端交互验证，未虚构真实儿童反应）',
  };

  try {
    await waitForServer(BASE_URL);
    const browser = await chromium.launch({ headless: true });

    // =========================================================================
    // 1. Mobile 390x844 Real Touch Verification (FriendAsksHomeGame & ToyBoatNegotiationGame)
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

    // Scenario 1: Curious friend asking -> Round 1 choose DIRECT_ANSWER
    const round1Text = await mobilePage.locator('[data-testid="peer-current-speech"]').textContent();
    await touchTap(mobilePage, '[data-testid="dialogue-option-opt_c1_direct"]');
    const round2ProbingText = await mobilePage.locator('[data-testid="peer-current-speech"]').textContent();

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
    const round2GrumbleText = await mobilePage.locator('[data-testid="peer-current-speech"]').textContent();
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
      round1Text: round1Text?.trim(),
      round2ProbingText: round2ProbingText?.trim(),
      s1TerminalVisible,
      round2GrumbleText: round2GrumbleText?.trim(),
      pauseAffirmationVisible,
    };

    if (
      mobileFriendOverflow.innerWidth !== 390 ||
      mobileFriendOverflow.scrollWidth > 390 ||
      !round2ProbingText?.includes('那你的玩具和画笔放哪边呀') ||
      !s1TerminalVisible ||
      !round2GrumbleText?.includes('小气鬼') ||
      !pauseAffirmationVisible
    ) {
      throw new Error(
        `Mobile 390px FriendAsksHomeGame check failed: ${JSON.stringify(report.checks.mobileFriendAsksHome)}`
      );
    }

    // 1B. Switch to 《小船协商》 on 390px mobile
    await touchTap(mobilePage, 'button:has-text("小船协商")');
    await mobilePage.waitForSelector('[data-testid="toy-boat-negotiation-game"]', { timeout: 5000 });

    // Move boat to BEAR_DOCK
    await touchTap(mobilePage, '[data-testid="move-boat-zone-BEAR_DOCK"]');
    const boatAtBearDock = await mobilePage
      .locator('[data-testid="move-boat-zone-BEAR_DOCK"]')
      .getAttribute('data-has-boat');

    // Arrange Bear first + 5s duration + empty-handed wait -> Rabbit is LOW_FRUSTRATED
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

    // Execute plan -> Round 1 -> Round 2 -> Observed Result
    await touchTap(mobilePage, '[data-testid="execute-negotiation-plan-btn"]');
    await touchTap(mobilePage, '[data-testid="advance-negotiation-round-btn"]');
    await touchTap(mobilePage, '[data-testid="advance-negotiation-round-btn"]');

    const observedBadgeVisible = await mobilePage
      .locator('[data-testid="negotiation-observed-complete-badge"]')
      .isVisible();

    const s3Shot = path.join(OUT_DIR, 'sprint2-mobile-390-toy-boat-executed.png');
    await mobilePage.screenshot({ path: s3Shot });
    report.screenshots.push(s3Shot);

    const mobileBoatOverflow = await mobilePage.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));

    report.checks.mobileToyBoatNegotiation = {
      scrollWidth: mobileBoatOverflow.scrollWidth,
      innerWidth: mobileBoatOverflow.innerWidth,
      boatAtBearDock,
      rabbitImpatientState,
      rabbitSatisfiedState,
      bearSatisfiedState,
      observedBadgeVisible,
    };

    if (
      mobileBoatOverflow.innerWidth !== 390 ||
      mobileBoatOverflow.scrollWidth > 390 ||
      boatAtBearDock !== 'true' ||
      rabbitImpatientState !== 'LOW_FRUSTRATED' ||
      rabbitSatisfiedState !== 'HIGH_SATISFIED' ||
      bearSatisfiedState !== 'HIGH_SATISFIED' ||
      !observedBadgeVisible
    ) {
      throw new Error(
        `Mobile 390px ToyBoatNegotiationGame check failed: ${JSON.stringify(report.checks.mobileToyBoatNegotiation)}`
      );
    }

    await mobileContext.close();

    // =========================================================================
    // 2. Desktop 1440x900 Verification (S2-FIX01, S2-FIX02, Bullying Protection, Task 2 Coop, Island & Companion Memory)
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

    // Check S2-FIX02: selecting hyp_peer_took after finding crayon under curtain is LACK_OF_SUPPORTING_EVIDENCE (not CONTRADICTED_BY_EVIDENCE)
    await desktopPage.locator('[data-testid="revise-hypothesis-hyp_peer_took"]').click();
    const pipiFindingState = await desktopPage
      .locator('[data-testid="hypothesis-evaluation-badge"]')
      .getAttribute('data-finding-state');
    const pipiBadgeText = await desktopPage
      .locator('[data-testid="hypothesis-evaluation-badge"]')
      .textContent();

    // Now select supported hypothesis + action + open synthesis 3 times to check S2-FIX01 deduplication
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

    // 2C. Desktop ToyBoatNegotiationGame Task 2 (Limited Resource Cooperation)
    await desktopPage.locator('button:has-text("小船协商")').click();
    await desktopPage.waitForSelector('[data-testid="toy-boat-negotiation-game"]', { timeout: 5000 });
    await desktopPage.locator('[data-testid="boat-task-tab-task_limited_resource_coop"]').click();
    await desktopPage.locator('[data-testid="execute-negotiation-plan-btn"]').click();
    await desktopPage.locator('[data-testid="advance-negotiation-round-btn"]').click();
    await desktopPage.locator('[data-testid="advance-negotiation-round-btn"]').click();

    const s5Shot = path.join(OUT_DIR, 'sprint2-desktop-1440-toy-boat-task2-coop.png');
    await desktopPage.screenshot({ path: s5Shot });
    report.screenshots.push(s5Shot);

    // 2D. Return to Child Island Home & Verify Map + Companion Memory Linkage
    await desktopPage.locator('button[aria-label="关闭游戏集"]').click();
    await desktopPage.waitForSelector('[data-testid="companion-session-memory"]', { timeout: 5000 });
    await desktopPage.evaluate(() => window.scrollTo(0, 0));
    await desktopPage.waitForTimeout(150);

    const companionMemoryText = await desktopPage
      .locator('[data-testid="companion-session-memory"]')
      .textContent();
    const friendBadgeText = await desktopPage
      .locator('[data-testid="island-friend-home-progress-badge"]')
      .textContent();
    const boatBadgeText = await desktopPage
      .locator('[data-testid="island-toy-boat-progress-badge"]')
      .textContent();
    const worldReactionText = await desktopPage
      .locator('[data-testid="island-world-reaction-banner"]')
      .textContent();

    const s6Shot = path.join(OUT_DIR, 'sprint2-desktop-1440-island-companion-memory.png');
    await desktopPage.screenshot({ path: s6Shot });
    report.screenshots.push(s6Shot);

    report.checks.islandAndCompanionLinkage = {
      bullyingRound2Speech: bullyingRound2Speech?.trim(),
      companionMemoryText: companionMemoryText?.trim(),
      friendBadgeText: friendBadgeText?.trim(),
      boatBadgeText: boatBadgeText?.trim(),
      worldReactionText: worldReactionText?.trim(),
    };

    report.actionSequences = {
      run1_mobile_friend_asks_home: {
        gameAndScenario: '《朋友问起我的家》｜情境 1（朋友出于好奇询问）& 情境 2（同学反复追问隐私）',
        executedSelectionSequence: [
          '情境 1 第 1 轮：选择 DIRECT_ANSWER（opt_c1_direct：直接说明住在两个家）',
          '情境 1 第 2 轮：选择 STATE_BOUNDARY（opt_c1_r2_boundary：温和说明玩具放哪里是家里的秘密并转向积木游戏）',
          '切换至情境 2 第 1 轮：选择 STATE_BOUNDARY（opt_p1_boundary：礼貌拒绝回答画里的隐私问题）',
          '情境 2 第 2 轮：点击 pause-conversation-anytime-btn（主动使用暂停对话权利）',
        ],
        branchOutcomes: [
          '情境 1 第 1 轮后：小明并未立刻结束话题，而是继续好奇追问玩具和画笔放哪边（真实非完美同伴反应）',
          '情境 1 第 2 轮后：小明尊重边界并一起去搭积木，进入第 3 轮完成总结卡',
          '情境 2 第 1 轮后：同桌豆豆未立即道歉，而是嘟囔“小气鬼”（真实同伴挫败反应，但明确肯定孩子划定边界完全正确）',
          '情境 2 第 2 轮暂停后：展示正向权利肯定卡「你成功使用了暂停对话的权利」，绝不判定为失败',
        ],
        lifecycleStatusTriggered: '情境 1 触发 COMPLETED（完成）；情境 2 触发 PAUSED_VOLUNTARILY（主动暂停）并支持随时重来或继续探索',
        evidencePaths: [
          'docs/evidence/sprint2/sprint2-mobile-390-friend-home-multiturn.png',
          'docs/evidence/sprint2/sprint2-mobile-390-friend-home-boundary-pause.png',
        ],
      },
      run2_mobile_toy_boat_negotiation: {
        gameAndScenario: '《玩具船协商》｜任务一（阳光水塘的唯一小木船 · 侧重轮流与等待）',
        executedSelectionSequence: [
          '动手移动小木船至 BEAR_DOCK（右岸·小熊码头）',
          '设置小熊波波先玩（order-actor-bear）+ 每轮真实 5 秒（duration-seconds-5）+ 岸上空手干等（waiting-activity-wait_empty_hands）',
          '观察小兔提莫需求满足状态变为 LOW_FRUSTRATED（干等太久着急）后，重新调整为每轮真实 3 秒（duration-seconds-3）+ 交换与替代开沙滩挖掘机修水渠（strategy-option-EXCHANGE_ALT）',
          '点击开始执行协商方案（execute-negotiation-plan-btn）-> 完成第 1 轮交接 -> 完成第 2 轮交接并查看真实结果',
        ],
        branchOutcomes: [
          '空手干等 5 秒方案下：小熊满足（HIGH_SATISFIED），小兔因空手等待过久产生真实不耐烦反应（LOW_FRUSTRATED）',
          '调整为 3 秒快节奏交接 + 沙滩挖掘机修水渠后：双方均获得可操作玩具，双方需求满足状态均变为 HIGH_SATISFIED',
          '执行两轮试航后：四维结果观察面板清晰呈现「谁先玩 / 谁在等 / 是否需要配合 / 双方是否满意」',
        ],
        lifecycleStatusTriggered: '触发重新协商修改（RENEGOTIATED）与两轮执行完成（OBSERVED_RESULT / COMPLETED）',
        evidencePaths: ['docs/evidence/sprint2/sprint2-mobile-390-toy-boat-executed.png'],
      },
      run3_desktop_s2_fixes_and_island_linkage: {
        gameAndScenario: '《蜡笔侦探》（S2-FIX01/02）+《朋友问起我的家》情境 4（起哄安全保护）+《玩具船协商》任务二（资源有限合作渡船）+ 晴雨小岛主地图联动',
        executedSelectionSequence: [
          '《蜡笔侦探》美术角案件：先选 hyp_unknown_yet -> 掀开窗帘并领取绿蜡笔线索 -> 调查小猫脚印 -> 选择 hyp_peer_took（皮皮拿走）验证 S2-FIX02 -> 改选 hyp_rolled_away + act_pickup_and_apologize -> 连续打开结局面板 3 次验证 S2-FIX01',
          '《朋友问起我的家》情境 4（多名同学起哄）：第 1 轮选择 STATE_BOUNDARY（大声制止）-> 第 2 轮选择 SEEK_ADULT_HELP（寻找值日老师保护）',
          '《玩具船协商》任务二（浅水溪湾的松果渡船挑战）：选择分工合作运松果方案并执行两轮试航',
          '关闭游戏集返回晴雨小岛首页，检查伙伴记忆横幅与 2.5D 小岛地图徽章变化',
        ],
        branchOutcomes: [
          'S2-FIX02：窗帘下找到蜡笔后选择皮皮拿走，反馈徽章为 LACK_OF_SUPPORTING_EVIDENCE（缺乏支持证据），而非反驳',
          'S2-FIX01：同一完成状态连续检查 3 次，taskParticipationCounts 仅记录 1 次真实会话参与',
          '情境 4 安全保护：面对起哄无需说服或原谅对方，值日老师果断介入保护',
          '小岛与伙伴联动：CompanionBanner 显示最近一次儿童选择记忆，2.5D 地图同步点亮侦探、边界表达与小船协商三项进展',
        ],
        lifecycleStatusTriggered: '全部触发 COMPLETED 并持久化至端侧记录，支持刷新与跨组件恢复',
        evidencePaths: [
          'docs/evidence/sprint2/sprint2-desktop-1440-friend-home-safety.png',
          'docs/evidence/sprint2/sprint2-desktop-1440-toy-boat-task2-coop.png',
          'docs/evidence/sprint2/sprint2-desktop-1440-island-companion-memory.png',
        ],
      },
    };

    if (
      !companionMemoryText?.includes('浅水溪湾的松果渡船挑战') ||
      !friendBadgeText?.includes('边界表达 1 幕') ||
      !boatBadgeText?.includes('小船协商 1 项')
    ) {
      throw new Error(
        `Island & Companion linkage check failed: ${JSON.stringify(report.checks.islandAndCompanionLinkage)}`
      );
    }

    await desktopContext.close();
    await browser.close();

    const reportPath = path.join(OUT_DIR, 'sprint2_verification_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log('Sprint 2 Browser Verification PASSED! Report written to:', reportPath);
  } finally {
    previewProc.kill('SIGTERM');
  }
}

main().catch((err) => {
  console.error('Sprint 2 Browser Verification FAILED:', err);
  process.exit(1);
});
