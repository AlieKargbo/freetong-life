'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import BuildingPin from '../../../utils/BuildingPins';
//import BuildingPin from '../buildings/BuildingPin';
//import type { BuildingInfo } from '../buildings/info';
import { buildMountain } from './mountain';
import { Inst, Trees, scatterPoints, type Item } from './Scatter';
import type { BuildingInfo } from '../../../utils/Info';

type V3 = [number, number, number];
type Props = {
  position: [number, number, number];
  nameOverride?: string;
  showPin?: boolean;
};

// export const info: BuildingInfo = {
//   id: 'sugar-loaf',
//   name: 'Sugar Loaf',
//   area: 'Western Area, Sierra Leone',
//   emoji: '🏔️',
//   tagline: 'Steep climb, worth the view',
//   banner: { badge: 'HIKE', line: '🥾 Guides leave the base camp at 7 AM' },
//   activities: [
//     { emoji: '🥾', label: 'Summit hike' },
//     { emoji: '⛺', label: 'Base camp' },
//     { emoji: '💧', label: 'Waterfall stop' },
//     { emoji: '🦜', label: 'Bird watching' },
//     { emoji: '📸', label: 'Photo point' },
//   ],
//   interior: {
//     size: [8, 7],
//     floor: ['#a16207', '#92400e'],
//     wall: '#365314',
//     ground: '#14532d',
//     furniture: [
//       { type: 'board', at: [0, -3.45], color: '#7c2d12', size: [3, 0.1] },
//       { type: 'shelf', at: [-2.6, -3.3], size: [1.6, 0.4] },
//       { type: 'rug', at: [0, 0.6], color: '#b45309', size: [4, 3] },
//       { type: 'bench', at: [-1.4, 0.6], rot: Math.PI / 2, size: [2, 0.5] },
//       { type: 'bench', at: [1.4, 0.6], rot: -Math.PI / 2, size: [2, 0.5] },
//       { type: 'table', at: [0, 0.6], size: [1, 1.2] },
//       { type: 'crate', at: [3.2, -2.6] },
//       { type: 'crate', at: [3.2, -1.9] },
//       { type: 'crate', at: [2.5, -2.6] },
//       { type: 'counter', at: [3.4, 1.6], rot: -Math.PI / 2, color: '#7c4a21', size: [2.4, 0.7] },
//       { type: 'lamp', at: [-3.4, -0.5] },
//       { type: 'plant', at: [-3.2, 2.8] },
//     ],
//   },
// };

const R = 6;
const H = 8.5;
export const SUGAR_LOAF_HEIGHT = H + 1.3;

const TENTS: { a: number; c: string }[] = [
  { a: 55, c: '#f97316' },
  { a: 90, c: '#3b82f6' },
  { a: 125, c: '#facc15' },
];

function Cloud({ base, phase }: { base: V3; phase: number }) {
  const g = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (g.current) g.current.position.x = base[0] + Math.sin(clock.elapsedTime * 0.25 + phase) * 1.4;
  });
  return (
    <group ref={g} position={base}>
      {(
        [
          [0, 0, 0, 0.55],
          [0.5, -0.05, 0.1, 0.4],
          [-0.5, -0.08, -0.05, 0.38],
          [0.1, 0.18, 0, 0.35],
        ] as [number, number, number, number][]
      ).map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[r, 1]} />
          <meshStandardMaterial color="#ffffff" flatShading transparent opacity={0.92} />
        </mesh>
      ))}
    </group>
  );
}

export const SUGAR_LOAF_INFO: BuildingInfo = {
  id: 'sugar-loaf',
  name: 'Sugar Loaf Memorial',
  area: 'Regent, Freetown, Sierra Leone',
  emoji: '🏔️',
  tagline: 'Remembering the lives lost on 14 August 2017',
  activities: [
    { emoji: '🕯️', label: 'Pay your respects' },
    { emoji: '📖', label: 'Learn about the disaster' },
    { emoji: '🌿', label: 'Explore landslide awareness' },
  ],
  interior: {
    size: [14, 11],
    floor: ['#69533e', '#78634f'],
    wall: '#494943',
    ground: '#7d8988',
    furniture: [],
  },
};

