'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import BuildingPin from '../../../utils/BuildingPins';
//import BuildingPin from '../buildings/BuildingPin';
//import type { BuildingInfo } from '../buildings/info';
import { buildMountain } from './mountain';
import { Inst, Trees, scatterPoints, type Item } from './Scatter';

type V3 = [number, number, number];
type Props = { position: [number, number, number]; nameOverride?: string };

// export const info: BuildingInfo = {
//   id: 'leicester-peak',
//   name: 'Leicester Peak',
//   area: 'Regent, Freetown',
//   emoji: '⛰️',
//   tagline: 'Clear views over the whole city',
//   banner: { badge: 'VIEWPOINT', line: '📡 Radio mast tours · sunrise hikes at 6 AM' },
//   activities: [
//     { emoji: '🥾', label: 'Hike the trail' },
//     { emoji: '📡', label: 'Radio mast' },
//     { emoji: '🌅', label: 'Sunrise viewpoint' },
//     { emoji: '🧺', label: 'Picnic spot' },
//     { emoji: '📸', label: 'Photo point' },
//   ],
//   interior: {
//     size: [9, 7],
//     floor: ['#6b7280', '#4b5563'],
//     wall: '#334155',
//     ground: '#14532d',
//     furniture: [
//       { type: 'machine', at: [-3, -2.9], color: '#0f172a', size: [0.8, 1.2] },
//       { type: 'machine', at: [-1.5, -2.9], color: '#0f172a', size: [0.8, 1.2] },
//       { type: 'machine', at: [0, -2.9], color: '#0f172a', size: [0.8, 1.2] },
//       { type: 'machine', at: [1.5, -2.9], color: '#0f172a', size: [0.8, 1.2] },
//       { type: 'desk', at: [3.2, -2.7], size: [1.6, 0.7] },
//       { type: 'chair', at: [3.2, -2], rot: Math.PI },
//       { type: 'board', at: [-4.45, 0.5], rot: Math.PI / 2, color: '#0c4a6e', size: [3, 0.1] },
//       { type: 'rug', at: [0, 0.8], color: '#1e3a8a', size: [4, 3] },
//       { type: 'sofa', at: [-2.5, 2.6], rot: Math.PI, color: '#475569', size: [2.4, 0.9] },
//       { type: 'table', at: [-2.5, 1.6], size: [1.2, 0.8] },
//       { type: 'crate', at: [3.6, 1.8] },
//       { type: 'crate', at: [3.6, 2.5] },
//       { type: 'lamp', at: [3.9, -0.8] },
//       { type: 'plant', at: [-3.8, 3.2] },
//     ],
//   },
// };

const R = 7.5; // base radius
const H = 7; // summit height
const STRETCH: [number, number] = [1.15, 0.95];
const MAST_H = 4.2;
export const LEICESTER_HEIGHT = H + MAST_H;

function Wire({ from, to }: { from: V3; to: V3 }) {
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    return { pos: a.clone().add(b).multiplyScalar(0.5), quat, len };
  }, [from, to]);
  return (
    <mesh position={pos} quaternion={quat}>
      <cylinderGeometry args={[0.01, 0.01, len, 4]} />
      <meshStandardMaterial color="#cbd5e1" />
    </mesh>
  );
}

// Guy wires from the mast down to the slope.
const WIRES: { from: V3; to: V3 }[] = [90, 210, 330].map((deg) => {
  const a = (deg * Math.PI) / 180;
  return { from: [0, 2.6, 0] as V3, to: [Math.cos(a) * 1.6, -1.2, Math.sin(a) * 1.6] as V3 };
});

