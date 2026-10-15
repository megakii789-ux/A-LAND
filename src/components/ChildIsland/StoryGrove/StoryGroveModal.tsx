import React, { useState, useEffect } from 'react';
import {
  DoorOpen,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Volume2,
  CheckCircle2,
  ShieldCheck,
  X,
  Compass,
  MessageCircle,
  Home,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { LeafScenario, DoorType } from '../../../types';
import { INITIAL_LEAF_SCENARIOS } from '../../../data/mockData';
import { useApp } from '../../../context/AppContext';
import { sounds } from '../../../utils/sound';
import { speechNarrator } from '../../../utils/speech';
import { isHeavyWeather } from '../../../domain/weather/soilWeatherContract';
import {
  CupScaleInteractiveIllustration,
  RainWeatherIllustration,
  LocationBadgeIllustration,
} from './StoryIllustrations';
import { ContentAuditRegistry } from '../../../domain/cognitive/ContentAuditRegistry';
import {
  issueAdultPreviewSession,
  isAdultPreviewSessionValid,
  revokeAdultPreviewSession,
  lockParentAccess,
  subscribeParentAccess,
  isInternalPlaytestEnabled,
} from '../../../domain/privacy/parentAccess';
import {
  loadProductExperienceMetrics,
  recordStoryGroveLeafProgress,
  recordStoryGroveTransferAttempt,
  recordUnknownHonestyChoice,
} from '../../../domain/cognitive/productExperienceMetrics';
import {
  INTERACTIVE_STORY_LEAVES,
  InteractiveStoryLeafId,
  STORY_GROVE_CAMP_TRANSFER_CHALLENGE,
  CupTablePosition,
  FlashlightBeamTarget,
  evaluateInteractiveLeafGoalCompletion,
  evaluateCampTransferGoals,
  isGenuineActionRevision,
} from '../../../domain/storyGrove/interactiveStoryLeaves';
import { ParentGateModal } from '../../ParentGateModal';
import { IslandUiIconSvg } from '../CompanionIcons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialLeafId?: string | null;
}

