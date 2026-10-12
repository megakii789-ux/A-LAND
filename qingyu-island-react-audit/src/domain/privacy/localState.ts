/**
 * Local-state allowlist. This module has no React or storage dependency.
 * A persisted payload is untrusted input; load only the subset declared here.
 */
export const LOCAL_STATE_KEY = 'qingyu_review_state_v2';
export const CONSENT_KEY = 'qingyu_review_consent_v2';
export const OLD_STATE_KEY = 'sunny_rain_island_v1_state';
export const CARE_LABELS = ['妈妈', '爸爸', '奶奶', '爷爷', '外婆', '外公', '照顾我的大人'] as const;
export const WEATHER_VALUES = ['sunny', 'cloudy', 'rainy', 'stormy', 'foggy', 'opt_out'] as const;
export interface LocalReviewState {
  version: 2;
  completedLeaves: string[];
  careWeek: (string | null)[];
  familyContent: boolean;
}
export const emptyLocalState = (): LocalReviewState => ({
  version: 2, completedLeaves: [], careWeek: Array(7).fill(null), familyContent: false,
});
export function parseLocalState(raw: string): LocalReviewState | null {
  if (raw.length > 200_000) return null;
  try {
    const d: unknown = JSON.parse(raw);
    if (!d || typeof d !== 'object' || Array.isArray(d)) return null;
    const x = d as Record<string, unknown>;
    const allowed = new Set(['version','completedLeaves','careWeek','familyContent']);
    if (Object.keys(x).some(k => !allowed.has(k)) || x.version !== 2) return null;
    if (!Array.isArray(x.completedLeaves) || x.completedLeaves.length > 300 ||
        x.completedLeaves.some(v => typeof v !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(v))) return null;
    if (!Array.isArray(x.careWeek) || x.careWeek.length !== 7 ||
        x.careWeek.some(v => v !== null && !CARE_LABELS.includes(v as typeof CARE_LABELS[number]))) return null;
    if (typeof x.familyContent !== 'boolean') return null;
    return { version: 2, completedLeaves: [...new Set(x.completedLeaves as string[])],
      careWeek: [...x.careWeek] as (string|null)[], familyContent: x.familyContent };
  } catch { return null; }
}
export function isOwnedStorageKey(key: string): boolean {
  return key === OLD_STATE_KEY || key === LOCAL_STATE_KEY || key === CONSENT_KEY ||
    key === 'sunny_island_child_private_artifacts_v1' || key === 'active_open_hug_state' || key.startsWith('qingyu_') ||
    key.startsWith('sunny_rain_island_');
}
