/**
 * Local-only Storage for Child Private Artifacts
 * 遵循 Phase M 契约要求：
 * - 纯本地存储 (Local-only storage)
 * - 绝不上报云端
 * - 提供明确删除功能 (Explicit delete action)
 */

export interface PrivateChildArtifact {
  id: string;
  type: 'DRAWING' | 'VOICE_MEMENTO' | 'WISH_LETTER' | 'WEATHER_STICKER';
  createdAt: string;
  title: string;
  contentData: string; // 本地 base64 或文本内容
}

const LOCAL_ARTIFACT_KEY = 'sunny_island_child_private_artifacts_v1';

export class LocalChildArtifactStore {
  static getArtifacts(): PrivateChildArtifact[] {
    try {
      const raw = localStorage.getItem(LOCAL_ARTIFACT_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  static saveArtifact(artifact: Omit<PrivateChildArtifact, 'id' | 'createdAt'>): PrivateChildArtifact {
    const full: PrivateChildArtifact = {
      ...artifact,
      id: `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };

    const current = this.getArtifacts();
    const updated = [full, ...current];
    try {
      localStorage.setItem(LOCAL_ARTIFACT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage quota or storage error:', e);
    }
    return full;
  }

  /**
   * 明确物理级单项删除
   */
  static deleteArtifact(artifactId: string): boolean {
    const current = this.getArtifacts();
    const filtered = current.filter((a) => a.id !== artifactId);
    try {
      localStorage.setItem(LOCAL_ARTIFACT_KEY, JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 明确物理级全部抹除
   */
  static clearAllArtifacts(): void {
    try {
      localStorage.removeItem(LOCAL_ARTIFACT_KEY);
    } catch {}
  }
}