export const StoryGroveModal: React.FC<Props> = ({ isOpen, onClose, initialLeafId }) => {
  const { completedLeaves, markLeafComplete, childQuotes, todayWeather } = useApp();

  const [activeLeafId, setActiveLeafId] = useState<string>(initialLeafId || 'cup-size');
  const [stage, setStage] = useState<
    'catalog' | 'doorIntro' | 'walkLoop' | 'choose' | 'offscreen' | 'compare' | 'transferChallenge'
  >('catalog');
  const [selectedDoor, setSelectedDoor] = useState<DoorType>('fen');
  const [walkSubStep, setWalkSubStep] = useState<'fen' | 'tong' | 'ze'>('fen');
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [customQuote, setCustomQuote] = useState<string>('');
  const [compareAnswered, setCompareAnswered] = useState<boolean>(false);
  const [previewSessionToken, setPreviewSessionToken] = useState<string | null>(null);
  const [isParentGateOpen, setIsParentGateOpen] = useState<boolean>(false);
  const [, setAccessVersion] = useState<number>(0);

  // Stage B interactive leaf states (with Sprint 4 Showcase A cup manipulation & FIX-03 genuine revision tracking)
  const [leafMode, setLeafMode] = useState<'interactiveScene' | 'classicDoors'>('interactiveScene');
  const [inspectedHotspotIds, setInspectedHotspotIds] = useState<string[]>([]);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const [selectedSceneActionId, setSelectedSceneActionId] = useState<string | null>(null);
  const [actionAttemptHistory, setActionAttemptHistory] = useState<string[]>([]);
  const [revisionCount, setRevisionCount] = useState<number>(0);
  const [lastObservedLeafAction, setLastObservedLeafAction] = useState<{
    actionId: string;
    outcomeState: string;
  } | null>(null);
  const [cupPosition, setCupPosition] = useState<CupTablePosition>('CENTER_TABLE');
  const [comparedCupPositions, setComparedCupPositions] = useState<
    ('NEXT_TO_BLOCK' | 'NEXT_TO_BUCKET')[]
  >([]);
  const [showParentCoReadDrawer, setShowParentCoReadDrawer] = useState<boolean>(false);

  // Stage C cross-game cognitive transfer challenge states (with Sprint 4 Showcase B flashlight beam & FIX-01..05)
  const [campInspectedIds, setCampInspectedIds] = useState<string[]>([]);
  const [activeCampHotspotId, setActiveCampHotspotId] = useState<string | null>(null);
  const [campBeamTarget, setCampBeamTarget] = useState<FlashlightBeamTarget>('OFF');
  const [campIlluminatedTargets, setCampIlluminatedTargets] = useState<FlashlightBeamTarget[]>([]);
  const [campCurrentActionId, setCampCurrentActionId] = useState<string | null>(null);
  const [campTriedActionIds, setCampTriedActionIds] = useState<string[]>([]);
  const [campLastObservedAction, setCampLastObservedAction] = useState<{
    actionId: string;
    outcomeState: string;
    wasUnsuccessfulOrIncomplete?: boolean;
  } | null>(null);
  const [campRevisionCount, setCampRevisionCount] = useState<number>(0);
  const [campRevisedMethod, setCampRevisedMethod] = useState<boolean>(false);
  const [campUsedHintOrPrompt, setCampUsedHintOrPrompt] = useState<boolean>(false);
  const [campUnknownAcknowledged, setCampUnknownAcknowledged] = useState<boolean>(false);
  const [showCampParentDrawer, setShowCampParentDrawer] = useState<boolean>(false);

  useEffect(() => {
    return subscribeParentAccess(() => {
      setAccessVersion((v) => v + 1);
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setPreviewSessionToken(null);
      setIsParentGateOpen(false);
      setStage('catalog');
      revokeAdultPreviewSession();
      if (!isInternalPlaytestEnabled()) {
        lockParentAccess();
      }
    }
    return () => {
      revokeAdultPreviewSession();
    };
  }, [isOpen]);

  const isCurrentHeavyWeather = todayWeather
    ? isHeavyWeather(
        todayWeather.primary,
        todayWeather.intensity >= 4 ? 'intense' : todayWeather.intensity >= 2 ? 'medium' : 'gentle'
      )
    : false;

  const currentLeaf: LeafScenario =
    INITIAL_LEAF_SCENARIOS.find((l) => l.id === activeLeafId) || INITIAL_LEAF_SCENARIOS[0];
  const currentScopeKey =
    stage === 'transferChallenge' ? 'story:leaf-camp-transfer' : `story:${currentLeaf.id}`;
  const isCurrentLeafApproved =
    stage === 'transferChallenge'
      ? ContentAuditRegistry.canRenderContent('cup-size')
      : ContentAuditRegistry.canRenderContent(currentLeaf.id);
  const adultPreviewUnlocked =
    isAdultPreviewSessionValid(currentScopeKey, previewSessionToken) || isInternalPlaytestEnabled();

  const hasBoundaryConflict = !!currentLeaf.boundary && currentLeaf.boundary !== 'NONE';
  const interactiveLeafDef =
    activeLeafId === 'cup-size' || activeLeafId === 'toy-share'
      ? INTERACTIVE_STORY_LEAVES[activeLeafId as InteractiveStoryLeafId]
      : null;

  if (!isOpen) return null;

  const isPlaytestIsolated = () =>
    isInternalPlaytestEnabled() || (adultPreviewUnlocked && !isCurrentLeafApproved);

  const handleCloseStoryGrove = () => {
    speechNarrator.stop();
    setPreviewSessionToken(null);
    setIsParentGateOpen(false);
    setStage('catalog');
    revokeAdultPreviewSession();
    if (!isInternalPlaytestEnabled()) {
      lockParentAccess();
    }
    onClose();
  };

  const handleReturnToCatalog = () => {
    sounds.playClick();
    speechNarrator.stop();
    setPreviewSessionToken(null);
    setIsParentGateOpen(false);
    revokeAdultPreviewSession();
    if (!isInternalPlaytestEnabled()) {
      lockParentAccess();
    }
    setStage('catalog');
  };

  const handleStartLeaf = (leafId: string) => {
    sounds.playClick();
    speechNarrator.stop();
    setActiveLeafId(leafId);
    setPreviewSessionToken(null);
    setIsParentGateOpen(false);
    revokeAdultPreviewSession();
    if (!isInternalPlaytestEnabled()) {
      lockParentAccess();
    }
    setStage('doorIntro');
    setSelectedDoor('fen');
    setWalkSubStep('fen');
    setSelectedChoiceId(null);
    setCustomQuote(childQuotes[leafId] || '');
    setCompareAnswered(false);
    setShowParentCoReadDrawer(false);

    if (leafId === 'cup-size' || leafId === 'toy-share') {
      setLeafMode('interactiveScene');
      const savedMetrics = loadProductExperienceMetrics();
      const savedLeafState = savedMetrics.storyLeafStatesById[leafId];
      setInspectedHotspotIds(savedLeafState?.inspectedObjectIds || []);
      setActiveHotspotId(null);
      setSelectedSceneActionId(savedLeafState?.chosenActionId || null);
      setActionAttemptHistory(savedLeafState?.actionAttemptHistory || []);
      setRevisionCount(savedLeafState?.revisionCount || 0);
      const lastActId = savedLeafState?.chosenActionId || null;
      const leafDef = INTERACTIVE_STORY_LEAVES[leafId as InteractiveStoryLeafId];
      const lastActObj = leafDef.actions.find((a) => a.id === lastActId);
      setLastObservedLeafAction(
        lastActObj ? { actionId: lastActObj.id, outcomeState: lastActObj.sceneVisualEffect } : null
      );
      setCupPosition(savedLeafState?.cupPosition || 'CENTER_TABLE');
      setComparedCupPositions(savedLeafState?.comparedCupPositions || []);
    } else {
      setLeafMode('classicDoors');
    }
  };

  const handleStartTransferChallenge = () => {
    sounds.playClick();
    speechNarrator.stop();
    setActiveLeafId('cup-size');
    setPreviewSessionToken(null);
    setIsParentGateOpen(false);
    revokeAdultPreviewSession();
    if (!isInternalPlaytestEnabled()) {
      lockParentAccess();
    }
    setStage('transferChallenge');
    setCampInspectedIds([]);
    setActiveCampHotspotId(null);
    setCampBeamTarget('OFF');
    setCampIlluminatedTargets([]);
    setCampCurrentActionId(null);
    setCampTriedActionIds([]);
    setCampLastObservedAction(null);
    setCampRevisionCount(0);
    setCampRevisedMethod(false);
    setCampUsedHintOrPrompt(false);
    setCampUnknownAcknowledged(false);
    setShowCampParentDrawer(false);
  };

  const handleRequestAdultReview = () => {
    sounds.playClick();
    setPreviewSessionToken(null);
    revokeAdultPreviewSession();
    lockParentAccess();
    setIsParentGateOpen(true);
  };

  const handleSpeak = (text: string) => {
    speechNarrator.speak(text);
  };

  // Sprint 4 样板 A: 直接移动蓝水杯道具到小积木旁、桌子中间或大水桶旁
  const handleMoveCupToPosition = (targetPosition: CupTablePosition) => {
    if (!interactiveLeafDef || interactiveLeafDef.id !== 'cup-size') return;
    sounds.playClick();
    setCupPosition(targetPosition);

    let mappedHotspotId = 'obj_blue_cup';
    let nextCompared = comparedCupPositions;
    let spokenLine =
      '蓝水杯回到桌子中间：杯身上的两格水位线一点儿没变，杯子自己的大小没有改变。';

    if (targetPosition === 'NEXT_TO_BLOCK') {
      mappedHotspotId = 'obj_wooden_block';
      nextCompared = comparedCupPositions.includes('NEXT_TO_BLOCK')
        ? comparedCupPositions
        : [...comparedCupPositions, 'NEXT_TO_BLOCK'];
      spokenLine =
        '把蓝水杯移到小积木旁边：杯子比小积木高好多，跳跳开心得蹦起来说“看，是大杯子吧！”';
    } else if (targetPosition === 'NEXT_TO_BUCKET') {
      mappedHotspotId = 'obj_elephant_bucket';
      nextCompared = comparedCupPositions.includes('NEXT_TO_BUCKET')
        ? comparedCupPositions
        : [...comparedCupPositions, 'NEXT_TO_BUCKET'];
      spokenLine =
        '把蓝水杯移到大水桶旁边：杯子在大水桶旁边显得好小，噗噗笑着晃鼻子说“看，跟我的水桶比它真小！”';
    }

    setComparedCupPositions(nextCompared);
    setActiveHotspotId(mappedHotspotId);
    const nextInspected = inspectedHotspotIds.includes(mappedHotspotId)
      ? inspectedHotspotIds
      : [...inspectedHotspotIds, mappedHotspotId];
    setInspectedHotspotIds(nextInspected);
    handleSpeak(spokenLine);

    const { isGoalCompleted } = evaluateInteractiveLeafGoalCompletion(
      interactiveLeafDef.id,
      selectedSceneActionId,
      nextInspected,
      nextCompared
    );

    recordStoryGroveLeafProgress(
      {
        leafId: interactiveLeafDef.id,
        inspectedObjectIds: nextInspected,
        chosenActionId: selectedSceneActionId,
        actionAttemptHistory,
        revisionCount,
        isCompleted: isGoalCompleted,
        cupPosition: targetPosition,
        comparedCupPositions: nextCompared,
        updatedAt: new Date().toISOString(),
      },
      {
        gameId: 'story_grove',
        scenarioTitle: interactiveLeafDef.title,
        eventStage: isGoalCompleted ? 'COMPLETED_OBSERVED' : 'ARRANGED_OR_STARTED',
        childChoiceSummary:
          targetPosition === 'NEXT_TO_BLOCK'
            ? '把蓝水杯移到小积木旁比高低'
            : targetPosition === 'NEXT_TO_BUCKET'
              ? '把蓝水杯移到大水桶旁比大小'
              : '观察桌子中间的蓝水杯',
        companionReactionText: spokenLine,
        updatedAt: new Date().toISOString(),
      }
    );

    if (isGoalCompleted && !isPlaytestIsolated()) {
      markLeafComplete(interactiveLeafDef.id);
    }
  };

  // Stage B hotspot inspection (linked to prop movement in cup-size and evidence check in FIX-02)
  const handleInspectStoryHotspot = (hotspotId: string) => {
    if (!interactiveLeafDef) return;
    const hotspot = interactiveLeafDef.hotspots.find((h) => h.id === hotspotId);
    if (!hotspot) return;
    sounds.playClick();
    setActiveHotspotId(hotspotId);

    let nextCupPos = cupPosition;
    let nextCompared = comparedCupPositions;
    if (interactiveLeafDef.id === 'cup-size') {
      if (hotspotId === 'obj_wooden_block') {
        nextCupPos = 'NEXT_TO_BLOCK';
        nextCompared = comparedCupPositions.includes('NEXT_TO_BLOCK')
          ? comparedCupPositions
          : [...comparedCupPositions, 'NEXT_TO_BLOCK'];
      } else if (hotspotId === 'obj_elephant_bucket') {
        nextCupPos = 'NEXT_TO_BUCKET';
        nextCompared = comparedCupPositions.includes('NEXT_TO_BUCKET')
          ? comparedCupPositions
          : [...comparedCupPositions, 'NEXT_TO_BUCKET'];
      } else if (hotspotId === 'obj_blue_cup') {
        nextCupPos = 'CENTER_TABLE';
      }
      setCupPosition(nextCupPos);
      setComparedCupPositions(nextCompared);
    }

    const nextInspected = inspectedHotspotIds.includes(hotspotId)
      ? inspectedHotspotIds
      : [...inspectedHotspotIds, hotspotId];
    setInspectedHotspotIds(nextInspected);
    handleSpeak(`${hotspot.label}。${hotspot.inspectObservation} ${hotspot.inspectCharacterLine}`);

    const { isGoalCompleted } = evaluateInteractiveLeafGoalCompletion(
      interactiveLeafDef.id,
      selectedSceneActionId,
      nextInspected,
      nextCompared
    );

    recordStoryGroveLeafProgress(
      {
        leafId: interactiveLeafDef.id,
        inspectedObjectIds: nextInspected,
        chosenActionId: selectedSceneActionId,
        actionAttemptHistory,
        revisionCount,
        isCompleted: isGoalCompleted,
        cupPosition: nextCupPos,
        comparedCupPositions: nextCompared,
        updatedAt: new Date().toISOString(),
      },
      {
        gameId: 'story_grove',
        scenarioTitle: interactiveLeafDef.title,
        eventStage: isGoalCompleted ? 'COMPLETED_OBSERVED' : 'ARRANGED_OR_STARTED',
        childChoiceSummary: `观察了「${hotspot.label}」`,
        companionReactionText: hotspot.inspectCharacterLine,
        updatedAt: new Date().toISOString(),
      }
    );
    if (isGoalCompleted && !isPlaytestIsolated()) {
      markLeafComplete(interactiveLeafDef.id);
    }
  };

  // Stage B action selection (with FIX-02 action-linked evidence and FIX-03 genuine revision counting)
  const handleSelectStoryAction = (actionId: string) => {
    if (!interactiveLeafDef) return;
    const action = interactiveLeafDef.actions.find((a) => a.id === actionId);
    if (!action) return;
    sounds.playBell();

    const isGenuineRev = isGenuineActionRevision(
      lastObservedLeafAction?.actionId ?? null,
      lastObservedLeafAction?.outcomeState ?? null,
      action.id,
      action.sceneVisualEffect
    );

    const nextHistory = actionAttemptHistory.includes(actionId)
      ? actionAttemptHistory
      : [...actionAttemptHistory, actionId];
    const nextRevisionCount = isGenuineRev ? revisionCount + 1 : revisionCount;

    setSelectedSceneActionId(actionId);
    setActionAttemptHistory(nextHistory);
    setRevisionCount(nextRevisionCount);
    setLastObservedLeafAction({
      actionId: action.id,
      outcomeState: action.sceneVisualEffect,
    });

    const reactionSpeech = action.characterResponses.map((r) => `${r.speaker}说：${r.line}`).join(' ');
    handleSpeak(`${action.consequenceSummary} ${reactionSpeech}`);

    const { isGoalCompleted } = evaluateInteractiveLeafGoalCompletion(
      interactiveLeafDef.id,
      actionId,
      inspectedHotspotIds,
      comparedCupPositions
    );

    recordStoryGroveLeafProgress(
      {
        leafId: interactiveLeafDef.id,
        inspectedObjectIds: inspectedHotspotIds,
        chosenActionId: actionId,
        actionAttemptHistory: nextHistory,
        revisionCount: nextRevisionCount,
        isCompleted: isGoalCompleted,
        cupPosition,
        comparedCupPositions,
        updatedAt: new Date().toISOString(),
      },
      {
        gameId: 'story_grove',
        scenarioTitle: interactiveLeafDef.title,
        eventStage: isGoalCompleted ? 'COMPLETED_OBSERVED' : 'ARRANGED_OR_STARTED',
        childChoiceSummary: action.shortTag,
        companionReactionText: action.consequenceSummary,
        updatedAt: new Date().toISOString(),
      }
    );
    if (isGoalCompleted && !isPlaytestIsolated()) {
      markLeafComplete(interactiveLeafDef.id);
    }
  };

  // Sprint 4 FIX-03: 点击“回到场景换个办法”只返回观察态，绝不直接增加 revisionCount
  const handleReturnToSceneObserve = () => {
    sounds.playClick();
    setSelectedSceneActionId(null);
  };

  // Sprint 4 样板 B: 操作手电筒光束照向不同区域
  const handleAimFlashlight = (target: FlashlightBeamTarget) => {
    sounds.playClick();
    setCampBeamTarget(target);
    const nextIlluminated =
      target === 'OFF' || campIlluminatedTargets.includes(target)
        ? campIlluminatedTargets
        : [...campIlluminatedTargets, target];
    setCampIlluminatedTargets(nextIlluminated);

    const matchedHotspot = STORY_GROVE_CAMP_TRANSFER_CHALLENGE.hotspots.find(
      (h) => h.beamTarget === target
    );
    let nextInspected = campInspectedIds;
    if (matchedHotspot) {
      setActiveCampHotspotId(matchedHotspot.id);
      nextInspected = campInspectedIds.includes(matchedHotspot.id)
        ? campInspectedIds
        : [...campInspectedIds, matchedHotspot.id];
      setCampInspectedIds(nextInspected);
      handleSpeak(
        `${matchedHotspot.revealedLabel}。${matchedHotspot.observationDetail} ${matchedHotspot.speakerName}说：${matchedHotspot.speakerLine}`
      );
    }

    if (campTriedActionIds.length > 0) {
      const { completedGoals, isAllGoalsCompleted } = evaluateCampTransferGoals(
        nextInspected,
        nextIlluminated,
        campTriedActionIds
      );
      recordStoryGroveTransferAttempt({
        scenarioId: STORY_GROVE_CAMP_TRANSFER_CHALLENGE.id,
        inspectedObjectIds: nextInspected,
        illuminatedBeamTargets: nextIlluminated,
        chosenActions: campTriedActionIds,
        completedGoals,
        revisionCount: campRevisionCount,
        revisedAfterConsequence: campRevisedMethod,
        usedHintOrRevisionPrompt: campUsedHintOrPrompt,
        isCompleted: isAllGoalsCompleted,
        completedAt: new Date().toISOString(),
      });
    }
  };

  // Stage C hotspot inspection (synchronizes with flashlight beam direction)
  const handleInspectCampHotspot = (hotspotId: string) => {
    const hotspot = STORY_GROVE_CAMP_TRANSFER_CHALLENGE.hotspots.find((h) => h.id === hotspotId);
    if (!hotspot) return;
    sounds.playClick();
    setActiveCampHotspotId(hotspotId);
    setCampBeamTarget(hotspot.beamTarget);

    const nextIlluminated = campIlluminatedTargets.includes(hotspot.beamTarget)
      ? campIlluminatedTargets
      : [...campIlluminatedTargets, hotspot.beamTarget];
    setCampIlluminatedTargets(nextIlluminated);

    const nextInspected = campInspectedIds.includes(hotspotId)
      ? campInspectedIds
      : [...campInspectedIds, hotspotId];
    setCampInspectedIds(nextInspected);
    handleSpeak(
      `${hotspot.revealedLabel}。${hotspot.observationDetail} ${hotspot.speakerName}说：${hotspot.speakerLine}`
    );

    if (campTriedActionIds.length > 0) {
      const { completedGoals, isAllGoalsCompleted } = evaluateCampTransferGoals(
        nextInspected,
        nextIlluminated,
        campTriedActionIds
      );
      recordStoryGroveTransferAttempt({
        scenarioId: STORY_GROVE_CAMP_TRANSFER_CHALLENGE.id,
        inspectedObjectIds: nextInspected,
        illuminatedBeamTargets: nextIlluminated,
        chosenActions: campTriedActionIds,
        completedGoals,
        revisionCount: campRevisionCount,
        revisedAfterConsequence: campRevisedMethod,
        usedHintOrRevisionPrompt: campUsedHintOrPrompt,
        isCompleted: isAllGoalsCompleted,
        completedAt: new Date().toISOString(),
      });
    }
  };

  // Stage C action selection (with FIX-01 multi-goal evaluation, FIX-03 genuine revision, FIX-04 separate history vs latest)
  const handleSelectCampAction = (actionId: string) => {
    const action = STORY_GROVE_CAMP_TRANSFER_CHALLENGE.actions.find((a) => a.id === actionId);
    if (!action) return;
    sounds.playBell();

    const nextTried = campTriedActionIds.includes(actionId)
      ? campTriedActionIds
      : [...campTriedActionIds, actionId];

    const { completedGoals, isAllGoalsCompleted } = evaluateCampTransferGoals(
      campInspectedIds,
      campIlluminatedTargets,
      nextTried
    );

    const isGenuineRev =
      Boolean(campLastObservedAction?.wasUnsuccessfulOrIncomplete) &&
      isGenuineActionRevision(
        campLastObservedAction?.actionId ?? null,
        campLastObservedAction?.outcomeState ?? null,
        action.id,
        action.visualOutcomeState
      );

    const isCurrentActionUnsuccessful =
      !action.resolvesProblem ||
      !action.targetGoalId ||
      !completedGoals.includes(action.targetGoalId);

    const nextRevisionCount = isGenuineRev ? campRevisionCount + 1 : campRevisionCount;
    const nextRevisedMethod = Boolean(campRevisedMethod || isGenuineRev);
    const nextUsedHint = Boolean(campUsedHintOrPrompt || !action.resolvesProblem);

    setCampCurrentActionId(actionId);
    setCampTriedActionIds(nextTried);
    setCampLastObservedAction({
      actionId: action.id,
      outcomeState: action.visualOutcomeState,
      wasUnsuccessfulOrIncomplete: isCurrentActionUnsuccessful,
    });
    setCampRevisionCount(nextRevisionCount);
    setCampRevisedMethod(nextRevisedMethod);
    setCampUsedHintOrPrompt(nextUsedHint);
    setCampUnknownAcknowledged(false);

    const reactionsText = action.characterReactions.map((r) => `${r.speaker}说：${r.line}`).join(' ');
    handleSpeak(`${action.consequenceNarrative} ${reactionsText}`);

    recordStoryGroveTransferAttempt(
      {
        scenarioId: STORY_GROVE_CAMP_TRANSFER_CHALLENGE.id,
        inspectedObjectIds: campInspectedIds,
        illuminatedBeamTargets: campIlluminatedTargets,
        chosenActions: nextTried,
        completedGoals,
        revisionCount: nextRevisionCount,
        revisedAfterConsequence: nextRevisedMethod,
        usedHintOrRevisionPrompt: nextUsedHint,
        isCompleted: isAllGoalsCompleted,
        completedAt: new Date().toISOString(),
      },
      {
        gameId: 'story_grove',
        scenarioTitle: STORY_GROVE_CAMP_TRANSFER_CHALLENGE.title,
        eventStage: isAllGoalsCompleted ? 'COMPLETED_OBSERVED' : 'ARRANGED_OR_STARTED',
        childChoiceSummary: action.shortTag,
        companionReactionText: action.islandFeedbackText,
        updatedAt: new Date().toISOString(),
      }
    );
  };

  // Sprint 4 FIX-03: 点击“换个方法再试”只回到观察/选择态，绝不直接增加修正次数或把 campRevisedMethod 设为 true
  const handleReviseCampMethod = () => {
    sounds.playClick();
    setCampCurrentActionId(null);
  };

  const handleCampUnknownPause = () => {
    sounds.playClick();
    recordUnknownHonestyChoice('story_grove:leaf-camp-transfer');
    setCampUnknownAcknowledged(true);
    handleSpeak('暂时不知道也没关系！你可以先转动手电筒照一照，或者先休息一下回小岛。');
  };

  const savedMetricsSnapshot = loadProductExperienceMetrics();
  const hasCompletedCampTransfer = Boolean(
    savedMetricsSnapshot.hasEverCompletedCampTransfer ||
      savedMetricsSnapshot.storyGroveTransferAttempts.some((a) => a.isCompleted)
  );
  const currentCampGoalProgress = evaluateCampTransferGoals(
    campInspectedIds,
    campIlluminatedTargets,
    campTriedActionIds
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-2.5 sm:p-5 overflow-y-auto">
      <div className="bg-amber-50/95 border border-amber-200/90 rounded-3xl p-3.5 sm:p-7 max-w-2xl w-full shadow-2xl relative my-auto transition-all duration-200 text-stone-800 max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleCloseStoryGrove}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-stone-500 hover:text-stone-700 p-2 rounded-full hover:bg-amber-100/60 transition-colors z-20 min-w-[52px] min-h-[52px] flex items-center justify-center cursor-pointer"
          aria-label="离开故事林"
        >
          <X className="w-6 h-6" />
        </button>

        {/* ================= STAGE 0: 叶子选择目录 (CATALOG) ================= */}
        {stage === 'catalog' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 pr-12">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center p-1.5 shadow-inner shrink-0 border border-emerald-200">
                <LocationBadgeIllustration type="story" className="w-full h-full" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-stone-800 flex items-center gap-1.5 flex-wrap">
                  <span>故事林 · 发现思考之叶</span>
                  <button
                    onClick={() =>
                      handleSpeak(
                        '欢迎来到故事林。点点童话场景里的东西，自己试试不同的办法，看看伙伴们会有什么反应！'
                      )
                    }
                    className="p-2 rounded-full hover:bg-amber-100 text-amber-700 min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer"
                    aria-label="朗读故事林介绍"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600">
                  先观察场景物件，再动手试试你的好办法
                </p>
              </div>
            </div>

            {isCurrentHeavyWeather && (
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-sky-900">
                <div className="text-xs sm:text-sm">
                  <span className="font-bold block">伴伴悄悄话：</span>
                  今天身体感受比较强烈，推荐先玩轻松的轻叶（如《一只杯子》），不给自己压力。
                </div>
              </div>
            )}

            {/* Stage C: 跨游戏认知迁移综合童话挑战入口 */}
            <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white p-4 sm:p-5 border-2 border-amber-300/80 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-black bg-amber-300 text-stone-950 px-2.5 py-0.5 rounded-full">
                  树屋露营夜 · 自主探索新情境
                </span>
                {hasCompletedCampTransfer && (
                  <span
                    data-testid="camp-transfer-completed-pill"
                    className="text-xs font-extrabold text-emerald-300 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" /> 已点亮树屋露营灯
                  </span>
                )}
              </div>
              <h4 className="text-base sm:text-lg font-black text-amber-100">
                {STORY_GROVE_CAMP_TRANSFER_CHALLENGE.title}
              </h4>
              <p className="text-xs sm:text-sm text-stone-200 mt-1 leading-relaxed">
                帐篷外有摇晃黑影、同伴紧追着问秘密、手电筒只有一把——不规定标准做法，由你自己观察和选择！
              </p>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-amber-200/90 font-semibold">
                  4 处露营物件可点 · 自由组合或调整方法
                </span>
                <button
                  type="button"
                  data-testid="open-camp-transfer-challenge"
                  onClick={handleStartTransferChallenge}
                  className="min-h-[48px] px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>进入树屋露营夜</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3.5">
              {INITIAL_LEAF_SCENARIOS.map((leaf) => {
                const isDone =
                  completedLeaves.includes(leaf.id) ||
                  savedMetricsSnapshot.completedStoryLeafIds.includes(leaf.id);
                const isAudited = ContentAuditRegistry.canRenderContent(leaf.id);
                const isInteractiveSceneLeaf = leaf.id === 'cup-size' || leaf.id === 'toy-share';
                return (
                  <button
                    key={leaf.id}
                    data-testid={`story-catalog-leaf-${leaf.id}`}
                    onClick={() => handleStartLeaf(leaf.id)}
                    className="text-left p-4 sm:p-5 rounded-3xl bg-white border-2 border-amber-200/80 hover:border-amber-400 hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer min-h-[136px]"
                    aria-label={`探索故事叶：${leaf.title}`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-bold text-emerald-800">{leaf.category}</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isInteractiveSceneLeaf && (
                            <span className="text-[11px] font-extrabold text-teal-900 bg-teal-100 border border-teal-300 px-2 py-0.5 rounded-full">
                              可动手场景 · 4物件
                            </span>
                          )}
                          {!isAudited && (
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                              准备中 · 需大人陪同
                            </span>
                          )}
                          {isDone && (
                            <span className="text-xs font-extrabold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4" /> 已探索
                            </span>
                          )}
                        </div>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-stone-900 group-hover:text-amber-900 transition-colors">
                        {leaf.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                        {leaf.summary}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs sm:text-sm text-amber-800 font-bold">
                      <span>主角：{leaf.character}</span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        看看详情 <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= NON-CATALOG AUDIT GATE: 任何非目录阶段若未授权则立即阻断 ================= */}
        {stage !== 'catalog' && !isCurrentLeafApproved && !adultPreviewUnlocked && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pr-12">
              <button
                onClick={handleReturnToCatalog}
                className="min-h-[48px] px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-xs sm:text-sm font-bold text-stone-700 flex items-center gap-1.5 border border-amber-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> 返回叶子目录
              </button>
              <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">
                {currentLeaf.category} · {currentLeaf.character}
              </span>
            </div>

            <div
              data-testid="story-leaf-audit-gate-blocked"
              className="p-5 sm:p-7 bg-amber-50 rounded-3xl border-2 border-amber-300 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
                <IslandUiIconSvg name="waiting_lantern" className="w-11 h-11" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-amber-950">
                  这片故事叶正在由大人细心检查中
                </h3>
                <p className="text-sm sm:text-base text-stone-700 max-w-md mx-auto leading-relaxed font-medium">
                  大人们正在认真检查《{currentLeaf.title}》的每一句话，确保它足够温暖安全，现在还不能自己打开哦。你可以先去小岛上其他已经准备好的地方玩一玩！
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCloseStoryGrove}
                  className="min-h-[56px] px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-sm sm:text-base cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  <span>回小岛去别的地点玩</span>
                </button>
                <button
                  type="button"
                  onClick={handleReturnToCatalog}
                  className="min-h-[56px] px-5 py-3 bg-white hover:bg-stone-100 text-stone-800 font-bold rounded-2xl text-sm sm:text-base border-2 border-stone-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>看其他故事叶</span>
                </button>
              </div>

              <div className="pt-3 border-t border-amber-200/80 flex flex-col items-center gap-1.5">
                <span className="text-xs text-stone-500">
                  如果你是家长或审阅老师，需要陪同预览内容：
                </span>
                <button
                  type="button"
                  onClick={handleRequestAdultReview}
                  className="min-h-[48px] px-4 py-2.5 bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-bold rounded-xl text-xs border border-amber-300 cursor-pointer transition-colors"
                >
                  🔒 家长 / 审阅人验证后预览（需输入家长 PIN）
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STAGE B: 可操作童话场景叶片 (cup-size & toy-share) ================= */}
        {stage === 'doorIntro' &&
          (isCurrentLeafApproved || adultPreviewUnlocked) &&
          interactiveLeafDef &&
          leafMode === 'interactiveScene' && (
            <div className="space-y-3" data-testid={`interactive-leaf-view-${interactiveLeafDef.id}`}>
              <div className="flex items-center justify-between gap-2 pr-12 flex-wrap">
                <button
                  onClick={handleReturnToCatalog}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-xs sm:text-sm font-bold text-stone-700 flex items-center gap-1.5 border border-amber-200 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> 返回目录
                </button>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    data-testid="story-inspected-counter"
                    className="text-xs bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full font-extrabold border border-emerald-300"
                  >
                    已观察物件 {inspectedHotspotIds.length}/{interactiveLeafDef.hotspots.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLeafMode('classicDoors')}
                    className="min-h-[38px] px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold cursor-pointer"
                  >
                    三扇门卡片
                  </button>
                </div>
              </div>

              {adultPreviewUnlocked && !isCurrentLeafApproved && (
                <div className="bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold px-3 py-2 rounded-2xl flex items-center justify-between gap-2">
                  <span>🛡️ 当前为家长/专家受控审阅预览模式（已通过家长 PIN 校验）</span>
                  <span className="text-[11px] bg-amber-200 px-2 py-0.5 rounded-full shrink-0">
                    成人共读
                  </span>
                </div>
              )}

              <div className="bg-white/95 p-3 sm:p-4 rounded-3xl border border-amber-200 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                      {interactiveLeafDef.title}
                    </h3>
                    <p className="text-xs text-amber-900 font-bold mt-0.5">
                      {interactiveLeafDef.subtitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSpeak(interactiveLeafDef.sceneSettingPrompt)}
                    className="min-w-[44px] min-h-[44px] p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center justify-center cursor-pointer shrink-0"
                    aria-label="朗读场景提示"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Interactive Fairy-tale SVG Scene (Scene-first on 390px mobile) */}
                <div
                  data-testid={`interactive-leaf-scene-${interactiveLeafDef.id}`}
                  data-scene-effect={
                    interactiveLeafDef.actions.find((a) => a.id === selectedSceneActionId)
                      ?.sceneVisualEffect || 'INITIAL_OBSERVE'
                  }
                  data-cup-position={
                    interactiveLeafDef.id === 'cup-size' ? cupPosition : undefined
                  }
                  data-compared-count={
                    interactiveLeafDef.id === 'cup-size'
                      ? comparedCupPositions.length
                      : undefined
                  }
                  className="relative rounded-2xl overflow-hidden border-2 border-amber-200 bg-gradient-to-b from-sky-100 via-emerald-50 to-amber-100 h-56 sm:h-64 select-none"
                >
                  {interactiveLeafDef.id === 'cup-size' ? (
                    <svg
                      viewBox="0 0 420 220"
                      className="w-full h-full"
                      role="img"
                      aria-label="一只杯子是大还是小童话木桌场景"
                    >
                      <circle cx="65" cy="40" r="45" fill="#A7F3D0" opacity="0.55" />
                      <circle cx="355" cy="36" r="52" fill="#6EE7B7" opacity="0.45" />
                      <rect x="20" y="142" width="380" height="22" rx="8" fill="#B45309" />
                      <rect x="48" y="164" width="18" height="46" rx="4" fill="#92400E" />
                      <rect x="354" y="164" width="18" height="46" rx="4" fill="#92400E" />

                      {/* Left: Squirrel Tiaotiao + Small Wooden Block */}
                      <g
                        transform="translate(46, 80)"
                        onClick={() => handleMoveCupToPosition('NEXT_TO_BLOCK')}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle cx="24" cy="24" r="16" fill="#D97706" />
                        <circle cx="14" cy="12" r="6" fill="#B45309" />
                        <circle cx="34" cy="12" r="6" fill="#B45309" />
                        <circle
                          cx="20"
                          cy="22"
                          r={cupPosition === 'NEXT_TO_BLOCK' ? '3.1' : '2.3'}
                          fill="#1C1917"
                        />
                        <circle
                          cx="29"
                          cy="22"
                          r={cupPosition === 'NEXT_TO_BLOCK' ? '3.1' : '2.3'}
                          fill="#1C1917"
                        />
                        <path
                          d={
                            cupPosition === 'NEXT_TO_BLOCK'
                              ? 'M18 29 Q24 35 30 29'
                              : 'M19 30 Q24 32 29 30'
                          }
                          fill="none"
                          stroke="#451A03"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <rect
                          x="30"
                          y="40"
                          width="22"
                          height="22"
                          rx="4"
                          fill="#F59E0B"
                          stroke={
                            inspectedHotspotIds.includes('obj_wooden_block') ||
                            comparedCupPositions.includes('NEXT_TO_BLOCK')
                              ? '#059669'
                              : '#78350F'
                          }
                          strokeWidth="2.5"
                        />
                        <text
                          x="41"
                          y="55"
                          fontSize="9.5"
                          textAnchor="middle"
                          fill="#451A03"
                          fontWeight="bold"
                        >
                          积木
                        </text>
                      </g>

                      {/* Right: Elephant Pupu + Large Bucket */}
                      <g
                        transform="translate(290, 52)"
                        onClick={() => handleMoveCupToPosition('NEXT_TO_BUCKET')}
                        style={{ cursor: 'pointer' }}
                      >
                        <ellipse cx="56" cy="48" rx="28" ry="24" fill="#94A3B8" />
                        <circle cx="46" cy="42" r="2.8" fill="#0F172A" />
                        <path
                          d={
                            selectedSceneActionId === 'act_only_look_squirrel'
                              ? 'M32 48 Q22 68 28 78'
                              : cupPosition === 'NEXT_TO_BUCKET'
                                ? 'M32 44 Q14 30 20 16'
                                : 'M32 46 Q18 42 20 28'
                          }
                          fill="none"
                          stroke="#64748B"
                          strokeWidth="7"
                          strokeLinecap="round"
                        />
                        <polygon
                          points="2,34 46,34 40,90 8,90"
                          fill="#FB923C"
                          stroke={
                            inspectedHotspotIds.includes('obj_elephant_bucket') ||
                            comparedCupPositions.includes('NEXT_TO_BUCKET')
                              ? '#059669'
                              : '#9A3412'
                          }
                          strokeWidth="2.5"
                        />
                        <text
                          x="24"
                          y="65"
                          fontSize="10"
                          textAnchor="middle"
                          fill="#431407"
                          fontWeight="bold"
                        >
                          大水桶
                        </text>
                      </g>

                      {/* Movable Forest Blue Cup Prop (Translates across table) */}
                      <g
                        data-testid="movable-blue-cup-prop"
                        data-cup-position={cupPosition}
                        transform={
                          cupPosition === 'NEXT_TO_BLOCK'
                            ? 'translate(106, 90)'
                            : cupPosition === 'NEXT_TO_BUCKET'
                              ? 'translate(242, 90)'
                              : 'translate(186, 90)'
                        }
                      >
                        <rect
                          x="0"
                          y="10"
                          width="38"
                          height="42"
                          rx="6"
                          fill="#38BDF8"
                          stroke="#0284C7"
                          strokeWidth="2.8"
                        />
                        <path
                          d="M38 18 C48 18, 48 36, 38 36"
                          fill="none"
                          stroke="#0284C7"
                          strokeWidth="3.5"
                        />
                        <line
                          x1="6"
                          y1="24"
                          x2="32"
                          y2="24"
                          stroke="#E0F2FE"
                          strokeWidth="2"
                          strokeDasharray="3 2"
                        />
                        <line
                          x1="6"
                          y1="36"
                          x2="32"
                          y2="36"
                          stroke="#E0F2FE"
                          strokeWidth="2"
                          strokeDasharray="3 2"
                        />
                        <text
                          data-testid="cup-constant-size-gauge"
                          x="19"
                          y="6"
                          fontSize="8.5"
                          textAnchor="middle"
                          fill="#0369A1"
                          fontWeight="bold"
                        >
                          2格高(不变)
                        </text>
                      </g>

                      {/* Dynamic Visual Proportion Lines when cup is moved next to Block or Bucket */}
                      {cupPosition === 'NEXT_TO_BLOCK' && (
                        <g data-testid="cup-vs-block-visual-badge">
                          <line
                            x1="78"
                            y1="120"
                            x2="106"
                            y2="100"
                            stroke="#059669"
                            strokeWidth="2.5"
                            strokeDasharray="4 2"
                          />
                          <rect
                            x="32"
                            y="14"
                            width="172"
                            height="26"
                            rx="13"
                            fill="#ECFDF5"
                            stroke="#10B981"
                            strokeWidth="2"
                          />
                          <text
                            x="118"
                            y="31"
                            fontSize="10.5"
                            textAnchor="middle"
                            fill="#065F46"
                            fontWeight="bold"
                          >
                            比积木高好多 ↑ 跳跳觉得杯子大
                          </text>
                        </g>
                      )}

                      {cupPosition === 'NEXT_TO_BUCKET' && (
                        <g data-testid="cup-vs-bucket-visual-badge">
                          <line
                            x1="280"
                            y1="100"
                            x2="294"
                            y2="86"
                            stroke="#0284C7"
                            strokeWidth="2.5"
                            strokeDasharray="4 2"
                          />
                          <rect
                            x="208"
                            y="14"
                            width="182"
                            height="26"
                            rx="13"
                            fill="#EFF6FF"
                            stroke="#3B82F6"
                            strokeWidth="2"
                          />
                          <text
                            x="299"
                            y="31"
                            fontSize="10.5"
                            textAnchor="middle"
                            fill="#1E40AF"
                            fontWeight="bold"
                          >
                            比大水桶矮好多 ↓ 噗噗觉得杯子小
                          </text>
                        </g>
                      )}

                      {/* Bottom Twig Ruler */}
                      <g transform="translate(115, 172)">
                        <rect
                          x="0"
                          y="0"
                          width="190"
                          height="10"
                          rx="5"
                          fill="#78350F"
                          stroke={inspectedHotspotIds.includes('obj_twig_ruler') ? '#10B981' : 'none'}
                          strokeWidth="2"
                        />
                        <line x1="35" y1="0" x2="35" y2="10" stroke="#FDE68A" strokeWidth="2" />
                        <line x1="95" y1="0" x2="95" y2="10" stroke="#FDE68A" strokeWidth="2" />
                        <line x1="155" y1="0" x2="155" y2="10" stroke="#FDE68A" strokeWidth="2" />
                      </g>

                      {selectedSceneActionId === 'act_compare_both_sides' && (
                        <g data-testid="svg-effect-compare-both">
                          <path
                            d="M96 105 Q145 65 186 98"
                            fill="none"
                            stroke="#059669"
                            strokeWidth="3"
                            strokeDasharray="5 3"
                          />
                          <path
                            d="M232 98 Q265 60 292 88"
                            fill="none"
                            stroke="#0284C7"
                            strokeWidth="3"
                            strokeDasharray="5 3"
                          />
                          <rect
                            x="96"
                            y="44"
                            width="228"
                            height="24"
                            rx="12"
                            fill="#ECFDF5"
                            stroke="#10B981"
                            strokeWidth="2"
                          />
                          <text
                            x="210"
                            y="60"
                            fontSize="10.5"
                            textAnchor="middle"
                            fill="#065F46"
                            fontWeight="bold"
                          >
                            同一只杯子没变：比积木大 ↑ · 比水桶小 ↓
                          </text>
                        </g>
                      )}

                      {selectedSceneActionId === 'act_only_look_squirrel' && (
                        <g data-testid="svg-effect-single-side">
                          <rect
                            x="240"
                            y="10"
                            width="170"
                            height="150"
                            rx="12"
                            fill="#1E293B"
                            opacity="0.45"
                          />
                          <text
                            x="325"
                            y="42"
                            fontSize="11"
                            textAnchor="middle"
                            fill="#FEF3C7"
                            fontWeight="bold"
                          >
                            右边还没被对比到…
                          </text>
                        </g>
                      )}

                      {selectedSceneActionId === 'act_ask_usage_need' && (
                        <g data-testid="svg-effect-ask-need">
                          <rect
                            x="26"
                            y="44"
                            width="132"
                            height="26"
                            rx="12"
                            fill="#FFFBEB"
                            stroke="#F59E0B"
                            strokeWidth="2"
                          />
                          <text
                            x="92"
                            y="61"
                            fontSize="10"
                            textAnchor="middle"
                            fill="#92400E"
                            fontWeight="bold"
                          >
                            跳跳：浇3棵小花苗
                          </text>
                          <rect
                            x="252"
                            y="44"
                            width="142"
                            height="26"
                            rx="12"
                            fill="#EFF6FF"
                            stroke="#3B82F6"
                            strokeWidth="2"
                          />
                          <text
                            x="323"
                            y="61"
                            fontSize="10"
                            textAnchor="middle"
                            fill="#1E40AF"
                            fontWeight="bold"
                          >
                            噗噗：装满一桶洗澡水
                          </text>
                        </g>
                      )}
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 420 220"
                      className="w-full h-full"
                      role="img"
                      aria-label="两个人想玩同一辆小火车童话轨道场景"
                    >
                      <ellipse
                        cx="210"
                        cy="132"
                        rx="155"
                        ry="48"
                        fill="none"
                        stroke="#92400E"
                        strokeWidth="10"
                      />
                      <ellipse
                        cx="210"
                        cy="132"
                        rx="155"
                        ry="48"
                        fill="none"
                        stroke="#FDE68A"
                        strokeWidth="4"
                        strokeDasharray="8 8"
                      />

                      <g transform="translate(56, 118)">
                        <polygon
                          points="0,0 28,0 18,18 28,36 0,36 10,18"
                          fill="#F59E0B"
                          stroke={
                            inspectedHotspotIds.includes('obj_acorn_hourglass')
                              ? '#059669'
                              : '#78350F'
                          }
                          strokeWidth="2.5"
                        />
                        <text
                          x="14"
                          y="50"
                          fontSize="10"
                          textAnchor="middle"
                          fill="#78350F"
                          fontWeight="bold"
                        >
                          松果沙漏
                        </text>
                      </g>

                      <g
                        transform={
                          selectedSceneActionId === 'act_cooperate_station_driver'
                            ? 'translate(248, 86)'
                            : selectedSceneActionId === 'act_grab_first'
                              ? 'translate(105, 42) rotate(-14)'
                              : 'translate(176, 92)'
                        }
                      >
                        <rect
                          x="0"
                          y="10"
                          width="54"
                          height="30"
                          rx="6"
                          fill="#EF4444"
                          stroke={
                            inspectedHotspotIds.includes('obj_red_train') ? '#059669' : '#991B1B'
                          }
                          strokeWidth="2.5"
                        />
                        <rect x="32" y="0" width="18" height="14" rx="3" fill="#FCA5A5" />
                        <circle cx="14" cy="42" r="7" fill="#1F2937" />
                        <circle cx="40" cy="42" r="7" fill="#1F2937" />
                      </g>

                      <g transform="translate(302, 72)">
                        <rect
                          x="0"
                          y="16"
                          width="14"
                          height="42"
                          fill="#60A5FA"
                          stroke="#1D4ED8"
                          strokeWidth="2"
                        />
                        <rect
                          x="44"
                          y="16"
                          width="14"
                          height="42"
                          fill="#60A5FA"
                          stroke="#1D4ED8"
                          strokeWidth="2"
                        />
                        <polygon
                          points="-6,16 64,16 29,-6"
                          fill="#F472B6"
                          stroke={
                            inspectedHotspotIds.includes('obj_station_blocks')
                              ? '#059669'
                              : '#BE185D'
                          }
                          strokeWidth="2.5"
                        />
                        <text
                          x="29"
                          y="72"
                          fontSize="10"
                          textAnchor="middle"
                          fill="#1E3A8A"
                          fontWeight="bold"
                        >
                          积木车站
                        </text>
                      </g>

                      <g transform="translate(248, 142)">
                        <line x1="0" y1="0" x2="0" y2="34" stroke="#475569" strokeWidth="3" />
                        <polygon
                          points="0,0 28,8 0,18"
                          fill="#10B981"
                          stroke={
                            inspectedHotspotIds.includes('obj_whistle_flag') ? '#047857' : 'none'
                          }
                          strokeWidth="2"
                        />
                      </g>

                      {selectedSceneActionId === 'act_cooperate_station_driver' && (
                        <g data-testid="svg-effect-cooperate-roles">
                          <rect
                            x="92"
                            y="16"
                            width="236"
                            height="28"
                            rx="14"
                            fill="#ECFDF5"
                            stroke="#10B981"
                            strokeWidth="2"
                          />
                          <text
                            x="210"
                            y="34"
                            fontSize="11"
                            textAnchor="middle"
                            fill="#065F46"
                            fontWeight="bold"
                          >
                            小火车顺利进站！司机波波 + 站长乐乐默契配合
                          </text>
                        </g>
                      )}

                      {selectedSceneActionId === 'act_hourglass_turns' && (
                        <g data-testid="svg-effect-hourglass-turns">
                          <rect
                            x="96"
                            y="16"
                            width="228"
                            height="28"
                            rx="14"
                            fill="#FFFBEB"
                            stroke="#F59E0B"
                            strokeWidth="2"
                          />
                          <text
                            x="210"
                            y="34"
                            fontSize="11"
                            textAnchor="middle"
                            fill="#92400E"
                            fontWeight="bold"
                          >
                            松果沙漏计时中：2圈到站准时交接！
                          </text>
                        </g>
                      )}

                      {selectedSceneActionId === 'act_grab_first' && (
                        <g data-testid="svg-effect-grab-first">
                          <rect
                            x="92"
                            y="16"
                            width="236"
                            height="28"
                            rx="14"
                            fill="#FEF2F2"
                            stroke="#EF4444"
                            strokeWidth="2"
                          />
                          <text
                            x="210"
                            y="34"
                            fontSize="11"
                            textAnchor="middle"
                            fill="#991B1B"
                            fontWeight="bold"
                          >
                            火车离开了轨道，积木车站冷冷清清…
                          </text>
                        </g>
                      )}
                    </svg>
                  )}

                </div>

                {/* 场景物件观察条：不遮挡童话插画本体，390px 双列 / 桌面四列清晰触控 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
                  {interactiveLeafDef.hotspots.map((hotspot) => {
                    const isInspected = inspectedHotspotIds.includes(hotspot.id);
                    const isCurrent = activeHotspotId === hotspot.id;
                    return (
                      <button
                        key={hotspot.id}
                        type="button"
                        data-testid={`story-hotspot-${hotspot.id}`}
                        onClick={() => handleInspectStoryHotspot(hotspot.id)}
                        className={`min-h-[44px] px-2.5 py-1.5 rounded-2xl text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 border-2 ${
                          isCurrent
                            ? 'bg-amber-400 text-stone-950 border-stone-900 shadow-sm'
                            : isInspected
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-white text-stone-900 border-amber-300 hover:bg-amber-50'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{hotspot.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Showcase A Direct Prop Manipulation Bar for cup-size */}
                {interactiveLeafDef.id === 'cup-size' && (
                  <div
                    data-testid="cup-prop-manipulation-bar"
                    className="grid grid-cols-3 gap-2 pt-1"
                  >
                    <button
                      type="button"
                      data-testid="move-cup-to-block"
                      onClick={() => handleMoveCupToPosition('NEXT_TO_BLOCK')}
                      className={`min-h-[46px] px-2 py-1.5 rounded-2xl text-xs font-black border-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        cupPosition === 'NEXT_TO_BLOCK'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-amber-50 hover:bg-amber-100 text-stone-900 border-amber-300'
                      }`}
                    >
                      <span>👈 移到小积木旁</span>
                    </button>
                    <button
                      type="button"
                      data-testid="move-cup-to-center"
                      onClick={() => handleMoveCupToPosition('CENTER_TABLE')}
                      className={`min-h-[46px] px-2 py-1.5 rounded-2xl text-xs font-black border-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        cupPosition === 'CENTER_TABLE'
                          ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-800 border-stone-300'
                      }`}
                    >
                      <span>🎯 放回木桌中间</span>
                    </button>
                    <button
                      type="button"
                      data-testid="move-cup-to-bucket"
                      onClick={() => handleMoveCupToPosition('NEXT_TO_BUCKET')}
                      className={`min-h-[46px] px-2 py-1.5 rounded-2xl text-xs font-black border-2 transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        cupPosition === 'NEXT_TO_BUCKET'
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-amber-50 hover:bg-amber-100 text-stone-900 border-amber-300'
                      }`}
                    >
                      <span>移到大水桶旁 👉</span>
                    </button>
                  </div>
                )}

                {activeHotspotId ? (
                  (() => {
                    const h = interactiveLeafDef.hotspots.find((item) => item.id === activeHotspotId);
                    if (!h) return null;
                    return (
                      <div
                        data-testid="story-hotspot-observation-card"
                        className="p-2.5 rounded-2xl bg-amber-50 border border-amber-300 space-y-1 animate-in fade-in"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-amber-950">
                            你观察了：{h.label}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            {h.speakerName}
                          </span>
                        </div>
                        <p className="text-xs text-stone-800 font-medium">{h.inspectObservation}</p>
                        <p className="text-xs text-amber-900 font-bold">{h.inspectCharacterLine}</p>
                      </div>
                    );
                  })()
                ) : (
                  <div className="p-2 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 text-center font-bold">
                    {interactiveLeafDef.id === 'cup-size'
                      ? '👆 点击上方按钮把蓝水杯移到小积木和大水桶旁边比一比！'
                      : '👆 先点点上方画面里的物件，看看每个角色遇到了什么情况吧！'}
                  </div>
                )}
              </div>

              <div className="bg-white/95 p-3 sm:p-4 rounded-3xl border border-amber-200 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm sm:text-base font-black text-stone-900">
                    试试你的做法（会直接改变场景）
                  </h4>
                  {revisionCount > 0 && (
                    <span
                      data-testid="story-revised-badge"
                      className="text-[11px] font-extrabold bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded-full border border-teal-300"
                    >
                      已根据后果调整做法 ({revisionCount})
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {interactiveLeafDef.actions.map((action) => {
                    const isSelected = selectedSceneActionId === action.id;
                    return (
                      <button
                        key={action.id}
                        type="button"
                        data-testid={`story-action-${action.id}`}
                        onClick={() => handleSelectStoryAction(action.id)}
                        className={`min-h-[50px] p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-sm'
                            : 'bg-stone-50/90 hover:bg-amber-50/60 border-stone-200 text-stone-800'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="inline-block text-[11px] font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full mr-1.5">
                            {action.shortTag}
                          </span>
                          <span className="text-xs sm:text-sm font-bold">{action.label}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 shrink-0 text-stone-500" />
                      </button>
                    );
                  })}
                </div>

                {selectedSceneActionId &&
                  (() => {
                    const selectedAction = interactiveLeafDef.actions.find(
                      (a) => a.id === selectedSceneActionId
                    );
                    if (!selectedAction) return null;
                    const { isGoalCompleted: isLeafCompleted, missingHotspotIds } =
                      evaluateInteractiveLeafGoalCompletion(
                        interactiveLeafDef.id,
                        selectedSceneActionId,
                        inspectedHotspotIds,
                        comparedCupPositions
                      );
                    const missingLabels = missingHotspotIds
                      .map(
                        (id) =>
                          interactiveLeafDef.hotspots.find((h) => h.id === id)?.label || id
                      )
                      .join('、');

                    return (
                      <div
                        data-testid="story-action-outcome-panel"
                        className="mt-2.5 p-3 rounded-2xl bg-amber-50/90 border-2 border-amber-300 space-y-2.5 animate-in fade-in"
                      >
                        <div className="text-xs sm:text-sm font-black text-stone-900">
                          画面变化：{selectedAction.consequenceSummary}
                        </div>

                        <div
                          data-testid="story-character-reactions"
                          className="grid sm:grid-cols-2 gap-2"
                        >
                          {selectedAction.characterResponses.map((resp, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl border text-xs sm:text-sm ${
                                resp.mood === 'UPSET'
                                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                                  : 'bg-white border-emerald-200 text-stone-800'
                              }`}
                            >
                              <div className="font-black text-emerald-900 mb-0.5">
                                {resp.speaker}：
                              </div>
                              <div className="font-medium leading-snug">“{resp.line}”</div>
                            </div>
                          ))}
                        </div>

                        {selectedAction.encouragesRevision && (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                            <span className="text-xs font-bold text-rose-800">
                              {selectedAction.revisionPrompt}
                            </span>
                            <button
                              type="button"
                              data-testid="story-revise-action-btn"
                              onClick={handleReturnToSceneObserve}
                              className="min-h-[46px] px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>回到场景换个办法试试</span>
                            </button>
                          </div>
                        )}

                        {!selectedAction.encouragesRevision && !isLeafCompleted && (
                          <div
                            data-testid="story-missing-evidence-prompt"
                            className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-bold"
                          >
                            再去上方画面亲自观察或移动对比「{missingLabels}」，就能完整验证这个办法并点亮小岛果子啦！
                          </div>
                        )}

                        {isLeafCompleted && (
                          <div
                            data-testid="story-island-linkage-banner"
                            className="p-3 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-950 text-xs sm:text-sm font-extrabold flex items-center justify-between gap-2"
                          >
                            <span>🌱 {selectedAction.islandLinkNote}</span>
                            <button
                              type="button"
                              data-testid="story-complete-return-island-btn"
                              onClick={handleCloseStoryGrove}
                              className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs cursor-pointer shrink-0"
                            >
                              回小岛看变化
                            </button>
                          </div>
                        )}

                        {/* Collapsible Parent Co-Read Explanation */}
                        <div className="pt-1 border-t border-amber-200/80">
                          <button
                            type="button"
                            data-testid="parent-co-read-drawer-toggle"
                            onClick={() => setShowParentCoReadDrawer((v) => !v)}
                            className="text-xs font-bold text-amber-900 hover:text-amber-700 cursor-pointer flex items-center gap-1"
                          >
                            <span>{showParentCoReadDrawer ? '收起家长共读小贴士 ▲' : '展开家长共读小贴士 ▼'}</span>
                          </button>
                          {showParentCoReadDrawer && (
                            <div
                              data-testid="parent-co-read-drawer-content"
                              className="mt-1.5 p-2.5 rounded-xl bg-white/90 border border-amber-200 text-xs text-stone-700 font-medium"
                            >
                              思考小发现：{selectedAction.cognitiveTakeaway}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
              </div>
            </div>
          )}

        {/* ================= STAGE C: 跨游戏认知迁移综合童话挑战 (leaf-camp-transfer) ================= */}
        {stage === 'transferChallenge' && (isCurrentLeafApproved || adultPreviewUnlocked) && (
          <div className="space-y-3" data-testid="story-grove-transfer-challenge-view">
            <div className="flex items-center justify-between gap-2 pr-12 flex-wrap">
              <button
                onClick={handleReturnToCatalog}
                className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-xs sm:text-sm font-bold text-stone-700 flex items-center gap-1.5 border border-amber-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> 返回目录
              </button>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  data-testid="camp-transfer-clue-counter"
                  className="text-xs bg-indigo-100 text-indigo-950 px-2.5 py-1 rounded-full font-extrabold border border-indigo-300"
                >
                  已观察 {campInspectedIds.length}/
                  {STORY_GROVE_CAMP_TRANSFER_CHALLENGE.hotspots.length}
                </span>
                {hasCompletedCampTransfer && (
                  <span
                    data-testid="camp-historical-lantern-badge"
                    className="text-xs bg-amber-100 text-amber-950 px-2.5 py-1 rounded-full font-extrabold border border-amber-300"
                  >
                    🏮 小岛历史暖灯常亮中
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white/95 p-3 sm:p-4 rounded-3xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 leading-tight">
                    {STORY_GROVE_CAMP_TRANSFER_CHALLENGE.title}
                  </h3>
                  <p className="text-xs text-indigo-900 font-bold mt-0.5">
                    {STORY_GROVE_CAMP_TRANSFER_CHALLENGE.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSpeak(STORY_GROVE_CAMP_TRANSFER_CHALLENGE.openingNarrative)}
                  className="min-w-[44px] min-h-[44px] p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center justify-center cursor-pointer shrink-0"
                  aria-label="朗读露营夜情境"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Sprint 4 FIX-01: 3 Observable Sub-Goal Progress Badges */}
              <div
                data-testid="camp-multi-goal-progress-bar"
                className="grid grid-cols-3 gap-1.5"
              >
                {STORY_GROVE_CAMP_TRANSFER_CHALLENGE.goals.map((goal) => {
                  const isMetNow = currentCampGoalProgress.completedGoals.includes(goal.id);
                  const isMetHistorically =
                    savedMetricsSnapshot.historicalCompletedCampGoals.includes(goal.id);
                  return (
                    <div
                      key={goal.id}
                      data-testid={`camp-goal-badge-${goal.id}`}
                      data-completed={isMetNow ? 'true' : 'false'}
                      data-historical-completed={isMetHistorically ? 'true' : 'false'}
                      className={`px-2 py-1.5 rounded-xl border text-[11px] font-black flex items-center justify-between gap-1 ${
                        isMetNow
                          ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                          : isMetHistorically
                            ? 'bg-amber-50 border-amber-300 text-amber-950'
                            : 'bg-stone-50 border-stone-200 text-stone-600'
                      }`}
                    >
                      <span className="truncate">{goal.title}</span>
                      <span>{isMetNow ? '✓' : isMetHistorically ? '★' : '○'}</span>
                    </div>
                  );
                })}
              </div>

              {/* Treehouse Camp Night Interactive SVG with Movable Flashlight Beam */}
              <div
                data-testid="camp-transfer-svg-scene"
                data-camp-outcome={
                  STORY_GROVE_CAMP_TRANSFER_CHALLENGE.actions.find(
                    (a) => a.id === campCurrentActionId
                  )?.visualOutcomeState || 'NIGHT_MYSTERY'
                }
                data-beam-target={campBeamTarget}
                className="relative rounded-2xl overflow-hidden border-2 border-indigo-300 bg-gradient-to-b from-slate-900 via-indigo-950 to-amber-950 h-56 sm:h-64 select-none"
              >
                <svg
                  viewBox="0 0 420 220"
                  className="w-full h-full"
                  role="img"
                  aria-label="树屋露营夜的神秘影子与唯一手电筒场景"
                >
                  <circle cx="48" cy="28" r="2" fill="#FDE68A" />
                  <circle cx="145" cy="22" r="2.5" fill="#FDE68A" />
                  <circle cx="360" cy="30" r="2" fill="#FDE68A" />

                  {/* Outside Window Area */}
                  <rect
                    x="150"
                    y="24"
                    width="120"
                    height="78"
                    rx="10"
                    fill={campBeamTarget === 'OUTSIDE_BRANCH' ? '#FEF3C7' : '#1E293B'}
                    stroke="#64748B"
                    strokeWidth="3"
                  />
                  <path
                    d="M162 52 Q210 42 254 64"
                    fill="none"
                    stroke="#78350F"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                  {/* Pinecones only brightly visible when illuminated or inspected */}
                  <ellipse
                    cx="204"
                    cy="60"
                    rx="8"
                    ry="12"
                    fill={
                      campInspectedIds.includes('camp_obj_pinecone_branch') ||
                      campBeamTarget === 'OUTSIDE_BRANCH'
                        ? '#D97706'
                        : '#0F172A'
                    }
                  />
                  <ellipse
                    cx="226"
                    cy="64"
                    rx="9"
                    ry="13"
                    fill={
                      campInspectedIds.includes('camp_obj_pinecone_branch') ||
                      campBeamTarget === 'OUTSIDE_BRANCH'
                        ? '#F59E0B'
                        : '#0F172A'
                    }
                  />

                  {/* Left Tent Curtain Shadow */}
                  <polygon
                    points="46,44 132,34 136,118 42,118"
                    fill={
                      campBeamTarget === 'SHADOW_CURTAIN' ||
                      campCurrentActionId === 'camp_act_shine_light_check_branch' ||
                      campCurrentActionId === 'camp_act_share_flashlight_roles'
                        ? '#FEF3C7'
                        : '#334155'
                    }
                    opacity="0.88"
                  />
                  <path
                    d="M78 62 L92 48 L104 66 L114 52 L116 96 L74 96 Z"
                    fill={
                      campCurrentActionId === 'camp_act_shine_light_check_branch' ||
                      campCurrentActionId === 'camp_act_share_flashlight_roles'
                        ? '#D97706'
                        : '#0F172A'
                    }
                  />

                  {/* Interactive Flashlight Beam Cone */}
                  {(campBeamTarget !== 'OFF' ||
                    campCurrentActionId === 'camp_act_shine_light_check_branch' ||
                    campCurrentActionId === 'camp_act_share_flashlight_roles') && (
                    <polygon
                      data-testid="camp-svg-light-beam"
                      data-beam-direction={campBeamTarget}
                      points={
                        campBeamTarget === 'SHADOW_CURTAIN'
                          ? '202,152 44,40 134,40'
                          : campBeamTarget === 'TENT_INSIDE'
                            ? '202,152 286,98 370,152'
                            : campBeamTarget === 'LANTERN_DIFFUSER'
                              ? '202,152 150,120 266,120'
                              : '202,152 148,24 272,24'
                      }
                      fill="#FDE68A"
                      opacity="0.42"
                    />
                  )}

                  {/* Center Flashlight & Diffuser */}
                  <g transform="translate(182, 146)">
                    <rect
                      x="0"
                      y="6"
                      width="42"
                      height="16"
                      rx="6"
                      fill="#F59E0B"
                      stroke="#FEF3C7"
                      strokeWidth="2"
                    />
                    <circle
                      cx="52"
                      cy="14"
                      r={campBeamTarget === 'LANTERN_DIFFUSER' ? '15' : '11'}
                      fill="#FDE68A"
                      opacity="0.92"
                    />
                  </g>

                  {/* Right Peer Hedgehog Diandian */}
                  <g transform="translate(306, 112)">
                    <circle
                      cx="28"
                      cy="26"
                      r="20"
                      fill={campBeamTarget === 'TENT_INSIDE' ? '#D6D3D1' : '#A8A29E'}
                    />
                    <circle cx="22" cy="22" r="2.5" fill="#1C1917" />
                    <circle cx="34" cy="22" r="2.5" fill="#1C1917" />
                  </g>
                </svg>
              </div>

              {/* 露营夜场景物件观察条：不遮挡手电光束与角色表情，探索前保持中性名称 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
                {STORY_GROVE_CAMP_TRANSFER_CHALLENGE.hotspots.map((hotspot) => {
                  const isInspected = campInspectedIds.includes(hotspot.id);
                  const isCurrent = activeCampHotspotId === hotspot.id;
                  // Sprint 4 FIX-05: 尚未探索前显示中性名称 hotspot.label，真实观察后才显示 revealedLabel
                  const displayLabel = isInspected ? hotspot.revealedLabel : hotspot.label;
                  return (
                    <button
                      key={hotspot.id}
                      type="button"
                      data-testid={`camp-hotspot-${hotspot.id}`}
                      onClick={() => handleInspectCampHotspot(hotspot.id)}
                      className={`min-h-[44px] px-2.5 py-1.5 rounded-2xl text-[11px] sm:text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1 border-2 ${
                        isCurrent
                          ? 'bg-amber-300 text-stone-950 border-stone-900 shadow-sm'
                          : isInspected
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-white text-stone-900 border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{displayLabel}</span>
                    </button>
                  );
                })}
              </div>

              {/* Showcase B Direct Flashlight Beam Control Bar */}
              <div
                data-testid="camp-flashlight-control-bar"
                className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5"
              >
                <button
                  type="button"
                  data-testid="aim-flashlight-SHADOW_CURTAIN"
                  onClick={() => handleAimFlashlight('SHADOW_CURTAIN')}
                  className={`min-h-[44px] px-2 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    campBeamTarget === 'SHADOW_CURTAIN'
                      ? 'bg-amber-400 text-stone-950 border-stone-900 shadow-sm'
                      : 'bg-slate-100 hover:bg-amber-50 text-stone-800 border-slate-300'
                  }`}
                >
                  🔦 照向窗外影子
                </button>
                <button
                  type="button"
                  data-testid="aim-flashlight-OUTSIDE_BRANCH"
                  onClick={() => handleAimFlashlight('OUTSIDE_BRANCH')}
                  className={`min-h-[44px] px-2 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    campBeamTarget === 'OUTSIDE_BRANCH'
                      ? 'bg-amber-400 text-stone-950 border-stone-900 shadow-sm'
                      : 'bg-slate-100 hover:bg-amber-50 text-stone-800 border-slate-300'
                  }`}
                >
                  🔦 照向帐篷旁的东西
                </button>
                <button
                  type="button"
                  data-testid="aim-flashlight-LANTERN_DIFFUSER"
                  onClick={() => handleAimFlashlight('LANTERN_DIFFUSER')}
                  className={`min-h-[44px] px-2 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    campBeamTarget === 'LANTERN_DIFFUSER'
                      ? 'bg-amber-400 text-stone-950 border-stone-900 shadow-sm'
                      : 'bg-slate-100 hover:bg-amber-50 text-stone-800 border-slate-300'
                  }`}
                >
                  🔦 照向地上照明工具
                </button>
                <button
                  type="button"
                  data-testid="aim-flashlight-TENT_INSIDE"
                  onClick={() => handleAimFlashlight('TENT_INSIDE')}
                  className={`min-h-[44px] px-2 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    campBeamTarget === 'TENT_INSIDE'
                      ? 'bg-amber-400 text-stone-950 border-stone-900 shadow-sm'
                      : 'bg-slate-100 hover:bg-amber-50 text-stone-800 border-slate-300'
                  }`}
                >
                  🔦 照向身旁同伴
                </button>
              </div>

              {activeCampHotspotId ? (
                (() => {
                  const h = STORY_GROVE_CAMP_TRANSFER_CHALLENGE.hotspots.find(
                    (item) => item.id === activeCampHotspotId
                  );
                  if (!h) return null;
                  return (
                    <div
                      data-testid="camp-hotspot-observation-card"
                      className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-950">
                          光束照亮：{h.revealedLabel}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-800">
                          {h.speakerName}
                        </span>
                      </div>
                      <p className="text-xs text-stone-800 font-medium">{h.observationDetail}</p>
                      <p className="text-xs text-indigo-900 font-bold">“{h.speakerLine}”</p>
                    </div>
                  );
                })()
              ) : (
                <div className="p-2 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 text-center font-bold">
                  👆 先转动手电筒光束照一照帐篷内外，看看发现了什么！
                </div>
              )}
            </div>

            {/* Action Choices across 3 Independent Problem Lines */}
            <div className="bg-white/95 p-3 sm:p-4 rounded-3xl border border-amber-200 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-black text-stone-900">
                  你想先处理哪件事？（可按任意顺序尝试）
                </h4>
                <div className="flex items-center gap-1.5">
                  {campRevisedMethod && campRevisionCount > 0 && (
                    <span
                      data-testid="camp-method-revised-badge"
                      className="text-[11px] font-extrabold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-300"
                    >
                      已观察后果并调整方法 ({campRevisionCount})
                    </span>
                  )}
                  <button
                    type="button"
                    data-testid="camp-unknown-wait-btn"
                    onClick={handleCampUnknownPause}
                    className="min-h-[36px] px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                  >
                    我还不知道 / 先看看
                  </button>
                </div>
              </div>

              {campUnknownAcknowledged && (
                <div
                  data-testid="camp-unknown-acknowledged-banner"
                  className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-bold flex items-center justify-between gap-2"
                >
                  <span>暂时不知道也没关系！你可以继续用手电筒照一照，或者先保存当前发现回小岛。</span>
                  <button
                    type="button"
                    onClick={handleCloseStoryGrove}
                    className="min-h-[38px] px-3 py-1 rounded-lg bg-sky-700 text-white font-black text-xs shrink-0 cursor-pointer"
                  >
                    先回小岛
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                {STORY_GROVE_CAMP_TRANSFER_CHALLENGE.actions.map((act) => {
                  const isSelected = campCurrentActionId === act.id;
                  const wasTried = campTriedActionIds.includes(act.id);
                  const isGoalDone =
                    act.targetGoalId &&
                    currentCampGoalProgress.completedGoals.includes(act.targetGoalId);
                  return (
                    <button
                      key={act.id}
                      type="button"
                      data-testid={`camp-action-${act.id}`}
                      onClick={() => handleSelectCampAction(act.id)}
                      className={`min-h-[50px] p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-sm'
                          : isGoalDone
                            ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                            : 'bg-stone-50 hover:bg-amber-50/60 border-stone-200 text-stone-800'
                      }`}
                    >
                      <div className="text-xs sm:text-sm font-bold leading-snug">
                        <span className="inline-block text-[11px] font-extrabold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full mr-1.5">
                          {act.shortTag}
                        </span>
                        {act.label}
                        {isGoalDone && (
                          <span className="ml-1.5 text-[11px] font-extrabold text-emerald-700">
                            ✓ 已达成
                          </span>
                        )}
                        {wasTried && !isSelected && !isGoalDone && (
                          <span className="ml-1.5 text-[11px] font-semibold text-stone-500">
                            （试过）
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-4 h-4 shrink-0 text-stone-500" />
                    </button>
                  );
                })}
              </div>

              {campCurrentActionId &&
                (() => {
                  const currentAct = STORY_GROVE_CAMP_TRANSFER_CHALLENGE.actions.find(
                    (a) => a.id === campCurrentActionId
                  );
                  if (!currentAct) return null;
                  const isThisGoalMet =
                    currentAct.targetGoalId &&
                    currentCampGoalProgress.completedGoals.includes(currentAct.targetGoalId);
                  const missingForThisAction = (currentAct.requiredHotspotIds || []).filter(
                    (reqId) => !campInspectedIds.includes(reqId)
                  );

                  return (
                    <div
                      data-testid="camp-action-consequence-panel"
                      className="p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 space-y-2.5 animate-in fade-in"
                    >
                      <div className="text-xs sm:text-sm font-black text-stone-900">
                        结果观察：{currentAct.consequenceNarrative}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2">
                        {currentAct.characterReactions.map((r, i) => (
                          <div
                            key={i}
                            className={`p-2.5 rounded-xl border text-xs sm:text-sm ${
                              r.mood === 'SCARED' || r.mood === 'UPSET'
                                ? 'bg-rose-50 border-rose-200 text-rose-950'
                                : 'bg-white border-emerald-200 text-stone-800'
                            }`}
                          >
                            <div className="font-black text-indigo-950 mb-0.5">{r.speaker}：</div>
                            <div className="font-medium">“{r.line}”</div>
                          </div>
                        ))}
                      </div>

                      {currentAct.resolvesProblem && !isThisGoalMet && missingForThisAction.length > 0 && (
                        <div
                          data-testid="camp-missing-observation-prompt"
                          className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 font-bold"
                        >
                          先用上方手电筒照一照对应的位置，亲自看清事实后就能完成这项小目标啦！
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
                        <span className="text-xs font-bold text-stone-700">
                          {currentCampGoalProgress.isAllGoalsCompleted
                            ? '🎉 太棒啦！窗外黑影、个人边界与共享照明三件事都解决了，树屋露营暖灯已点亮！'
                            : currentAct.revisionHint}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            data-testid="camp-revise-method-btn"
                            onClick={handleReviseCampMethod}
                            className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-800 font-bold text-xs border border-stone-300 flex items-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>换个方法再试</span>
                          </button>
                          {currentAct.resolvesProblem && (
                            <button
                              type="button"
                              data-testid="camp-return-island-btn"
                              onClick={handleCloseStoryGrove}
                              className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer shadow-sm"
                            >
                              {currentCampGoalProgress.isAllGoalsCompleted
                                ? '带着全部发现回小岛'
                                : '保存当前发现回小岛'}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="pt-1 border-t border-amber-200/80">
                        <button
                          type="button"
                          data-testid="camp-parent-co-read-toggle"
                          onClick={() => setShowCampParentDrawer((v) => !v)}
                          className="text-xs font-bold text-amber-900 hover:text-amber-700 cursor-pointer"
                        >
                          {showCampParentDrawer ? '收起家长共读说明 ▲' : '展开家长共读说明 ▼'}
                        </button>
                        {showCampParentDrawer && (
                          <div className="mt-1.5 p-2.5 rounded-xl bg-white/90 border border-amber-200 text-xs text-stone-700 font-medium">
                            本露营夜包含三项独立可观察目标：核实黑影、表达个人边界、安排共享照明。孩子可以自由决定先后顺序，也可以只完成一部分后休息。
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        )}

        {/* ================= CLASSIC STAGE 1: 三扇门进入 (DOORS INTRO) ================= */}
        {stage === 'doorIntro' &&
          (isCurrentLeafApproved || adultPreviewUnlocked) &&
          (!interactiveLeafDef || leafMode === 'classicDoors') && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pr-12">
                <button
                  onClick={handleReturnToCatalog}
                  className="min-h-[48px] px-3.5 py-2 rounded-xl bg-white/80 hover:bg-white text-xs sm:text-sm font-bold text-stone-700 flex items-center gap-1.5 border border-amber-200 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> 返回叶子目录
                </button>
                <div className="flex items-center gap-2">
                  {interactiveLeafDef && (
                    <button
                      type="button"
                      onClick={() => setLeafMode('interactiveScene')}
                      className="min-h-[40px] px-2.5 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold cursor-pointer"
                    >
                      切换到动手场景
                    </button>
                  )}
                  <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold">
                    {currentLeaf.category} · {currentLeaf.character}
                  </span>
                </div>
              </div>

              <div className="bg-white/90 p-4 rounded-3xl border border-amber-200 overflow-hidden shadow-sm space-y-3">
                {adultPreviewUnlocked && !isCurrentLeafApproved && (
                  <div className="bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold px-3.5 py-2.5 rounded-2xl flex items-center justify-between gap-2">
                    <span>
                      🛡️ 当前为家长/专家受控审阅预览模式（已通过家长 PIN 校验），本故事尚未向儿童独立开放。
                    </span>
                    <span className="text-[11px] bg-amber-200 px-2 py-0.5 rounded-full shrink-0">
                      成人共读审阅
                    </span>
                  </div>
                )}
                <div className="mb-3 rounded-2xl overflow-hidden border border-stone-200/80 bg-slate-50">
                  {currentLeaf.id === 'cup-size' ? (
                    <CupScaleInteractiveIllustration
                      perspective="neutral"
                      className="w-full h-40 sm:h-48"
                    />
                  ) : currentLeaf.id === 'rain-weather' ? (
                    <RainWeatherIllustration focusSide="both" className="w-full h-40 sm:h-48" />
                  ) : (
                    <div className="h-32 bg-amber-100/50 flex items-center justify-center">
                      <LocationBadgeIllustration type="story" className="w-16 h-16" />
                    </div>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-black text-stone-800 mb-1 flex items-center gap-2">
                  <span>{currentLeaf.title}</span>
                  <button
                    onClick={() => handleSpeak(currentLeaf.summary)}
                    className="p-2 rounded-xl text-amber-700 hover:bg-amber-100 min-w-[48px] min-h-[48px] flex items-center justify-center cursor-pointer"
                    aria-label="朗读故事概述"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-2 font-medium">
                  {currentLeaf.summary}
                </p>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
                  <DoorOpen className="w-4 h-4 text-amber-700" />
                  <span>我们可以从三扇小门走进这件事（任选一扇开始，最终都会走完完整回路）：</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {(['fen', 'tong', 'ze'] as DoorType[]).map((doorKey) => {
                    const door = currentLeaf.doors[doorKey];
                    const active = selectedDoor === doorKey;
                    const doorLabels: Record<DoorType, string> = {
                      fen: '分 · 看事实猜测',
                      tong: '通 · 换位置看',
                      ze: '择 · 想办法选',
                    };
                    const badgeColors: Record<DoorType, string> = {
                      fen: 'bg-sky-100 text-sky-900 border-sky-300',
                      tong: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                      ze: 'bg-amber-100 text-amber-900 border-amber-300',
                    };
                    return (
                      <button
                        key={doorKey}
                        onClick={() => {
                          sounds.playClick();
                          setSelectedDoor(doorKey);
                          setWalkSubStep(doorKey);
                        }}
                        className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                          active
                            ? 'bg-white border-amber-500 shadow-md scale-[1.01]'
                            : 'bg-white/60 border-stone-200/80 hover:bg-white'
                        }`}
                      >
                        <div>
                          <span
                            className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md border mb-1.5 ${badgeColors[doorKey]}`}
                          >
                            {doorLabels[doorKey]}
                          </span>
                          <div className="text-xs font-bold text-stone-800 line-clamp-2">
                            {door.description}
                          </div>
                        </div>
                        <div className="text-[11px] text-amber-800 font-semibold mt-2">
                          {active ? '● 已选这扇门' : '点我试试'}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 rounded-2xl bg-amber-100/70 border border-amber-200/90 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-900">🚪 伴伴提问：</span>
                    <button
                      onClick={() => handleSpeak(currentLeaf.doors[selectedDoor].question)}
                      className="p-2 rounded-full hover:bg-amber-200/60 text-amber-800 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                      aria-label="朗读伴伴提问"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-stone-800">
                    “{currentLeaf.doors[selectedDoor].question}”
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playBell();
                  setWalkSubStep(selectedDoor);
                  setStage('walkLoop');
                }}
                className="w-full min-h-[56px] py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer"
              >
                <span>推开这扇门，走一走完整思考回路</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        {/* ================= STAGE 2: 走完 分 -> 同 -> 择 完整小回路 (WALK LOOP) ================= */}
        {stage === 'walkLoop' && (isCurrentLeafApproved || adultPreviewUnlocked) && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pr-12">
              <button
                onClick={() => setStage('doorIntro')}
                className="min-h-[48px] px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-xs font-bold text-stone-600 flex items-center gap-1 border border-amber-200 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> 重新选门
              </button>
              <div className="text-xs font-bold text-stone-500">
                完整的思考回路：先看事实 → 再看两边 → 最后做选择
              </div>
            </div>

            {currentLeaf.id === 'cup-size' && (
              <div className="rounded-2xl overflow-hidden border border-amber-200 bg-white p-2">
                <CupScaleInteractiveIllustration
                  perspective={
                    walkSubStep === 'fen' ? 'squirrel' : walkSubStep === 'tong' ? 'neutral' : 'elephant'
                  }
                  className="w-full h-36 sm:h-40"
                />
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 bg-stone-100 p-1.5 rounded-2xl">
              {(
                [
                  { key: 'fen', label: '1. 分清事实与猜测' },
                  { key: 'tong', label: '2. 换个位置看两边' },
                  { key: 'ze', label: '3. 权衡办法做选择' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    sounds.playClick();
                    setWalkSubStep(tab.key);
                  }}
                  className={`min-h-[44px] py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    walkSubStep === tab.key
                      ? 'bg-white text-amber-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {walkSubStep === 'fen' && (
              <div className="bg-white p-5 rounded-2xl border border-sky-200 space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-extrabold text-sky-800 bg-sky-50 px-3 py-1 rounded-full inline-block">
                  第一步 · 事实、猜测与感觉
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100">
                    <div className="text-xs font-bold text-sky-900 mb-1">👀 看到的事实：</div>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {currentLeaf.walkSteps.fenContent.fact}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                    <div className="text-xs font-bold text-indigo-900 mb-1">💭 脑子里的猜测：</div>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {currentLeaf.walkSteps.fenContent.guess}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100">
                    <div className="text-xs font-bold text-rose-900 mb-1">💓 心里的感觉：</div>
                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      {currentLeaf.walkSteps.fenContent.feeling}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setWalkSubStep('tong');
                    }}
                    className="min-h-[48px] px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>看清楚啦，去换个位置看看两边</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {walkSubStep === 'tong' && (
              <div className="bg-white p-5 rounded-2xl border border-emerald-200 space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                  第二步 · 两边各自怎么想？
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-1">
                    <div className="text-xs font-bold text-emerald-900">🌱 一边的视角：</div>
                    <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                      {currentLeaf.walkSteps.tongContent.sideA}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 space-y-1">
                    <div className="text-xs font-bold text-teal-900">🌿 另一边的视角：</div>
                    <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                      {currentLeaf.walkSteps.tongContent.sideB}
                    </p>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs text-stone-700">
                  <span className="font-bold text-amber-900">💡 伴伴小发现：</span>{' '}
                  {currentLeaf.walkSteps.tongContent.whoseView}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setWalkSubStep('ze');
                    }}
                    className="min-h-[48px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>明白两边啦，去看看可以怎么做</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {walkSubStep === 'ze' && (
              <div className="bg-white p-5 rounded-2xl border border-amber-200 space-y-4 animate-in fade-in duration-200">
                <div className="text-xs font-extrabold text-amber-900 bg-amber-100 px-3 py-1 rounded-full inline-block">
                  第三步 · 带着两边的发现做选择
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {currentLeaf.doors.ze.question}
                </p>

                {hasBoundaryConflict && currentLeaf.walkSteps.zeContent.fenceReminder && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900">
                    <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block mb-0.5">安全与边界守护提醒：</span>
                      {currentLeaf.walkSteps.zeContent.fenceReminder}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    sounds.playBell();
                    setStage('choose');
                  }}
                  className="w-full min-h-[56px] py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  <span>进入我的做法实验室</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= STAGE 3: 选择行动与我的原话 (CHOOSE & QUOTE) ================= */}
        {stage === 'choose' && (isCurrentLeafApproved || adultPreviewUnlocked) && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pr-12">
              <button
                onClick={() => setStage('walkLoop')}
                className="min-h-[48px] px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white text-xs font-bold text-stone-600 flex items-center gap-1 border border-amber-200 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> 回到思考回路
              </button>
              <span className="text-xs font-bold text-amber-800">不追求唯一标准答案，试试你的做法</span>
            </div>

            <h4 className="text-base sm:text-lg font-bold text-stone-800">
              如果这件事发生在你面前，你会选哪种做法？
            </h4>

            <div className="space-y-2.5">
              {currentLeaf.choices.map((choice) => {
                const isSelected = selectedChoiceId === choice.id;
                return (
                  <button
                    key={choice.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedChoiceId(choice.id);
                      if (!customQuote) {
                        setCustomQuote(choice.description);
                      }
                    }}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/90 border-amber-500 shadow-sm'
                        : 'bg-white border-stone-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-stone-800">{choice.label}</span>
                    </div>
                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-amber-200/60 text-xs text-stone-600 space-y-1">
                        <div>
                          <span className="font-bold text-emerald-800">好处：</span>
                          {choice.benefit}
                        </div>
                        <div>
                          <span className="font-bold text-amber-900">需要注意：</span>
                          {choice.cost}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-2">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-amber-600" />
                <span>用你自己的话说一句（伴伴会帮你在小岛上记住这句闪光的话）：</span>
              </label>
              <input
                type="text"
                value={customQuote}
                onChange={(e) => setCustomQuote(e.target.value)}
                placeholder="例如：跟小蚂蚁比它很大，跟大象比它很小！"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-amber-500 bg-amber-50/30"
              />
            </div>

            <button
              disabled={!selectedChoiceId}
              onClick={() => {
                if (!selectedChoiceId) return;
                sounds.playBell();
                if (!isPlaytestIsolated()) {
                  markLeafComplete(currentLeaf.id, customQuote.trim() || undefined);
                }
                setStage('offscreen');
              }}
              className="w-full min-h-[56px] py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
            >
              <span>选好啦，去现实生活里试一试</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= STAGE 4: 屏幕外微行动与另一片叶子比较 (OFFSCREEN & COMPARE) ================= */}
        {stage === 'offscreen' && (isCurrentLeafApproved || adultPreviewUnlocked) && (
          <div className="space-y-5">
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" /> 屏幕外微行动 · 把方法带回真实世界
                </span>
                <button
                  onClick={() => handleSpeak(currentLeaf.offscreenTask.action)}
                  className="p-2 rounded-full hover:bg-emerald-200/50 text-emerald-800 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                  aria-label="朗读现实小任务"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-bold">
                {currentLeaf.offscreenTask.action}
              </p>
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-100 text-xs text-emerald-900 font-medium">
                💬 给大人的小提示：{currentLeaf.offscreenTask.tipForAdult}
              </div>
            </div>

            <div className="p-5 rounded-3xl bg-white border border-amber-200 space-y-3">
              <div className="text-xs font-extrabold text-amber-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>跨情境连连看：这片叶子和另一件事有什么像的地方？</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-stone-800">
                {currentLeaf.compareWithOtherLeaf.question}
              </p>

              <button
                onClick={() => {
                  sounds.playBell();
                  setCompareAnswered(true);
                }}
                className={`w-full min-h-[48px] p-3 rounded-xl border text-xs sm:text-sm text-left transition-all cursor-pointer ${
                  compareAnswered
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                💡 {compareAnswered ? '已发现核心相同点：' : '点一下揭秘共同的思考小秘密：'}
                <div className="mt-1 font-semibold text-stone-800">
                  {currentLeaf.compareWithOtherLeaf.keyAnalogy}
                </div>
              </button>
            </div>

            {compareAnswered && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-xs text-emerald-800 font-bold animate-in fade-in">
                🌱 太棒啦！你已经不靠死记硬背，而是自己发现了两件事底下的同一套办法！
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReturnToCatalog}
                className="flex-1 min-h-[48px] py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-2xl text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center"
              >
                看其他故事叶
              </button>
              <button
                onClick={handleCloseStoryGrove}
                className="flex-1 min-h-[56px] py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center"
              >
                完成本次探索，回小岛
              </button>
            </div>
          </div>
        )}
      </div>

      <ParentGateModal
        isOpen={isParentGateOpen}
        onClose={() => setIsParentGateOpen(false)}
        onSuccess={() => {
          setIsParentGateOpen(false);
          const token = issueAdultPreviewSession(currentScopeKey);
          setPreviewSessionToken(token || null);
        }}
      />
    </div>
  );
};
