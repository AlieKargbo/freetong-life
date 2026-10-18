'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Html } from '@react-three/drei';

import { game, useGame } from './Store';
import type { BuildingInfo } from './Info';

type Props = {
  emoji: string;
  label: string;
  height: number; // top of the building (the pin floats a little above this)
  nameOverride?: string;
  onClick?: () => void;
  info?: BuildingInfo;
};

const LIFT = 0.9; // gap between the building's top and the pin
const ICON = 36; // px, collapsed circle
const EXPANDED_MAX = 240; // px, max width of the expanded pill
// Put one inside a building's <group>. The name expands on hover or selection so nearby labels
// don't cover one another when the camera is zoomed in.
export default function BuildingPin({ emoji, label, height, nameOverride, onClick, info}: Props) {
  const displayName = nameOverride ?? label;
  const area = info?.area ?? 'Freetown';
  const generatedId = useId();
  const buildingInfo: BuildingInfo = info
    ? { ...info, name: displayName }
    : {
        id: `${area}-${label}-${generatedId}`.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
        name: displayName,
        area,
        emoji,
        tagline: `${displayName} in ${area}`,
        activities: [{ emoji, label: displayName }],
        interior: {
          size: [10, 8],
          floor: ['#cbd5e1', '#94a3b8'],
          wall: '#e2e8f0',
          ground: '#14532d',
          furniture: [],
        },
      };
  const [hovered, setHovered] = useState(false);
  const [pinned, setPinned] = useState(false);
  const selected = useGame((state) => state.popup?.id === buildingInfo.id);
  const pinRef = useRef<HTMLButtonElement>(null);
  const expanded = hovered || pinned || selected;

  useEffect(() => {
    if (!pinned) return;
    const closeWhenOutside = (event: PointerEvent) => {
      if (!pinRef.current?.contains(event.target as Node)) setPinned(false);
    };
    document.addEventListener('pointerdown', closeWhenOutside);
    return () => document.removeEventListener('pointerdown', closeWhenOutside);
  }, [pinned]);

  const handleClick = () => {
    game.openPopup(buildingInfo);
    onClick?.();
  };
  
  return (
    <Html position={[0, height + LIFT, 0]} center zIndexRange={selected || hovered || pinned ? [100, 100] : [20, 0]}>
      {/* Fixed-size anchor so the icon stays centred over the building while the pill grows */}
      <div className="relative" style={{ width: ICON, height: ICON }}>
        <button
          ref={pinRef}
          type="button"
          aria-label={`Open ${displayName}`}
          aria-pressed={selected}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onClick={() => {
            setPinned((p) => !p);
            handleClick();
          }}
          className={`absolute left-0 top-0 flex cursor-pointer select-none items-center overflow-hidden rounded-full border-0 bg-white p-0 text-left shadow-lg ring-2 transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 ${
            selected
              ? 'z-10 scale-110 ring-4 ring-emerald-500 shadow-emerald-950/30'
              : hovered || pinned
                ? 'ring-yellow-400'
                : 'ring-white'
          }`}
          style={{ height: ICON, maxWidth: expanded ? EXPANDED_MAX : ICON }}
        >
          <span className="flex shrink-0 items-center justify-center text-lg" style={{ width: ICON, height: ICON }}>
            {emoji}
          </span>
          <span
            className={`whitespace-nowrap pr-3 text-sm font-semibold text-slate-800 transition-opacity duration-200 ${
              expanded ? 'opacity-100 delay-100' : 'opacity-0'
            }`}
          >
            {displayName}
          </span>
        </button>
      </div>
    </Html>
  );
}