// Red-and-white banded radio mast with cross arms, a dish, a small equipment hut and a blinking light.
function Antenna({ position }: { position: V3 }) {
  const light = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const mat = light.current?.material as THREE.MeshStandardMaterial | undefined;
    if (mat) mat.emissiveIntensity = 0.3 + 1.8 * Math.max(0, Math.sin(clock.elapsedTime * 3));
  });

  return (
    <group position={position}>
      {/* Mast: alternating red and white sections, tapering upwards */}
      {Array.from({ length: 8 }, (_, i) => {
        const seg = MAST_H / 8;
        const r0 = 0.07 - (i / 8) * 0.04;
        const r1 = 0.07 - ((i + 1) / 8) * 0.04;
        return (
          <mesh key={i} position={[0, seg * (i + 0.5), 0]}>
            <cylinderGeometry args={[r1, r0, seg, 8]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#dc2626' : '#f8fafc'} />
          </mesh>
        );
      })}

      {/* Cross arms with panel antennas */}
      {[2.6, 3.3].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <mesh>
            <boxGeometry args={[0.9, 0.03, 0.03]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          {[-0.45, 0.45].map((x) => (
            <mesh key={x} position={[x, -0.14, 0]}>
              <boxGeometry args={[0.1, 0.32, 0.05]} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Dish */}
      <mesh position={[0, 1.9, 0.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.24, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#f1f5f9" side={THREE.DoubleSide} />
      </mesh>

      {/* Blinking aircraft light */}
      <mesh ref={light} position={[0, MAST_H + 0.08, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
      </mesh>

      {WIRES.map((w, i) => (
        <Wire key={i} from={w.from} to={w.to} />
      ))}

      {/* Equipment hut */}
      <mesh position={[0.7, -0.15, 0.55]}>
        <boxGeometry args={[0.7, 0.45, 0.6]} />
        <meshStandardMaterial color="#cbd5e1" flatShading />
      </mesh>
      <mesh position={[0.7, 0.12, 0.55]}>
        <boxGeometry args={[0.8, 0.1, 0.7]} />
        <meshStandardMaterial color="#475569" flatShading />
      </mesh>
    </group>
  );
}

// Leicester Peak: a forested ridge with bare rock at the top, a switchback road and the radio mast.
export default function LeicesterPeak({ position, nameOverride }: Props) {
  const m = useMemo(
    () =>
      buildMountain({
        kind: 'peak',
        radius: R,
        height: H,
        seed: 7,
        radialSegments: 11,
        heightSegments: 7,
        colors: { low: '#2f6b3a', mid: '#4f8a45', high: '#8b8f98' },
        highAt: 0.78,
        stretch: STRETCH,
      }),
    [],
  );

  const trees = useMemo(() => scatterPoints(m, { count: 150, seed: 3, radius: R, stretch: STRETCH, maxY: H * 0.74 }), [m]);

  // The road spirals up the mountain, one short dirt segment at a time.
  const road = useMemo(() => {
    const items: Item[] = [];
    const N = 70;
    const pt = (s: number): [number, number] => {
      const ang = 0.4 + s * Math.PI * 3.1;
      const rad = R * (0.92 - 0.76 * s);
      return [Math.cos(ang) * rad * STRETCH[0], Math.sin(ang) * rad * STRETCH[1]];
    };
    for (let i = 0; i < N; i++) {
      const [x0, z0] = pt(i / N);
      const [x1, z1] = pt((i + 1) / N);
      const mx = (x0 + x1) / 2;
      const mz = (z0 + z1) / 2;
      const y = m.heightAt(mx, mz);
      if (y === null) continue;
      const dx = x1 - x0;
      const dz = z1 - z0;
      items.push({ p: [mx, y + 0.06, mz], s: [0.26, 0.05, Math.hypot(dx, dz) + 0.05], c: '#c8b08a', r: Math.atan2(dx, dz) });
    }
    return items;
  }, [m]);

  return (
    <group position={position}>
      {/* Grass apron the mountain stands on */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[R * 1.4, R * 1.4, 0.3, 14]} />
        <meshStandardMaterial color="#9dc07a" flatShading />
      </mesh>

      <mesh geometry={m.geometry}>
        <meshStandardMaterial vertexColors flatShading />
      </mesh>

      <Trees points={trees} seed={5} />
      <Inst items={road} shape="box" />

      <Antenna position={[0, H - 0.1, 0]} />
      <BuildingPin
        emoji="⛰️"
        label="Leicester Peak"
        nameOverride={nameOverride ?? "Leicester Peak"}
        height={LEICESTER_HEIGHT}
      />
    </group>
  );
}
