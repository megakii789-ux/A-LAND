import React, { useState } from 'react';
import { ShieldAlert, X, Lock } from 'lucide-react';
import { sounds } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ParentGateModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const num1 = 7;
  const num2 = 8;
  const correctAnswer = num1 + num2; // 15

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(answer.trim(), 10) === correctAnswer) {
      sounds.playBell();
      onSuccess();
    } else {
      setError(true);
      sounds.playClick();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-amber-50/95 border border-amber-200/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-stone-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-amber-100/50 transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-200/60 flex items-center justify-center text-amber-700 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-800">家长验证闸门</h3>
            <p className="text-xs text-stone-500">保护孩子的探索空间与家长私密辅导信息</p>
          </div>
        </div>

        <p className="text-sm text-stone-600 mb-6 bg-amber-100/40 p-3 rounded-2xl border border-amber-200/50">
          为了确保小岛属于孩子自主玩耍，请大人们解答一道小数学题以进入“家长与教练端”：
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-amber-200 text-center shadow-xs">
            <label className="text-sm font-medium text-stone-500 block mb-2">
              计算算式：
            </label>
            <div className="text-2xl font-bold tracking-wider text-amber-800">
              {num1} + {num2} = ?
            </div>
          </div>

          <input
            type="number"
            autoFocus
            value={answer}
            onChange={(e) => {
              setAnswer(e.target.value);
              setError(false);
            }}
            placeholder="输入计算结果"
            className="w-full text-center text-xl font-bold px-4 py-3 rounded-2xl border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
          />

          {error && (
            <p className="text-rose-500 text-xs text-center font-medium animate-pulse">
              答案不对哦，请重新计算后再试一次。
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-medium text-sm transition-colors"
            >
              返回小岛
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all"
            >
              验证进入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
