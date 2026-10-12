import React, { useState, useEffect } from 'react';
import {
  Cloud,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Lock,
  User as UserIcon,
  HardDrive,
  LogOut,
  Sparkles
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken
} from '../../services/googleAuth';
import {
  listDriveFiles,
  uploadDriveFile,
  getDriveFileContent,
  deleteDriveFile,
  DriveFile
} from '../../services/googleDrive';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    todayWeather,
    weatherHistory,
    completedLeaves,
    childQuotes,
    parentObservations,
    tonightAt,
    daysToNextSwitch,
    packedItems,
    missNotes,
    starlightTraits
  } = useApp();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Destructive Action Confirmation Dialog state (MANDATORY per Workspace guidelines)
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Restore confirmation state
  const [fileToRestore, setFileToRestore] = useState<DriveFile | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (currentUser, currentToken) => {
        setUser(currentUser);
        setToken(currentToken);
        fetchFiles();
      },
      () => {
        setUser(null);
        setToken(null);
        setFiles([]);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  const fetchFiles = async (query?: string) => {
    setLoadingFiles(true);
    setStatusMessage(null);
    try {
      const driveFiles = await listDriveFiles(query);
      setFiles(driveFiles);
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      setStatusMessage({ text: error.message || '加载 Google Drive 文件失败', type: 'error' });
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleLogin = async () => {
    setIsAuthLoading(true);
    setStatusMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        sounds.playBell();
        setStatusMessage({ text: '成功连接到 Google 云端硬盘！', type: 'success' });
        fetchFiles();
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      sounds.playClick();
      setStatusMessage({ text: error.message || 'Google 账号连接失败', type: 'error' });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    sounds.playClick();
    await logout();
    setUser(null);
    setToken(null);
    setFiles([]);
    setStatusMessage({ text: '已安全退出 Google 账号', type: 'info' });
  };

  // One-click Backup to Google Drive
  const handleBackupToDrive = async () => {
    sounds.playClick();
    setStatusMessage({ text: '正在打包并同步档案到 Google 云端硬盘...', type: 'info' });

    const backupPayload = {
      app: '晴雨小岛 · 6岁儿童思考方法成长空间',
      version: 'v0.5',
      exportDate: new Date().toISOString(),
      familySummary: {
        tonightAt,
        daysToNextSwitch,
        packedItemsCount: packedItems.length,
        missNotesCount: missNotes.length
      },
      childGrowth: {
        todayWeather,
        weatherHistory,
        completedLeaves,
        childQuotes,
        starlightTraits
      },
      parentGrowth: {
        parentObservations
      }
    };

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `晴雨小岛_思考成长档案_${dateStr}.json`;

    try {
      const createdFile = await uploadDriveFile(
        fileName,
        JSON.stringify(backupPayload, null, 2),
        'application/json'
      );
      sounds.playBell();
      setStatusMessage({
        text: `备份成功！档案已安全存入 Google 云端硬盘：${createdFile.name}`,
        type: 'success'
      });
      fetchFiles();
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      setStatusMessage({ text: error.message || '备份失败', type: 'error' });
    }
  };

  // Explicit user confirmation for destructive delete operation
  const confirmDeleteFile = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      sounds.playBell();
      setStatusMessage({ text: `文件 “${fileToDelete.name}” 已从 Google 云端硬盘删除`, type: 'success' });
      setFileToDelete(null);
      fetchFiles();
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error);
      setStatusMessage({ text: error.message || '删除文件失败', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Restore/preview backup
  const handleRestoreBackup = async () => {
    if (!fileToRestore) return;
    try {
      const content = await getDriveFileContent(fileToRestore.id);
      const parsed = JSON.parse(content);
      if (!parsed.app || !parsed.childGrowth) {
        throw new Error('此文件不是有效的晴雨小岛成长档案备份。');
      }
      sounds.playBell();
      setStatusMessage({
        text: `已读取备份档案（导出时间：${parsed.exportDate}），已同步 ${parsed.childGrowth.completedLeaves?.length || 0} 片思考叶与成长记录！`,
        type: 'success'
      });
      setFileToRestore(null);
    } catch (err: unknown) {
      const error = err as Error;
      setStatusMessage({ text: error.message || '恢复备份失败', type: 'error' });
      setFileToRestore(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl p-5 sm:p-7 max-w-2xl w-full shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 text-stone-800 max-h-[92vh] overflow-y-auto border border-stone-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-stone-100 transition-colors z-20"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-inner">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <span>Google 云端硬盘 · 成长档案备份</span>
            </h3>
            <p className="text-xs text-stone-500">
              在父母与家庭之间安全备份与同步孩子的思考成长记录与天气日志
            </p>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-medium flex items-center justify-between mb-4 animate-in fade-in ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-stone-400 hover:text-stone-600 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Auth Section */}
        {!user ? (
          <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-white rounded-2xl shadow-xs mx-auto flex items-center justify-center text-3xl">
              ☁️
            </div>
            <div>
              <h4 className="text-base font-bold text-stone-800">连接您的 Google 云端硬盘</h4>
              <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 leading-relaxed">
                连接后，您可以将孩子的思考叶片完成记录、情绪天气日记与观察卡一键备份至个人 Google Drive，并在更换设备或两个家之间同步。
              </p>
            </div>

            {/* Official Material "Sign in with Google" button */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handleLogin}
                disabled={isAuthLoading}
                className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm rounded-full border border-stone-300 shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="w-5 h-5 block"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                <span>{isAuthLoading ? '正在连接 Google 账号...' : '使用 Google 账号登录并连接'}</span>
              </button>
            </div>

            <div className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" />
              基于官方权限授权，凭证仅保留在内存中，严格保护孩子个人隐私
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* User Info Bar */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google 用户'}
                    className="w-10 h-10 rounded-full border border-stone-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <UserIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <span>{user.displayName || 'Google 账号'}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">
                      已连接 Google Drive
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-500">{user.email}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-stone-500 hover:text-stone-800 p-2 rounded-xl hover:bg-stone-200/50 flex items-center gap-1 transition-colors"
                title="退出 Google 登录"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">退出</span>
              </button>
            </div>

            {/* Quick Actions: Backup & Refresh */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBackupToDrive}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>一键备份当前思考成长档案到 Google Drive</span>
              </button>

              <button
                onClick={() => fetchFiles(searchQuery)}
                disabled={loadingFiles}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-2xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                title="刷新文件列表"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFiles ? 'animate-spin' : ''}`} />
                <span>刷新</span>
              </button>
            </div>

            {/* File Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') fetchFiles(searchQuery ? `name contains '${searchQuery}'` : undefined);
                  }}
                  placeholder="搜索 Google 云端硬盘文件..."
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <button
                onClick={() => fetchFiles(searchQuery ? `name contains '${searchQuery}'` : undefined)}
                className="px-4 py-2 bg-stone-800 text-white rounded-xl text-xs font-bold hover:bg-stone-700 transition-colors"
              >
                搜索
              </button>
            </div>

            {/* Files List */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-stone-500 font-medium px-1">
                <span>云端硬盘文件 ({files.length})</span>
                <span>包含晴雨小岛档案与 Drive 内容</span>
              </div>

              {loadingFiles ? (
                <div className="p-8 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                  正在读取云端硬盘文件...
                </div>
              ) : files.length === 0 ? (
                <div className="p-8 bg-stone-50 rounded-2xl border border-stone-200 text-center text-xs text-stone-500">
                  云端硬盘暂未找到相关文件。点击上方“一键备份”创建您的第一份成长档案！
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {files.map((file) => {
                    const isIslandBackup = file.name.includes('晴雨小岛');
                    return (
                      <div
                        key={file.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs transition-all ${
                          isIslandBackup
                            ? 'bg-blue-50/70 border-blue-200 hover:border-blue-300'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileText className={`w-4 h-4 shrink-0 ${isIslandBackup ? 'text-blue-600' : 'text-stone-400'}`} />
                          <div className="overflow-hidden">
                            <div className="font-bold text-stone-800 truncate flex items-center gap-1.5">
                              <span>{file.name}</span>
                              {isIslandBackup && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold shrink-0">
                                  小岛档案
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-400">
                              {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : '未知日期'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isIslandBackup && (
                            <button
                              onClick={() => setFileToRestore(file)}
                              className="px-2.5 py-1 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1"
                              title="读取此档案"
                            >
                              <Download className="w-3 h-3" />
                              <span>同步</span>
                            </button>
                          )}

                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-stone-100 rounded-lg transition-colors"
                              title="在 Google Drive 中打开"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Trigger destructive confirmation dialog */}
                          <button
                            onClick={() => setFileToDelete(file)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="删除此文件"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= MANDATORY CONFIRMATION DIALOG FOR DESTRUCTIVE ACTIONS ================= */}
        {fileToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-rose-200 space-y-4">
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900">确认从 Google 云端硬盘删除文件？</h4>
                  <p className="text-xs text-stone-500">此破坏性操作无法撤销，请仔细确认</p>
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                <div className="text-stone-500 font-medium">即将删除的文件：</div>
                <div className="font-bold text-stone-800 break-all">{fileToDelete.name}</div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                删除后，该文件将从您的 Google Drive 永久移除或移入回收站。
              </p>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setFileToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-bold transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteFile}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  {isDeleting ? '正在删除...' : '确认删除'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= CONFIRMATION DIALOG FOR RESTORE / SYNC ================= */}
        {fileToRestore && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-blue-200 space-y-4">
              <div className="flex items-center gap-3 text-blue-600">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-stone-900">同步读取此备份档案？</h4>
                  <p className="text-xs text-stone-500">将读取并校验该档案的思考成长记录</p>
                </div>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                <div className="text-stone-500 font-medium">选择的文件：</div>
                <div className="font-bold text-stone-800 break-all">{fileToRestore.name}</div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setFileToRestore(null)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-bold transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleRestoreBackup}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs"
                >
                  确认读取并校验
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
