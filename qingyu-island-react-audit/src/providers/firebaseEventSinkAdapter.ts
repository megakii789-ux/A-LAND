import { requireImplementedCloudAdapter } from './cloudGuard';
import { ResearchEvent } from '../domain/research/types';
import { EventSink, validateResearchEvent } from '../domain/research/eventSink';
import { AuthSession } from './authProvider';
import { verifyEndpointAuthorization } from './serverAuthorization';

export class FirebaseEventSinkAdapter implements EventSink {
  private events: ResearchEvent[] = [];

  constructor() { requireImplementedCloudAdapter(); }

  async recordEvent(
    event: ResearchEvent,
    session?: AuthSession
  ): Promise<{ success: boolean; eventId?: string; error?: string }> {
    if (session) {
      try {
        verifyEndpointAuthorization({
          session,
          targetFamilyId: session.familyId,
          actionType: 'WRITE'
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, error: msg };
      }
    }

    const validation = validateResearchEvent(event);
    if (!validation.isValid) {
      return { success: false, error: validation.errors.join('; ') };
    }

    const cleanEvent: ResearchEvent = Object.freeze({
      participantPseudonymousId: event.participantPseudonymousId,
      sessionId: event.sessionId,
      contentId: event.contentId,
      structureId: event.structureId,
      supportLevel: event.supportLevel,
      failureCode: event.failureCode,
      latencyBucket: event.latencyBucket,
      exitType: event.exitType,
      coarseEmotionalLoad: event.coarseEmotionalLoad,
      adultInterventionType: event.adultInterventionType,
      timestamp: event.timestamp || Date.now()
    });

    this.events.push(cleanEvent);
    return { success: true, eventId: `evt_${Date.now()}_${this.events.length}` };
  }

  async getEventsByParticipant(
    participantPseudonymousId: string,
    session?: AuthSession
  ): Promise<ReadonlyArray<ResearchEvent>> {
    if (session) {
      verifyEndpointAuthorization({
        session,
        targetFamilyId: session.familyId,
        actionType: 'READ'
      });
    }

    return Object.freeze(
      this.events.filter((e) => e.participantPseudonymousId === participantPseudonymousId)
    );
  }

  async exportDeIdentifiedEvents(
    options?: { sessionId?: string },
    session?: AuthSession
  ): Promise<ReadonlyArray<ResearchEvent>> {
    if (session) {
      verifyEndpointAuthorization({
        session,
        targetFamilyId: session.familyId,
        actionType: 'RESEARCH_EXPORT'
      });
    }

    let filtered = this.events;
    if (options?.sessionId) {
      filtered = filtered.filter((e) => e.sessionId === options.sessionId);
    }

    return Object.freeze(
      filtered.map((e) => ({
        participantPseudonymousId: e.participantPseudonymousId,
        sessionId: e.sessionId,
        contentId: e.contentId,
        structureId: e.structureId,
        supportLevel: e.supportLevel,
        failureCode: e.failureCode,
        latencyBucket: e.latencyBucket,
        exitType: e.exitType,
        coarseEmotionalLoad: e.coarseEmotionalLoad,
        adultInterventionType: e.adultInterventionType,
        timestamp: e.timestamp
      }))
    );
  }

  async deleteEventsByParticipant(
    participantPseudonymousId: string,
    session?: AuthSession
  ): Promise<{ deletedCount: number }> {
    if (session) {
      verifyEndpointAuthorization({
        session,
        targetFamilyId: session.familyId,
        actionType: 'DELETE'
      });
    }

    const initialLen = this.events.length;
    this.events = this.events.filter(
      (e) => e.participantPseudonymousId !== participantPseudonymousId
    );
    return { deletedCount: initialLen - this.events.length };
  }

  async deleteEventsBySession(
    sessionId: string,
    session?: AuthSession
  ): Promise<{ deletedCount: number }> {
    if (session) {
      verifyEndpointAuthorization({
        session,
        targetFamilyId: session.familyId,
        actionType: 'DELETE'
      });
    }

    const initialLen = this.events.length;
    this.events = this.events.filter((e) => e.sessionId !== sessionId);
    return { deletedCount: initialLen - this.events.length };
  }

  async clearAllEvents(): Promise<{ clearedCount: number }> {
    const count = this.events.length;
    this.events = [];
    return { clearedCount: count };
  }

  getEventCount(): number {
    return this.events.length;
  }
}
