'use client';

import { Text } from '@react-three/drei';
import BuildingPin from '../../../utils/BuildingPins';
import type { BuildingInfo } from '../../../utils/Info';
import { FISH_GRILL_INTERIOR } from '../../Buildings/RestaurantInteriors';

export const info: BuildingInfo = {
  id: 'fish-grill',
  name: 'Fish Grill',
  area: 'Lumley, Freetown',
  emoji: '🐟',
  tagline: 'Grilled catch of the day',
  banner: { badge: 'FRESH', line: '🐟 Straight off the boats' },
  activities: [{ emoji: '🐟', label: 'Grilled tilapia' }, { emoji: '🍢', label: 'Spicy suya' }, { emoji: '🥤', label: 'Cold drinks' }, { emoji: '🏖️', label: 'Beach tables' }],
  shops: true,
  cuisine: 'sierra-leonean',
  interior: FISH_GRILL_INTERIOR,
};


type Props = { position: [number, number, number]; nameOverride?: string };

export const FISH_GRILL_HEIGHT = 2.1;
const W = 1.6;
const H = 0.9;
const D = 1.1;

const SMOKE: { p: [number, number, number]; r: number }[] = [
  { p: [0.55, 1.55, -0.3], r: 0.1 },
  { p: [0.62, 1.75, -0.3], r: 0.13 },
  { p: [0.7, 2.0, -0.3], r: 0.16 },
];

// Fish grill: brick-red shack with a tin roof, chimney smoke, serving window,
// a glowing charcoal grill and a table under a beach umbrella.
export default function FishGrill({ position, nameOverride }: Props) {
  const front = D / 2;

  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#9a3412" />
      </mesh>

      {/* Tin roof, slightly sloped */}
      <mesh position={[0, H + 0.08, 0]} rotation={[0.12, 0, 0]} castShadow>
        <boxGeometry args={[W + 0.2, 0.06, D + 0.2]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>

      {/* Chimney + smoke */}
      <mesh position={[0.55, 1.15, -0.3]} castShadow>
        <cylinderGeometry args={[0.09, 0.1, 0.6, 10]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      {SMOKE.map((s, i) => (
        <mesh key={i} position={s.p}>
          <sphereGeometry args={[s.r, 10, 10]} />
          <meshStandardMaterial color="#e2e8f0" transparent opacity={0.7} />
        </mesh>
      ))}

      {/* Serving window + sign */}
      <mesh position={[0, 0.5, front + 0.02]}>
        <boxGeometry args={[1.1, 0.35, 0.04]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.8, front + 0.03]}>
        <boxGeometry args={[1.2, 0.2, 0.04]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <Text position={[0, 0.8, front + 0.06]} fontSize={0.12} letterSpacing={0.1} color="#fde68a" anchorX="center" anchorY="middle">
        FISH GRILL
      </Text>

      {/* Charcoal grill drum */}
      <mesh position={[1.1, 0.25, 0.7]} castShadow>
        <cylinderGeometry args={[0.22, 0.2, 0.3, 14]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[1.1, 0.42, 0.7]}>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 14]} />
        <meshStandardMaterial color="#f97316" emissive="#f97316" emissiveIntensity={1.1} />
      </mesh>

      {/* Table + umbrella */}
      <mesh position={[-1.1, 0.2, 0.8]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[-1.1, 0.42, 0.8]} castShadow>
        <cylinderGeometry args={[0.28, 0.28, 0.04, 16]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[-1.1, 0.7, 0.8]}>
        <cylinderGeometry args={[0.02, 0.02, 1.0, 8]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[-1.1, 1.25, 0.8]} castShadow>
        <coneGeometry args={[0.55, 0.25, 8]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>

      <BuildingPin emoji={info.emoji} label={info.name} height={FISH_GRILL_HEIGHT} nameOverride={nameOverride} info={info} />
    </group>
  );
}
