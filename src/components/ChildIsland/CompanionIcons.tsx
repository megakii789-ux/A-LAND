import React from 'react';
import { AnimalCompanionId, InterestActivityId } from '../../domain/personalization';

export type CompanionKey =
  | AnimalCompanionId
  | 'squirrel'
  | 'otter'
  | 'raccoon'
  | 'deer'
  | 'beaver'
  | 'owl'
  | 'guoguo'
  | 'beibei'
  | 'tiantian'
  | 'qiqi'
  | 'tiantian_deer'
  | 'qiqi_owl'
  | 'beibei_beaver';

export type CompanionSize = 'sm' | 'md' | 'lg' | 'xl';
export type CompanionPose = 'standing' | 'cheering' | 'listening' | 'thinking' | 'comforting';

export const COMPANION_SIZE_CLASSES: Record<CompanionSize, string> = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
};

export const CHARACTER_SIZE_CLASSES: Record<CompanionSize, string> = {
  sm: 'w-20 h-20',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-64 h-64',
};

export interface CompanionAvatarSvgProps {
  companionId: CompanionKey;
  className?: string;
  size?: CompanionSize;
}

export interface CompanionCharacterSvgProps {
  companionId: CompanionKey;
  pose?: CompanionPose;
  className?: string;
  size?: CompanionSize;
  title?: string;
}

export type NormalizedCompanion = 'guoguo' | 'beibei' | 'tiantian' | 'qiqi';

export function normalizeCompanionKey(key: CompanionKey): NormalizedCompanion {
  switch (key) {
    case 'guoguo_squirrel':
    case 'squirrel':
    case 'guoguo':
      return 'guoguo';
    case 'beibei_otter':
    case 'otter':
    case 'beaver':
    case 'beibei':
    case 'beibei_beaver':
      return 'beibei';
    case 'tiantian_raccoon':
    case 'tiantian':
    case 'tiantian_deer':
    case 'deer':
    case 'raccoon':
      return 'tiantian';
    case 'qiqi_deer':
    case 'qiqi':
    case 'qiqi_owl':
    case 'owl':
    default:
      return 'qiqi';
  }
}

/**
 * 晴雨小岛 · 原创绘本级四位动物伙伴矢量头像 (Avatar System)
 * 100% 原创纯矢量绘制：果果（小松鼠）、贝贝（小海狸）、甜甜（小鹿）、奇奇（小猫头鹰）
 * 彻底消除跨平台 Unicode 缺失导致的豆腐块 (▯) 瑕疵。
 */
