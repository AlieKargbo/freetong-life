'use client';

import { BuildingPins } from '@/app/components/zoned/BuildingImports';
import WindowGrid from './WindowGrid';

type Props = { position: [number, number, number] };

export const CHURCH_HEIGHT = 3.65;
const TILT = 0.7; // roof pitch in radians

// Church: white nave with a pitched slate roof, a front bell tower with a spire and a cross,
// a round rose window and amber stained-glass windows along the sides.
export default function Church({ position }: Props) {
  return (
    <group position={position}>
      {/* Consistent city-style building lot: pale concrete, curb edging, entrance walk and landscaping. */}
      <mesh position={[0, -0.09, 0]} receiveShadow>
        <boxGeometry args={[3.8, 0.18, 4.8]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.92} />
      </mesh>
      {/* Raised light curb around the plot */}
      <mesh position={[0, 0.005, -2.340]}>
        <boxGeometry args={[3.8, 0.035, 0.09]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.005, 2.340]}>
        <boxGeometry args={[3.8, 0.035, 0.09]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.85} />
      </mesh>
      <mesh position={[-1.840, 0.005, 0]}>
        <boxGeometry args={[0.09, 0.035, 4.8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.85} />
      </mesh>
      <mesh position={[1.840, 0.005, 0]}>
        <boxGeometry args={[0.09, 0.035, 4.8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.85} />
      </mesh>
      {/* Short paved entrance apron */}
      <mesh position={[0, 0.012, 2.820]} receiveShadow>
        <boxGeometry args={[1.25, 0.035, 0.82]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.95} />
      </mesh>
      {/* Low landscaped planters at the front corners */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (1.580), 0, 2.080]}>
          <mesh position={[0, 0.08, 0]} receiveShadow>
            <boxGeometry args={[0.48, 0.16, 0.48]} />
            <meshStandardMaterial color="#9ca3af" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.29, 0]} castShadow>
            <dodecahedronGeometry args={[0.24, 0]} />
            <meshStandardMaterial color="#27834a" roughness={1} flatShading />
          </mesh>
        </group>
      ))}

      {/* Nave */}
      <mesh position={[0, 0.6, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 1.2, 2.6]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Pitched roof: two slabs */}
      <mesh position={[0.45, 1.58, -0.2]} rotation={[0, 0, -TILT]} castShadow>
        <boxGeometry args={[1.15, 0.08, 2.8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[-0.45, 1.58, -0.2]} rotation={[0, 0, TILT]} castShadow>
        <boxGeometry args={[1.15, 0.08, 2.8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      {/* Side windows */}
      <WindowGrid position={[0.81, 0.7, -0.3]} rotationY={Math.PI / 2} width={1.8} height={0.4} cols={3} rows={1} fill={0.55} color="#fbbf24" emissive="#f59e0b" />
      <WindowGrid position={[-0.81, 0.7, -0.3]} rotationY={-Math.PI / 2} width={1.8} height={0.4} cols={3} rows={1} fill={0.55} color="#fbbf24" emissive="#f59e0b" />

      {/* Bell tower */}
      <mesh position={[0, 1.1, 1.1]} castShadow>
        <boxGeometry args={[0.8, 2.2, 0.8]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      <mesh position={[0, 2.7, 1.1]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.65, 1, 4]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      {/* Cross */}
      <mesh position={[0, 3.4, 1.1]}>
        <boxGeometry args={[0.05, 0.4, 0.05]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
      <mesh position={[0, 3.45, 1.1]}>
        <boxGeometry args={[0.25, 0.05, 0.05]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>

      {/* Door + rose window */}
      <mesh position={[0, 0.4, 1.51]}>
        <boxGeometry args={[0.5, 0.8, 0.04]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>
      <mesh position={[0, 1.5, 1.51]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.03, 20]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.7} />
      </mesh>

      <BuildingPins emoji="⛪" label="Church" height={CHURCH_HEIGHT} />
    </group>
  );
}
