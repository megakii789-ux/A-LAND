import React from 'react';
import { tokens } from './tokens';

export interface ChildButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'warm' | 'calm';
  size?: 'normal' | 'large' | 'icon';
  fullWidth?: boolean;
  children: React.ReactNode;
  'aria-label': string; // 强制提供 aria-label，保障可访问性
}

export const ChildButton: React.FC<ChildButtonProps> = ({
  variant = 'primary',
  size = 'normal',
  fullWidth = false,
  className = '',
  children,
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-bold tracking-wide select-none cursor-pointer transition-all duration-200 motion-reduce:transition-none active:scale-95 motion-reduce:active:scale-100 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500';

  const sizeStyles = {
    normal: `${tokens.touchTarget.childMin} px-5 py-3.5 text-base sm:text-lg rounded-2xl`,
    large: `${tokens.touchTarget.childPrimaryAction} text-lg sm:text-xl rounded-2xl`,
    icon: `${tokens.touchTarget.childIconButton} rounded-2xl p-2`,
  }[size];

  const variantStyles = {
    primary:
      'bg-sky-600 hover:bg-sky-700 text-white shadow-md hover:shadow-lg border-2 border-sky-500/20',
    secondary:
      'bg-white hover:bg-stone-50 text-stone-800 border-2 border-stone-200 shadow-sm hover:border-stone-300',
    warm:
      'bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg border-2 border-amber-400/20',
    calm:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg border-2 border-emerald-500/20',
  }[variant];

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${widthStyle} ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </button>
  );
};