// Sugar Loaf: a steep forested dome with a bare granite top, a Sierra Leone flag on the summit,
// boulders, a base camp with tents and a campfire, and clouds drifting past.
export default function SugarLoaf({ position, showPin = false, nameOverride }: Props) {
  const m = useMemo(
    () =>
      buildMountain({
        kind: 'dome',
        radius: R,
        height: H,
        seed: 21,
        radialSegments: 12,
        heightSegments: 9,
        colors: { low: '#2c6a38', mid: '#4a8645', high: '#9aa08f' },
        highAt: 0.7,
      }),
    [],
  );

  const trees = useMemo(() => scatterPoints(m, { count: 170, seed: 8, radius: R, maxY: H * 0.7 }), [m]);

  // Boulders scattered over the upper slopes.
  const boulders = useMemo(() => {
    const pts = scatterPoints(m, { count: 40, seed: 14, radius: R, maxY: H * 0.97, minR: 0.05 }).filter((p) => p[1] > H * 0.45);
    return pts.map<Item>(([x, y, z], i) => {
      const k = 0.18 + ((i * 37) % 10) / 40;
      return { p: [x, y + k * 0.25, z], s: [k * 1.3, k, k * 1.1], c: i % 2 ? '#9ca3af' : '#a8a29e', r: i };
    });
  }, [m]);

  const tents = useMemo(
    () =>
      TENTS.map((t) => {
        const a = (t.a * Math.PI) / 180;
        return { x: Math.cos(a) * R * 1.2, z: Math.sin(a) * R * 1.2, c: t.c, a };
      }),
    [],
  );

  return (
    <group position={position}>
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[R * 1.4, R * 1.4, 0.3, 14]} />
        <meshStandardMaterial color="#9dc07a" flatShading />
      </mesh>

      <mesh geometry={m.geometry}>
        <meshStandardMaterial vertexColors flatShading />
      </mesh>

      <Trees points={trees} seed={9} size={1.1} />
      <Inst items={boulders} shape="sphere" />

      {/* Summit: stone cairn and the flag of Sierra Leone (green, white, blue) */}
      <group position={[0, H - 0.12, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <icosahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial color="#a8a29e" flatShading />
        </mesh>
        <mesh position={[0, 0.65, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 1.1, 6]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        {(['#1eb53a', '#ffffff', '#0072c6'] as const).map((c, i) => (
          <mesh key={c} position={[0.3, 1.05 - i * 0.13, 0]}>
            <boxGeometry args={[0.55, 0.13, 0.02]} />
            <meshStandardMaterial color={c} />
          </mesh>
        ))}
      </group>

      {/* Base camp: tents around a fire */}
      {tents.map((t, i) => (
        <mesh key={i} position={[t.x, 0.3, t.z]} rotation={[0, Math.PI / 4 - t.a, 0]} scale={[0.9, 0.6, 0.9]}>
          <coneGeometry args={[0.5, 1, 4]} />
          <meshStandardMaterial color={t.c} flatShading />
        </mesh>
      ))}
      <group position={[0, 0, R * 1.2 + 1]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 8]} />
          <meshStandardMaterial color="#44403c" flatShading />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <coneGeometry args={[0.13, 0.3, 5]} />
          <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={1.2} flatShading />
        </mesh>
      </group>

      <Cloud base={[-1.5, H + 1.2, 0.8]} phase={0} />
      <Cloud base={[2.5, H - 0.4, -1.5]} phase={2} />

      {showPin && (
        <BuildingPin
          emoji="🏔️"
          label="Sugar Loaf"
          nameOverride={nameOverride ?? "Sugar Loaf Memorial"}
          height={SUGAR_LOAF_HEIGHT}
          info={SUGAR_LOAF_INFO}
        />
      )}
    </group>
  );
}
