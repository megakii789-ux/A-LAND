/**
 * Local accidental-entry barrier, NOT identity verification.
 * Salted hash lives in this tab's sessionStorage; unlocked state only in memory.
 */
export interface PinRecord { salt: string; hash: string; iterations: number; }
const KEY = 'qingyu_parent_gate_v2';
const ITERATIONS = 210_000;
let granted = false;
export function hasParentAccess(): boolean { return granted; }
export function lockParentAccess(): void { granted = false; }
export function pinFormatValid(pin: string): boolean {
  return /^\d{6,12}$/.test(pin) && !/^(\d)\1+$/.test(pin);
}
const hex = (b: Uint8Array) => Array.from(b, v => v.toString(16).padStart(2, '0')).join('');
function unhex(s: string): Uint8Array {
  return Uint8Array.from(s.match(/.{2}/g) || [], c => parseInt(c, 16));
}
export async function makePinRecord(pin: string): Promise<PinRecord> {
  if (!pinFormatValid(pin)) throw new Error('请设置 6–12 位数字，不能全部相同。');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(pin, salt, ITERATIONS);
  return { salt: hex(salt), hash: hex(hash), iterations: ITERATIONS };
}
async function derive(pin: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin),
    'PBKDF2', false, ['deriveBits']);
  const bytes = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', iterations, salt: salt as BufferSource }, key, 256);
  return new Uint8Array(bytes);
}
export async function checkPin(pin: string, record: PinRecord): Promise<boolean> {
  if (!/^\d{6,12}$/.test(pin)) return false;
  if (!/^[0-9a-f]{32}$/.test(record.salt) || !/^[0-9a-f]{64}$/.test(record.hash) ||
      !Number.isInteger(record.iterations) || record.iterations < 100_000 || record.iterations > 600_000) return false;
  const actual = await derive(pin, unhex(record.salt), record.iterations);
  const expected = unhex(record.hash);
  let diff = actual.length ^ expected.length;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ (expected[i] || 0);
  return diff === 0;
}
export function readPinRecord(): PinRecord | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as PinRecord;
    return typeof v?.salt === 'string' && typeof v?.hash === 'string' &&
      Number.isInteger(v?.iterations) ? v : null;
  } catch { return null; }
}
export function savePinRecord(record: PinRecord): void {
  // Failure is visible to the gate, never silently bypassed.
  sessionStorage.setItem(KEY, JSON.stringify(record));
}
export function grantParentAccess(): void { granted = true; }
