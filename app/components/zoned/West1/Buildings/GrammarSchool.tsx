'use client';

import { BuildingPins } from '@/app/components/zoned/BuildingImports';
import WindowGrid from './WindowGrid';
import type { BuildingInfo } from '@/app/components/zoned/BuildingImports';

export const info: BuildingInfo = {
  id: 'grammar-school',
  name: 'Grammar School',
  area: 'Aberdeen, Freetown',
  emoji: '🔔',
  tagline: 'The bell rings every hour',
  banner: { badge: 'FOUNDED 1845', line: '🔔 Old boys reunion this weekend' },
  activities: [{ emoji: '🏛️', label: 'Great hall' }, { emoji: '⛪', label: 'Chapel' }, { emoji: '🎙️', label: 'Debating club' }, { emoji: '📖', label: 'Library' }, { emoji: '🔔', label: 'Bell tower' }],
  interior: {
    size: [10, 8],
    floor: ['#e7e5e4', '#d6d3d1'],
    wall: '#f5f0e1',
    ground: '#365314',
    furniture: [
      { type: 'stage', at: [0, -3], color: '#7c2d12', size: [5, 1.6] },
      { type: 'board', at: [0, -3.95], color: '#1e3a8a', size: [3.4, 0.1] },
      { type: 'bench', at: [-2.6, -0.8], size: [2.4, 0.5] },
      { type: 'bench', at: [2.6, -0.8], size: [2.4, 0.5] },
      { type: 'bench', at: [-2.6, 0.8], size: [2.4, 0.5] },
      { type: 'bench', at: [2.6, 0.8], size: [2.4, 0.5] },
      { type: 'bench', at: [-2.6, 2.4], size: [2.4, 0.5] },
      { type: 'bench', at: [2.6, 2.4], size: [2.4, 0.5] },
      { type: 'shelf', at: [-4.7, 0], rot: Math.PI / 2, size: [1.8, 0.4] },
      { type: 'plant', at: [-4.4, 3.4] },
      { type: 'plant', at: [4.4, 3.4] },
      { type: 'lamp', at: [4.5, -3.4] },
    ],
  },
};


type Props = { position: [number, number, number]; nameOverride?: string };

export const GRAMMAR_HEIGHT = 3;
const W = 3.2;
const H = 1.6;
const D = 2.2;

const COLUMNS = [-0.7, -0.23, 0.23, 0.7];
const BELFRY_POSTS: [number, number][] = [
  [-0.28, -0.28],
  [0.28, -0.28],
  [-0.28, 0.28],
  [0.28, 0.28],
];

// School 4, Grammar: cream classical building, columned portico and an open bell tower.
export default function GrammarSchool({ position, nameOverride }: Props) {
  const front = D / 2;

  return (
    <group position={position}>
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#f5f0e1" />
      </mesh>
      <mesh position={[0, H + 0.05, 0]} castShadow>
        <boxGeometry args={[W + 0.1, 0.1, D + 0.1]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>

      <WindowGrid position={[-1.25, 0.9, front + 0.015]} width={0.5} height={1.1} cols={1} rows={2} fill={0.7} />
      <WindowGrid position={[1.25, 0.9, front + 0.015]} width={0.5} height={1.1} cols={1} rows={2} fill={0.7} />
      <mesh position={[0, 0.5, front + 0.02]}>
        <boxGeometry args={[0.55, 0.9, 0.04]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>

      {/* Portico */}
      <mesh position={[0, 0.06, front + 0.55]} receiveShadow>
        <boxGeometry args={[1.9, 0.12, 0.7]} />
        <meshStandardMaterial color="#d6d3d1" />
      </mesh>
      {COLUMNS.map((x) => (
        <mesh key={x} position={[x, 0.87, front + 0.5]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 1.5, 12]} />
          <meshStandardMaterial color="#fafaf9" />
        </mesh>
      ))}
      <mesh position={[0, 1.75, front + 0.4]} castShadow>
        <boxGeometry args={[1.95, 0.25, 0.8]} />
        <meshStandardMaterial color="#f5f0e1" />
      </mesh>

      {/* Open bell tower */}
      {BELFRY_POSTS.map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 2.1, z]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.7, 8]} />
          <meshStandardMaterial color="#f5f0e1" />
        </mesh>
      ))}
      <mesh position={[0, 2.15, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#facc15" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.65, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.55, 0.5, 4]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>

      <BuildingPins emoji={info.emoji} label={info.name} height={GRAMMAR_HEIGHT} nameOverride={nameOverride} info={info} />
    </group>
  );
}
