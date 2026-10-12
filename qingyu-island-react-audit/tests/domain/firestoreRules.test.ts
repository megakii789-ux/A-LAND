import { describe, it } from 'vitest';
/**
 * The old suite evaluated a hand-written simulator, not firestore.rules.
 * Do not convert this TODO to a passing test without launching the real emulator.
 */
describe('Firestore Emulator qualification — NOT IMPLEMENTED',()=>{
 it.todo('Execute firestore.rules with the real Firebase Emulator Suite: cross-family read/write isolation');
 it.todo('Verify caregiver private notes, child-device scope, revocation and anonymous denial');
});
