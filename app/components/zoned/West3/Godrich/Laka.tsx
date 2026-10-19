'use client';

import type { ZoneConfig } from '../../../WorldCanvas';

export const zone: ZoneConfig = {
  id: 'freetown',
  c: [-4, 15],
  size: [14, 9],
  color: '#d8dbc9',
  label: { text: 'FREETOWN', size: 0.45 },
};

function Plane() {
  return (
    <group position={[-1, 0.5, 13.5]} rotation={[0, -0.5, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.32, 0.22, 4.2, 12]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[1, 0.06, 4.4]} />
        <meshStandardMaterial color="#e2e8f0" />
      </mesh>
      <mesh position={[-1.9, 0.5, 0]} castShadow>
        <boxGeometry args={[0.6, 0.9, 0.06]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
    </group>
  );
}

function Helipad() {
  return (
    <group position={[-9, 0, 17.5]}>
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 24]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.9, 0.06, 6, 24]} />
        <meshStandardMaterial color="#facc15" />
      </mesh>
    </group>
  );
}

export default function FreetownZone() {
  return (
    <>
      <Plane />
      <Helipad />
    </>
  );
}
