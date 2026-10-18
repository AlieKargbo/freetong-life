'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { CURRENCY, useGame } from './utils/Store';
import GameHUD from './zoned/Utils/GameHUD';
type Chip = { icon: string; label: string; onClick?: () => void };

type Props = {
  online?: number;
  visits?: number;
  headline?: string;
  chips?: Chip[];
  signupHref?: string;
  loginHref?: string;
  authenticated?: boolean;
  onHome?: () => void;
  onMap?: () => void;
  onPhone?: () => void;
  onOpenJobs?: () => void;
  onOpenSettings?: () => void;
  money?: number;
  mood?: string;
  gemCount?: number;
  nextGemPrize?: number;
  avatar?: string;
  showNeeds?: boolean;
};

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
const AVATARS = ['🧑🏿', '👩🏾', '👨🏽', '🧑🏾'];

const DEFAULT_CHIPS: Chip[] = [
  { icon: '🏛️', label: 'Mayor @Aki-Sawyerr' },
  // { icon: '🌊', label: 'Sea Plots' },
  // { icon: '🏠', label: '400 homes' },
];

/* Small stroke icons for the social buttons */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

const SOCIALS: { label: string; icon: ReactNode }[] = [
  { label: 'X', icon: <Icon><path d="M4 4l16 16M20 4L4 20" /></Icon> },
  { label: 'TikTok', icon: <Icon><path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.4 2.4 2 4 4.5 4.2" /></Icon> },
  {
    label: 'Instagram',
    icon: (
      <Icon>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </Icon>
    ),
  },
  { label: 'LinkedIn', icon: <span className="text-sm font-extrabold leading-none">in</span> },
];

export default function Hud({
  online,
  visits,
  headline = '🍲 Food subsidy is law this week',
  chips = DEFAULT_CHIPS,
  signupHref = '/signup',
  loginHref = '/login',
  authenticated = false,
  onHome,
  onMap,
  onPhone,
  onOpenJobs,
  onOpenSettings,
  money,
  mood,
  gemCount,
  nextGemPrize,
  avatar,
  showNeeds,
}: Props) {
  const storedMoney = useGame((state) => state.money);
  const [liveStats, setLiveStats] = useState<{ online: number | null; visits: number | null }>({ online: null, visits: null });

  useEffect(() => {
    let active = true;
    const loadStats = async () => {
      try {
        const response = await fetch('/api/site-stats', { cache: 'no-store' });
        if (!response.ok) return;
        const data: unknown = await response.json();
        if (!data || typeof data !== 'object') return;
        const result = data as Record<string, unknown>;
        if (active) setLiveStats({
          online: Number.isSafeInteger(result.online) && Number(result.online) >= 0 ? Number(result.online) : null,
          visits: Number.isSafeInteger(result.visits) && Number(result.visits) >= 0 ? Number(result.visits) : null,
        });
      } catch {
        // Stats are optional while the realtime service is unavailable.
      }
    };

    void loadStats();
    const interval = window.setInterval(() => { if (active) void loadStats(); }, 30_000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const shownOnline = online ?? liveStats.online;
  const shownVisits = visits ?? liveStats.visits;

  if (authenticated) {
    return (
      <GameHUD
        onHome={onHome}
        onMap={onMap}
        onOpenPhone={onPhone}
        onOpenJobs={onOpenJobs}
        onOpenSettings={onOpenSettings}
        money={money ?? storedMoney}
        mood={mood}
        gemCount={gemCount}
        nextGemPrize={nextGemPrize}
        avatar={avatar}
        showNeeds={showNeeds}
      />
    );
  }

  return (
    // The overlay itself ignores the pointer so the map can still be dragged; only the cards catch it.
    <div className="pointer-events-none absolute inset-0 z-50 flex flex-col justify-between">
      {/* ───────── Top ───────── */}
      <div className="flex flex-col items-center gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <header className="pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-full bg-white/90 py-2 pl-4 pr-2 shadow-lg backdrop-blur">
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-2xl leading-none">👑</span>
            <span className="truncate text-lg font-extrabold tracking-tight text-slate-800">Freetown Life</span>
            <span className="hidden items-center gap-1.5 text-sm font-semibold text-emerald-600 sm:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              
              {shownOnline === null ? 'online' : `${compact.format(shownOnline)} online`}
            </span>
            <span className="hidden items-center gap-1.5 text-sm font-semibold text-slate-500 md:flex">
              👀 
              
              {shownVisits === null ? 'visits' : `${compact.format(shownVisits)} visits`}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700" aria-label="Wallet balance">
              {CURRENCY}{compact.format(storedMoney)}
            </span>
            <a href={signupHref} className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow hover:bg-emerald-600">
              Sign up
            </a>
            <a href={loginHref} className="rounded-full px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100">
              Log in
            </a>
          </div>
        </header>

        <div className="pointer-events-auto flex flex-wrap justify-center gap-2">
          {chips.map((c) => (
            <button
              key={c.label}
              onClick={c.onClick}
              className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-semibold text-slate-700 shadow-md backdrop-blur hover:bg-white"
            >
              <span>{c.icon}</span>
              {c.label}
            </button>
          ))}
        </div>

        <div className="pointer-events-auto w-full max-w-3xl rounded-full bg-emerald-700 px-5 py-2 text-center text-sm font-bold text-white shadow-lg">
          {headline}
        </div>
      </div>

      {/* ───────── Bottom ───────── */}
      <div className="flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto w-full max-w-md rounded-3xl bg-white/95 p-3 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-2 px-1 pb-2">
            <div className="flex -space-x-2">
              {AVATARS.map((e, i) => (
                <span key={i} className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-lg ring-2 ring-white">
                  {e}
                </span>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              <span className="font-bold text-slate-800">
                
                {/* {compact.format(online)}  */}
                
                {shownOnline === null ? 'Freetonians' : compact.format(shownOnline)}</span> playing right now · free
            </p>
          </div>

          <div className="flex gap-2">
            <a href={signupHref} className="flex-1 rounded-full bg-emerald-500 py-4 text-center text-lg font-bold text-white shadow hover:bg-emerald-600">
              Sign up free
            </a>
            <a href={loginHref} className="rounded-full border border-slate-200 bg-white px-7 py-4 text-lg font-bold text-slate-700 hover:bg-slate-50">
              Log in
            </a>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600">
              <span className="text-emerald-500">✔</span> Official
            </span>
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="#"
                aria-label={s.label}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
