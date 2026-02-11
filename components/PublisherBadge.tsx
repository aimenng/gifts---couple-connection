import React from 'react';
import { UserCircle2 } from 'lucide-react';

type AuthorGender = 'male' | 'female' | null | undefined;

interface PublisherBadgeProps {
  tag: string;
  name?: string;
  avatar?: string;
  gender?: AuthorGender;
  isOwn?: boolean;
  className?: string;
}

const getGenderToken = (gender: AuthorGender) => {
  if (gender === 'female') {
    return {
      symbol: '♀',
      chipClass: 'bg-rose-500 text-white',
    };
  }
  return {
    symbol: '♂',
    chipClass: 'bg-sky-500 text-white',
  };
};

export const PublisherBadge: React.FC<PublisherBadgeProps> = ({
  tag,
  name,
  avatar,
  gender,
  isOwn = false,
  className = '',
}) => {
  const token = getGenderToken(gender);
  const shellClass = isOwn
    ? 'border-primary/40 bg-primary/5 text-[var(--eye-text-primary)]'
    : 'border-sky-200/70 bg-sky-50/70 text-[var(--eye-text-primary)] dark:border-sky-800/50 dark:bg-sky-900/20';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold shrink-0 ${shellClass} ${className}`}
      title={name || tag}
    >
      <span className="relative inline-flex h-4 w-4 items-center justify-center">
        {avatar ? (
          <img src={avatar} alt={name || tag} className="h-4 w-4 rounded-full object-cover" />
        ) : (
          <UserCircle2 className="h-4 w-4" />
        )}
        <span
          className={`absolute -bottom-1 -right-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] leading-none shadow-sm ${token.chipClass}`}
          aria-hidden
        >
          {token.symbol}
        </span>
      </span>
      <span>{tag}</span>
    </span>
  );
};

