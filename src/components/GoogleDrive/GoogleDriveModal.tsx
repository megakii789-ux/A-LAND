import React, { useState } from 'react';
import {
  ShieldAlert,
  Download,
  X,
  FileText,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    completedLeaves,
    tonightAt,
    daysToNextSwitch,
    packedItems,
    medals
  } = useApp();

  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // SEC-04: 允许导出到本机文件 (明确告知未加密，仅保存在本设备，绝非云备份)
  const handleExportLocalJson = () => {
    sounds.playClick();
    const exportData = {
      product: '晴雨小岛 A-LAND',
      exportNotice: '本文件为端侧本地非敏感配置导出。文件未加密，请妥善保管。',
      exportDate: new Date().toISOString(),
      securityPolicy: {
        cloudBackupEnabled: false,
        rawVoiceUploaded: false,
        childQuotesUploaded: false,
        researchPipeline: 'isolated'
      },
      settings: {
        tonightAt,
        daysToNextSwitch,
        packedItems
      },
      progress: {
        completedLeafCount: completedLeaves.length,
        completedLeaves,
        unlockedMedals: medals.filter(m => m.unlocked).map(m => m.id)
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `晴雨小岛_本地非敏感配置_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    sounds.playBell();
    setDownloadNotice('已生成本机下载文件。该文件仅保存在您的设备本地，未上传任何云端。');
    setTimeout(() => setDownloadNotice(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative text-stone-800 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">数据安全与云备份状态</h3>
              <p className="text-xs text-stone-500">SEC-04: 儿童隐私优先与数据最小化审计</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="text-stone-400 hover:text-stone-600 p-2 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4">
          {/* Status Box: Cloud Backup Disabled */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-black text-sm text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
              <span>云端备份功能已关闭（保护儿童数据安全）</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-medium">
              根据《儿童现实安全与隐私契约》，未经严格脱敏与端到端加密审计的第三方云盘（包括 Google Drive）自动备份已被完全关闭。
            </p>
          </div>

          {/* Privacy Rules */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2 text-xs">
            <span className="font-bold text-stone-800 block">当前数据安全规则：</span>
            <ul className="space-y-1.5 text-stone-600 list-disc list-inside leading-relaxed">
              <li><strong>零云端上传：</strong>孩子的自由表达、录音、画作与私密想念仅保存在本机内存或受限空间，绝不上传云端。</li>
              <li><strong>权限关闭：</strong>已关闭第三方 Google Drive OAuth 登录，不请求任何过宽的云盘读写权限。</li>
              <li><strong>不隐式删除：</strong>系统绝不会静默删除用户此前已存在于云端的任何历史文件。</li>
            </ul>
          </div>

          {/* Local Non-sensitive Export Section */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-sky-950 text-sm">
              <FileText className="w-4 h-4 text-sky-700" />
              <span>仅限本机的非敏感配置导出</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              如需在更换浏览器前备份非敏感的生活设置（如两家轮换日期、打包清单与已浏览故事进度），可导出纯文本 JSON 文件至本地电脑。
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-800 bg-amber-100/60 p-2 rounded-xl">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>注意：导出的本地文件未加密，仅保存在当前设备的下载文件夹中，请勿上传至公开网络。</span>
            </div>

            <button
              type="button"
              onClick={handleExportLocalJson}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-xs sm:text-sm"
            >
              <Download className="w-4 h-4" />
              <span>导出非敏感配置至本机文件 (.json)</span>
            </button>

            {downloadNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{downloadNotice}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="py-2.5 px-5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
          >
            知道了，返回
          </button>
        </div>
      </div>
    </div>
  );
};
