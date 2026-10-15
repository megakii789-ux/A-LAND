/**
 * Local accidental-entry barrier for Parent Dashboard (SEC-06 & Phase 3 P1 #5).
 * NOT identity verification, NOT server authentication.
 * Salted PBKDF2 hash stored in this tab's sessionStorage; unlocked state only in memory.
 */

export interface PinRecord {
  salt: string;
  hash: string;
  iterations: number;
}

export interface VerifyPinResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  lockoutSeconds?: number;
}

export interface AdultPreviewSession {
  readonly token: string;
  readonly scopeKey: string;
  readonly issuedAt: number;
}

type ParentAccessListener = () => void;

const STORAGE_PIN_KEY = 'aland_parent_gate_pin_v2';
const ITERATIONS = 120_000;
let granted = false;
let verificationEpoch = 0;
let previewSessionCounter = 0;
let activePreviewSession: AdultPreviewSession | null = null;
let internalPlaytestEnabled = false;
const accessListeners = new Set<ParentAccessListener>();

// Consecutive failed attempts rate-limiting (anti-bruteforce)
let failedAttempts = 0;
let lockoutUntil = 0;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000; // 60 seconds

function notifyAccessListeners(): void {
  for (const listener of Array.from(accessListeners)) {
    try {
      listener();
    } catch {
      // Ignore listener errors
    }
  }
}

export function subscribeParentAccess(listener: ParentAccessListener): () => void {
  accessListeners.add(listener);
  return () => {
    accessListeners.delete(listener);
  };
}

export function cancelPendingPinVerification(): void {
  verificationEpoch += 1;
}

export function hasParentAccess(): boolean {
  return granted;
}

export function grantParentAccess(): void {
  granted = true;
  notifyAccessListeners();
}

export function isInternalPlaytestEnabled(): boolean {
  return internalPlaytestEnabled;
}

export function enableInternalPlaytestMode(): boolean {
  if (!granted) {
    return false;
  }
  internalPlaytestEnabled = true;
  notifyAccessListeners();
  return true;
}

export function disableInternalPlaytestMode(): void {
  if (!internalPlaytestEnabled) return;
  internalPlaytestEnabled = false;
  notifyAccessListeners();
}

export function issueAdultPreviewSession(scopeKey: string): string {
  const normalizedScope = typeof scopeKey === 'string' ? scopeKey.trim() : '';
  if (!granted || !normalizedScope) {
    return '';
  }
  const token = `preview_${++previewSessionCounter}_${Date.now()}`;
  activePreviewSession = {
    token,
    scopeKey: normalizedScope,
    issuedAt: Date.now()
  };
  notifyAccessListeners();
  return token;
}

export function isAdultPreviewSessionValid(scopeKey: string, token?: string | null): boolean {
  if (!granted) {
    return false;
  }
  if (internalPlaytestEnabled && Boolean(scopeKey?.trim())) {
    return true;
  }
  if (!activePreviewSession || !token || typeof token !== 'string') {
    return false;
  }
  return (
    activePreviewSession.token === token &&
    activePreviewSession.scopeKey === scopeKey
  );
}

export function revokeAdultPreviewSession(scopeKey?: string): void {
  if (!activePreviewSession) return;
  if (!scopeKey || activePreviewSession.scopeKey === scopeKey) {
    activePreviewSession = null;
    notifyAccessListeners();
  }
}

export function lockParentAccess(): void {
  granted = false;
  activePreviewSession = null;
  internalPlaytestEnabled = false;
  verificationEpoch += 1;
  failedAttempts = 0;
  lockoutUntil = 0;
  notifyAccessListeners();
}

export function resetParentPinForTesting(): void {
  granted = false;
  activePreviewSession = null;
  internalPlaytestEnabled = false;
  verificationEpoch += 1;
  failedAttempts = 0;
  lockoutUntil = 0;
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(STORAGE_PIN_KEY);
    }
  } catch {
    // Ignore
  }
  notifyAccessListeners();
}

export function pinFormatValid(pin: string): boolean {
  const cleaned = pin.trim();
  return /^\d{6,12}$/.test(cleaned) && !/^(\d)\1+$/.test(cleaned);
}

export function isValidPinFormat(pin: string): boolean {
  return pinFormatValid(pin);
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
    { name: 'PBKDF2', hash: 'SHA-256', iterations, salt: salt as unknown as BufferSource },
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
  const hash = await derive(pin.trim(), salt, ITERATIONS);
  return {
    salt: hex(salt),
    hash: hex(hash),
    iterations: ITERATIONS
  };
}

export function readPinRecord(): PinRecord | null {
  try {
    if (typeof sessionStorage === 'undefined') return null;
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
  try {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(STORAGE_PIN_KEY, JSON.stringify(record));
    }
  } catch {
    // Ignore
  }
}

export async function checkPin(pin: string, record: PinRecord): Promise<boolean> {
  if (
    !record ||
    typeof record.salt !== 'string' ||
    typeof record.hash !== 'string' ||
    !Number.isInteger(record.iterations)
  ) {
    return false;
  }
  const cleaned = pin.trim();
  if (!/^\d{6,12}$/.test(cleaned)) return false;
  try {
    const actual = await derive(cleaned, unhex(record.salt), record.iterations);
    const expected = unhex(record.hash);
    let diff = actual.length ^ expected.length;
    for (let i = 0; i < actual.length; i++) {
      diff |= actual[i] ^ (expected[i] || 0);
    }
    return diff === 0;
  } catch {
    return false;
  }
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

  const cleaned = pin.trim();
  if (!/^\d{6,12}$/.test(cleaned)) {
    return {
      success: false,
      error: 'PIN 格式不正确（需为 6–12 位纯数字）。'
    };
  }

  const startEpoch = verificationEpoch;
  const matched = await checkPin(cleaned, record);
  if (startEpoch !== verificationEpoch) {
    return {
      success: false,
      error: '验证已取消，请重新验证。'
    };
  }
  if (matched) {
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
