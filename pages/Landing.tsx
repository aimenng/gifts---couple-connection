import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Heart } from 'lucide-react';
import { IMAGES } from '../constants';
import { LoveTimer } from '../components/LoveTimer';
import { useApp } from '../context';
import { useAuth } from '../authContext';

interface LandingProps {
  onEnter: () => void;
}

const FloatingHearts: React.FC = () => {
  const hearts = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: 10 + Math.random() * 18,
        delay: `${Math.random() * 8}s`,
        duration: `${8 + Math.random() * 8}s`,
        opacity: 0.15 + Math.random() * 0.2,
      })),
    []
  );

  return (
    <div className="floating-hearts">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="heart"
          style={{
            left: h.left,
            animationDelay: h.delay,
            animationDuration: h.duration,
          }}
        >
          <Heart
            style={{ width: h.size, height: h.size, opacity: h.opacity }}
            className="text-primary/40 fill-current"
          />
        </div>
      ))}
    </div>
  );
};

export const LandingPage: React.FC<LandingProps> = ({ onEnter }) => {
  const { togetherDate } = useApp();
  const { currentUser, partner } = useAuth();
  const [entered, setEntered] = useState(false);
  const enterTimerRef = useRef<number | null>(null);

  const avatar1 = currentUser?.avatar || IMAGES.COFFEE;
  const avatar2 = partner?.avatar;

  useEffect(() => {
    return () => {
      if (enterTimerRef.current !== null) {
        window.clearTimeout(enterTimerRef.current);
      }
    };
  }, []);

  const handleEnter = () => {
    if (enterTimerRef.current !== null) {
      window.clearTimeout(enterTimerRef.current);
    }
    setEntered(true);
    enterTimerRef.current = window.setTimeout(onEnter, 400);
  };

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-between px-6 pt-16 pb-safe-bottom h-full relative overflow-hidden transition-all duration-500 ${
        entered ? 'opacity-0 scale-105' : ''
      }`}
    >
      <FloatingHearts />

      <div className="absolute top-20 -right-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-32 -left-20 w-48 h-48 rounded-full bg-rose-400/10 blur-3xl pointer-events-none" />

      <div className="w-full flex flex-col items-center gap-8 mt-8 relative z-10">
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          <h1
            className="font-bold tracking-widest uppercase font-display gradient-text"
            style={{ fontWeight: 800, letterSpacing: '0.18em', fontSize: 'clamp(2.5rem, 12vw, 3.75rem)' }}
          >
            GIFTS
          </h1>
          <p className="text-sage/70 text-sm font-medium tracking-[0.3em] uppercase">记录爱的每一刻</p>
        </div>

        <div
          className="relative flex items-center justify-center py-6 animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          <div
            className="absolute w-[min(11rem,40vw)] h-[min(11rem,40vw)] rounded-full border border-dashed border-primary/20"
            style={{ animation: 'ring-rotate 20s linear infinite' }}
          />
          <div
            className="absolute w-[min(13rem,48vw)] h-[min(13rem,48vw)] rounded-full border border-dotted border-sage/10"
            style={{ animation: 'ring-rotate 30s linear infinite reverse' }}
          />

          <div className="w-[min(7rem,26vw)] h-[min(7rem,26vw)] rounded-full border-[4px] border-[#FFFDD0] shadow-lg z-10 overflow-hidden bg-stone-200 -mr-5 relative animate-pulse-glow">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${avatar1}')` }} />
          </div>

          <div className="w-[min(7rem,26vw)] h-[min(7rem,26vw)] rounded-full border-[4px] border-[#FFFDD0] shadow-lg z-0 overflow-hidden bg-[#E8E6D9] -ml-5 flex items-center justify-center relative">
            {avatar2 ? (
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${avatar2}')` }} />
            ) : (
              <UserIconPlaceholder />
            )}
          </div>

          <div className="absolute z-20 bg-white rounded-full p-2.5 shadow-md flex items-center justify-center top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-8 animate-heartbeat">
            <Heart className="w-5 h-5 text-rose-400 fill-current" />
          </div>
        </div>

        {currentUser && partner ? (
          <div
            className="flex items-center gap-3 text-sage font-semibold animate-fade-in"
            style={{ animationDelay: '0.3s' }}
          >
            <span className="text-base">{currentUser.name || '我'}</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-current animate-heartbeat" />
            <span className="text-base">{partner.name || 'Ta'}</span>
          </div>
        ) : (
          <div className="h-6" />
        )}

        <div className="w-full max-w-xs animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <LoveTimer startDate={togetherDate} size="small" />
        </div>
      </div>

      <div
        className="w-full space-y-6 mb-8 flex flex-col items-center relative z-10 animate-fade-in-up"
        style={{ animationDelay: '0.5s' }}
      >
        <button
          onClick={handleEnter}
          className="group relative w-full max-w-[280px] bg-gradient-to-r from-primary to-[#9aad67] text-white h-[56px] rounded-full text-[17px] font-semibold tracking-wide shadow-glow hover:shadow-lg hover:from-[#7a8a4b] hover:to-[#8a9a5b] active:from-[#5c6b38] active:to-[#6a7a42] active:scale-[0.95] active:shadow-inner transition-all duration-200 flex items-center justify-center gap-2 overflow-hidden"
        >
          <div className="absolute inset-0 animate-shimmer opacity-30 group-hover:opacity-50 transition-opacity" />
          <span className="relative z-10">{currentUser ? '进入我们的世界' : '开始记录爱'}</span>
          <Heart className="w-4 h-4 relative z-10 fill-current opacity-80 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};

const UserIconPlaceholder = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-stone-400/50">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
