'use client';

import BuildingPin from '../../../utils/BuildingPins';

type Props = { position: [number, number, number]; nameOverride?: string };

export const LIGHTHOUSE_HEIGHT = 3.4;

// Lighthouse: tapered white tower with red bands, gallery, glowing lantern and red cap.
export default function Lighthouse({ position, nameOverride }: Props) {
  return (
    <group position={position}>
      {/* Tower */}
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.38, 0.55, 2.4, 20]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>

      {/* Red bands */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.51, 0.54, 0.4, 20]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.44, 0.47, 0.4, 20]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.22, 0.53]}>
        <boxGeometry args={[0.22, 0.44, 0.05]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Gallery */}
      <mesh position={[0, 2.44, 0]} castShadow>
        <cylinderGeometry args={[0.52, 0.5, 0.08, 20]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Lantern room */}
      <mesh position={[0, 2.68, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.4, 16]} />
        <meshStandardMaterial color="#fde68a" emissive="#facc15" emissiveIntensity={1.4} />
      </mesh>

      {/* Cap + finial */}
      <mesh position={[0, 3.08, 0]} castShadow>
        <coneGeometry args={[0.36, 0.42, 16]} />
        <meshStandardMaterial color="#dc2626" />
      </mesh>
      <mesh position={[0, 3.34, 0]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      <BuildingPin emoji="⚓" label="Lighthouse" height={LIGHTHOUSE_HEIGHT} nameOverride={nameOverride} />
    </group>
  );
}