export const CompanionAvatarSvg: React.FC<CompanionAvatarSvgProps> = ({
  companionId,
  className,
  size,
}) => {
  const norm = normalizeCompanionKey(companionId);
  const sizeClass = size ? COMPANION_SIZE_CLASSES[size] : (className ? '' : 'w-10 h-10');
  const finalClass = [sizeClass, className].filter(Boolean).join(' ');

  switch (norm) {
    case 'guoguo':
      return (
        <svg
          viewBox="0 0 64 64"
          className={finalClass}
          role="img"
          aria-label="小松鼠果果头像"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="gg-av-bg" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="100%" stopColor="#FDE68A" />
            </radialGradient>
            <linearGradient id="gg-av-fur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="60%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
            <linearGradient id="gg-av-acorn" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#92400E" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          {/* 背景圆 */}
          <circle cx="32" cy="32" r="30" fill="url(#gg-av-bg)" stroke="#F59E0B" strokeWidth="2.5" />
          {/* 蓬松大尾巴 */}
          <path
            d="M45 48 C58 44 60 22 48 16 C40 12 37 22 41 28 C38 32 39 44 45 48 Z"
            fill="url(#gg-av-fur)"
            stroke="#92400E"
            strokeWidth="1.5"
          />
          <path
            d="M48 42 C54 38 55 24 47 21"
            stroke="#FEF3C7"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* 圆耳朵 */}
          <ellipse cx="19" cy="17" rx="6" ry="7.5" transform="rotate(-15 19 17)" fill="url(#gg-av-fur)" stroke="#92400E" strokeWidth="1.2" />
          <ellipse cx="19" cy="17.5" rx="3.2" ry="4.5" transform="rotate(-15 19 17.5)" fill="#FEF3C7" />
          <ellipse cx="39" cy="17" rx="6" ry="7.5" transform="rotate(15 39 17)" fill="url(#gg-av-fur)" stroke="#92400E" strokeWidth="1.2" />
          <ellipse cx="39" cy="17.5" rx="3.2" ry="4.5" transform="rotate(15 39 17.5)" fill="#FEF3C7" />
          {/* 脸颊与头部 */}
          <ellipse cx="29" cy="35" rx="17" ry="15" fill="url(#gg-av-fur)" stroke="#92400E" strokeWidth="1.5" />
          <ellipse cx="29" cy="38" rx="13" ry="11" fill="#FFFBEB" />
          {/* 橡果小帽饰 */}
          <path d="M22 17 Q29 11 36 17 Z" fill="url(#gg-av-acorn)" stroke="#78350F" strokeWidth="1" />
          <path d="M29 9 L29 13" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          {/* 眼睛与双重高光 */}
          <circle cx="23" cy="32" r="2.8" fill="#1C1917" />
          <circle cx="24" cy="31" r="1.1" fill="#FFFFFF" />
          <circle cx="22.5" cy="33.2" r="0.5" fill="#FFFFFF" />
          <circle cx="35" cy="32" r="2.8" fill="#1C1917" />
          <circle cx="36" cy="31" r="1.1" fill="#FFFFFF" />
          <circle cx="34.5" cy="33.2" r="0.5" fill="#FFFFFF" />
          {/* 腮红 */}
          <ellipse cx="18" cy="37" rx="3.5" ry="2" fill="#FB7185" opacity="0.6" />
          <ellipse cx="40" cy="37" rx="3.5" ry="2" fill="#FB7185" opacity="0.6" />
          {/* 鼻子、微笑与标志性小兔牙 */}
          <ellipse cx="29" cy="35" rx="2.4" ry="1.7" fill="#78350F" />
          <path d="M25.5 38.5 Q29 41.5 32.5 38.5" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <rect x="27.4" y="39.5" width="3.2" height="2.6" rx="0.8" fill="#FFFFFF" stroke="#D97706" strokeWidth="0.6" />
        </svg>
      );

    case 'beibei':
      return (
        <svg
          viewBox="0 0 64 64"
          className={finalClass}
          role="img"
          aria-label="小海狸贝贝头像"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="bb-av-bg" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#E0F2FE" />
              <stop offset="100%" stopColor="#BAE6FD" />
            </radialGradient>
            <linearGradient id="bb-av-fur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B45309" />
              <stop offset="50%" stopColor="#92400E" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id="bb-av-tail" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#78350F" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>
          </defs>
          {/* 背景圆 */}
          <circle cx="32" cy="32" r="30" fill="url(#bb-av-bg)" stroke="#38BDF8" strokeWidth="2.5" />
          {/* 扁平坚固的海狸尾巴边角 */}
          <path
            d="M48 36 C57 32 60 48 50 54 C46 56 42 50 44 44 Z"
            fill="url(#bb-av-tail)"
            stroke="#451A03"
            strokeWidth="1.5"
          />
          <path d="M47 40 L53 48 M51 38 L49 48" stroke="#92400E" strokeWidth="1" strokeLinecap="round" />
          {/* 圆圆小耳 */}
          <circle cx="16" cy="22" r="5.5" fill="url(#bb-av-fur)" stroke="#78350F" strokeWidth="1.2" />
          <circle cx="16" cy="22" r="2.8" fill="#FEF3C7" />
          <circle cx="48" cy="22" r="5.5" fill="url(#bb-av-fur)" stroke="#78350F" strokeWidth="1.2" />
          <circle cx="48" cy="22" r="2.8" fill="#FEF3C7" />
          {/* 头部轮廓 */}
          <ellipse cx="32" cy="34" rx="18" ry="16" fill="url(#bb-av-fur)" stroke="#78350F" strokeWidth="1.5" />
          {/* 奶油色大吻部 */}
          <ellipse cx="32" cy="38" rx="14" ry="11" fill="#FEF3C7" />
          {/* 亮晶晶眼睛 */}
          <circle cx="24.5" cy="30.5" r="2.8" fill="#1C1917" />
          <circle cx="25.4" cy="29.6" r="1.1" fill="#FFFFFF" />
          <circle cx="39.5" cy="30.5" r="2.8" fill="#1C1917" />
          <circle cx="40.4" cy="29.6" r="1.1" fill="#FFFFFF" />
          {/* 温暖腮红 */}
          <ellipse cx="19" cy="36" rx="3.5" ry="2" fill="#FDA4AF" opacity="0.65" />
          <ellipse cx="45" cy="36" rx="3.5" ry="2" fill="#FDA4AF" opacity="0.65" />
          {/* 稳固小黑鼻与胡须 */}
          <path d="M29 34 Q32 32.5 35 34 Q33 37 32 37 Q31 37 29 34 Z" fill="#292524" />
          <path d="M28.5 38.5 Q32 41.5 35.5 38.5" stroke="#44403C" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <rect x="30" y="39.8" width="4" height="3" rx="0.8" fill="#FFFFFF" stroke="#92400E" strokeWidth="0.8" />
          {/* 海狸建造小木块徽章 */}
          <rect x="28" y="50" width="8" height="6" rx="1.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
        </svg>
      );

    case 'tiantian':
      return (
        <svg
          viewBox="0 0 64 64"
          className={finalClass}
          role="img"
          aria-label="小鹿甜甜头像"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="tt-av-bg" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#FEF3C7" />
              <stop offset="60%" stopColor="#ECFDF5" />
              <stop offset="100%" stopColor="#A7F3D0" />
            </radialGradient>
            <linearGradient id="tt-av-fur" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          {/* 背景圆 */}
          <circle cx="32" cy="32" r="30" fill="url(#tt-av-bg)" stroke="#10B981" strokeWidth="2.5" />
          {/* 嫩枝花朵鹿角 */}
          <path d="M23 18 L19 9 M21 14 L16 12" stroke="#92400E" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="19" cy="9" r="2.2" fill="#F43F5E" />
          <circle cx="16" cy="12" r="1.8" fill="#FDA4AF" />
          <path d="M41 18 L45 9 M43 14 L48 12" stroke="#92400E" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="45" cy="9" r="2.2" fill="#F43F5E" />
          <circle cx="48" cy="12" r="1.8" fill="#FDA4AF" />
          {/* 优雅长耳 */}
          <ellipse cx="14.5" cy="22" rx="7" ry="3.6" transform="rotate(-30 14.5 22)" fill="url(#tt-av-fur)" stroke="#B45309" strokeWidth="1.2" />
          <ellipse cx="14.5" cy="22" rx="4" ry="1.8" transform="rotate(-30 14.5 22)" fill="#FEF3C7" />
          <ellipse cx="49.5" cy="22" rx="7" ry="3.6" transform="rotate(30 49.5 22)" fill="url(#tt-av-fur)" stroke="#B45309" strokeWidth="1.2" />
          <ellipse cx="49.5" cy="22" rx="4" ry="1.8" transform="rotate(30 49.5 22)" fill="#FEF3C7" />
          {/* 头部轮廓 */}
          <ellipse cx="32" cy="36" rx="16" ry="15" fill="url(#tt-av-fur)" stroke="#B45309" strokeWidth="1.5" />
          <ellipse cx="32" cy="40" rx="11" ry="9" fill="#FFFBEB" />
          {/* 额头温和梅花斑点 */}
          <circle cx="28" cy="26" r="1.5" fill="#FFFFFF" opacity="0.9" />
          <circle cx="36" cy="26" r="1.5" fill="#FFFFFF" opacity="0.9" />
          <circle cx="32" cy="23" r="1.6" fill="#FFFFFF" opacity="0.9" />
          {/* 柔和大眼睛 */}
          <circle cx="24.5" cy="33" r="2.8" fill="#1C1917" />
          <circle cx="25.5" cy="32" r="1.1" fill="#FFFFFF" />
          <circle cx="39.5" cy="33" r="2.8" fill="#1C1917" />
          <circle cx="40.5" cy="32" r="1.1" fill="#FFFFFF" />
          {/* 腮红 */}
          <ellipse cx="19" cy="38" rx="3.2" ry="1.8" fill="#FB7185" opacity="0.6" />
          <ellipse cx="45" cy="38" rx="3.2" ry="1.8" fill="#FB7185" opacity="0.6" />
          {/* 鼻子与微笑 */}
          <ellipse cx="32" cy="37" rx="2.2" ry="1.5" fill="#78350F" />
          <path d="M28.5 40.5 Q32 43 35.5 40.5" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          {/* 胸前花朵领结 */}
          <circle cx="32" cy="50" r="3" fill="#F43F5E" />
          <circle cx="32" cy="50" r="1.2" fill="#FEF08A" />
        </svg>
      );

    case 'qiqi':
    default:
      return (
        <svg
          viewBox="0 0 64 64"
          className={finalClass}
          role="img"
          aria-label="小猫头鹰奇奇头像"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="qq-av-bg" cx="50%" cy="40%" r="55%">
              <stop offset="0%" stopColor="#EEF2FF" />
              <stop offset="60%" stopColor="#E0E7FF" />
              <stop offset="100%" stopColor="#C7D2FE" />
            </radialGradient>
            <linearGradient id="qq-av-feather" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="60%" stopColor="#4F46E5" />
              <stop offset="100%" stopColor="#3730A3" />
            </linearGradient>
            <radialGradient id="qq-av-eye" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="70%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </radialGradient>
          </defs>
          {/* 背景圆 */}
          <circle cx="32" cy="32" r="30" fill="url(#qq-av-bg)" stroke="#6366F1" strokeWidth="2.5" />
          {/* 羽毛耳簇 */}
          <polygon points="17,21 21,9 29,17" fill="#4338CA" stroke="#312E81" strokeWidth="1.2" strokeLinejoin="round" />
          <polygon points="47,21 43,9 35,17" fill="#4338CA" stroke="#312E81" strokeWidth="1.2" strokeLinejoin="round" />
          {/* 头部轮廓 */}
          <ellipse cx="32" cy="34" rx="18" ry="16" fill="url(#qq-av-feather)" stroke="#312E81" strokeWidth="1.5" />
          {/* 星光披肩星芒点缀 */}
          <path d="M16 26 L17.5 28.5 L20 30 L17.5 31.5 L16 34 L14.5 31.5 L12 30 L14.5 28.5 Z" fill="#FDE047" />
          <path d="M48 26 L49.5 28.5 L52 30 L49.5 31.5 L48 34 L46.5 31.5 L44 30 L46.5 28.5 Z" fill="#FDE047" />
          {/* 标志性好奇金色大眼睛外圈 */}
          <circle cx="23.5" cy="33" r="8.5" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="1.5" />
          <circle cx="40.5" cy="33" r="8.5" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="1.5" />
          {/* 金色眼虹膜 */}
          <circle cx="23.5" cy="33" r="6" fill="url(#qq-av-eye)" />
          <circle cx="40.5" cy="33" r="6" fill="url(#qq-av-eye)" />
          {/* 瞳孔与高光 */}
          <circle cx="24.5" cy="33" r="3.2" fill="#0F172A" />
          <circle cx="23.5" cy="31.8" r="1.3" fill="#FFFFFF" />
          <circle cx="39.5" cy="33" r="3.2" fill="#0F172A" />
          <circle cx="38.5" cy="31.8" r="1.3" fill="#FFFFFF" />
          {/* 腮红 */}
          <ellipse cx="15.5" cy="38" rx="2.5" ry="1.5" fill="#FDA4AF" opacity="0.65" />
          <ellipse cx="48.5" cy="38" rx="2.5" ry="1.5" fill="#FDA4AF" opacity="0.65" />
          {/* 亮橙色小喙与微笑胸脯 */}
          <polygon points="32,34 28,40 36,40" fill="#EA580C" />
          {/* 胸前羽毛 */}
          <ellipse cx="32" cy="46" rx="11" ry="8" fill="#EEF2FF" />
          <path d="M27 45 Q32 48 37 45" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      );
  }
};

/**
 * 晴雨小岛 · 四位伙伴全景表达姿态 (Full Expressive Vector Postures)
 * 支持 5 种姿态：
 * - standing: 亲切站立问候
 * - cheering: 跃起欢呼庆祝
 * - listening: 歪头认真倾听
 * - thinking: 托腮/拿道具深思
 * - comforting: 伸出双手温暖拥抱/安慰
 */
