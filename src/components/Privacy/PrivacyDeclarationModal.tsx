import React, { useState } from 'react';
import {
  ShieldCheck,
  Download,
  X,
  FileText,
  CheckCircle2,
  HeartHandshake
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { sounds } from '../../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyDeclarationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    completedLeaves,
    tonightAt,
    daysToNextSwitch,
    packedItems,
    medals
  } = useApp();

  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportLocalJson = () => {
    sounds.playClick();
    const exportData = {
      product: '小岛',
      exportNotice: '本文件为端侧本地非敏感配置导出。文件仅保存在本设备，请妥善保管。',
      exportDate: new Date().toISOString(),
      privacyCommitment: {
        localStorageOnly: true,
        noCloudUpload: true,
        noVoiceOrBiometricCollection: true,
        noAIPsychologicalProfiling: true
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
    a.download = `小岛_本地配置_${new Date().toISOString().slice(0, 10)}.json`;
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
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-lg font-black text-stone-900">儿童与家庭隐私保护声明</h3>
              <p className="text-xs text-stone-500">零云端上传 · 本地安全运行 · 隐私透明</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="text-stone-400 hover:text-stone-600 p-2 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="关闭隐私保护声明弹窗"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4">
          {/* Core Privacy Promise */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-black text-sm text-emerald-900">
              <HeartHandshake className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>为 6 岁儿童与家庭定制的高等级隐私保护</span>
            </div>
            <p className="text-xs text-emerald-800/90 leading-relaxed font-medium">
              本产品坚持数据最小化与儿童安全第一原则，所有儿童互动与生活记录均在您的设备本地完成，守护纯粹、安心的家庭空间。
            </p>
          </div>

          {/* Privacy Rules */}
          <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2.5 text-xs">
            <span className="font-bold text-stone-800 block text-sm">我们的隐私保护承诺：</span>
            <ul className="space-y-2 text-stone-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>纯本地存储：</strong>孩子的自由表达、录音、画作与心愿仅保存在当前设备的本地存储中，不上传任何云端服务器。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>不采集身份隐私：</strong>不要求提供、亦不存储孩子的真实姓名、身份证件、家庭住址、就读学校或精确位置。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>无心理算法推测：</strong>不在儿童端使用生成式 AI 进行心理评估、性格推断或情绪诊断，不做声纹或人脸情绪识别。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <span><strong>无广告与商业追踪：</strong>无第三方广告插件，不进行任何商业行为画像，给孩子安静专注的探索环境。</span>
              </li>
            </ul>
          </div>

          {/* Local Non-sensitive Export Section */}
          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-sky-950 text-sm">
              <FileText className="w-4 h-4 text-sky-700" />
              <span>本地配置导出（完全由您掌控）</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              如需在更换浏览器前备份非敏感的生活设置（如日程记录、出行清单与阅读进度），可导出纯文本 JSON 文件并保存在当前设备中。
            </p>

            <button
              type="button"
              onClick={handleExportLocalJson}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-xs sm:text-sm"
            >
              <Download className="w-4 h-4" />
              <span>导出本地配置至本机文件 (.json)</span>
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
            className="px-5 py-2.5 bg-stone-900 text-white font-bold rounded-xl text-xs hover:bg-stone-800 transition-colors cursor-pointer"
          >
            了解并返回
          </button>
        </div>
      </div>
    </div>
  );
};
