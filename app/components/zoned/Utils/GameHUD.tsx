'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  Gem,
  Menu,
  X,
  EyeOff,
  Eye,
  Smartphone,
  Settings,
  Volume2,
  Home,
  Map as MapIcon,
  ShoppingBag,
  LogOut,
} from 'lucide-react';
import PlayerStatusBar from '../Interior/PlayerStatusBar';
import { AUTH_STORAGE_KEY, PLAYER_USERNAME_STORAGE_KEY, game, removeMigratedLocalStorage, useGame } from '../../utils/Store';
import useGameClock from '../../utils/useGameClock';
import { formatGameTime } from '@/app/Game/clock';
import { CAREER_JOBS, getCareerRank, getCareerShiftPay } from '@/app/Game/careers';
import { skillLevelForXp } from '@/app/Game/skills';

type GameHUDProps = {
  onOpenJobs?: () => void;
  onOpenPhone?: () => void;
  onOpenSettings?: () => void;
  onHome?: () => void;
  onMap?: () => void;
  money?: number;
  mood?: string;
  gemCount?: number;
  nextGemPrize?: number;
  avatar?: string;
  showNeeds?: boolean;
};

const moneyFormat = new Intl.NumberFormat('en-US');

export default function GameHUD({
  onOpenJobs,
  onOpenPhone,
  onOpenSettings,
  onHome,
  onMap,
  money = 1091000,
  mood = 'Happy',
  gemCount = 9166,
  nextGemPrize = 3000,
  avatar,
  showNeeds = true,
}: GameHUDProps) {
  const worldClock = useGameClock();
  const hasCafeJob = useGame((state) => state.hasCafeJob);
  const shiftsCompleted = useGame((state) => state.shiftsCompleted);
  const careerProgress = useGame((state) => state.careerProgress);
  const hustleXp = useGame((state) => state.skills.hustle);
  const firstDayComplete = useGame((state) => state.firstDayComplete);
  const skillGoalRewarded = useGame((state) => state.skillGoalRewarded);
  const interiorId = useGame((state) => state.interior?.id ?? null);
  const needs = useGame((state) => state.needs);
  const activeCareerJob = CAREER_JOBS.find((job) => job.id === careerProgress.activeJobId) ?? null;
  const activeShiftJob = CAREER_JOBS.find((job) => job.id === careerProgress.activeShiftJobId) ?? null;
  const careerStatusJob = activeShiftJob ?? activeCareerJob;
  const careerStatusStats = careerStatusJob ? careerProgress.jobs[careerStatusJob.id] : null;
  const careerStatusRank = careerStatusStats ? getCareerRank(careerStatusStats.shiftsCompleted) : null;
  const careerStatusPay = careerStatusJob && careerStatusStats
    ? getCareerShiftPay(careerStatusJob, careerStatusStats.shiftsCompleted, skillLevelForXp(hustleXp))
    : 0;
  const messageNotification = useGame((state) => state.messageNotification);
  const [clean, setClean] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [reminderToast, setReminderToast] = useState<{
    key: string;
    title: string;
    detail: string;
  } | null>(null);

  const hungerLow = needs.hunger <= 25;
  const energyLow = needs.energy <= 25;
  const bladderHigh = needs.bladder >= 75;
  const reminder = useMemo(() => {
    if (activeShiftJob) return {
      key: `shift-${activeShiftJob.id}-${careerProgress.shiftTaskIndex}`,
      title: 'Your shift is in progress',
      detail: careerStatusJob?.tasks[careerProgress.shiftTaskIndex] ?? 'Open your career panel to finish the shift and collect your pay.',
    };
    if (hasCafeJob && shiftsCompleted === 0) return {
      key: 'first-work-shift',
      title: interiorId === 'ice-cream-cafe' ? 'Ready to start your shift?' : 'Time to go to work',
      detail: interiorId === 'ice-cream-cafe' ? 'Open your career panel to start at the Ice Cream Cafe.' : 'Your Ice Cream Cafe job is waiting in Lumley.',
    };
    if (!hasCafeJob) return {
      key: 'accept-first-job',
      title: 'Ready to start earning?',
      detail: 'Accept the Ice Cream Cafe job, then travel to Lumley to start your first shift.',
    };
    if (shiftsCompleted > 0 && !firstDayComplete) return {
      key: 'first-day-purchase',
      title: 'Your first-day reward is waiting',
      detail: 'Buy an item to complete your first day and collect your SLE 5,000 bonus.',
    };
    if (hungerLow) return {
      key: 'low-hunger',
      title: 'You’re getting hungry',
      detail: 'Find a restaurant and order a meal to restore hunger.',
    };
    if (energyLow) return {
      key: 'low-energy',
      title: 'Your energy is running low',
      detail: 'Head home and get some rest.',
    };
    if (bladderHigh) return {
      key: 'high-bladder',
      title: 'Bathroom break reminder',
      detail: 'Your bladder is getting full. Find a toilet soon.',
    };
    return null;
  }, [activeShiftJob, careerProgress.shiftTaskIndex, careerStatusJob, hasCafeJob, shiftsCompleted, interiorId, firstDayComplete, hungerLow, energyLow, bladderHigh]);

  useEffect(() => {
    if (!reminder) {
      setReminderToast(null);
      return;
    }
    setReminderToast(reminder);
    const timeout = window.setTimeout(() => setReminderToast((current) => current?.key === reminder.key ? null : current), 9000);
    return () => window.clearTimeout(timeout);
  }, [reminder]);

  useEffect(() => {
    game.setInteractionPromptsHidden(panelTab !== null);
    return () => game.setInteractionPromptsHidden(false);
  }, [panelTab]);

  const signOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch('/api/auth', { method: 'DELETE' });
    } catch {
      // The local game session is still cleared if the server is unreachable.
    }
    try {
      removeMigratedLocalStorage(AUTH_STORAGE_KEY);
      localStorage.removeItem(PLAYER_USERNAME_STORAGE_KEY);
      localStorage.removeItem('freetown-life-game-save-v2');
      localStorage.removeItem('freetown-life-game-save-v1');
      localStorage.removeItem('freetown-life-player-appearance');
      localStorage.removeItem('freetown-life-player-choices');
      sessionStorage.removeItem('freetown-life-multiplayer-id');
    } catch {
      // Continue to login even if browser storage is unavailable.
    }
    game.signOut();
  };

  // Home is active by default.
  const [activeNav, setActiveNav] = useState<'home' | 'map'>('home');

  const handleHome = () => {
    setActiveNav('home');
    setMenuOpen(false);
    onHome?.();
  };

  const handleMap = () => {
    setActiveNav('map');
    setMenuOpen(false);
    setPanelTab(null);
    onMap?.();
  };

  const openPanel = (tab: string) => {
    setMenuOpen(false);
    setPanelTab(tab);
  };

  const openMessenger = () => {
    game.dismissMessageNotification();
    if (onOpenPhone) onOpenPhone();
    else openPanel('Phone');
  };

  const openJobs = () => {
    setMenuOpen(false);
    if (onOpenJobs) onOpenJobs();
    else setPanelTab('Career');
  };

  const firstDayTitle = firstDayComplete && !skillGoalRewarded
    ? 'Grow a skill to level 2'
    : firstDayComplete
      ? 'First day complete!'
    : !hasCafeJob
      ? 'Accept your first job'
      : shiftsCompleted === 0
        ? 'Complete your first shift'
        : 'Buy your first item';
  const firstDayDetail = firstDayComplete && !skillGoalRewarded
    ? 'Earn a SLE 5,000 skill goal reward'
    : firstDayComplete
      ? 'First-day and skill rewards earned'
    : !hasCafeJob
      ? 'Start at the Ice Cream Cafe'
      : shiftsCompleted === 0
        ? 'Work at the cafe in Lumley'
        : 'Spend some of your first paycheck';

  const toggleClean = () => {
    if (!clean) {
      setClean(true);
      setMenuOpen(false);
    } else {
      setMenuOpen((value) => !value);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-[100] select-none">
      {/* Top player status */}
      {!clean && (
        <header className="pointer-events-auto absolute left-3 right-3 top-3 mx-auto flex max-w-3xl items-center justify-between gap-2 rounded-full border border-white/70 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-xl sm:left-5 sm:right-5 sm:px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <span className="text-lg sm:text-xl">{worldClock.isDay ? '☀️' : '🌙'}</span>
            <span className="truncate text-sm font-semibold text-slate-800 sm:text-base">
              Day {worldClock.day} · {formatGameTime(worldClock)}
            </span>
            <span className="hidden items-center gap-1 text-sm font-bold text-emerald-500 sm:flex">
              😊 {mood}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              aria-label="Sound settings"
              onClick={onOpenSettings}
              className="hidden rounded-full p-2 text-slate-700 hover:bg-slate-100 sm:block"
            >
              <Volume2 size={20} />
            </button>

            <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-extrabold text-slate-800 sm:px-4 sm:text-sm">
              SLE {moneyFormat.format(money)}
            </div>

            <button
              aria-label="Open phone or wallet"
              onClick={onOpenPhone}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-xl font-bold text-white shadow-sm hover:bg-emerald-600 sm:h-10 sm:w-10"
            >
              +
            </button>

            <button
              type="button"
              aria-label="Sign out"
              title="Sign out"
              disabled={signingOut}
              onClick={signOut}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-full px-2 text-slate-600 hover:bg-slate-100 disabled:cursor-wait disabled:opacity-60 sm:h-10 sm:px-3"
            >
              <LogOut size={17} aria-hidden="true" />
              <span className="hidden text-xs font-bold sm:inline">Sign out</span>
            </button>
          </div>
        </header>
      )}

      {!clean && messageNotification && (
        <aside
          role="status"
          aria-live="polite"
          className="pointer-events-auto absolute left-1/2 top-[68px] z-[110] w-[min(440px,calc(100%-24px))] -translate-x-1/2"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white/95 px-3 py-2.5 shadow-xl backdrop-blur-xl">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-lg" aria-hidden="true">💬</span>
            <button type="button" onClick={openMessenger} className="min-w-0 flex-1 text-left">
              <span className="block text-xs font-extrabold text-emerald-700">Message from @{messageNotification.from}</span>
              <span className="block truncate text-sm text-slate-700">{messageNotification.text}</span>
            </button>
            <button
              type="button"
              aria-label="Dismiss message notification"
              onClick={() => game.dismissMessageNotification()}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>
        </aside>
      )}

      {!clean && reminderToast && (
        <aside
          role="status"
          aria-live="polite"
          className={`pointer-events-none absolute right-3 z-[105] w-[min(360px,calc(100%-24px))] sm:right-5 ${messageNotification ? 'top-[126px]' : 'top-[72px]'}`}
        >
          <div className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-white/95 p-3 shadow-xl backdrop-blur-xl">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-lg" aria-hidden="true">🔔</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-slate-900">{reminderToast.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{reminderToast.detail}</p>
            </div>
          </div>
        </aside>
      )}

      {/* Tasks on the left */}
      {!clean && (
        <aside className="pointer-events-auto absolute left-3 top-[100px] flex max-w-[min(290px,75vw)] flex-col gap-2 sm:left-5 sm:top-[136px]">
          <button
            onClick={firstDayComplete ? () => openPanel('Goals') : shiftsCompleted > 0 ? () => openPanel('Buy') : openJobs}
            className="flex items-center gap-3 rounded-full bg-white/95 px-3 py-2 text-left shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white sm:px-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-lg">
              🎯
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-800">
                {firstDayTitle}
              </span>
              <span className="block text-xs text-slate-500">
                {firstDayDetail}
              </span>
            </span>
          </button>

          {careerStatusJob && careerStatusStats && careerStatusRank && (
            <button
              onClick={openJobs}
              className="flex items-center gap-3 rounded-full bg-white/95 px-3 py-2 text-left shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white sm:px-4"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg text-amber-800">
                <BriefcaseBusiness size={18} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-slate-800">
                  {activeShiftJob ? `${careerStatusJob.employer} shift · ${careerProgress.shiftTaskIndex}/${careerStatusJob.tasks.length}` : `${careerStatusRank.title} · ${careerStatusJob.title}`}
                </span>
                <span className="block text-xs text-slate-500">
                  {activeShiftJob
                    ? careerStatusJob.tasks[careerProgress.shiftTaskIndex] ?? 'Final task complete · collect your pay'
                    : `${careerStatusStats.shiftsCompleted} shifts · SLE ${moneyFormat.format(careerStatusPay)} per shift`}
                </span>
              </span>
            </button>
          )}

          <button
            onClick={() => onOpenPhone?.()}
            className="flex items-center gap-3 rounded-full bg-white/95 px-3 py-2 text-left shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white sm:px-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-lg text-white">
              <Gem size={19} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-slate-800">
                Daily gem hunt
              </span>
              <span className="block text-xs text-slate-500">
                {gemCount} found · next prize SLE
                {moneyFormat.format(nextGemPrize)}
              </span>
            </span>
          </button>

          <button
            onClick={toggleClean}
            className="self-start rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-md hover:bg-white"
          >
            <EyeOff size={13} className="mr-1 inline" />
            Clean screen
          </button>
        </aside>
      )}

      {/* Player avatar and needs */}
      {!clean && showNeeds && (
        <PlayerStatusBar needsOnly openTab={panelTab} onOpenTab={openPanel} onClosePanel={() => setPanelTab(null)} onNavigate={(page) => {
          if (page === 'map') handleMap();
          else if (page === 'home') handleHome();
          else if (page === 'jobs') onOpenJobs?.();
          else if (page === 'phone') openPanel('Phone');
          else if (page === 'buy') openPanel('Buy');
        }} />
      )}

      {/* Burger button when the screen is clean */}
      {clean && (
        <button
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? 'Close game menu' : 'Open game menu'}
          className="pointer-events-auto absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/70 bg-white/95 text-slate-800 shadow-xl backdrop-blur hover:bg-white"
        >
          {menuOpen ? <X size={22} /> : <Menu size={23} />}
        </button>
      )}

      {/* Menu appears after clicking Clean screen */}
      {clean && menuOpen && (
        <>
          <button
            aria-label="Close menu backdrop"
            onClick={() => setMenuOpen(false)}
            className="pointer-events-auto absolute inset-0 -z-10 bg-slate-950/20"
          />

          <nav className="pointer-events-auto absolute left-4 top-[72px] w-64 overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-2 shadow-2xl backdrop-blur-xl">
            <div className="px-3 py-2">
              <p className="text-sm font-extrabold text-slate-800">
                Freetown Life
              </p>
              <p className="text-xs text-slate-500">
                Game menu
              </p>
            </div>

            <button
              onClick={() => {
                setClean(false);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Eye size={18} />
              Show all HUD
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                openJobs();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <BriefcaseBusiness size={18} />
              Jobs and career
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenPhone?.();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Smartphone size={18} />
              Open phone
            </button>

            <button
              onClick={() => {
                setMenuOpen(false);
                onOpenSettings?.();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              <Settings size={18} />
              Settings
            </button>

            <button
              onClick={() => {
                setClean(false);
                setMenuOpen(false);
              }}
              className="mt-1 w-full rounded-xl bg-slate-900 px-3 py-3 text-sm font-bold text-white hover:bg-slate-800"
            >
              Resume game
            </button>
          </nav>
        </>
      )}

      <nav className="pointer-events-auto absolute bottom-3 left-1/2 z-30 flex w-[min(560px,94%)] -translate-x-1/2 items-center justify-around rounded-full border border-white/70 bg-white/95 p-2 shadow-xl">
        {/* Home */}
        <button
          type="button"
          aria-current={activeNav === 'home' ? 'page' : undefined}
          onClick={handleHome}
          className={`flex w-32 flex-col items-center rounded-full px-4 py-2 text-sm font-bold transition-colors ${activeNav === 'home'
              ? 'bg-slate-900 text-white'
              : 'text-slate-700 hover:bg-slate-100'
            }`}
        >
          <Home size={18} aria-hidden="true" />
          Home
        </button>

        {/* Buy */}
        <button
          type="button"
          onClick={() => openPanel(interiorId === 'fish-grill' ? 'Food' : 'Buy')}
          className="flex w-32 flex-col items-center rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <ShoppingBag size={18} aria-hidden="true" />
          {interiorId === 'fish-grill' ? 'Food' : 'Buy'}
        </button>

        {/* Map */}
        <button
          type="button"
          aria-current={activeNav === 'map' ? 'page' : undefined}
          onClick={handleMap} className={`flex w-32 flex-col items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors ${activeNav === 'map' ? 'bg-slate-900 text-white'
            : 'text-slate-700 hover:bg-slate-100'
            }`}
        >
          <MapIcon size={18} aria-hidden="true" />
          Map
        </button>

        {/* Phone */}
        <button
          type="button"
          onClick={() => openPanel('Phone')}
          className="flex w-32 flex-col items-center rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          <Smartphone size={18} aria-hidden="true" />
          Phone
        </button>
      </nav>
    </div>
  );
}
