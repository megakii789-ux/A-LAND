import { DataStore, DataStoreFilter } from './dataStore';
import { AuthSession } from './authProvider';
import { verifyEndpointAuthorization } from './serverAuthorization';

/**
 * FirestoreDataStoreAdapter
 * 遵循严格的数据最小化与隔离契约：
 * - 绝不上报 Local-only child artifacts（孩子自由画作、录音、心愿私密信）
 * - 强制执行 family isolation、caregiver private-note isolation
 */
export class FirestoreDataStoreAdapter implements DataStore {
  private inMemoryStorage: Map<string, Map<string, Record<string, unknown>>> = new Map();

  constructor() {}

  private getCollectionMap(collection: string) {
    if (!this.inMemoryStorage.has(collection)) {
      this.inMemoryStorage.set(collection, new Map());
    }
    return this.inMemoryStorage.get(collection)!;
  }

  async getDoc<T>(collection: string, docId: string, session: AuthSession): Promise<T | null> {
    const col = this.getCollectionMap(collection);
    const doc = col.get(docId);
    if (!doc) return null;

    // 授权检查
    const targetFamilyId = (doc.familyId as string) || '';
    const resourceOwnerId = (doc.ownerCaregiverId as string) || (doc.userId as string);

    verifyEndpointAuthorization({
      session,
      targetFamilyId,
      resourceOwnerId,
      actionType: 'READ'
    });

    return doc as unknown as T;
  }

  async setDoc<T>(
    collection: string,
    docId: string,
    data: T,
    session: AuthSession
  ): Promise<void> {
    const rawData = data as unknown as Record<string, unknown>;
    // 铁律检查：严禁上传 child local artifacts (画作、自由录音、自由文本日记)
    if (rawData && (rawData.rawVoice || rawData.drawingCanvas || rawData.childPrivateDrawing || rawData.audioBlob)) {
      throw new Error('SECURITY VIOLATION: Local-only child artifacts MUST NOT be uploaded to Firestore');
    }

    const targetFamilyId = (rawData?.familyId as string) || session.familyId;
    const resourceOwnerId = (rawData?.ownerCaregiverId as string) || (rawData?.userId as string) || session.uid;

    verifyEndpointAuthorization({
      session,
      targetFamilyId,
      resourceOwnerId,
      actionType: 'WRITE'
    });

    const col = this.getCollectionMap(collection);
    col.set(docId, { ...(rawData || {}), updatedAt: new Date().toISOString() });
  }

  async updateDoc<T>(
    collection: string,
    docId: string,
    partialData: Partial<T>,
    session: AuthSession
  ): Promise<void> {
    const col = this.getCollectionMap(collection);
    const existing = col.get(docId);
    if (!existing) {
      throw new Error(`Document ${docId} does not exist in ${collection}`);
    }

    const targetFamilyId = (existing.familyId as string) || '';
    const resourceOwnerId = (existing.ownerCaregiverId as string) || (existing.userId as string);

    verifyEndpointAuthorization({
      session,
      targetFamilyId,
      resourceOwnerId,
      actionType: 'WRITE'
    });

    col.set(docId, { ...existing, ...partialData, updatedAt: new Date().toISOString() });
  }

  async deleteDoc(collection: string, docId: string, session: AuthSession): Promise<void> {
    const col = this.getCollectionMap(collection);
    const existing = col.get(docId);
    if (!existing) return;

    const targetFamilyId = (existing.familyId as string) || '';
    const resourceOwnerId = (existing.ownerCaregiverId as string) || (existing.userId as string);

    verifyEndpointAuthorization({
      session,
      targetFamilyId,
      resourceOwnerId,
      actionType: 'DELETE'
    });

    col.delete(docId);
  }

  async queryDocs<T>(
    collection: string,
    filters: readonly DataStoreFilter[],
    session: AuthSession
  ): Promise<T[]> {
    const col = this.getCollectionMap(collection);
    const results: T[] = [];

    for (const doc of col.values()) {
      const targetFamilyId = (doc.familyId as string) || '';
      const resourceOwnerId = (doc.ownerCaregiverId as string) || (doc.userId as string);

      try {
        verifyEndpointAuthorization({
          session,
          targetFamilyId,
          resourceOwnerId,
          actionType: 'READ'
        });

        // 匹配过滤器
        let match = true;
        for (const f of filters) {
          if (f.op === '==' && doc[f.field] !== f.value) {
            match = false;
            break;
          }
        }
        if (match) {
          results.push(doc as unknown as T);
        }
      } catch {
        // 无权限的记录直接跳过/拦截
      }
    }

    return results;
  }
}
