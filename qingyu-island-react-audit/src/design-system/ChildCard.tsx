import React from 'react';
import { tokens } from './tokens';

export interface ChildCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
  elevation?: 'flat' | 'raised';
}

export const ChildCard: React.FC<ChildCardProps> = ({
  children,
  interactive = false,
  elevation = 'raised',
  className = '',
  ...props
}) => {
  const base =
    'rounded-3xl bg-white/95 border-2 transition-all duration-200 motion-reduce:transition-none';
  const shadow =
    elevation === 'raised' ? 'shadow-md border-stone-200/80' : 'shadow-none border-stone-200/50';
  const hover = interactive
    ? 'cursor-pointer hover:border-sky-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0'
    : '';

  return (
    <div className={`${base} ${shadow} ${hover} p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
};
