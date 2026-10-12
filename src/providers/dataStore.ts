import { AuthSession } from './authProvider';

export interface DataStoreFilter {
  readonly field: string;
  readonly op: '==' | '<=' | '>=' | 'in' | 'array-contains';
  readonly value: unknown;
}

export interface DataStore {
  getDoc<T>(collection: string, docId: string, session: AuthSession): Promise<T | null>;
  setDoc<T>(collection: string, docId: string, data: T, session: AuthSession): Promise<void>;
  updateDoc<T>(collection: string, docId: string, partialData: Partial<T>, session: AuthSession): Promise<void>;
  deleteDoc(collection: string, docId: string, session: AuthSession): Promise<void>;
  queryDocs<T>(collection: string, filters: readonly DataStoreFilter[], session: AuthSession): Promise<T[]>;
}
