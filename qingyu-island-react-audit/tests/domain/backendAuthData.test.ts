import { describe, it, expect } from 'vitest';
import { FirebaseAuthAdapter, FirebaseNotificationAdapter, FirebaseEventSinkAdapter,
  FirestoreDataStoreAdapter, verifyEndpointAuthorization, AuthSession } from '../../src/providers';

describe('Legacy cloud doubles are quarantined',()=>{
 it('does not instantiate fake Firebase identity',()=>expect(()=>new FirebaseAuthAdapter()).toThrow(/NOT_IMPLEMENTED/));
 it('does not report an in-memory subscriber as push delivery',()=>expect(()=>new FirebaseNotificationAdapter()).toThrow(/NOT_IMPLEMENTED/));
 it('does not instantiate memory storage as Firestore',()=>expect(()=>new FirestoreDataStoreAdapter()).toThrow(/NOT_IMPLEMENTED/));
 it('does not instantiate a memory event list as a cloud sink',()=>expect(()=>new FirebaseEventSinkAdapter()).toThrow(/NOT_IMPLEMENTED/));
 it('a pure membership rule can reject another family (not proof of authentication)',()=>{
  const session:AuthSession={uid:'synthetic',role:'CAREGIVER',familyId:'a',scopes:[]};
  expect(()=>verifyEndpointAuthorization({session,targetFamilyId:'b',actionType:'READ'})).toThrow();
 });
 it.todo('Actual signed-token verification, revocation and server-owned family membership integration');
});
