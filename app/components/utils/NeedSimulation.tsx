'use client';

import { useEffect } from 'react';
import { GAME_TIME_SCALE } from '@/app/Game/clock';
import { game } from './Store';

// A 24-hour game day takes 10 real-world minutes (2.4 game minutes per second).
export const SIM_MINUTES_PER_REAL_SECOND = GAME_TIME_SCALE / 60;

export default function NeedSimulation({ active }: { active: boolean }) {
  useEffect(() => {
    if (!active) return;

    let previousTime = Date.now();
    const interval = window.setInterval(() => {
      if (document.visibilityState !== 'visible') {
        previousTime = Date.now();
        return;
      }

      const now = Date.now();
      const elapsedSeconds = Math.min((now - previousTime) / 1000, 5);
      previousTime = now;
      game.advanceSimulation(elapsedSeconds * SIM_MINUTES_PER_REAL_SECOND);
    }, 1000);

    const resetTime = () => { previousTime = Date.now(); };
    document.addEventListener('visibilitychange', resetTime);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', resetTime);
    };
  }, [active]);

  return null;
}
