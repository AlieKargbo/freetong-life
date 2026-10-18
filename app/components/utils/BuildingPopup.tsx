'use client';

import { useEffect, useState } from 'react';
import { CURRENCY, game, useGame } from './Store';
import type { BuildingInfo } from './Info';

type Ride = { id: string; emoji: string; label: string; cost: number };

const RIDES: Ride[] = [
  { id: 'trek', emoji: '🚶🏾', label: 'Trek', cost: 0 },
  { id: 'okada', emoji: '🏍️', label: 'Okada', cost: 200 },
  { id: 'keke', emoji: '🛺', label: 'Keke', cost: 100 },
  { id: 'cab', emoji: '🚕', label: 'Cab', cost: 500 },
  { id: 'poda-poda', emoji: '🚌', label: 'poda-poda', cost: 100 },
  

];

const isRushHour = () => {
  const h = new Date().getHours();
  return (h >= 7 && h <= 9) || (h >= 16 && h <= 19);
};

// Bottom-sheet style card: what is here, how you get there, and the Go button that enters the building.
export default function BuildingPopup() {
  const info = useGame<BuildingInfo | null>((state) => state.popup);
  const money = useGame((s) => s.money);
  const [rideChoice, setRideChoice] = useState<{ buildingId: string | null; ride: string }>({ buildingId: null, ride: 'trek' });
  const [copiedFor, setCopiedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!info) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && game.closePopup();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [info]);

  if (!info) return null;

  const rush = isRushHour();
  const ride = rideChoice.buildingId === info.id ? rideChoice.ride : 'trek';
  const copied = copiedFor === info.id;
  const fare = (r: Ride) => (r.id === 'cab' && rush ? Math.round(r.cost * 1.5) : r.cost);
  const price = (r: Ride) => (fare(r) === 0 ? 'Free' : `${CURRENCY}${fare(r)}`);
  const chosen = RIDES.find((r) => r.id === ride) ?? RIDES[0];
  const canAfford = money >= fare(chosen);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}${location.pathname}?b=${info.id}`);
      setCopiedFor(info.id);
      window.setTimeout(() => setCopiedFor((current) => current === info.id ? null : current), 2000);
    } catch {
      /* clipboard can be blocked; ignore */
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-slate-950/45 px-3 py-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm"
      onClick={() => game.closePopup()}
      role="presentation"
    >
      <div
        className="max-h-[min(88dvh,48rem)] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-[28px] bg-white p-4 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="building-popup-title"
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl">{info.emoji}</span>
          <div className="min-w-0 flex-1">
            <h2 id="building-popup-title" className="truncate text-2xl font-extrabold tracking-tight text-slate-800">{info.name}</h2>
            <p className="text-slate-500">{info.area}</p>
          </div>
          <button
            type="button"
            onClick={() => game.closePopup()}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <button type="button" onClick={share} className="mt-2 text-sm font-semibold text-blue-500 hover:underline">
          {copied ? '✔ Link copied' : `🔗 Share a link to ${info.name}`}
        </button>
        <p className="mt-1 text-sm text-slate-500">{info.tagline}</p>

        {/* What you can do here */}
        <div className="mt-4 flex flex-wrap gap-2">
          {info.activities.map((a) => (
            <span key={a.label} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-sm font-medium text-slate-700">
              <span>{a.emoji}</span>
              {a.label}
            </span>
          ))}
        </div>

        {info.shops && (
          <button type="button" className="mt-4 flex w-full items-center gap-3 rounded-2xl bg-purple-100 px-4 py-4 text-left font-bold text-slate-800">
            <span className="text-xl">🛍️</span>
            <span className="flex-1">Player shops here</span>
            <span className="text-slate-400">›</span>
          </button>
        )}

        {/* How to get there */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {RIDES.map((r) => (
            <button
              type="button"
              key={r.id}
              onClick={() => setRideChoice({ buildingId: info.id, ride: r.id })}
              className={`relative flex flex-col items-center rounded-2xl px-1 py-3 text-sm transition-colors ${
                ride === r.id ? 'bg-blue-50 ring-2 ring-blue-500' : 'bg-slate-100 hover:bg-slate-200'
              } ${money < fare(r) ? 'opacity-50' : ''}`}
            >
              {r.id === 'cab' && rush && (
                <span className="absolute -right-1 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-xs">⏰</span>
              )}
              <span className="text-2xl">{r.emoji}</span>
              <span className="mt-1 font-semibold text-slate-800">{r.label}</span>
              <span className="text-slate-500">{price(r)}</span>
            </button>
          ))}
        </div>
        {rush && <p className="mt-2 text-center text-sm font-medium text-amber-700">⏰ Rush hour: Cab fares are up</p>}

        <button
          type="button"
          disabled={!canAfford}
          onClick={() => game.travelTo(info, fare(chosen), chosen.label)}
          className="mt-4 w-full rounded-full bg-emerald-500 py-4 text-xl font-bold text-white shadow transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {canAfford ? `Go · ${price(chosen)}` : `Not enough ${CURRENCY}`}
        </button>
      </div>
    </div>
  );
}
