/**
 * Local accidental-entry barrier for Parent Dashboard (SEC-06).
 * NOT identity verification, NOT server authentication.
 * Salted hash stored in this tab's sessionStorage; unlocked state only in memory.
 */

export interface PinRecord {
  salt: string;
  hash: string;
  iterations: number;
}

const STORAGE_PIN_KEY = 'aland_parent_gate_pin_v2';
const ITERATIONS = 210_000;
let granted = false;

// Consecutive failed attempts rate-limiting (anti-bruteforce)
let failedAttempts = 0;
let lockoutUntil = 0;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000; // 60 seconds

export function hasParentAccess(): boolean {
  return granted;
}

export function grantParentAccess(): void {
  granted = true;
}

export function lockParentAccess(): void {
  granted = false;
}

export function pinFormatValid(pin: string): boolean {
  return /^\d{6,12}$/.test(pin) && !/^(\d)\1+$/.test(pin);
}

const hex = (b: Uint8Array) =>
  Array.from(b, (v) => v.toString(16).padStart(2, '0')).join('');

function unhex(s: string): Uint8Array {
  return Uint8Array.from(s.match(/.{2}/g) || [], (c) => parseInt(c, 16));
}

async function derive(pin: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bytes = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', iterations, salt: salt as BufferSource },
    key,
    256
  );
  return new Uint8Array(bytes);
}

export async function makePinRecord(pin: string): Promise<PinRecord> {
  if (!pinFormatValid(pin)) {
    throw new Error('请设置 6–12 位数字，且不能全部为相同数字。');
  }
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(pin, salt, ITERATIONS);
  return {
    salt: hex(salt),
    hash: hex(hash),
    iterations: ITERATIONS
  };
}

export function readPinRecord(): PinRecord | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_PIN_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as PinRecord;
    return typeof v?.salt === 'string' &&
      typeof v?.hash === 'string' &&
      Number.isInteger(v?.iterations)
      ? v
      : null;
  } catch {
    return null;
  }
}

export function savePinRecord(record: PinRecord): void {
  sessionStorage.setItem(STORAGE_PIN_KEY, JSON.stringify(record));
}

export interface VerifyPinResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  lockoutSeconds?: number;
}

export async function verifyPin(pin: string): Promise<VerifyPinResult> {
  const now = Date.now();
  if (now < lockoutUntil) {
    const remainingSec = Math.ceil((lockoutUntil - now) / 1000);
    return {
      success: false,
      error: `尝试次数过多，请等待 ${remainingSec} 秒后再试。`,
      lockoutSeconds: remainingSec
    };
  }

  const record = readPinRecord();
  if (!record) {
    return {
      success: false,
      error: '尚未配置家长 PIN，请先完成初始设置。'
    };
  }

  if (!/^\d{6,12}$/.test(pin)) {
    return {
      success: false,
      error: 'PIN 格式不正确（需为 6–12 位纯数字）。'
    };
  }

  const actual = await derive(pin, unhex(record.salt), record.iterations);
  const expected = unhex(record.hash);

  // Constant-time comparison
  let diff = actual.length ^ expected.length;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual[i] ^ (expected[i] || 0);
  }

  if (diff === 0) {
    failedAttempts = 0;
    lockoutUntil = 0;
    grantParentAccess();
    return { success: true };
  } else {
    failedAttempts++;
    if (failedAttempts >= MAX_ATTEMPTS) {
      lockoutUntil = Date.now() + LOCKOUT_MS;
      failedAttempts = 0;
      return {
        success: false,
        error: `连续错误已达 ${MAX_ATTEMPTS} 次，工作台已临时锁定 60 秒。`,
        lockoutSeconds: 60
      };
    }
    const remaining = MAX_ATTEMPTS - failedAttempts;
    return {
      success: false,
      error: `PIN 码不正确，还可尝试 ${remaining} 次。`,
      remainingAttempts: remaining
    };
  }
}
