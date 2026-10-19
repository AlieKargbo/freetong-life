'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  RotateCcw,
  Menu,
  X,
  Home,
  ShoppingBag,
  Map,
  Smartphone,
} from 'lucide-react';
import { CURRENCY, game, useGame } from '../../utils/Store';
import NeedsPanel, { NEED_INFO } from './NeedsPanel';
import { calculateMood, needSatisfaction } from '@/app/Game/needs';
import { BUY_ITEMS } from '@/app/Game/storeCatalog';
import { SKILL_INFO, SKILL_NAMES, skillLevelForXp, skillXpForNextLevel } from '@/app/Game/skills';
import { FOOD_MENUS } from '@/app/Game/foodMenu';
import { BUILDING_SERVICES } from '@/app/Game/buildingServices';
import { CAREER_JOBS, getCareerRank, getCareerShiftPay } from '@/app/Game/careers';
import { canFundStartup, getDreamObjectives, isDreamComplete } from '@/app/Game/dreams';
import { DREAMS } from '@/app/components/Game-setup/CharacterData';
import { sendPlayerMessage, sendPlayerPayment } from '../../utils/MultiplayerPresence';

type Props = {
  onRotateRoom?: () => void;
  onCleanScreen?: (clean: boolean) => void;
  onNavigate?: (page: string) => void;
  needsOnly?: boolean;
  openTab?: string | null;
  onOpenTab?: (tab: string) => void;
  onClosePanel?: () => void;
};

const tabs = ['Profile', 'Needs', 'Goals', 'Skills', 'People', 'Career', 'Buy'];