export const CompanionCharacterSvg: React.FC<CompanionCharacterSvgProps> = ({
  companionId,
  pose = 'standing',
  className,
  size,
  title,
}) => {
  const norm = normalizeCompanionKey(companionId);
  const sizeClass = size ? CHARACTER_SIZE_CLASSES[size] : (className ? '' : 'w-36 h-36');
  const finalClass = [sizeClass, className].filter(Boolean).join(' ');

  const defaultTitle = `${norm === 'guoguo' ? '果果' : norm === 'beibei' ? '贝贝' : norm === 'tiantian' ? '甜甜' : '奇奇'}正在${
    pose === 'cheering' ? '欢呼' : pose === 'listening' ? '倾听' : pose === 'thinking' ? '思考' : pose === 'comforting' ? '安慰' : '站立'
  }`;

  return (
    <svg
      viewBox="0 0 160 160"
      className={finalClass}
      role="img"
      aria-label={title || defaultTitle}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{title || defaultTitle}</title>
      <defs>
        {/* 全局滤镜与渐变 */}
        <filter id="char-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.08" />
        </filter>
        <radialGradient id="char-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 脚底影子 */}
      <ellipse cx="80" cy="146" rx="46" ry="9" fill="#0F172A" opacity="0.08" />

      {/* 根据角色与姿态渲染真实矢量场景 */}
      {norm === 'guoguo' && <GuoguoVectorBody pose={pose} />}
      {norm === 'beibei' && <BeibeiVectorBody pose={pose} />}
      {norm === 'tiantian' && <TiantianVectorBody pose={pose} />}
      {norm === 'qiqi' && <QiqiVectorBody pose={pose} />}
    </svg>
  );
};

export const CompanionPoseSvg = CompanionCharacterSvg;

