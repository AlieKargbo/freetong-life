
'use client';

import { BuildingPins } from '@/app/components/zoned/BuildingImports';
import WindowGrid from './WindowGrid';

type Props = {
  position: [number, number, number];
  level: 'low' | 'middle' | 'high';
  label?: string;
  nameOverride?: string;
};

const W = 3.2;
const H = 2;
const D = 2.2;

const HOUSING_STYLES = {
  low: {
    wall: '#d6b58c',
    roof: '#8b5e3c',
    trim: '#f3e3ca',
    door: '#5b3826',
    window: '#93c5d8',
    emoji: '🏠',
  },
  middle: {
    wall: '#d9d4c7',
    roof: '#647b69',
    trim: '#f8fafc',
    door: '#59483b',
    window: '#7dd3fc',
    emoji: '🏠',
  },
  high: {
    wall: '#e5e7eb',
    roof: '#334155',
    trim: '#ffffff',
    door: '#1e293b',
    window: '#67e8f9',
    emoji: '🏡',
  },
} as const;

export default function HousingBuilding({
  position,
  level,
  label,
  nameOverride,
}: Props) {
  const style = HOUSING_STYLES[level];
  const front = D / 2;

  return (
    <group position={position}>
      {/* Plot foundation: same footprint as SecondarySchool */}
      <mesh position={[0, -0.09, 0]} receiveShadow>
        <boxGeometry args={[4.3, 0.18, 3.8]} />
        <meshStandardMaterial
          color="#d1d5db"
          roughness={0.92}
        />
      </mesh>

      {/* Pale raised plot curbs */}
      {[-1, 1].map((side) => (
        <mesh
          key={`front-back-${side}`}
          position={[0, 0.005, side * 1.84]}
        >
          <boxGeometry args={[4.3, 0.035, 0.09]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}

      {[-1, 1].map((side) => (
        <mesh
          key={`left-right-${side}`}
          position={[side * 2.09, 0.005, 0]}
        >
          <boxGeometry args={[0.09, 0.035, 3.8]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      ))}

      {/* Entrance walkway */}
      <mesh position={[0, 0.012, 2.32]} receiveShadow>
        <boxGeometry args={[1.25, 0.035, 0.82]} />
        <meshStandardMaterial
          color="#cbd5e1"
          roughness={0.95}
        />
      </mesh>

      {/* Small landscaped front corners */}
      {[-1, 1].map((side) => (
        <group
          key={`tree-${side}`}
          position={[side * 1.83, 0, 1.58]}
        >
          <mesh position={[0, 0.08, 0]} receiveShadow>
            <boxGeometry args={[0.48, 0.16, 0.48]} />
            <meshStandardMaterial color="#9ca3af" />
          </mesh>

          <mesh position={[0, 0.29, 0]} castShadow>
            <dodecahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial
              color="#27834a"
              flatShading
            />
          </mesh>
        </group>
      ))}

      {/* First floor */}
      <mesh
        position={[0, H / 4, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[W, H / 2, D]} />
        <meshStandardMaterial color={style.wall} />
      </mesh>

      {/* Second floor */}
      <mesh
        position={[0, (3 * H) / 4, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[W, H / 2, D]} />
        <meshStandardMaterial color={style.wall} />
      </mesh>

      {/* Horizontal floor divider */}
      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={[W + 0.04, 0.08, D + 0.04]} />
        <meshStandardMaterial color={style.trim} />
      </mesh>

      {/* Flat roof */}
      <mesh position={[0, H + 0.05, 0]} castShadow>
        <boxGeometry args={[W + 0.1, 0.1, D + 0.1]} />
        <meshStandardMaterial color={style.roof} />
      </mesh>

      {/* Ground-floor windows */}
      <WindowGrid
        position={[-1, 0.48, front + 0.015]}
        width={1.0}
        height={0.55}
        cols={2}
        rows={1}
        fill={0.6}
      />

      <WindowGrid
        position={[1, 0.48, front + 0.015]}
        width={1.0}
        height={0.55}
        cols={2}
        rows={1}
        fill={0.6}
      />

      {/* Upper-floor windows */}
      <WindowGrid
        position={[-1, 1.42, front + 0.015]}
        width={1.0}
        height={0.55}
        cols={2}
        rows={1}
        fill={0.6}
      />

      <WindowGrid
        position={[1, 1.42, front + 0.015]}
        width={1.0}
        height={0.55}
        cols={2}
        rows={1}
        fill={0.6}
      />

      {/* Front entrance door */}
      <mesh position={[0, 0.4, front + 0.025]}>
        <boxGeometry args={[0.5, 0.8, 0.05]} />
        <meshStandardMaterial color={style.door} />
      </mesh>

      <BuildingPins
        emoji={style.emoji}
        label={label ?? `${level[0].toUpperCase()}${level.slice(1)} Income House`}
        height={H + 0.3}
          nameOverride={nameOverride}
      />
    </group>
  );
}
