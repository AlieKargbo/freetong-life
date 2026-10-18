'use client';

import { Text } from '@react-three/drei';
import BuildingPin from '../../../utils/BuildingPins';
import type { BuildingInfo } from '../../../utils/Info';

export const info: BuildingInfo = {
  id: 'lifeguard-tower',
  name: 'Lifeguard Tower',
  area: 'Lumley, Freetown',
  emoji: '🛟',
  tagline: 'All clear on the water',
  banner: { badge: 'SAFE SWIM', line: '🛟 Red flag after 6 PM' },
  activities: [{ emoji: '🛟', label: 'Safety briefing' }, { emoji: '🩹', label: 'First aid' }, { emoji: '🌤️', label: 'Weather board' }, { emoji: '🚤', label: 'Rescue boat' }],
  interior: {
    size: [6, 5],
    floor: ['#e2e8f0', '#cbd5e1'],
    wall: '#f8fafc',
    ground: '#f5deb3',
    furniture: [
      { type: 'desk', at: [0.6, -1.9], size: [1.6, 0.7] },
      { type: 'chair', at: [0.6, -1.2], rot: Math.PI },
      { type: 'board', at: [-1.2, -2.45], color: '#0369a1', size: [1.8, 0.1] },
      { type: 'bench', at: [-2.3, 0.6], rot: Math.PI / 2, size: [1.6, 0.5] },
      { type: 'crate', at: [2.2, 1.5] },
      { type: 'lamp', at: [2.4, -2] },
      { type: 'plant', at: [-2.4, 2] },
    ],
  },
};


type Props = { position: [number, number, number]; nameOverride?: string };

export const LIFEGUARD_HEIGHT = 2.2;
const LEG = 0.35;
const RUNGS = [0.15, 0.3, 0.45, 0.6];

// Lifeguard tower: wooden stilts and ladder, white cabin with a red band, red roof and flag.
export default function LifeguardTower({ position, nameOverride }: Props) {
  return (
    <group position={position}>
      {/* Stilts */}
      {[-LEG, LEG].flatMap((x) =>
        [-LEG, LEG].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.35, z]} castShadow>
            <cylinderGeometry args={[0.04, 0.05, 0.7, 8]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>
        )),
      )}

      {/* Platform */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1, 0.06, 1]} />
        <meshStandardMaterial color="#b45309" />
      </mesh>

      {/* Cabin */}
      <mesh position={[0, 1, -0.05]} castShadow>
        <boxGeometry args={[0.8, 0.5, 0.7]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0, 1.1, 0.31]}>
        <boxGeometry args={[0.5, 0.2, 0.02]} />
        <meshStandardMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.88, 0.31]}>
        <boxGeometry args={[0.8, 0.1, 0.02]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <Text position={[0, 0.88, 0.33]} fontSize={0.065} letterSpacing={0.08} color="#ffffff" anchorX="center" anchorY="middle">
        LIFEGUARD
      </Text>

      {/* Roof */}
      <mesh position={[0, 1.4, -0.05]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.75, 0.3, 4]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      {/* Flag */}
      <mesh position={[0, 1.85, -0.05]}>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[0.15, 2.05, -0.05]}>
        <boxGeometry args={[0.3, 0.16, 0.01]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      {/* Ladder */}
      {[-0.15, 0.15].map((x) => (
        <mesh key={x} position={[x, 0.36, 0.61]} rotation={[-0.29, 0, 0]}>
          <boxGeometry args={[0.04, 0.78, 0.04]} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
      ))}
      {RUNGS.map((y) => (
        <mesh key={y} position={[0, y, 0.72 - 0.3056 * y]}>
          <boxGeometry args={[0.3, 0.03, 0.03]} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
      ))}

      <BuildingPin emoji={info.emoji} label={info.name} height={LIFEGUARD_HEIGHT} nameOverride={nameOverride} info={info} />
    </group>
  );
}