/* -------------------------------------------------------------------------- */
/* 果果 (小松鼠) 矢量身体组件                                                  */
/* -------------------------------------------------------------------------- */
const GuoguoVectorBody: React.FC<{ pose: CompanionPose }> = ({ pose }) => {
  return (
    <g id="guoguo-full" filter="url(#char-shadow)">
      <defs>
        <linearGradient id="gg-fur" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="gg-tail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </defs>

      {/* 蓬松巨大大尾巴（小松鼠的灵魂标志） */}
      {pose === 'cheering' ? (
        <g id="tail-cheer">
          <path
            d="M95 130 C135 125 155 75 145 40 C138 18 118 15 110 32 C105 45 115 65 118 80 C120 95 112 115 95 130 Z"
            fill="url(#gg-tail)"
            stroke="#92400E"
            strokeWidth="2.5"
          />
          <path d="M135 48 C142 65 135 88 122 105" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" />
          {/* 庆祝小星芒 */}
          <polygon points="140,20 142,26 148,28 142,30 140,36 138,30 132,28 138,26" fill="#FDE047" />
          <polygon points="150,55 151,59 155,60 151,61 150,65 149,61 145,60 149,59" fill="#FDE047" />
        </g>
      ) : pose === 'comforting' ? (
        <g id="tail-comfort">
          {/* 尾巴像温暖毯子般前卷环抱 */}
          <path
            d="M90 132 C130 130 148 100 138 70 C130 50 110 52 108 65 C106 78 120 95 115 110 C110 120 95 128 90 132 Z"
            fill="url(#gg-tail)"
            stroke="#92400E"
            strokeWidth="2.5"
          />
          <path d="M130 75 C132 90 125 105 115 118" stroke="#FEF3C7" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ) : (
        <g id="tail-default">
          <path
            d="M92 135 C136 130 154 85 142 50 C134 26 114 26 112 45 C110 60 124 82 120 100 C116 115 102 125 92 135 Z"
            fill="url(#gg-tail)"
            stroke="#92400E"
            strokeWidth="2.5"
          />
          <path d="M132 55 C138 75 130 96 118 112" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {/* 小脚丫 */}
      <ellipse cx="64" cy="142" rx="10" ry="6" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
      <ellipse cx="92" cy="142" rx="10" ry="6" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />

      {/* 身体 */}
      <ellipse cx="78" cy="108" rx="26" ry="30" fill="url(#gg-fur)" stroke="#92400E" strokeWidth="2" />
      {/* 奶油色肚皮 */}
      <ellipse cx="78" cy="112" rx="18" ry="22" fill="#FFFBEB" />

      {/* 头部（根据姿态有微调角度） */}
      <g transform={pose === 'listening' ? 'rotate(-8 78 62)' : pose === 'thinking' ? 'rotate(6 78 62)' : ''}>
        {/* 圆耳朵 */}
        <ellipse cx="58" cy="38" rx="10" ry="13" transform="rotate(-15 58 38)" fill="url(#gg-fur)" stroke="#92400E" strokeWidth="2" />
        <ellipse cx="58" cy="38" rx="5.5" ry="8" transform="rotate(-15 58 38)" fill="#FEF3C7" />
        <ellipse cx="98" cy="38" rx="10" ry="13" transform="rotate(15 98 38)" fill="url(#gg-fur)" stroke="#92400E" strokeWidth="2" />
        <ellipse cx="98" cy="38" rx="5.5" ry="8" transform="rotate(15 98 38)" fill="#FEF3C7" />

        {/* 头部圆轮廓 */}
        <ellipse cx="78" cy="64" rx="28" ry="24" fill="url(#gg-fur)" stroke="#92400E" strokeWidth="2" />
        {/* 脸部下半奶油色 */}
        <ellipse cx="78" cy="70" rx="21" ry="17" fill="#FFFBEB" />

        {/* 橡果帽子装饰 */}
        <path d="M68 38 Q78 30 88 38 Z" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
        <line x1="78" y1="28" x2="78" y2="33" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" />

        {/* 腮红 */}
        <ellipse cx="60" cy="71" rx="5.5" ry="3.5" fill="#FB7185" opacity="0.6" />
        <ellipse cx="96" cy="71" rx="5.5" ry="3.5" fill="#FB7185" opacity="0.6" />

        {/* 眼睛与表情 */}
        {pose === 'cheering' ? (
          <>
            {/* 开心弯弯月牙眼 */}
            <path d="M63 60 Q69 54 75 60" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M81 60 Q87 54 93 60" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* 大笑嘴 */}
            <path d="M72 73 Q78 82 84 73 Z" fill="#E11D48" stroke="#92400E" strokeWidth="1.5" />
            <rect x="76" y="72" width="4" height="3" rx="0.8" fill="#FFFFFF" />
          </>
        ) : pose === 'thinking' ? (
          <>
            {/* 好奇上挑小眉毛与聚焦眼神 */}
            <path d="M62 55 Q68 53 74 57" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
            <circle cx="69" cy="62" r="4" fill="#1C1917" />
            <circle cx="70.5" cy="60.5" r="1.5" fill="#FFFFFF" />
            <circle cx="87" cy="62" r="4" fill="#1C1917" />
            <circle cx="88.5" cy="60.5" r="1.5" fill="#FFFFFF" />
            {/* 嘟嘟小思考嘴 */}
            <ellipse cx="78" cy="74" rx="2.5" ry="2" fill="#78350F" />
            {/* 思考小泡泡/灯泡 */}
            <circle cx="106" cy="40" r="3.5" fill="#FDE047" />
            <circle cx="114" cy="30" r="5.5" fill="#FDE047" />
            <polygon points="122,12 125,18 131,20 125,22 122,28 119,22 113,20 119,18" fill="#F59E0B" />
          </>
        ) : (
          <>
            {/* 温和好奇大眼睛 */}
            <circle cx="68" cy="62" r="4.2" fill="#1C1917" />
            <circle cx="69.5" cy="60.5" r="1.7" fill="#FFFFFF" />
            <circle cx="67" cy="63.5" r="0.8" fill="#FFFFFF" />
            <circle cx="88" cy="62" r="4.2" fill="#1C1917" />
            <circle cx="89.5" cy="60.5" r="1.7" fill="#FFFFFF" />
            <circle cx="87" cy="63.5" r="0.8" fill="#FFFFFF" />
            {/* 黑色小圆鼻与兔牙微笑 */}
            <ellipse cx="78" cy="68" rx="3.5" ry="2.2" fill="#78350F" />
            <path d="M73 72 Q78 76 83 72" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
            <rect x="76.2" y="73" width="3.6" height="3" rx="0.8" fill="#FFFFFF" stroke="#D97706" strokeWidth="0.8" />
          </>
        )}
      </g>

      {/* 手臂与道具（根据姿态完全不同） */}
      {pose === 'cheering' ? (
        <g id="arms-cheer">
          {/* 双臂举高高欢呼 */}
          <path d="M55 98 C45 80 42 62 48 55 C54 48 64 62 62 78" fill="url(#gg-fur)" stroke="#92400E" strokeWidth="2" />
          <path d="M101 98 C111 80 114 62 108 55 C102 48 92 62 94 78" fill="url(#gg-fur)" stroke="#92400E" strokeWidth="2" />
        </g>
      ) : pose === 'listening' ? (
        <g id="arms-listen">
          {/* 一只手凑在耳边，另一只手轻轻放在胸口 */}
          <path d="M56 102 C46 88 44 72 48 64 C53 58 60 70 58 84" fill="url(#gg-fur)" stroke="#92400E" strokeWidth="2" />
          <circle cx="49" cy="62" r="4.5" fill="#FEF3C7" stroke="#92400E" strokeWidth="1.5" />
          <ellipse cx="88" cy="106" rx="6" ry="8" fill="url(#gg-fur)" stroke="#92400E" strokeWidth="1.5" />
        </g>
      ) : pose === 'thinking' ? (
        <g id="arms-think">
          {/* 左爪托腮，右爪高举橡果放大镜 */}
          <path d="M60 108 C54 94 62 82 72 80" stroke="url(#gg-fur)" strokeWidth="10" strokeLinecap="round" />
          <circle cx="72" cy="78" r="5" fill="#FEF3C7" stroke="#92400E" strokeWidth="1.5" />
          {/* 橡果放大镜 */}
          <g transform="translate(92, 70)">
            <line x1="12" y1="20" x2="24" y2="34" stroke="#78350F" strokeWidth="4" strokeLinecap="round" />
            <circle cx="10" cy="14" r="14" fill="#E0F2FE" fillOpacity="0.8" stroke="#F59E0B" strokeWidth="3" />
            <path d="M2 10 A 10 10 0 0 1 14 4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* 放大镜中心的小线索点 */}
            <circle cx="10" cy="14" r="2.5" fill="#D97706" />
          </g>
        </g>
      ) : pose === 'comforting' ? (
        <g id="arms-comfort">
          {/* 双手向前张开，给予大大的安心拥抱 */}
          <path d="M58 106 C42 102 32 110 30 118 C30 125 45 124 55 116" fill="url(#gg-fur)" stroke="#92400E" strokeWidth="2" />
          <path d="M98 106 C114 102 124 110 126 118 C126 125 111 124 101 116" fill="url(#gg-fur)" stroke="#92400E" strokeWidth="2" />
          {/* 胸前温暖爱心 */}
          <path
            d="M78 114 C78 110 73 106 68 108 C62 111 63 118 78 130 C93 118 94 111 88 108 C83 106 78 110 78 114 Z"
            fill="#F43F5E"
          />
        </g>
      ) : (
        <g id="arms-stand">
          {/* 双手抱在胸前，捧着心爱的小橡果 */}
          <ellipse cx="62" cy="108" rx="6" ry="8" transform="rotate(20 62 108)" fill="url(#gg-fur)" stroke="#92400E" strokeWidth="1.5" />
          <ellipse cx="94" cy="108" rx="6" ry="8" transform="rotate(-20 94 108)" fill="url(#gg-fur)" stroke="#92400E" strokeWidth="1.5" />
          {/* 小橡果 */}
          <path d="M72 106 Q78 100 84 106 Q82 116 78 118 Q74 116 72 106 Z" fill="#D97706" stroke="#78350F" strokeWidth="1.2" />
          <path d="M71 106 Q78 103 85 106 Z" fill="#78350F" />
        </g>
      )}
    </g>
  );
};

/* -------------------------------------------------------------------------- */
/* 贝贝 (小海狸) 矢量身体组件                                                  */
/* -------------------------------------------------------------------------- */
const BeibeiVectorBody: React.FC<{ pose: CompanionPose }> = ({ pose }) => {
  return (
    <g id="beibei-full" filter="url(#char-shadow)">
      <defs>
        <linearGradient id="bb-fur" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="60%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#451A03" />
        </linearGradient>
        <linearGradient id="bb-paddle" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#78350F" />
          <stop offset="100%" stopColor="#292524" />
        </linearGradient>
      </defs>

      {/* 坚固扁平海狸划桨尾巴（海狸特色，带菱形压纹） */}
      {pose === 'cheering' ? (
        <g id="bb-tail-splash">
          {/* 尾巴拍水 */}
          <ellipse cx="120" cy="135" rx="30" ry="14" transform="rotate(15 120 135)" fill="url(#bb-paddle)" stroke="#451A03" strokeWidth="2.5" />
          <path d="M102 130 L138 138 M108 142 L132 128" stroke="#92400E" strokeWidth="1.5" />
          {/* 飞溅水花 */}
          <path d="M136 120 Q145 110 142 125" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M145 130 Q155 128 146 140" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ) : (
        <g id="bb-tail-ground">
          {/* 稳稳平铺在地面上的大尾巴 */}
          <ellipse cx="118" cy="138" rx="28" ry="12" transform="rotate(8 118 138)" fill="url(#bb-paddle)" stroke="#451A03" strokeWidth="2.5" />
          <path d="M100 135 L136 141 M106 144 L130 132 M112 130 L126 146" stroke="#92400E" strokeWidth="1.2" />
        </g>
      )}

      {/* 大而稳固的后足 */}
      <ellipse cx="62" cy="144" rx="12" ry="7" fill="#451A03" stroke="#292524" strokeWidth="1.5" />
      <ellipse cx="94" cy="144" rx="12" ry="7" fill="#451A03" stroke="#292524" strokeWidth="1.5" />

      {/* 憨厚稳健的圆滚滚身体 */}
      <ellipse cx="78" cy="110" rx="30" ry="32" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2.5" />
      {/* 奶油胸腹 */}
      <ellipse cx="78" cy="114" rx="20" ry="23" fill="#FEF3C7" />

      {/* 头部 */}
      <g>
        {/* 圆耳朵 */}
        <circle cx="54" cy="46" r="9" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2" />
        <circle cx="54" cy="46" r="4.5" fill="#FEF3C7" />
        <circle cx="102" cy="46" r="9" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2" />
        <circle cx="102" cy="46" r="4.5" fill="#FEF3C7" />

        {/* 头部轮廓 */}
        <ellipse cx="78" cy="68" rx="29" ry="25" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2.5" />
        {/* 丰满吻部 */}
        <ellipse cx="78" cy="74" rx="22" ry="17" fill="#FEF3C7" />

        {/* 腮红 */}
        <ellipse cx="58" cy="75" rx="5" ry="3.2" fill="#FDA4AF" opacity="0.65" />
        <ellipse cx="98" cy="75" rx="5" ry="3.2" fill="#FDA4AF" opacity="0.65" />

        {/* 眼睛与表情 */}
        {pose === 'listening' ? (
          <>
            {/* 深呼吸平静闭目，温和放松 */}
            <path d="M64 66 Q70 70 76 66" stroke="#451A03" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            <path d="M80 66 Q86 70 92 66" stroke="#451A03" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            {/* 呼吸涟漪光环 */}
            <circle cx="78" cy="72" r="38" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />
          </>
        ) : pose === 'cheering' ? (
          <>
            <path d="M63 65 Q69 58 75 65" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M81 65 Q87 58 93 65" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <circle cx="68" cy="65" r="4.2" fill="#1C1917" />
            <circle cx="69.5" cy="63.5" r="1.7" fill="#FFFFFF" />
            <circle cx="88" cy="65" r="4.2" fill="#1C1917" />
            <circle cx="89.5" cy="63.5" r="1.7" fill="#FFFFFF" />
          </>
        )}

        {/* 海狸特征小黑鼻、大门牙与胡须 */}
        <polygon points="78,69 72,73 84,73" fill="#292524" />
        <path d="M72 76 Q78 80 84 76" stroke="#44403C" strokeWidth="2" strokeLinecap="round" fill="none" />
        <rect x="75" y="77" width="6" height="4.5" rx="1" fill="#FFFFFF" stroke="#78350F" strokeWidth="1" />
        {/* 胡须 */}
        <line x1="56" y1="73" x2="68" y2="74" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="55" y1="77" x2="67" y2="76" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="100" y1="73" x2="88" y2="74" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="101" y1="77" x2="89" y2="76" stroke="#A8A29E" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* 手臂与海狸建造/深呼吸动作 */}
      {pose === 'cheering' ? (
        <g id="bb-arms-cheer">
          <ellipse cx="50" cy="94" rx="8" ry="14" transform="rotate(-30 50 94)" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2" />
          <ellipse cx="106" cy="94" rx="8" ry="14" transform="rotate(30 106 94)" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2" />
          {/* 空中抛出的木头积木 */}
          <rect x="72" y="32" width="14" height="10" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" transform="rotate(15 72 32)" />
        </g>
      ) : pose === 'listening' ? (
        <g id="bb-arms-breathe">
          {/* 双手安详地放在心口与肚子上，感受深呼吸 */}
          <ellipse cx="66" cy="110" rx="9" ry="7" transform="rotate(15 66 110)" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2" />
          <ellipse cx="90" cy="110" rx="9" ry="7" transform="rotate(-15 90 110)" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2" />
        </g>
      ) : pose === 'thinking' ? (
        <g id="bb-arms-build">
          {/* 正在堆叠两块木质建造积木 */}
          <ellipse cx="64" cy="106" rx="8" ry="10" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2" />
          <ellipse cx="92" cy="106" rx="8" ry="10" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2" />
          {/* 积木组合 */}
          <rect x="68" y="104" width="20" height="12" rx="2" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <rect x="74" y="94" width="14" height="10" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
        </g>
      ) : pose === 'comforting' ? (
        <g id="bb-arms-hug">
          {/* 宽厚坚实的海狸大怀抱 */}
          <path d="M52 108 C36 104 28 114 26 122 C26 128 42 126 50 118" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2" />
          <path d="M104 108 C120 104 128 114 130 122 C130 128 114 126 106 118" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2" />
          {/* 温和贝壳挂坠 */}
          <ellipse cx="78" cy="116" rx="7" ry="5" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
        </g>
      ) : (
        <g id="bb-arms-stand">
          {/* 站立双手捧着光滑小木棍 */}
          <ellipse cx="64" cy="108" rx="8" ry="10" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2" />
          <ellipse cx="92" cy="108" rx="8" ry="10" fill="url(#bb-fur)" stroke="#451A03" strokeWidth="2" />
          <rect x="62" y="106" width="32" height="6" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="1" />
        </g>
      )}
    </g>
  );
};

/* -------------------------------------------------------------------------- */
/* 甜甜 (小鹿) 矢量身体组件                                                    */
/* -------------------------------------------------------------------------- */
const TiantianVectorBody: React.FC<{ pose: CompanionPose }> = ({ pose }) => {
  return (
    <g id="tiantian-full" filter="url(#char-shadow)">
      <defs>
        <linearGradient id="tt-fur" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="60%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>

      {/* 小巧可爱的鹿尾巴 */}
      <ellipse cx="112" cy="120" rx="8" ry="6" transform="rotate(-20 112 120)" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />

      {/* 纤细优雅的小蹄子 */}
      <rect x="62" y="136" width="8" height="12" rx="4" fill="#78350F" />
      <rect x="88" y="136" width="8" height="12" rx="4" fill="#78350F" />

      {/* 柔和小鹿身形 */}
      <ellipse cx="78" cy="112" rx="25" ry="28" fill="url(#tt-fur)" stroke="#B45309" strokeWidth="2" />
      {/* 奶油胸腹 */}
      <ellipse cx="78" cy="115" rx="16" ry="20" fill="#FFFBEB" />
      {/* 背部温柔白色斑点 */}
      <circle cx="68" cy="105" r="2.5" fill="#FFFFFF" opacity="0.85" />
      <circle cx="88" cy="108" r="2.2" fill="#FFFFFF" opacity="0.85" />
      <circle cx="76" cy="98" r="2.2" fill="#FFFFFF" opacity="0.85" />
      <circle cx="70" cy="118" r="2" fill="#FFFFFF" opacity="0.85" />

      {/* 头部与花枝鹿角 */}
      <g transform={pose === 'listening' ? 'rotate(-6 78 60)' : pose === 'comforting' ? 'rotate(4 78 60)' : ''}>
        {/* 开满鲜花与嫩芽的鹿角 */}
        <g id="antlers">
          <path d="M62 38 L54 18 M58 28 L50 24" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          <circle cx="54" cy="18" r="3.5" fill="#F43F5E" />
          <circle cx="50" cy="24" r="2.8" fill="#FDA4AF" />
          <circle cx="53" cy="28" r="2" fill="#86EFAC" />

          <path d="M94 38 L102 18 M98 28 L106 24" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
          <circle cx="102" cy="18" r="3.5" fill="#F43F5E" />
          <circle cx="106" cy="24" r="2.8" fill="#FDA4AF" />
          <circle cx="103" cy="28" r="2" fill="#86EFAC" />
        </g>

        {/* 灵动长耳 */}
        <ellipse cx="48" cy="46" rx="13" ry="6" transform="rotate(-35 48 46)" fill="url(#tt-fur)" stroke="#B45309" strokeWidth="1.8" />
        <ellipse cx="48" cy="46" rx="7" ry="3" transform="rotate(-35 48 46)" fill="#FEF3C7" />
        <ellipse cx="108" cy="46" rx="13" ry="6" transform="rotate(35 108 46)" fill="url(#tt-fur)" stroke="#B45309" strokeWidth="1.8" />
        <ellipse cx="108" cy="46" rx="7" ry="3" transform="rotate(35 108 46)" fill="#FEF3C7" />

        {/* 头部轮廓 */}
        <ellipse cx="78" cy="65" rx="27" ry="24" fill="url(#tt-fur)" stroke="#B45309" strokeWidth="2" />
        {/* 奶油口鼻区 */}
        <ellipse cx="78" cy="72" rx="18" ry="14" fill="#FFFBEB" />

        {/* 额头梅花斑点 */}
        <circle cx="72" cy="50" r="2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="84" cy="50" r="2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="78" cy="46" r="2.2" fill="#FFFFFF" opacity="0.9" />

        {/* 腮红 */}
        <ellipse cx="60" cy="73" rx="5" ry="3" fill="#FB7185" opacity="0.6" />
        <ellipse cx="96" cy="73" rx="5" ry="3" fill="#FB7185" opacity="0.6" />

        {/* 眼睛与表情 */}
        {pose === 'cheering' ? (
          <>
            <path d="M64 63 Q70 56 76 63" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M80 63 Q86 56 92 63" stroke="#1C1917" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* 飘舞花瓣 */}
            <circle cx="42" cy="30" r="3" fill="#FDA4AF" />
            <circle cx="116" cy="35" r="2.5" fill="#F43F5E" />
          </>
        ) : (
          <>
            <circle cx="68" cy="63" r="4.5" fill="#1C1917" />
            <circle cx="69.5" cy="61.5" r="1.8" fill="#FFFFFF" />
            <circle cx="67" cy="64.5" r="0.8" fill="#FFFFFF" />
            <circle cx="88" cy="63" r="4.5" fill="#1C1917" />
            <circle cx="89.5" cy="61.5" r="1.8" fill="#FFFFFF" />
            <circle cx="87" cy="64.5" r="0.8" fill="#FFFFFF" />
          </>
        )}

        {/* 柔和小黑鼻与微笑 */}
        <ellipse cx="78" cy="69" rx="3.5" ry="2.2" fill="#78350F" />
        <path d="M73 74 Q78 78 83 74" stroke="#78350F" strokeWidth="2" strokeLinecap="round" fill="none" />
      </g>

      {/* 手臂/蹄子动作 */}
      {pose === 'cheering' ? (
        <g id="tt-arms-cheer">
          <ellipse cx="56" cy="94" rx="6" ry="14" transform="rotate(-35 56 94)" fill="url(#tt-fur)" stroke="#B45309" strokeWidth="1.8" />
          <ellipse cx="100" cy="94" rx="6" ry="14" transform="rotate(35 100 94)" fill="url(#tt-fur)" stroke="#B45309" strokeWidth="1.8" />
        </g>
      ) : pose === 'comforting' ? (
        <g id="tt-arms-hug">
          {/* 温柔环抱双臂 */}
          <path d="M58 106 C42 102 34 112 32 120 C32 126 46 124 56 116" fill="url(#tt-fur)" stroke="#B45309" strokeWidth="2" />
          <path d="M98 106 C114 102 122 112 124 120 C124 126 110 124 100 116" fill="url(#tt-fur)" stroke="#B45309" strokeWidth="2" />
          {/* 怀中绽放的小粉花 */}
          <circle cx="78" cy="116" r="5" fill="#F43F5E" />
          <circle cx="78" cy="116" r="2" fill="#FEF08A" />
        </g>
      ) : pose === 'listening' ? (
        <g id="tt-arms-listen">
          <ellipse cx="64" cy="108" rx="6" ry="10" transform="rotate(15 64 108)" fill="url(#tt-fur)" stroke="#B45309" strokeWidth="1.8" />
          <ellipse cx="90" cy="108" rx="6" ry="10" transform="rotate(-15 90 108)" fill="url(#tt-fur)" stroke="#B45309" strokeWidth="1.8" />
        </g>
      ) : pose === 'thinking' ? (
        <g id="tt-arms-think">
          <ellipse cx="64" cy="106" rx="6" ry="10" transform="rotate(25 64 106)" fill="url(#tt-fur)" stroke="#B45309" strokeWidth="1.8" />
          <circle cx="70" cy="80" r="4" fill="#78350F" />
          {/* 头顶微光灵感 */}
          <polygon points="106,35 108,40 114,41 108,43 106,48 104,43 98,41 104,40" fill="#F59E0B" />
        </g>
      ) : (
        <g id="tt-arms-stand">
          <ellipse cx="64" cy="108" rx="6" ry="9" fill="url(#tt-fur)" stroke="#B45309" strokeWidth="1.8" />
          <ellipse cx="92" cy="108" rx="6" ry="9" fill="url(#tt-fur)" stroke="#B45309" strokeWidth="1.8" />
          <circle cx="78" cy="112" r="3.5" fill="#F43F5E" />
        </g>
      )}
    </g>
  );
};

/* -------------------------------------------------------------------------- */
/* 奇奇 (小猫头鹰) 矢量身体组件                                                */
/* -------------------------------------------------------------------------- */
const QiqiVectorBody: React.FC<{ pose: CompanionPose }> = ({ pose }) => {
  return (
    <g id="qiqi-full" filter="url(#char-shadow)">
      <defs>
        <linearGradient id="qq-cape" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="60%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>
        <radialGradient id="qq-eye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="70%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </radialGradient>
      </defs>

      {/* 爪子 */}
      <ellipse cx="66" cy="142" rx="8" ry="5" fill="#EA580C" />
      <ellipse cx="90" cy="142" rx="8" ry="5" fill="#EA580C" />

      {/* 星光羽翼披风（猫头鹰展开或收拢的翅膀） */}
      {pose === 'cheering' ? (
        <g id="wings-cheer">
          {/* 展开的双翼如同星空斗篷 */}
          <path
            d="M60 90 C30 75 14 55 18 42 C24 35 45 55 58 72 Z"
            fill="url(#qq-cape)"
            stroke="#312E81"
            strokeWidth="2"
          />
          <path
            d="M96 90 C126 75 142 55 138 42 C132 35 111 55 98 72 Z"
            fill="url(#qq-cape)"
            stroke="#312E81"
            strokeWidth="2"
          />
          {/* 星斗点缀 */}
          <circle cx="28" cy="50" r="2" fill="#FDE047" />
          <circle cx="38" cy="62" r="1.5" fill="#FDE047" />
          <circle cx="128" cy="50" r="2" fill="#FDE047" />
          <circle cx="118" cy="62" r="1.5" fill="#FDE047" />
        </g>
      ) : pose === 'comforting' ? (
        <g id="wings-comfort">
          {/* 一侧羽翼如同夜空毛毯般向前披护 */}
          <path
            d="M55 90 C35 95 38 120 50 126 C65 130 72 120 62 105 Z"
            fill="url(#qq-cape)"
            stroke="#312E81"
            strokeWidth="2"
          />
          <path
            d="M101 90 C121 95 118 120 106 126 C91 130 84 120 94 105 Z"
            fill="url(#qq-cape)"
            stroke="#312E81"
            strokeWidth="2"
          />
          {/* 星星徽章 */}
          <polygon points="78,110 80,115 86,116 81,119 83,124 78,121 73,124 75,119 70,116 76,115" fill="#FDE047" />
        </g>
      ) : (
        <g id="wings-fold">
          {/* 收拢在身侧的星光翅膀 */}
          <path d="M48 85 Q36 108 52 124 Q56 108 54 88 Z" fill="url(#qq-cape)" stroke="#312E81" strokeWidth="2" />
          <circle cx="46" cy="106" r="1.6" fill="#FDE047" />
          <path d="M108 85 Q120 108 104 124 Q100 108 102 88 Z" fill="url(#qq-cape)" stroke="#312E81" strokeWidth="2" />
          <circle cx="110" cy="106" r="1.6" fill="#FDE047" />
        </g>
      )}

      {/* 浑圆猫头鹰身体 */}
      <ellipse cx="78" cy="108" rx="28" ry="30" fill="url(#qq-cape)" stroke="#312E81" strokeWidth="2" />
      {/* 薰衣草浅紫肚皮 */}
      <ellipse cx="78" cy="112" rx="19" ry="22" fill="#EEF2FF" />
      {/* 肚皮羽毛波纹 */}
      <path d="M71 104 Q78 108 85 104" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M68 114 Q78 118 88 114" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <path d="M72 124 Q78 128 84 124" stroke="#818CF8" strokeWidth="1.8" strokeLinecap="round" fill="none" />

      {/* 头部（支持猫头鹰特色的大角度歪头探问） */}
      <g transform={pose === 'listening' ? 'rotate(18 78 60)' : pose === 'thinking' ? 'rotate(-10 78 60)' : ''}>
        {/* 羽簇尖耳 */}
        <polygon points="52,42 58,22 72,34" fill="#4338CA" stroke="#312E81" strokeWidth="1.8" strokeLinejoin="round" />
        <polygon points="104,42 98,22 84,34" fill="#4338CA" stroke="#312E81" strokeWidth="1.8" strokeLinejoin="round" />

        {/* 头部大圆 */}
        <ellipse cx="78" cy="62" rx="30" ry="26" fill="url(#qq-cape)" stroke="#312E81" strokeWidth="2" />

        {/* 标志性好奇金色大圆眼（猫头鹰的灵魂） */}
        <circle cx="64" cy="62" r="14" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="2" />
        <circle cx="92" cy="62" r="14" fill="#FFFFFF" stroke="#FBBF24" strokeWidth="2" />
        <circle cx="64" cy="62" r="10" fill="url(#qq-eye)" />
        <circle cx="92" cy="62" r="10" fill="url(#qq-eye)" />
        {/* 深邃瞳孔与明亮双重星芒高光 */}
        <circle cx="65.5" cy="62" r="5" fill="#0F172A" />
        <circle cx="64" cy="59.5" r="2" fill="#FFFFFF" />
        <circle cx="67.5" cy="63.5" r="1" fill="#FFFFFF" />
        <circle cx="90.5" cy="62" r="5" fill="#0F172A" />
        <circle cx="89" cy="59.5" r="2" fill="#FFFFFF" />
        <circle cx="92.5" cy="63.5" r="1" fill="#FFFFFF" />

        {/* 腮红 */}
        <ellipse cx="50" cy="71" rx="4.5" ry="2.8" fill="#FDA4AF" opacity="0.65" />
        <ellipse cx="106" cy="71" rx="4.5" ry="2.8" fill="#FDA4AF" opacity="0.65" />

        {/* 亮橙小喙 */}
        <polygon points="78,65 72,74 84,74" fill="#EA580C" />
      </g>
    </g>
  );
};

/* -------------------------------------------------------------------------- */
/* 兴趣徽章 SVG 系统                                                          */
/* -------------------------------------------------------------------------- */
export interface InterestBadgeSvgProps {
  interestId: InterestActivityId;
  className?: string;
}

export const InterestBadgeSvg: React.FC<InterestBadgeSvgProps> = ({
  interestId,
  className = 'w-6 h-6',
}) => {
  switch (interestId) {
    case 'drawing':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 3C7.03 3 3 6.58 3 11C3 15.42 7.03 19 12 19C13.38 19 14.5 17.88 14.5 16.5C14.5 15.86 14.26 15.27 13.86 14.83C13.48 14.41 13.25 13.86 13.25 13.25C13.25 11.87 14.37 10.75 15.75 10.75H17.5C19.99 10.75 22 8.74 22 6.25C22 4.45 17.52 3 12 3Z"
            fill="#FDE68A"
            stroke="#D97706"
            strokeWidth="1.6"
          />
          <circle cx="7.5" cy="10.5" r="1.6" fill="#EF4444" />
          <circle cx="11" cy="7.5" r="1.6" fill="#3B82F6" />
          <circle cx="15.5" cy="7.5" r="1.6" fill="#10B981" />
          <circle cx="16" cy="14.5" r="1.4" fill="#F59E0B" />
        </svg>
      );
    case 'sports':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="9.5" fill="#F8FAFC" stroke="#0F172A" strokeWidth="1.8" />
          <polygon points="12,7.5 15.5,10.2 14.2,14.5 9.8,14.5 8.5,10.2" fill="#1E293B" />
          <path d="M12 2.5V7.5M15.5 10.2L20.5 8.8M14.2 14.5L17.5 19.5M9.8 14.5L6.5 19.5M8.5 10.2L3.5 8.8" stroke="#334155" strokeWidth="1.5" />
        </svg>
      );
    case 'nature':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,2.5 4.5,13 8.5,13 5.5,18.5 18.5,18.5 15.5,13 19.5,13" fill="#34D399" stroke="#059669" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="10.5" y="18.5" width="3" height="3.5" rx="0.8" fill="#78350F" />
        </svg>
      );
    case 'puzzle':
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3.5" y="11.5" width="8" height="8" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <rect x="12.5" y="11.5" width="8" height="8" rx="2" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <polygon points="12,3 6,10.5 18,10.5" fill="#FB7185" stroke="#E11D48" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
  }
};

