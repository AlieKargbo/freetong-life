'use client';

import { useEffect, useState } from 'react';
import { game } from '../../utils/Store';

type WelcomeTourProps = {
  onClose: () => void;
};

const TOUR_STEPS = [
  {
    title: 'Welcome to Freetown!',
    description: 'Quick tour, under one minute. Oya!',
    emoji: '👋🏾',
  },
  {
    title: 'Make yourself at home',
    description: 'Explore your room, furniture, and personal space.',
    emoji: '🏠',
  },
  {
    title: 'Look after yourself',
    description: 'Keep your needs balanced as you live your everyday life.',
    emoji: '💚',
  },
  {
    title: 'Meet your neighbours',
    description: 'Visit places around the city and meet other players.',
    emoji: '🤝🏾',
  },
  {
    title: 'Earn money',
    description: 'Find work, earn money, and manage your spending.',
    emoji: '💰',
  },
  {
    title: 'Explore the city',
    description: 'Use the map to discover buildings and choose where to go.',
    emoji: '🗺️',
  },
  {
    title: 'Your Freetown story starts now',
    description: 'You are home. Go out, explore, and make it yours!',
    emoji: '✨',
  },
];

export default function WelcomeTour({ onClose }: WelcomeTourProps) {
  const [step, setStep] = useState(0);
  const current = TOUR_STEPS[step];
  const lastStep = step === TOUR_STEPS.length - 1;

  useEffect(() => {
    game.setInteractionPromptsHidden(true);
    return () => game.setInteractionPromptsHidden(false);
  }, []);

  function finish() {
    try {
      localStorage.setItem('lagos-life-welcome-tour-completed', 'true');
      localStorage.removeItem('lagos-life-welcome-tour-pending');
    } catch {
      // The tour still works when browser storage is unavailable.
    }

    onClose();
  }

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-tour-title"
        className="w-full max-w-[430px] rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl">
            {current.emoji}
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <h2
              id="welcome-tour-title"
              className="text-xl font-extrabold tracking-tight text-slate-900"
            >
              {current.title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">
              {current.description}
            </p>
          </div>
        </div>

        <div
          className="mt-5 flex items-center justify-center gap-1.5"
          aria-label={`Step ${step + 1} of ${TOUR_STEPS.length}`}
        >
          {TOUR_STEPS.map((item, index) => (
            <span
              key={item.title}
              className={`h-1.5 rounded-full transition-all ${
                index === step
                  ? 'w-5 bg-emerald-500'
                  : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={finish}
            className="rounded-full px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100"
          >
            Skip
          </button>

          <button
            type="button"
            onClick={() => (lastStep ? finish() : setStep((s) => s + 1))}
            className="min-w-40 rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-600"
          >
            {lastStep ? 'Let’s go!' : 'Start'}
          </button>
        </div>
      </section>
    </div>
  );
}
