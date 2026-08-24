import { type ElementType, type ReactNode } from 'react';

type CardVariant = 'light' | 'dark' | 'muted' | 'ghost';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  hover?: boolean;
  as?: ElementType;
  padding?: 'sm' | 'md' | 'lg';
}

const VARIANTS: Record<CardVariant, string> = {
  light: 'bg-cream-50 border border-ink-100',
  muted: 'bg-cream-100 border border-ink-100',
  dark: 'bg-ink-800 border border-ink-700',
  ghost: 'bg-transparent border border-ink-100',
};

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-7',
};

export default function Card({
  children,
  className = '',
  variant = 'light',
  hover = false,
  as: Tag = 'div',
  padding = 'md',
}: CardProps) {
  const hoverClass =
    variant === 'dark'
      ? 'transition-colors duration-300 hover:bg-ink-700'
      : 'transition-colors duration-300 hover:border-ink-300';

  return (
    <Tag
      className={`${VARIANTS[variant]} ${PADDING[padding]} ${hover ? hoverClass : ''} ${className}`}
    >
      {children}
    </Tag>
  );
}