export default function PlayerStatusBar({
  onRotateRoom,
  onCleanScreen,
  onNavigate,
  needsOnly = false,
  openTab,
  onOpenTab,
  onClosePanel,
}: Props) {
  const needs = useGame((state) => state.needs);
  const player = useGame((state) => state.player);
  const money = useGame((state) => state.money);
  const playerUsername = useGame((state) => state.playerUsername);
  const contacts = useGame((state) => state.contacts);
  const messages = useGame((state) => state.messages);
  const walletTransfers = useGame((state) => state.walletTransfers);
  const multiplayerStatus = useGame((state) => state.multiplayerStatus);
  const multiplayerError = useGame((state) => state.multiplayerError);
  const purchases = useGame((state) => state.purchases);
  const hasCafeJob = useGame((state) => state.hasCafeJob);
  const shiftsCompleted = useGame((state) => state.shiftsCompleted);
  const careerProgress = useGame((state) => state.careerProgress);
  const firstDayComplete = useGame((state) => state.firstDayComplete);
  const skills = useGame((state) => state.skills);
  const skillGoalRewarded = useGame((state) => state.skillGoalRewarded);
  const dream = useGame((state) => state.dream);
  const dreamProgress = useGame((state) => state.dreamProgress);
  const interior = useGame((state) => state.interior);
  const interiorId = interior?.id ?? null;
  const foodMenu = interior?.cuisine ? FOOD_MENUS[interior.cuisine] : [];
  const buildingServices = interiorId ? BUILDING_SERVICES[interiorId] ?? [] : [];
  const mood = calculateMood(needs);
  const lowestNeed = NEED_INFO.reduce((lowest, item) => needSatisfaction(needs, item.key) < needSatisfaction(needs, lowest.key) ? item : lowest, NEED_INFO[0]);
  const lowestNeedValue = needSatisfaction(needs, lowestNeed.key);
  const dreamState = { dream, progress: dreamProgress, hasCafeJob, money, purchases, skills };
  const dreamObjectives = getDreamObjectives(dreamState).map((objective) => dreamProgress.completed
    ? { ...objective, value: objective.target, complete: true }
    : objective);
  const dreamComplete = isDreamComplete(dreamState);
  const startupReady = canFundStartup(dreamState);
  const activeCareerJob = CAREER_JOBS.find((job) => job.id === careerProgress.activeJobId) ?? null;
  const activeShiftJob = CAREER_JOBS.find((job) => job.id === careerProgress.activeShiftJobId) ?? null;
  const hustleLevel = skillLevelForXp(skills.hustle);
  const selectedDream = DREAMS.find((item) => item.name === dream);
  const avatar = player?.body === 'Man' ? '🧑🏾' : '👩🏾';
  const displayName = player?.name?.replace(/^@/, '') || 'Your Sim';
  const feelings = [{
    icon: lowestNeed.emoji,
    title: lowestNeed.key === 'bladder' ? 'Bladder is too full' : `${lowestNeed.label} needs attention`,
    description: lowestNeed.key === 'bladder'
      ? `Bladder fullness: ${Math.round(needs.bladder)}% · use a toilet to empty it.`
      : `Current level: ${Math.round(needs[lowestNeed.key])}%`,
    points: mood,
  }];
  const firstDayGoals: { label: string; done: boolean }[] = [
    { label: 'Accept a job', done: hasCafeJob },
    { label: 'Complete a cafe shift', done: shiftsCompleted > 0 },
    { label: 'Buy your first item', done: firstDayComplete },
  ];
  const [clean, setClean] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [needsOpen, setNeedsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Profile');
  const [phoneApp, setPhoneApp] = useState('Home');
  const [contactDraft, setContactDraft] = useState('');
  const [activeContact, setActiveContact] = useState('');
  const [messageDraft, setMessageDraft] = useState('');
  const [paymentDraft, setPaymentDraft] = useState('');
  const [phoneNotice, setPhoneNotice] = useState('');
  const [foodNotice, setFoodNotice] = useState('');
  const [serviceNotice, setServiceNotice] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const controlled = openTab !== undefined;
  const modalOpen = controlled ? openTab !== null : needsOpen;
  const selectedTab = controlled ? (openTab ?? 'Profile') : activeTab;
  const visibleTabs = foodMenu.length > 0 ? [...tabs, 'Food'] : tabs;
  const normalizedUsername = playerUsername.replace(/^@/, '').toLowerCase();
  const conversation = activeContact
    ? messages.filter((message) => (message.from === normalizedUsername && message.to === activeContact) || (message.to === normalizedUsername && message.from === activeContact))
    : [];

  const addPhoneContact = () => {
    const username = contactDraft.trim().replace(/^@/, '').toLowerCase();
    if (!game.addContact(username)) {
      setPhoneNotice('Enter a valid username other than your own.');
      return;
    }
    setActiveContact(username);
    setContactDraft('');
    setPhoneNotice(`@${username} added to Messages.`);
  };

  const sendPhoneMessage = () => {
    const text = messageDraft.trim();
    if (!activeContact || !text) return;
    if (multiplayerStatus !== 'connected') {
      setPhoneNotice(multiplayerError || 'Wait for multiplayer to connect before sending messages.');
      return;
    }
    const id = sendPlayerMessage(activeContact, text);
    if (!id) {
      setPhoneNotice('Connect to multiplayer before sending messages.');
      return;
    }
    game.recordMessage({ id, from: normalizedUsername, to: activeContact, text, sentAt: Date.now() });
    setMessageDraft('');
    setPhoneNotice('Message sent. If they are offline, it will arrive when they reconnect.');
  };

  const sendKallahPayment = () => {
    const amount = Number(paymentDraft);
    if (!activeContact || !Number.isSafeInteger(amount) || amount <= 0) {
      setPhoneNotice('Choose a contact and enter a whole amount.');
      return;
    }
    if (amount > money) {
      setPhoneNotice('Your wallet balance is too low for that payment.');
      return;
    }
    if (multiplayerStatus !== 'connected') {
      setPhoneNotice(multiplayerError || 'Wait for multiplayer to connect before sending a payment.');
      return;
    }
    const id = sendPlayerPayment(activeContact, amount);
    if (!id) {
      setPhoneNotice('Connect to multiplayer before sending a payment.');
      return;
    }
    const transfer = { id, from: normalizedUsername, to: activeContact, amount, sentAt: Date.now() };
    if (!game.sendPayment(transfer)) {
      setPhoneNotice('Payment could not be completed. Check your balance.');
      return;
    }
    setPaymentDraft('');
    setPhoneNotice(`SLE ${amount.toLocaleString('en-US')} sent to @${activeContact}.`);
  };

  const openNeeds = () => {
    setMenuOpen(false);
    if (onOpenTab) onOpenTab('Needs');
    else {
      setActiveTab('Needs');
      setNeedsOpen(true);
    }
  };

  const closeNeeds = useCallback(() => {
    setNeedsOpen(false);
    onClosePanel?.();
  }, [onClosePanel]);

  const toggleClean = () => {
    const next = !clean;
    setClean(next);
    onCleanScreen?.(next);
    if (next) {
      setMenuOpen(false);
      setNeedsOpen(false);
    }
  };

  // Escape closes the modal or menu.
  useEffect(() => {
    if (!modalOpen && !menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeNeeds();
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalOpen, menuOpen, closeNeeds]);

  return (
    <>
      {/* Main HUD */}
      {!clean && (
        <>
          {/* Job and gem shortcuts */}
          {!needsOnly && <div className="pointer-events-none absolute left-4 top-28 z-30 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => onNavigate?.('jobs')}
              className="pointer-events-auto flex items-center gap-3 rounded-full bg-white/95 px-4 py-3 text-left shadow-lg transition hover:scale-[1.02]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-xl">
                🎯
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-800">
                  Get a job
                </span>
                <span className="block text-xs text-slate-500">
                  Open Phone → Jobs
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('gems')}
              className="pointer-events-auto flex items-center gap-3 rounded-full bg-white/95 px-4 py-3 text-left shadow-lg transition hover:scale-[1.02]"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-xl">
                💎
              </span>
              <span>
                <span className="block text-sm font-bold text-slate-800">
                  Daily gem hunt
                </span>
                <span className="block text-xs text-slate-500">
                  Find gems · Next prize SLE 3,000
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={toggleClean}
              className="pointer-events-auto w-fit rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-slate-600 shadow"
            >
              ⌃ Clean screen
            </button>
          </div>}

          {/* Clickable player needs shortcut */}
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              openNeeds();
            }}
            aria-label="Open player needs"
            className="pointer-events-auto absolute bottom-24 left-4 z-150 flex cursor-pointer items-center gap-3 rounded-full bg-white/95 p-2 text-left shadow-xl transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border-[3px] border-emerald-400 bg-amber-100 text-3xl">
              🧑🏾
            </span>

            <span className="grid grid-cols-3 gap-x-3 gap-y-2 pr-3">
              {NEED_INFO.map((need) => (
                <span key={need.key} className="flex items-center gap-1">
                  <span className="text-sm">{need.emoji}</span>
                  <span className="h-2 w-10 overflow-hidden rounded-full bg-slate-200">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${Math.round(needs[need.key])}%`,
                        backgroundColor: need.color,
                      }}
                    />
                  </span>
                </span>
              ))}
            </span>
          </button>
        </>
      )}

      {/* Room rotation */}
      {!needsOnly && <button
        type="button"
        aria-label="Rotate room view"
        title="Rotate room view"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onRotateRoom?.();
        }}
        className="pointer-events-auto absolute bottom-36 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-white/95 text-slate-800 shadow-xl transition hover:scale-105 active:scale-95"
      >
        <RotateCcw size={25} />
      </button>}

      {/* Restore HUD */}
      {clean && (
        <button
          type="button"
          onClick={toggleClean}
          className="pointer-events-auto absolute left-4 top-4 z-[60] rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg"
        >
          Show HUD
        </button>
      )}

      {/* Bottom navigation */}
      {!clean && !needsOnly && (
        <nav className="pointer-events-auto absolute bottom-3 left-1/2 z-30 flex w-[min(560px,94%)] -translate-x-1/2 items-center justify-around rounded-full border border-white/70 bg-white/95 p-2 shadow-xl">
          {[
            { id: 'home', label: 'Home', Icon: Home },
            { id: 'buy', label: 'Buy', Icon: ShoppingBag },
            { id: 'map', label: 'Map', Icon: Map },
            { id: 'phone', label: 'Phone', Icon: Smartphone },
          ].map(({ id, label, Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => onNavigate?.(id)}
              className={`flex min-w-[76px] flex-col items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold ${
                id === 'home'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Icon size={21} />
              {label}
            </button>
          ))}
        </nav>
      )}

      {/* Menu */}
      {!clean && !needsOnly && (
        <div className="pointer-events-auto absolute right-4 top-4 z-50">
          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            className="grid h-11 w-11 place-items-center rounded-full bg-white text-slate-800 shadow-lg"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      )}

      <AnimatePresence>
        {menuOpen && !clean && !needsOnly && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="pointer-events-auto absolute inset-0 z-[55] cursor-default bg-black/25"
            />

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className="pointer-events-auto absolute right-4 top-16 z-[60] w-64 rounded-2xl bg-white p-4 shadow-2xl"
            >
              <h3 className="mb-3 text-lg font-bold text-slate-900">
                Freetown Life
              </h3>

              {[
                ['home', '🏠', 'Player home'],
                ['jobs', '💼', 'Jobs & career'],
                ['gems', '💎', 'Daily gem hunt'],
                ['buy', '🛍️', 'Buy furniture'],
                ['map', '🗺️', 'City map'],
                ['phone', '📱', 'Phone'],
              ].map(([id, emoji, label]) => (
                <button
                  type="button"
                  key={id}
                  onClick={() => {
                    setMenuOpen(false);
                    onNavigate?.(id);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <span>{emoji}</span>
                  {label}
                </button>
              ))}

              <button
                type="button"
                onClick={toggleClean}
                className="mt-2 w-full rounded-xl bg-slate-100 px-3 py-3 text-left text-sm font-semibold text-slate-700"
              >
                Clean screen
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Character status modal: fixed to viewport to escape HUD/canvas stacking */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            key="character-status-backdrop"
            className={`pointer-events-auto fixed inset-0 z-[9999] flex items-center justify-center ${selectedTab === 'Phone' ? 'bg-transparent p-0' : 'bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onPointerDown={(event) => {
              if (event.target === event.currentTarget) {
                closeNeeds();
              }
            }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label={selectedTab === 'Phone' ? 'Phone' : 'Character profile and needs'}
              onPointerDown={(event) => event.stopPropagation()}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className={`pointer-events-auto relative flex max-h-[90dvh] w-full flex-col text-left ${selectedTab === 'Phone' ? 'max-w-none overflow-visible rounded-none bg-transparent shadow-none' : 'max-w-[600px] overflow-hidden rounded-[28px] bg-white shadow-2xl'}`}
            >
              {/* Header */}
              {selectedTab !== 'Phone' && <header className="flex shrink-0 items-center gap-3 px-5 pb-4 pt-5 sm:px-7">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-blue-50 text-3xl">
                  🧑🏾
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {displayName}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {mood} · {lowestNeed.key === 'bladder' ? `Bladder is ${Math.round(needs.bladder)}% full` : `${lowestNeed.label} ${lowestNeedValue <= 25 ? 'needs attention' : 'is your lowest need'}`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeNeeds}
                  aria-label="Close character status"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xl text-slate-600 hover:bg-slate-200"
                >
                  ×
                </button>
              </header>}

              {/* Tabs */}
              {selectedTab !== 'Phone' && <div className="flex shrink-0 gap-1.5 overflow-x-auto px-5 pb-4 sm:px-7">
              {visibleTabs.map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    onClick={() => onOpenTab ? onOpenTab(tab) : setActiveTab(tab)}
                    className={`shrink-0 rounded-full px-4 py-3 text-sm font-semibold transition ${
                      selectedTab === tab
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {tab === 'Profile' ? '✏️ ' : ''}
                    {tab}
                  </button>
                ))}
              </div>}

              {/* Scrollable panel */}
              <div className={`min-h-0 flex-1 overscroll-contain ${selectedTab === 'Phone' ? 'flex items-center justify-center overflow-visible px-0 pb-0' : 'overflow-y-auto px-5 pb-6 sm:px-7'}`}>
                {selectedTab === 'Needs' && (
                  <div className="space-y-5">
                    <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      <span className="mr-2">{avatar}</span>
                      <strong>{mood}</strong>
                      <span> · {lowestNeed.key === 'bladder' ? `Bladder is ${Math.round(needs.bladder)}% full.` : `${lowestNeed.label} is currently lowest (${Math.round(needs[lowestNeed.key])}%).`}</span>
                    </div>
                    <NeedsPanel needs={needs} />

                    <section className="pt-2">
                      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
                        Feelings
                      </h3>

                      {feelings.map((feeling) => (
                        <div
                          key={feeling.title}
                          className="mb-2 flex items-center gap-3 rounded-3xl bg-slate-100 p-4"
                        >
                          <span className="text-2xl">{feeling.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800">
                              {feeling.title}
                            </p>
                            <p className="text-sm text-slate-500">
                              {feeling.description}
                            </p>
                          </div>
                          <span className="font-bold text-emerald-600">
                            {feeling.points}
                          </span>
                        </div>
                      ))}
                    </section>
                  </div>
                )}

                {selectedTab === 'Career' && (
                  <section className="space-y-4">
                    <div className="rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Jobs and careers</p>
                      <h3 className="mt-1 text-xl font-extrabold text-slate-900">Choose where you work</h3>
                      <p className="mt-1 text-sm text-slate-600">Accept jobs, travel to the workplace, and complete each task for a shift payout. Promotions and Hustle skill increase your pay.</p>
                    </div>

                    {activeCareerJob && (
                      <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Current career</p>
                        <p className="mt-1 font-extrabold text-slate-900">{activeCareerJob.title}</p>
                        <p className="mt-1 text-sm text-slate-600">
                          {getCareerRank(careerProgress.jobs[activeCareerJob.id].shiftsCompleted).title} · {careerProgress.jobs[activeCareerJob.id].shiftsCompleted} shifts · {CURRENCY}{getCareerShiftPay(activeCareerJob, careerProgress.jobs[activeCareerJob.id].shiftsCompleted, hustleLevel).toLocaleString('en-US')} per shift
                        </p>
                        {getCareerRank(careerProgress.jobs[activeCareerJob.id].shiftsCompleted).nextRequirement !== null && (
                          <p className="mt-1 text-xs text-slate-500">
                            {getCareerRank(careerProgress.jobs[activeCareerJob.id].shiftsCompleted).shiftsToNext} more shifts to the next promotion
                          </p>
                        )}
                        {activeShiftJob && (
                          <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                            Shift in progress: {activeShiftJob.tasks[careerProgress.shiftTaskIndex] ?? 'Ready to collect your payout'} ({careerProgress.shiftTaskIndex}/{activeShiftJob.tasks.length} tasks complete)
                          </p>
                        )}
                      </div>
                    )}

                    {CAREER_JOBS.map((job) => {
                      const accepted = careerProgress.acceptedJobIds.includes(job.id);
                      const active = careerProgress.activeJobId === job.id;
                      const onThisShift = careerProgress.activeShiftJobId === job.id;
                      const stats = careerProgress.jobs[job.id];
                      const rank = getCareerRank(stats.shiftsCompleted);
                      const pay = getCareerShiftPay(job, stats.shiftsCompleted, hustleLevel);
                      const canWorkHere = interiorId === job.locationId;

                      return (
                        <article key={job.id} className="space-y-3 rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{job.career} · {job.employer}</p>
                              <h4 className="mt-1 font-extrabold text-slate-900">{job.title}</h4>
                              <p className="mt-1 text-sm text-slate-600">{job.tasks.length} tasks per shift · {CURRENCY}{pay.toLocaleString('en-US')} payout</p>
                            </div>
                            {active && <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Active</span>}
                          </div>

                          <div>
                            <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                              <span>{rank.title} · {stats.shiftsCompleted} shifts completed</span>
                              <span>{stats.lifetimeEarnings > 0 ? `${CURRENCY}${stats.lifetimeEarnings.toLocaleString('en-US')} earned` : 'Career just started'}</span>
                            </div>
                            {rank.nextRequirement !== null ? (
                              <p className="mt-1 text-xs text-slate-500">{rank.shiftsToNext} more shifts to promotion at {rank.nextRequirement} shifts</p>
                            ) : (
                              <p className="mt-1 text-xs text-emerald-700">Top rank reached · 15% career pay bonus</p>
                            )}
                          </div>

                          {onThisShift ? (
                            <div className="space-y-3 rounded-xl bg-slate-50 p-3">
                              <div className="flex items-center justify-between text-sm font-bold text-slate-800">
                                <span>Shift progress</span>
                                <span>{careerProgress.shiftTaskIndex}/{job.tasks.length}</span>
                              </div>
                              <div className="flex gap-2" aria-label={`${careerProgress.shiftTaskIndex} of ${job.tasks.length} shift tasks complete`}>
                                {job.tasks.map((task, index) => <span key={task} className={`h-2 flex-1 rounded-full ${index < careerProgress.shiftTaskIndex ? 'bg-emerald-500' : 'bg-slate-200'}`} />)}
                              </div>
                              {canWorkHere ? (
                                <button type="button" onClick={() => game.completeCareerTask()} className="w-full rounded-full bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800">
                                  {job.tasks[careerProgress.shiftTaskIndex] ?? 'Complete shift'}
                                </button>
                              ) : (
                                <p className="text-sm text-slate-600">Return to {job.employer} to continue this shift.</p>
                              )}
                            </div>
                          ) : !accepted ? (
                            <button type="button" disabled={Boolean(activeShiftJob)} onClick={() => game.acceptCareerJob(job.id)} className="w-full rounded-full bg-emerald-500 px-5 py-3 font-bold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50">
                              Accept job
                            </button>
                          ) : !active ? (
                            <button type="button" disabled={Boolean(activeShiftJob)} onClick={() => game.selectCareerJob(job.id)} className="w-full rounded-full bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50">
                              {activeShiftJob ? `Finish your ${activeShiftJob.employer} shift first` : 'Choose this career'}
                            </button>
                          ) : canWorkHere ? (
                            <button type="button" onClick={() => game.startCareerShift()} className="w-full rounded-full bg-emerald-500 px-5 py-3 font-bold text-white hover:bg-emerald-600">
                              Start a shift
                            </button>
                          ) : (
                            <div className="space-y-2 rounded-xl bg-slate-50 p-3">
                              <p className="text-sm text-slate-600">Travel to {job.employer} to start this shift.</p>
                              <button type="button" onClick={() => { closeNeeds(); onNavigate?.('map'); }} className="w-full rounded-full bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-800">
                                Open the city map
                              </button>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </section>
                )}

                {selectedTab === 'Food' && foodMenu.length > 0 && (
                  <section className="space-y-4">
                    <div className="rounded-2xl bg-orange-50 p-4">
                      <h3 className="text-xl font-extrabold text-slate-900">{interior?.name} menu</h3>
                      <p className="mt-1 text-sm text-slate-600">Choose a dish to buy and eat it right away. Your wallet is charged, and hunger and fun improve.</p>
                    </div>
                    <p aria-live="polite" className="min-h-5 text-sm font-semibold text-emerald-700">{foodNotice}</p>
                    {foodMenu.map((food) => (
                      <article key={food.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-50 text-2xl">🍽️</span>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-900">{food.name}</h4>
                          <p className="text-xs text-slate-500">{food.description}</p>
                          <p className="mt-1 text-xs font-semibold text-orange-700">+{food.hunger} hunger · +{food.fun} fun</p>
                        </div>
                        <button type="button" disabled={money < food.price} onClick={() => setFoodNotice(game.buyFood(food.id) ? `${food.name} bought and eaten. Hunger and fun restored.` : 'Unable to place that order. Check your balance and try again.')} className="shrink-0 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white disabled:bg-slate-300">
                          Buy &amp; eat · {CURRENCY}{food.price.toLocaleString('en-US')}
                        </button>
                      </article>
                    ))}
                  </section>
                )}

                {selectedTab === 'Goals' && (
                  <section className="space-y-4">
                    <div className={`rounded-2xl border p-4 ${dreamComplete ? 'border-emerald-200 bg-emerald-50' : 'border-indigo-200 bg-indigo-50'}`}>
                      <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Your selected dream</p>
                      {selectedDream ? (
                        <>
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-2xl">{selectedDream.emoji}</span>
                            <h3 className="text-xl font-extrabold text-slate-900">{dreamComplete ? `${selectedDream.name} achieved!` : selectedDream.name}</h3>
                          </div>
                          <p className="mt-1 text-sm text-slate-600">{selectedDream.description}</p>
                          <div className="mt-4 space-y-3">
                            {dreamObjectives.map((objective) => {
                              const percent = Math.min(100, Math.round((objective.value / objective.target) * 100));
                              return (
                                <div key={objective.label}>
                                  <div className="flex items-center justify-between gap-3 text-xs">
                                    <span className={objective.complete ? 'font-semibold text-emerald-800' : 'text-slate-700'}>{objective.complete ? '✓ ' : ''}{objective.label}</span>
                                    <span className="shrink-0 font-bold text-slate-500">{objective.label.includes('SLE') ? `SLE ${objective.value.toLocaleString('en-US')} / SLE ${objective.target.toLocaleString('en-US')}` : `${objective.value.toLocaleString('en-US')} / ${objective.target.toLocaleString('en-US')}`}</span>
                                  </div>
                                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/80" role="progressbar" aria-label={objective.label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                                    <span className={`block h-full rounded-full transition-all ${objective.complete ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${percent}%` }} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {dream === 'Tech Unicorn' && !dreamProgress.startupFunded && (
                            <div className="mt-4 rounded-xl bg-white/80 p-3 text-sm text-slate-600">
                              {startupReady ? (
                                <>
                                  <p>Your Hustle and savings qualify. Investing costs SLE 100,000 and completes your startup pitch.</p>
                                  <button type="button" onClick={() => game.fundStartup()} className="mt-3 w-full rounded-full bg-indigo-600 px-4 py-2.5 font-bold text-white hover:bg-indigo-700">Invest SLE 100,000 and pitch</button>
                                </>
                              ) : <p>Build Hustle through cafe shifts and save SLE 100,000. The investment is your choice.</p>}
                            </div>
                          )}
                          {!dreamComplete && dream === 'Freetong Landlord' && <p className="mt-3 text-xs text-slate-500">Food and other purchases reduce savings. Furniture you own counts toward net worth.</p>}
                          {!dreamComplete && dream === 'Alaki' && <p className="mt-3 text-xs text-slate-500">Each completed dance counts. Choosing the club means spending time away from work.</p>}
                        </>
                      ) : <p className="mt-1 text-sm text-slate-600">Choose a dream during character creation to start a long-term goal.</p>}
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">First day in Freetown</p>
                      <h3 className="mt-1 text-xl font-extrabold text-slate-900">{firstDayComplete ? 'You’re settled in!' : 'Build your new life'}</h3>
                      <p className="mt-1 text-sm text-slate-600">{firstDayComplete ? 'Your first day is complete. You earned a SLE 5,000 welcome bonus.' : !hasCafeJob ? 'Accept the Ice Cream Cafe crew job to get started.' : shiftsCompleted === 0 ? 'Travel to Ice Cream Cafe in Lumley and complete your first shift.' : 'Buy one item to finish your first day and collect a SLE 5,000 welcome bonus.'}</p>
                    </div>
                    <ol className="space-y-2 text-sm">
                      {firstDayGoals.map(({ label, done }) => (
                        <li key={label} className="flex items-center gap-3 rounded-xl bg-slate-100 p-3">
                          <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${done ? 'bg-emerald-500 text-white' : 'bg-white text-slate-500'}`}>{done ? '✓' : '•'}</span>
                          <span className={done ? 'text-slate-500 line-through' : 'font-semibold text-slate-800'}>{label}</span>
                        </li>
                      ))}
                    </ol>
                    {!hasCafeJob ? (
                      <button type="button" onClick={() => onOpenTab ? onOpenTab('Career') : setActiveTab('Career')} className="w-full rounded-full bg-emerald-500 px-5 py-3 font-bold text-white">Find a job</button>
                    ) : shiftsCompleted === 0 ? (
                      <button type="button" onClick={() => onOpenTab ? onOpenTab('Career') : setActiveTab('Career')} className="w-full rounded-full bg-emerald-500 px-5 py-3 font-bold text-white">Continue your shift</button>
                    ) : !firstDayComplete ? (
                      <button type="button" onClick={() => onOpenTab ? onOpenTab('Buy') : setActiveTab('Buy')} className="w-full rounded-full bg-emerald-500 px-5 py-3 font-bold text-white">Open the shop</button>
                    ) : null}
                    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-violet-700">Skill goal · SLE 5,000 reward</p>
                      <h3 className="mt-1 font-extrabold text-slate-900">Reach level 2 in any skill</h3>
                      <p className="mt-1 text-sm text-slate-600">{skillGoalRewarded ? 'Complete — your reward has been added to your wallet.' : 'Build skills by finishing activities and cafe shift tasks.'}</p>
                      {!skillGoalRewarded && <button type="button" onClick={() => onOpenTab ? onOpenTab('Skills') : setActiveTab('Skills')} className="mt-3 rounded-full bg-violet-600 px-4 py-2 text-sm font-bold text-white">View skills</button>}
                    </div>
                  </section>
                )}

                {selectedTab === 'Skills' && (
                  <section className="space-y-3">
                    <p className="text-sm text-slate-500">Skills grow when you finish related activities. Reach level 2 to unlock a bonus.</p>
                    {SKILL_NAMES.map((skill) => {
                      const info = SKILL_INFO[skill];
                      const progress = skillXpForNextLevel(skills[skill]);
                      const level = skillLevelForXp(skills[skill]);
                      const percent = progress.needed === 0 ? 100 : Math.round((progress.current / progress.needed) * 100);
                      return (
                        <article key={skill} className="rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-center gap-3">
                            <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-2xl">{info.emoji}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className="font-bold text-slate-900">{info.label}</h3>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">Level {level}</span>
                              </div>
                              <p className="text-xs text-slate-500">{info.source}</p>
                            </div>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${info.label} progress`} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
                            <span className="block h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
                          </div>
                          <p className="mt-1 text-right text-xs text-slate-400">{progress.needed === 0 ? 'Max level' : `${progress.current} / ${progress.needed} XP to level ${level + 1}`}</p>
                          <p className={`mt-3 rounded-xl px-3 py-2 text-xs ${level >= 2 ? 'bg-emerald-50 font-semibold text-emerald-800' : 'bg-slate-50 text-slate-500'}`}>
                            {level >= 2 ? 'Unlocked · ' : 'Unlocks at level 2 · '}{info.unlock.replace('Level 2: ', '')}
                          </p>
                        </article>
                      );
                    })}
                  </section>
                )}

                {selectedTab === 'Profile' && (
                  <div className="space-y-4">
                    <div className="flex h-64 items-center justify-center rounded-[28px] bg-gradient-to-b from-blue-100 to-slate-100">
                      <div className="text-center">
                        <div className="text-8xl">🧑🏾</div>
                        <p className="mt-3 text-sm text-slate-500">
                          Character preview
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="font-bold text-slate-800">{player?.name || 'Create a character'}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Your username
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="font-semibold text-slate-800">
                        📄 My CV · choose what others see
                      </p>
                    </div>

                    <label className="block text-sm font-semibold text-slate-600">
                      Display name
                      <input
                        defaultValue={displayName === 'Your Sim' ? '' : displayName}
                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-400"
                      />
                    </label>
                  </div>
                )}

                {selectedTab === 'Buy' && (
                  <section className="space-y-4">
                    {buildingServices.length > 0 && (
                      <div className="space-y-3 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                        <div>
                          <h3 className="text-lg font-extrabold text-slate-900">Services at {interior?.name}</h3>
                          <p className="mt-1 text-sm text-slate-600">Choose a service to pay and use it now. Your needs update immediately.</p>
                        </div>
                        <p aria-live="polite" className="min-h-5 text-sm font-semibold text-emerald-700">{serviceNotice}</p>
                        {buildingServices.map((service) => (
                          <article key={service.id} className="rounded-xl border border-sky-100 bg-white p-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-slate-900">{service.name}</h4>
                                <p className="mt-1 text-sm text-slate-600">{service.description}</p>
                                <p className="mt-2 text-xs font-semibold text-sky-800">
                                  {Object.entries(service.effects).map(([need, amount]) => `${amount > 0 ? '+' : ''}${amount} ${need}`).join(' · ')}
                                </p>
                              </div>
                              <button type="button" disabled={money < service.price} onClick={() => setServiceNotice(game.buyBuildingService(service.id) ? `${service.name} purchased. Your needs have been updated.` : 'Unable to use this service. Check your balance and try again.')} className="shrink-0 rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                                Use · {CURRENCY} {service.price.toLocaleString('en-US')}
                              </button>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Available balance</p>
                        <p className="text-xl font-extrabold text-slate-900">{CURRENCY} {money.toLocaleString('en-US')}</p>
                      </div>
                      <ShoppingBag className="text-emerald-600" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {BUY_ITEMS.map((item) => {
                        const owned = purchases[item.id] ?? 0;
                        const canAfford = money >= item.price;
                        return (
                          <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                            <div className="flex items-start gap-3">
                              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-100 text-2xl">{item.emoji}</span>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-slate-800">{item.name}</p>
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.category}</p>
                              </div>
                            </div>
                            <p className="mt-3 min-h-10 text-sm text-slate-500">{item.description}</p>
                            <div className="mt-3 flex items-center justify-between gap-2">
                              <div>
                                <p className="font-bold text-slate-800">{CURRENCY} {item.price.toLocaleString('en-US')}</p>
                                {owned > 0 && <p className="text-xs text-emerald-700">Owned: {owned}</p>}
                              </div>
                              <button type="button" disabled={!canAfford} onClick={() => game.buyItem(item.id)} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300">
                                {canAfford ? 'Buy' : 'Need more'}
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-400">Purchased items are tracked in your collection.</p>
                  </section>
                )}

                {selectedTab === 'Phone' && (
                  <section className="flex justify-center py-1">
                    <div className="w-full max-w-[350px] rounded-[46px] border-[7px] border-slate-950 bg-slate-950 p-[3px] shadow-[0_24px_55px_rgba(15,23,42,0.35)]">
                      <div className="relative min-h-[510px] overflow-hidden rounded-[36px] bg-gradient-to-b from-sky-300 via-blue-400 to-indigo-500 px-4 pb-6 pt-3 text-white">
                        <div className="flex h-7 items-center justify-between px-2 text-[11px] font-bold drop-shadow-sm">
                          <span>9:41</span>
                          <span className="absolute left-1/2 top-2 h-[22px] w-[88px] -translate-x-1/2 rounded-full bg-black" aria-label="Dynamic Island" />
                          <span className="flex items-center gap-1.5"><span aria-hidden="true">●●●</span><span aria-hidden="true">⌁</span><span className="relative inline-block h-2.5 w-5 rounded-[3px] border border-white"><span className="absolute inset-y-0.5 left-0.5 right-1 rounded-[1px] bg-white" /></span></span>
                        </div>

                        {phoneApp !== 'Home' && (
                          <div className="mt-2 flex items-center justify-between px-1 text-slate-900">
                            <button type="button" onClick={() => { setPhoneApp('Home'); setPhoneNotice(''); }} className="text-sm font-semibold text-blue-700">‹ Home</button>
                            <strong className="text-sm">{phoneApp === 'Messages' ? 'Messenger' : phoneApp}</strong>
                            <span className="w-12" />
                          </div>
                        )}

                        <div className={`max-h-[calc(100dvh-155px)] overflow-y-auto pb-20 [scrollbar-width:none] ${phoneApp === 'Home' ? 'mt-7' : 'mt-3'}`}>
                          {phoneApp === 'Home' && (
                            <>
                              <div className="rounded-[26px] border border-white/35 bg-white/25 p-4 shadow-lg backdrop-blur-md">
                                <p className="text-xs font-semibold text-white/85">FREETOWN LIFE · WALLET</p>
                                <p className="mt-1 text-[11px] text-white/80">Available balance</p>
                                <p className="mt-0.5 text-2xl font-extrabold tracking-tight">{CURRENCY} {money.toLocaleString('en-US')}</p>
                              </div>

                              <div className="mt-6 grid grid-cols-4 gap-x-2 gap-y-6">
                                {[
                                  { tab: 'Profile', label: 'My Sim', emoji: '👤', tile: 'from-violet-400 to-fuchsia-500' },
                                  { tab: 'Needs', label: 'Needs', emoji: '💚', tile: 'from-emerald-400 to-teal-600' },
                                  { tab: 'Buy', label: foodMenu.length > 0 ? 'Food' : buildingServices.length > 0 ? 'Services' : 'Shop', emoji: '🛍️', tile: 'from-orange-400 to-rose-500' },
                                  { tab: 'Map', label: 'City', emoji: '🗺️', tile: 'from-cyan-400 to-blue-600' },
                                  { tab: 'Messages', label: 'Messenger', emoji: '💬', tile: 'from-green-400 to-emerald-600' },
                                  { tab: 'Settings', label: 'Settings', emoji: '⚙️', tile: 'from-slate-400 to-slate-700' },
                                  { tab: 'Bank', label: 'Bank', emoji: '🏦', tile: 'from-blue-400 to-indigo-700' },
                                  { tab: 'Kallah', label: 'Kallah', emoji: '💸', tile: 'from-rose-400 to-pink-700' },
                                ].map((app) => (
                                  <button key={app.tab} type="button" onClick={() => {
                                    setPhoneNotice('');
                                    if (['Messages', 'Settings', 'Bank', 'Kallah'].includes(app.tab)) setPhoneApp(app.tab);
                                    else if (app.tab === 'Map') { closeNeeds(); onNavigate?.('map'); }
                                    else if (onOpenTab) onOpenTab(app.tab === 'Buy' && foodMenu.length > 0 ? 'Food' : app.tab);
                                    else setActiveTab(app.tab === 'Buy' && foodMenu.length > 0 ? 'Food' : app.tab);
                                  }} className="group flex min-w-0 flex-col items-center gap-1.5 rounded-2xl text-center text-[10px] font-semibold text-white drop-shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                                    <span className={`grid h-[54px] w-[54px] place-items-center rounded-[16px] bg-gradient-to-br ${app.tile} text-[25px] shadow-lg ring-1 ring-white/35 transition group-hover:scale-105`}>{app.emoji}</span>
                                    <span className="leading-tight">{app.label}</span>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}

                          {phoneApp === 'Messages' && (
                            <div className="space-y-3 text-slate-900">
                              <div className="rounded-2xl bg-white/90 p-3 shadow-sm">
                                <p className="text-xs text-slate-500">Add someone by their player username</p>
                                <div className="mt-2 flex gap-2">
                                  <input value={contactDraft} onChange={(event) => setContactDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addPhoneContact(); } }} maxLength={25} placeholder="e.g. @aminata" aria-label="Player username" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                                  <button type="button" onClick={addPhoneContact} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white">Add</button>
                                </div>
                              </div>
                              <div className="flex gap-2 overflow-x-auto pb-1">
                                {contacts.map((contact) => <button key={contact} type="button" onClick={() => { setActiveContact(contact); setPhoneNotice(''); }} className={`shrink-0 rounded-full px-3 py-2 text-xs font-bold ${activeContact === contact ? 'bg-emerald-600 text-white' : 'bg-white/85 text-slate-700'}`}>@{contact}</button>)}
                                {contacts.length === 0 && <p className="text-xs text-white drop-shadow">Your added players will appear here.</p>}
                              </div>
                              {activeContact ? (
                                <div className="rounded-2xl bg-white/90 p-3 shadow-sm">
                                  <p className="mb-2 text-sm font-bold">Chat with @{activeContact}</p>
                                  <div className="max-h-44 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-2">
                                    {conversation.map((message) => {
                                      const mine = message.from === normalizedUsername;
                                      return <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${mine ? 'bg-emerald-600 text-white' : 'bg-white text-slate-800 shadow-sm'}`}><p>{message.text}</p><time className="mt-1 block text-[9px] opacity-70">{new Date(message.sentAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time></div></div>;
                                    })}
                                    {conversation.length === 0 && <p className="py-3 text-center text-xs text-slate-500">Start the conversation.</p>}
                                  </div>
                                  <div className="mt-2 flex gap-2">
                                    <input value={messageDraft} onChange={(event) => setMessageDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); sendPhoneMessage(); } }} maxLength={1000} placeholder="Message" aria-label="Message text" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                                    <button type="button" onClick={sendPhoneMessage} disabled={!messageDraft.trim()} className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-40">Send</button>
                                  </div>
                                </div>
                              ) : <p className="rounded-xl bg-white/80 p-3 text-xs text-slate-600">Add a username, then select that player to chat.</p>}
                              <p className="text-center text-[10px] text-white drop-shadow">{multiplayerStatus === 'connected' ? 'Messages are connected' : multiplayerError || (multiplayerStatus === 'connecting' ? 'Connecting to multiplayer…' : 'Reconnect to multiplayer to send and receive')}</p>
                            </div>
                          )}

                          {phoneApp === 'Settings' && (
                            <div className="space-y-3 text-slate-900">
                              <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account</p>
                                <p className="mt-2 text-sm font-bold">@{normalizedUsername || 'not signed in'}</p>
                                <p className="mt-1 text-xs text-slate-500">Multiplayer: {multiplayerStatus}</p>
                              </div>
                              {[
                                { label: 'Sound effects', enabled: soundEnabled, toggle: () => setSoundEnabled((value) => !value) },
                                { label: 'Message notifications', enabled: notificationsEnabled, toggle: () => setNotificationsEnabled((value) => !value) },
                              ].map((setting) => <button key={setting.label} type="button" onClick={setting.toggle} className="flex w-full items-center justify-between rounded-2xl bg-white/90 p-4 text-left text-sm font-semibold text-slate-800 shadow-sm"><span>{setting.label}</span><span className={`rounded-full px-3 py-1 text-xs font-bold ${setting.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{setting.enabled ? 'On' : 'Off'}</span></button>)}
                              <p className="rounded-xl bg-white/75 p-3 text-xs text-slate-600">App preferences apply to this session.</p>
                            </div>
                          )}

                          {phoneApp === 'Bank' && (
                            <div className="space-y-3 text-slate-900">
                              <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 p-4 text-white shadow-lg">
                                <p className="text-xs font-semibold text-blue-100">FREETOWN COMMUNITY BANK</p>
                                <p className="mt-4 text-xs text-blue-100">Available balance</p>
                                <p className="mt-1 text-2xl font-extrabold">SLE {money.toLocaleString('en-US')}</p>
                                <p className="mt-4 text-[10px] text-blue-100">In-game account · @{normalizedUsername || 'player'}</p>
                              </div>
                              <div className="rounded-2xl bg-white/90 p-3 shadow-sm">
                                <h3 className="text-sm font-bold">Recent transfers</h3>
                                <div className="mt-2 space-y-2">
                                  {[...walletTransfers].reverse().slice(0, 5).map((transfer) => {
                                    const outgoing = transfer.from.toLowerCase() === normalizedUsername;
                                    return <div key={transfer.id} className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs"><span className="truncate">{outgoing ? `To @${transfer.to}` : `From @${transfer.from}`}</span><span className={`shrink-0 font-bold ${outgoing ? 'text-slate-700' : 'text-emerald-700'}`}>{outgoing ? '−' : '+'}SLE {transfer.amount.toLocaleString('en-US')}</span></div>;
                                  })}
                                  {walletTransfers.length === 0 && <p className="py-3 text-xs text-slate-500">No transfers yet.</p>}
                                </div>
                              </div>
                              <p className="text-center text-[10px] text-white drop-shadow">Game currency only. No real money is held.</p>
                            </div>
                          )}

                          {phoneApp === 'Kallah' && (
                            <div className="space-y-3 text-slate-900">
                              <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-pink-700 p-4 text-white shadow-lg">
                                <p className="text-xs font-bold uppercase tracking-wide text-rose-100">Kallah Pay</p>
                                <p className="mt-3 text-xs text-rose-100">Your in-game wallet</p>
                                <p className="text-2xl font-extrabold">SLE {money.toLocaleString('en-US')}</p>
                              </div>
                              <div className="space-y-3 rounded-2xl bg-white/90 p-4 shadow-sm">
                                <label className="block text-xs font-bold text-slate-600">Pay a player
                                  <select value={activeContact} onChange={(event) => setActiveContact(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-normal text-slate-800">
                                    <option value="">Choose a contact</option>
                                    {contacts.map((contact) => <option key={contact} value={contact}>@{contact}</option>)}
                                  </select>
                                </label>
                                <label className="block text-xs font-bold text-slate-600">Amount (SLE)
                                  <input type="number" min="1" step="1" max={money} value={paymentDraft} onChange={(event) => setPaymentDraft(event.target.value)} placeholder="0" className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-base font-semibold text-slate-900 outline-none focus:border-rose-500" />
                                </label>
                                <button type="button" onClick={sendKallahPayment} disabled={!activeContact || !paymentDraft} className="w-full rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40">Send payment</button>
                              </div>
                              <p className="text-center text-[10px] text-white drop-shadow">Transfers use game SLE only, never real money.</p>
                            </div>
                          )}
                        </div>

                        {phoneNotice && phoneApp !== 'Home' && <p role="status" className="absolute bottom-[70px] left-5 right-5 rounded-xl bg-slate-950/85 px-3 py-2 text-center text-[10px] text-white">{phoneNotice}</p>}

                        {phoneApp === 'Home' ? (
                          <div className="absolute bottom-4 left-4 right-4 flex h-[58px] items-center justify-around rounded-[24px] border border-white/30 bg-white/25 backdrop-blur-lg">
                            <button type="button" onClick={() => setPhoneApp('Messages')} aria-label="Open Messenger" className="h-10 w-10 rounded-[13px] bg-gradient-to-br from-green-400 to-emerald-700 text-xl">💬</button>
                            <button type="button" onClick={() => setPhoneApp('Bank')} aria-label="Open Bank" className="h-10 w-10 rounded-[13px] bg-gradient-to-br from-blue-400 to-blue-700 text-xl">🏦</button>
                            <button type="button" onClick={() => setPhoneApp('Kallah')} aria-label="Open Kallah Pay" className="h-10 w-10 rounded-[13px] bg-gradient-to-br from-pink-400 to-rose-600 text-xl">💸</button>
                            <button type="button" onClick={() => setPhoneApp('Settings')} aria-label="Open Settings" className="h-10 w-10 rounded-[13px] bg-gradient-to-br from-slate-300 to-slate-600 text-xl">⚙️</button>
                          </div>
                        ) : null}
                        <button type="button" onClick={() => { if (phoneApp === 'Home') closeNeeds(); else { setPhoneApp('Home'); setPhoneNotice(''); } }} className="absolute bottom-1.5 left-1/2 h-1 w-24 -translate-x-1/2 rounded-full bg-white/90" aria-label={phoneApp === 'Home' ? 'Close phone' : 'Return to phone home screen'} />
                      </div>
                    </div>
                  </section>
                )}
                {!['Profile', 'Needs', 'Buy', 'Phone', 'Goals', 'Career', 'Skills', 'Food'].includes(selectedTab) && (
                  <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl bg-slate-50 p-6 text-center">
                    <span className="text-4xl">
                      {selectedTab === 'Goals'
                        ? '🎯'
                        : selectedTab === 'Skills'
                          ? '📚'
                          : selectedTab === 'People'
                            ? '🤝'
                            : '💼'}
                    </span>
                    <h3 className="mt-3 text-lg font-bold text-slate-800">
                      {selectedTab}
                    </h3>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">
                      Your {selectedTab.toLowerCase()} information will appear here.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {selectedTab !== 'Phone' && <footer className="shrink-0 border-t border-slate-100 px-5 py-4 sm:px-7">
                <button
                  type="button"
                  onClick={closeNeeds}
                  className="w-full rounded-full bg-emerald-400 px-5 py-4 font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-500"
                >
                  Done
                </button>
              </footer>}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
