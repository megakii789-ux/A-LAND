import { CommunicationStatus as C, CareResponsibility as R, CoPresenceStatus as P,
  HugRequestType as T, HugDomainState, ChildFacingHugPresentation } from './types';

const safeAction = '不用一直等屏幕。可以直接去找身边你信任的大人；一个人帮不上忙时，再找另一位。';
const view = (displayText: string, spokenText: string, shouldStepBack = false): ChildFacingHugPresentation =>
  ({ displayText, spokenText, shouldStepBack, safeWaitingAction: safeAction });

/** Conservative projection: report evidence, never infer physical presence from communication. */
export function mapHugStateToChildPresentation(s: HugDomainState): ChildFacingHugPresentation {
  if (!s || !Object.values(C).includes(s.communication) ||
      !Object.values(R).includes(s.care) || !Object.values(P).includes(s.coPresence) ||
      !Object.values(T).includes(s.requestType)) {
    return view('状态暂时不清楚', '这里没有可以确认的新消息。请直接找身边你信任的大人。');
  }
  const allowedNames = ['妈妈','爸爸','奶奶','爷爷','外婆','外公','老师','照顾我的大人'];
  const adult = allowedNames.includes(s.targetCaregiverName || '') ? s.targetCaregiverName! : '大人';
  if (s.coPresence === P.ARRIVED_CONFIRMED) {
    if (s.meetingEvidence === 'LOCAL_CLOSE') {
      return view('结束这次屏幕请求', '你选择结束这次屏幕请求。可以放下屏幕了。', true);
    }
    if (s.meetingEvidence === 'OBSERVER_REPORT') {
      return view('观察记录：有人来陪伴', '观察记录显示，有人来陪伴了。可以把注意力交回身边的人。', true);
    }
    if (s.meetingEvidence === 'ADULT_SELF_REPORT') {
      return view('大人反馈：已经来到身边', '有大人反馈说已经来到身边。这是对方的反馈，你可以看看身边谁能陪你。');
    }
    // An old enum with no provenance is not proof.
  }
  if (s.requestType === T.ASYNC_MISS) {
    if (s.communication === C.UNSENT)
      return view('还没有寄出', '这条想念还没有寄出。你不用等回复。');
    if (s.communication === C.SEND_FAILED)
      return view('这次没有确认发送成功', '这次没有确认发送成功。这里不能保证保存了留言，也不用等回复。');
    if (s.communication === C.SENDING)
      return view('发送结果待确认', '正在尝试发送，还没有确认结果。你不用一直等屏幕。');
    return view('服务已接收 · 不用等回复', '发送服务已经接收了这条消息。这不代表对方已经看到，你不用等回复。');
  }
  // Care evidence is independent of transport, but never implies arrival.
  if (s.care === R.CANNOT_ATTEND && s.careEvidence === 'DECLINED')
    return view('大人回应：现在不能来', `${adult}回应说现在不能来。可以直接找身边其他可信的大人。`);
  if (s.care === R.ASSIGNED_SELF && s.careEvidence === 'SELF_ACCEPTED')
    return view('大人回应：愿意来陪伴', `${adult}回应说愿意来陪伴。这里没有新的会合确认，不用一直等屏幕。`);
  if ((s.care === R.ASSIGNED_OTHER || s.care === R.ESCALATED_FALLBACK) && s.careEvidence === 'OTHER_ACCEPTED')
    return view('接应人已回应', '接应人回应说愿意来陪伴。这里没有新的会合确认，不用一直等屏幕。');
  if (s.care === R.ASSIGNED_OTHER && s.careEvidence === 'REQUESTED_OTHER')
    return view('正在询问另一位大人', '已向另一位大人询问能否帮忙，还没有收到对方接受的确认。');
  if (s.communication === C.UNSENT)
    return view('还没有发出消息', '还没有发出消息。请直接找身边你信任的大人。');
  if (s.communication === C.SEND_FAILED)
    return view('这次没有确认发送成功', '这次没有确认发送成功。不要只等屏幕，请直接找身边你信任的大人。');
  if (s.communication === C.SENDING)
    return view('发送结果待确认', '正在尝试发送，还没有确认结果。');
  if (s.communication === C.ACKNOWLEDGED && s.acknowledgementEvidence === 'HUMAN_OPENED')
    return view('大人确认看到了消息', '大人确认看到了这条消息。这里还没有收到其他回应。');
  return view('还没有收到新的回应', '消息由服务接收了，但这不代表有人已经看到或答应来。你不用一直等屏幕。');
}