/* -------------------------------------------------------------------------- */
/* 晴雨小岛 · 核心操作与界面原创矢量图标 (Zero-Tofu UI Icon System)           */
/* -------------------------------------------------------------------------- */
export type IslandUiIconName =
  | 'island_brand'
  | 'map_compass'
  | 'card_grid'
  | 'interactive_games'
  | 'medals_star'
  | 'calm_leaf'
  | 'hug_heart'
  | 'detective_hammer'
  | 'waiting_lantern'
  | 'mom_home'
  | 'dad_home'
  | 'magnifier'
  | 'scales'
  | 'lightbulb'
  | 'sparkles'
  | 'star'
  | 'palette'
  | 'sprout'
  | 'heart'
  | 'balloon'
  | 'book'
  | 'music'
  | 'sun'
  | 'cloud_rain'
  | 'rainbow'
  | 'shield'
  | 'puzzle'
  | 'boat'
  | 'tree'
  | 'frog'
  | 'rabbit'
  | 'kite'
  | 'mountain'
  | 'water_drop'
  | 'cherry_blossom'
  | 'rocket'
  | 'acorn'
  | 'blocks'
  | 'antlers'
  | 'owl_feather';

export interface IslandUiIconSvgProps {
  name: IslandUiIconName;
  className?: string;
}

