'use client';

import BuildingPin from '../../../utils/BuildingPins';
import { Text } from '@react-three/drei';
import type { BuildingInfo } from '../../../utils/Info';

export const info: BuildingInfo = {
  id: 'gym',
  name: 'Gym',
  area: 'Lumley, Freetown',
  emoji: '🏋️',
  tagline: 'The leg-day crowd is in',
  banner: { badge: 'OPEN 24/7', line: '💪 Free trial class at 6 PM' },
  activities: [{ emoji: '🏃', label: 'Treadmills' }, { emoji: '🏋️', label: 'Weights' }, { emoji: '🥊', label: 'Boxing ring' }, { emoji: '🧘', label: 'Yoga mats' }, { emoji: '🥤', label: 'Juice bar' }],
  shops: true,
  interior: {
    size: [10, 8],
    floor: ['#374151', '#4b5563'],
    wall: '#1f2937',
    ground: '#0f172a',
    furniture: [
      { type: 'machine', at: [-3.6, -3.2], color: '#111827', size: [0.8, 1.4] },
      { type: 'machine', at: [-2.2, -3.2], color: '#111827', size: [0.8, 1.4] },
      { type: 'machine', at: [-0.8, -3.2], color: '#111827', size: [0.8, 1.4] },
      { type: 'machine', at: [0.6, -3.2], color: '#111827', size: [0.8, 1.4] },
      { type: 'machine', at: [2.0, -3.2], color: '#111827', size: [0.8, 1.4] },
      { type: 'bench', at: [-3, 0.6], color: '#ef4444', size: [1.8, 0.5] },
      { type: 'bench', at: [-3, 2.0], color: '#ef4444', size: [1.8, 0.5] },
      { type: 'rug', at: [3.1, 1.5], color: '#22c55e', size: [3.2, 2.4] },
      { type: 'counter', at: [-4.4, 2.2], rot: Math.PI / 2, color: '#f97316', size: [3, 0.7] },
      { type: 'board', at: [-4.9, -0.8], rot: Math.PI / 2, color: '#bfdbfe', size: [3, 0.1] },
      { type: 'plant', at: [4.3, 3.3] },
      { type: 'lamp', at: [4.4, -3.4] },
    ],
  },
};


type Props = { position: [number, number, number]; nameOverride?: string };

export const GYM_HEIGHT = 3.0;
const W = 3.2;
const H = 2;
const D = 2.8;

// Gym: dark body with an orange roof band, glass front, sign and a giant dumbbell on the roof.
export default function Gym({ position, nameOverride }: Props) {
  const front = D / 2;

  return (
    <group position={position}>
      {/* Body + roof band */}
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh position={[0, H + 0.1, 0]} castShadow>
        <boxGeometry args={[W + 0.1, 0.2, D + 0.1]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>

      {/* Glass front */}
      <mesh position={[0, 1.3, front + 0.02]}>
        <boxGeometry args={[2.5, 0.7, 0.04]} />
        <meshStandardMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={0.25} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.45, front + 0.02]}>
        <boxGeometry args={[0.8, 0.9, 0.04]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Sign */}
      <mesh position={[0, 1.88, front + 0.03]}>
        <boxGeometry args={[1.4, 0.34, 0.06]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      <Text position={[0, 1.88, front + 0.07]} fontSize={0.24} letterSpacing={0.2} color="#ffffff" anchorX="center" anchorY="middle">
        GYM
      </Text>

      {/* Dumbbell on the roof */}
      <group position={[0, H + 0.6, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.06, 0.06, 1.6, 12]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
        {[
          { x: -0.7, r: 0.38, c: '#1f2937' },
          { x: -0.52, r: 0.3, c: '#475569' },
          { x: 0.52, r: 0.3, c: '#475569' },
          { x: 0.7, r: 0.38, c: '#1f2937' },
        ].map((p) => (
          <mesh key={p.x} position={[p.x, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[p.r, p.r, 0.12, 16]} />
            <meshStandardMaterial color={p.c} />
          </mesh>
        ))}
      </group>

      {/* Icon on the building */}
      <BuildingPin emoji={info.emoji} label={info.name} height={GYM_HEIGHT} nameOverride={nameOverride} info={info} />
    </group>
  );
}
