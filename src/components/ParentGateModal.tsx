import React, { useState, useEffect } from 'react';
import { Lock, X, ShieldAlert, KeyRound, AlertTriangle } from 'lucide-react';
import { sounds } from '../utils/sound';
import {
  readPinRecord,
  makePinRecord,
  savePinRecord,
  verifyPin,
  grantParentAccess
} from '../domain/privacy/parentAccess';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ParentGateModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingMode, setIsSettingMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setConfirmPin('');
      setErrorMessage(null);
      const record = readPinRecord();
      setIsSettingMode(!record);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (isSettingMode) {
        if (pin.length < 6 || pin.length > 12) {
          setErrorMessage('PIN 码长度需为 6–12 位纯数字。');
          sounds.playClick();
          return;
        }
        if (/^(\d)\1+$/.test(pin)) {
          setErrorMessage('为了有效防止误触，PIN 码不能全部为相同数字（如 111111）。');
          sounds.playClick();
          return;
        }
        if (pin !== confirmPin) {
          setErrorMessage('两次输入的 PIN 码不一致，请重新确认。');
          sounds.playClick();
          return;
        }

        const record = await makePinRecord(pin);
        savePinRecord(record);
        grantParentAccess();
        sounds.playBell();
        onSuccess();
      } else {
        const result = await verifyPin(pin);
        if (result.success) {
          sounds.playBell();
          onSuccess();
        } else {
          sounds.playClick();
          setErrorMessage(result.error || 'PIN 码错误');
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || '操作失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-stone-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 p-2 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="关闭"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-inner">
            {isSettingMode ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-stone-900">
              {isSettingMode ? '初次设置家长端防误触 PIN' : '家长端防误触校验'}
            </h3>
            <p className="text-xs text-stone-500">SEC-06: 本机安全防误入机制</p>
          </div>
        </div>

        {/* 关键安全说明 */}
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 mb-5 leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-700" />
            <span>重要安全声明：</span>
          </div>
          <p className="text-stone-700">
            本机 PIN 仅为防止 6 岁儿童误触进入成人工作台的端侧屏障。
            <strong>不等于监护人法律身份认证，亦不作为任何云端数据接口授权依据。</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-stone-600 block mb-1.5">
              {isSettingMode ? '设置 6–12 位数字 PIN：' : '请输入家长端 PIN 码：'}
            </label>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
              maxLength={12}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, ''));
                setErrorMessage(null);
              }}
              placeholder="请输入数字 PIN"
              className="w-full text-center tracking-widest text-xl font-black px-4 py-3 rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-stone-50"
            />
          </div>

          {isSettingMode && (
            <div>
              <label className="text-xs font-bold text-stone-600 block mb-1.5">
                再次输入以确认 PIN：
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={12}
                value={confirmPin}
                onChange={(e) => {
                  setConfirmPin(e.target.value.replace(/\D/g, ''));
                  setErrorMessage(null);
                }}
                placeholder="请再次输入相同数字"
                className="w-full text-center tracking-widest text-xl font-black px-4 py-3 rounded-2xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-stone-50"
              />
            </div>
          )}

          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              返回孩子小岛
            </button>
            <button
              type="submit"
              disabled={isSubmitting || pin.length < 6}
              className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              {isSubmitting ? '正在计算校验...' : isSettingMode ? '确认并进入' : '校验进入'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
