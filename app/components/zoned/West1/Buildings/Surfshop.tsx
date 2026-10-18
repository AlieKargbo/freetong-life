'use client';

import { Text } from '@react-three/drei';
import BuildingPin from '../../../utils/BuildingPins';
import type { BuildingInfo } from '../../../utils/Info';

export const info: BuildingInfo = {
  id: 'surf-shop',
  name: 'Surf Shop',
  area: 'Lumley, Freetown',
  emoji: '🏄',
  tagline: 'New boards just arrived',
  banner: { badge: 'SALE', line: '🏄 Board rentals by the hour' },
  activities: [{ emoji: '🏄', label: 'Rent a board' }, { emoji: '🩱', label: 'Wetsuits' }, { emoji: '🌊', label: 'Surf lessons' }, { emoji: '🧴', label: 'Wax & gear' }],
  shops: true,
  interior: {
    size: [8, 6],
    floor: ['#fde68a', '#fcd34d'],
    wall: '#06b6d4',
    ground: '#f5deb3',
    furniture: [
      { type: 'shelf', at: [-2.4, -2.8], size: [1.6, 0.4] },
      { type: 'shelf', at: [0, -2.8], size: [1.6, 0.4] },
      { type: 'board', at: [2.6, -2.95], color: '#f97316', size: [2.2, 0.1] },
      { type: 'counter', at: [3.2, 0.5], rot: -Math.PI / 2, color: '#0891b2', size: [2.6, 0.7] },
      { type: 'crate', at: [-3, 1.5] },
      { type: 'crate', at: [-3, 2.2] },
      { type: 'crate', at: [-2.2, 2.2] },
      { type: 'rug', at: [-0.5, 0.6], color: '#fcd34d', size: [3.4, 2.4] },
      { type: 'plant', at: [3.4, -2.4] },
      { type: 'lamp', at: [-3.6, -0.5] },
    ],
  },
};


type Props = { position: [number, number, number]; nameOverride?: string };

export const SURF_SHOP_HEIGHT = 1.7;
const W = 1.8;
const H = 1.1;
const D = 1.3;

const BOARDS = ['#facc15', '#ef4444', '#a855f7'];

// Surf shop: turquoise shack, striped awning, sign board and surfboards leaning on the side.
export default function SurfShop({ position, nameOverride }: Props) {
  const front = D / 2;

  return (
    <group position={position}>
      {/* Body + roof */}
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#06b6d4" />
      </mesh>
      <mesh position={[0, H + 0.05, 0]} castShadow>
        <boxGeometry args={[W + 0.15, 0.1, D + 0.15]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Sign board */}
      <mesh position={[0, H + 0.4, front - 0.1]} castShadow>
        <boxGeometry args={[1.3, 0.34, 0.06]} />
        <meshStandardMaterial color="#f97316" />
      </mesh>
      <Text position={[0, H + 0.4, front - 0.06]} fontSize={0.16} letterSpacing={0.08} color="#ffffff" anchorX="center" anchorY="middle">
        SURF SHOP
      </Text>

      {/* Striped awning */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-0.75 + i * 0.3, 0.88, front + 0.2]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[0.3, 0.04, 0.5]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#f97316' : '#f8fafc'} />
        </mesh>
      ))}

      {/* Window + door */}
      <mesh position={[-0.4, 0.55, front + 0.02]}>
        <boxGeometry args={[0.55, 0.35, 0.04]} />
        <meshStandardMaterial color="#bae6fd" emissive="#38bdf8" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0.45, 0.35, front + 0.02]}>
        <boxGeometry args={[0.45, 0.7, 0.04]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Surfboards leaning on the left wall */}
      {BOARDS.map((c, i) => (
        <mesh key={c} position={[-W / 2 - 0.18, 0.55, -0.3 + i * 0.3]} rotation={[0, 0, 0.14]} scale={[0.11, 0.55, 0.03]} castShadow>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={c} />
        </mesh>
      ))}

      <BuildingPin emoji={info.emoji} label={info.name} height={SURF_SHOP_HEIGHT} nameOverride={nameOverride} info={info} />
    </group>
  );
}
