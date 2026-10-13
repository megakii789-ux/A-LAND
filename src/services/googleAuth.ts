import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// SEC-04: 关闭未经审核的过宽 Google Drive 授权。
// 严禁请求全盘 drive, scripts, photos 等 13 项超权 Scope。
export const SCOPES: string[] = [];

const provider = new GoogleAuthProvider();

// In-memory token cache (NEVER persist to localStorage or sessionStorage)
let cachedAccessToken: string | null = null;

export const initAuth = (
  _onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (onAuthFailure) onAuthFailure();
  return () => {};
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  throw new Error('CLOUD_BACKUP_DISABLED: 云端备份与未经审核的 Google Drive 授权已关闭，保护儿童与家庭数据安全。');
};

export const getAccessToken = async (): Promise<string | null> => {
  return null;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