export const IslandUiIconSvg: React.FC<IslandUiIconSvgProps> = ({
  name,
  className = 'w-5 h-5',
}) => {
  switch (name) {
    case 'island_brand':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="11" cy="11" r="6" fill="#FDE047" stroke="#F59E0B" strokeWidth="1.5" />
          <path
            d="M11 21H23C25.5 21 27.5 19 27.5 16.5C27.5 14.1 25.7 12.2 23.4 12C22.5 8.8 19.6 6.5 16 6.5C11.9 6.5 8.5 9.8 8.5 14C8.5 14.3 8.5 14.6 8.6 14.9C6.6 15.4 5.2 17.2 5.2 19.3C5.2 20.3 6 21 7 21H11Z"
            fill="#FFFFFF"
            stroke="#0284C7"
            strokeWidth="1.8"
          />
          <path d="M5 26.5C9.5 22.5 22.5 22.5 27 26.5Z" fill="#34D399" stroke="#059669" strokeWidth="1.6" />
        </svg>
      );
    case 'map_compass':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.8" strokeLinejoin="round" />
          <line x1="9" y1="3" x2="9" y2="18" stroke="#D97706" strokeWidth="1.5" />
          <line x1="15" y1="6" x2="15" y2="21" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="2.2" fill="#10B981" />
        </svg>
      );
    case 'card_grid':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="8" height="8" rx="2" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.8" />
          <rect x="13" y="3" width="8" height="8" rx="2" fill="#FDE68A" stroke="#D97706" strokeWidth="1.8" />
          <rect x="3" y="13" width="8" height="8" rx="2" fill="#A7F3D0" stroke="#059669" strokeWidth="1.8" />
          <rect x="13" y="13" width="8" height="8" rx="2" fill="#FECDD3" stroke="#E11D48" strokeWidth="1.8" />
        </svg>
      );
    case 'interactive_games':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2.5" y="6" width="19" height="12" rx="6" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.8" />
          <path d="M8.5 10V14M6.5 12H10.5" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="15.5" cy="10.8" r="1.4" fill="#E11D48" />
          <circle cx="17.8" cy="13.2" r="1.4" fill="#0284C7" />
        </svg>
      );
    case 'medals_star':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 14L6 21L12 18L18 21L16 14" fill="#F59E0B" stroke="#B45309" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="12" cy="9.5" r="6.5" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.8" />
          <polygon points="12,5.5 13.2,8.1 16,8.4 13.9,10.3 14.5,13 12,11.6 9.5,13 10.1,10.3 8,8.4 10.8,8.1" fill="#D97706" />
        </svg>
      );
    case 'calm_leaf':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 4C10.5 4 5 8.5 5 15.5C5 17.5 5.8 19 6.8 20C13.5 20 19 15 19 7.5C19 5.5 18.2 4 17 4Z" fill="#6EE7B7" stroke="#059669" strokeWidth="1.8" />
          <path d="M5.5 19.5C8.5 15.5 11.5 12.5 15.5 8.5" stroke="#047857" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'hug_heart':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 20.5C12 20.5 4 15.2 4 9.2C4 6.4 6.2 4.2 9 4.2C10.6 4.2 12 5 12 5C12 5 13.4 4.2 15 4.2C17.8 4.2 20 6.4 20 9.2C20 15.2 12 20.5 12 20.5Z"
            fill="#FFE4E6"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'detective_hammer':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="11" height="6" rx="2" transform="rotate(-15 4 4)" fill="#FEF3C7" stroke="#92400E" strokeWidth="1.8" />
          <path d="M11 10L18 19" stroke="#78350F" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case 'waiting_lantern':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="17" r="10" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
          <circle cx="16" cy="17" r="5" fill="#FBBF24" />
          <path d="M12 7H20M16 4V7" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'mom_home':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="3,11 12,3 21,11" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="5.5" y="11" width="13" height="9.5" rx="1.5" fill="#FFF1F2" stroke="#E11D48" strokeWidth="1.6" />
          <path d="M12 17.5C12 17.5 9.5 15.6 9.5 13.8C9.5 12.8 10.3 12 11.2 12C11.7 12 12 12.3 12 12.3C12 12.3 12.3 12 12.8 12C13.7 12 14.5 12.8 14.5 13.8C14.5 15.6 12 17.5 12 17.5Z" fill="#F43F5E" />
        </svg>
      );
    case 'dad_home':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="3,11 12,3 21,11" fill="#7DD3FC" stroke="#0284C7" strokeWidth="1.6" strokeLinejoin="round" />
          <rect x="5.5" y="11" width="13" height="9.5" rx="1.5" fill="#F0F9FF" stroke="#0284C7" strokeWidth="1.6" />
          <polygon points="12,12 13,14.2 15.4,14.5 13.6,16.1 14.1,18.4 12,17.2 9.9,18.4 10.4,16.1 8.6,14.5 11,14.2" fill="#0284C7" />
        </svg>
      );
    case 'magnifier':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="10.5" cy="10.5" r="6.5" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          <path d="M7.5 7.5 A 4 4 0 0 1 11.5 6.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15.5" y1="15.5" x2="20.5" y2="20.5" stroke="#92400E" strokeWidth="2.8" strokeLinecap="round" />
        </svg>
      );
    case 'scales':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="12" y1="3" x2="12" y2="21" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <line x1="4" y1="7" x2="20" y2="7" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <polygon points="12,3 10,6 14,6" fill="#F59E0B" />
          <path d="M4 7 L2 14 Q6 16 10 14 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
          <path d="M20 7 L14 14 Q18 16 22 14 Z" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
          <line x1="8" y1="21" x2="16" y2="21" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'lightbulb':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 18H15M10 21H14M12 2A7 7 0 0 0 5 9C5 12.38 7.24 14.5 8 16H16C16.76 14.5 19 12.38 19 9A7 7 0 0 0 12 2Z"
            fill="#FEF08A"
            stroke="#F59E0B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'sparkles':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L14 8L20 10L14 12L12 18L10 12L4 10L10 8Z" fill="#FDE047" stroke="#F59E0B" strokeWidth="1.2" />
          <circle cx="18" cy="18" r="2" fill="#F59E0B" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,2 15,9 22,9.5 17,14.5 18.5,21.5 12,18 5.5,21.5 7,14.5 2,9.5 9,9" fill="#FDE047" stroke="#F59E0B" strokeWidth="1.5" />
        </svg>
      );
    case 'palette':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 3C7 3 3 6.5 3 11C3 15.5 7 19 12 19C13.5 19 14.5 17.8 14.5 16.5C14.5 15.8 14.2 15.2 13.8 14.8C13.5 14.4 13.2 13.8 13.2 13.2C13.2 11.9 14.4 10.8 15.8 10.8H17.5C20 10.8 22 8.8 22 6.2C22 4.5 17.5 3 12 3Z"
            fill="#FEF08A"
            stroke="#D97706"
            strokeWidth="1.5"
          />
          <circle cx="7" cy="10" r="1.5" fill="#EF4444" />
          <circle cx="11" cy="7" r="1.5" fill="#3B82F6" />
          <circle cx="15.5" cy="7" r="1.5" fill="#10B981" />
        </svg>
      );
    case 'sprout':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21V11" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 13C8 13 5 10 5 6C9 6 12 9 12 13Z" fill="#86EFAC" stroke="#16A34A" strokeWidth="1.5" />
          <path d="M12 11C15 11 19 8 19 4C15 4 12 7 12 11Z" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
            fill="#F43F5E"
            stroke="#BE123C"
            strokeWidth="1.2"
          />
        </svg>
      );
    case 'shield':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 5V11C4 16.5 7.5 21.5 12 23C16.5 21.5 20 16.5 20 11V5L12 2Z" fill="#FECDD3" stroke="#E11D48" strokeWidth="1.8" />
          <path d="M12 7C12 7 9 9.5 9 12C9 14 10.5 15.5 12 17C13.5 15.5 15 14 15 12C15 9.5 12 7 12 7Z" fill="#F43F5E" />
        </svg>
      );
    case 'puzzle':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 11H7C7 9.5 8.5 8 10 8C11.5 8 13 9.5 13 11H16V14C14.5 14 13 15.5 13 17C13 18.5 14.5 20 16 20H4V11Z" fill="#93C5FD" stroke="#2563EB" strokeWidth="1.5" />
          <path d="M16 11V4H9C9 5.5 7.5 7 6 7C4.5 7 3 5.5 3 4H20V11H16Z" fill="#FCD34D" stroke="#D97706" strokeWidth="1.5" />
        </svg>
      );
    case 'boat':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 16L5 20H19L21 16H3Z" fill="#92400E" stroke="#78350F" strokeWidth="1.5" />
          <line x1="12" y1="16" x2="12" y2="4" stroke="#78350F" strokeWidth="2" />
          <polygon points="12,5 19,13 12,13" fill="#FDE047" stroke="#D97706" strokeWidth="1.2" />
          <polygon points="11,6 5,13 11,13" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.2" />
        </svg>
      );
    case 'tree':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="9" r="6" fill="#10B981" stroke="#059669" strokeWidth="1.5" />
          <circle cx="8" cy="11" r="4.5" fill="#34D399" />
          <circle cx="16" cy="11" r="4.5" fill="#34D399" />
          <rect x="10.5" y="14" width="3" height="7" rx="1" fill="#78350F" />
        </svg>
      );
    case 'frog':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="14" rx="8" ry="6" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.5" />
          <circle cx="8" cy="8" r="3.5" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.2" />
          <circle cx="16" cy="8" r="3.5" fill="#4ADE80" stroke="#16A34A" strokeWidth="1.2" />
          <circle cx="8" cy="8" r="1.5" fill="#000000" />
          <circle cx="16" cy="8" r="1.5" fill="#000000" />
          <path d="M8 14 Q12 17 16 14" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case 'rabbit':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="15" rx="7" ry="6" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
          <ellipse cx="9" cy="6" rx="2" ry="5" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
          <ellipse cx="15" cy="6" rx="2" ry="5" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.2" />
          <circle cx="10" cy="14" r="1" fill="#000" />
          <circle cx="14" cy="14" r="1" fill="#000" />
          <circle cx="12" cy="16" r="1" fill="#FB7185" />
        </svg>
      );
    case 'kite':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,2 18,10 12,18 6,10" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
          <line x1="12" y1="2" x2="12" y2="18" stroke="#D97706" strokeWidth="1.2" />
          <line x1="6" y1="10" x2="18" y2="10" stroke="#D97706" strokeWidth="1.2" />
          <path d="M12 18 Q14 21 16 22" stroke="#E11D48" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </svg>
      );
    case 'mountain':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,4 2,20 22,20" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" strokeLinejoin="round" />
          <polygon points="12,4 9,9 12,8 15,9" fill="#FFFFFF" />
        </svg>
      );
    case 'water_drop':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 3 C12 3 6 10.5 6 15 A 6 6 0 0 0 18 15 C18 10.5 12 3 12 3 Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <circle cx="9.5" cy="15" r="1.5" fill="#FFFFFF" opacity="0.8" />
        </svg>
      );
    case 'cherry_blossom':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="2.5" fill="#FEF08A" stroke="#EAB308" strokeWidth="1" />
          <path d="M12 9.5 C11 6 13 6 12 9.5 M14.5 12 C18 11 18 13 14.5 12 M12 14.5 C13 18 11 18 12 14.5 M9.5 12 C6 13 6 11 9.5 12" stroke="#F43F5E" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      );
    case 'rocket':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8 6 8 13 8 17L12 15L16 17C16 13 16 6 12 2Z" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <circle cx="12" cy="8" r="2" fill="#FEF08A" />
          <polygon points="8,14 4,17 8,17" fill="#F87171" />
          <polygon points="16,14 20,17 16,17" fill="#F87171" />
          <polygon points="12,17 10,21 12,20 14,21" fill="#F59E0B" />
        </svg>
      );
    case 'acorn':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 10 C6 16 12 21 12 21 C12 21 18 16 18 10 Z" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
          <path d="M4 10 Q12 5 20 10 Z" fill="#78350F" stroke="#451A03" strokeWidth="1.5" />
          <line x1="12" y1="5" x2="12" y2="2" stroke="#451A03" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'blocks':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="13" width="8" height="8" rx="2" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
          <rect x="13" y="13" width="8" height="8" rx="2" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          <rect x="8" y="4" width="8" height="8" rx="2" fill="#34D399" stroke="#059669" strokeWidth="1.5" />
        </svg>
      );
    case 'antlers':
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 19 L6 7 M6 13 L2 10 M6 9 L4 6" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
          <path d="M17 19 L18 7 M18 13 L22 10 M18 9 L20 6" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
          <circle cx="2" cy="10" r="1.5" fill="#F43F5E" />
          <circle cx="22" cy="10" r="1.5" fill="#F43F5E" />
        </svg>
      );
    case 'owl_feather':
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3C10 5 4 13 4 21C7 20 15 16 19 3Z" fill="#818CF8" stroke="#4F46E5" strokeWidth="1.5" />
          <line x1="4" y1="21" x2="15" y2="10" stroke="#312E81" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
};

