/**
 * 儿童情境组件的规范化内容定义 (Canonical Content Payloads for Child Modals)
 * 用于生成与校验 SHA-256 完整性摘要
 */

export const COURAGE_HOUSE_PAYLOAD = {
  id: 'courage-house',
  version: '1.0.0',
  title: '勇气说话屋',
  description: '信息房屋分级（客厅/卧室/保险箱）、三句话工具箱与现实求助动作。',
  rooms: ['living_room', 'bedroom', 'safe_box'],
  tools: ['light_sentence', 'firm_sentence', 'boundary_sentence'],
  boundaryAction: 'PROTECT_BODY_AND_CALL_TRUSTED_ADULT',
};

export const TWO_HOMES_BRIDGE_PAYLOAD = {
  id: 'two-homes-bridge',
  version: '1.0.0',
  title: '两家小桥',
  description: '换家日程、物品行李清单与两边生活仪式感。',
  features: ['schedule_calendar', 'packing_checklist', 'connecting_ritual'],
  privacyNote: '换家日期与家庭安排为家庭内部隐私，不向外部公开。',
};

export const THOUGHT_DETECTIVE_LAB_PAYLOAD = {
  id: 'thought-detective-lab',
  version: '1.0.0',
  title: '想法侦探社',
  description: '事实、想法与感受三棱镜，脚手架支持层级分通择。',
  tools: ['prism_fact', 'prism_thought', 'prism_feeling'],
  supportLevels: ['S0', 'S1', 'S2', 'S3', 'S4', 'S5'],
};

export const STARLIGHT_CABIN_PAYLOAD = {
  id: 'starlight-cabin',
  version: '1.0.0',
  title: '星光小屋',
  description: '多面自我优点星空、特质点亮与睡前安心感。',
  features: ['starlight_sky', 'trait_collection', 'bedtime_calm'],
};

export const DIFFICULTY_BREAKER_PAYLOAD = {
  id: 'difficulty-breaker',
  version: '1.0.0',
  title: '困难粉碎机',
  description: '大困难怪兽拆解为三步小行动，情绪优先与现实可及支持。',
  steps: ['step_breathe', 'step_break_down', 'step_first_move'],
};

export const GAME_FRIEND_ASKS_PAYLOAD = {
  id: 'game_friend_asks_home',
  version: '1.0.0',
  title: '朋友问起我的家',
  description: '面对同伴询问居住安排时的自主边界与三层回答深度。',
};

export const GAME_CRAYON_PAYLOAD = {
  id: 'game_crayon_detective',
  version: '1.0.0',
  title: '蜡笔小侦探',
  description: '事实与猜想分离，辨析起哄与欺凌边界，执行保护红线。',
};

export const GAME_TOY_BOAT_PAYLOAD = {
  id: 'game_toy_boat',
  version: '1.0.0',
  title: '玩具船谈判桌',
  description: '轮候分享与视角权衡，日常普通冲突协商。',
};