/**
 * 消除全系统跨平台 Unicode 缺失导致豆腐块 (▯) 的通用矢量替换器
 */
export const ZeroTofuIcon: React.FC<{
  glyphOrName: string;
  className?: string;
}> = ({ glyphOrName, className = 'w-4 h-4 inline-block align-middle' }) => {
  const map: Record<string, IslandUiIconName> = {
    '🎨': 'palette',
    '⚽': 'interactive_games',
    '🌲': 'tree',
    '🧩': 'puzzle',
    '⭐': 'star',
    '✨': 'sparkles',
    '🏡': 'mom_home',
    '🌱': 'sprout',
    '🌸': 'cherry_blossom',
    '🚀': 'rocket',
    '💡': 'lightbulb',
    '🔎': 'magnifier',
    '🔍': 'magnifier',
    '⚖️': 'scales',
    '🐸': 'frog',
    '🐰': 'rabbit',
    '⛰️': 'mountain',
    '💧': 'water_drop',
    '❤️': 'heart',
    '🛡️': 'shield',
    '⛵': 'boat',
    '🪁': 'kite',
    '🐿️': 'acorn',
    '🦦': 'blocks',
    '🦝': 'blocks',
    '🦌': 'antlers',
  };

  const matched = map[glyphOrName] || (glyphOrName as IslandUiIconName);
  return <IslandUiIconSvg name={matched} className={className} />;
};
