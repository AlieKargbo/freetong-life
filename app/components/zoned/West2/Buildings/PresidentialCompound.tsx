'use client';

import { Text } from '@react-three/drei';
import { BuildingPins } from '@/app/components/zoned/BuildingImports';
import {UrbanLot} from '@/app/components/zoned/BuildingImports';

type Props = { position: [number, number, number]; nameOverride?: string };
export const PRESIDENTIAL_COMPOUND_HEIGHT = 2.1;

export default function PresidentialCompound({ position, nameOverride }: Props) {
  return (
    <group position={position}>
      <UrbanLot width={7.8} depth={10.1} walkwayWidth={2} walkwayDepth={1.4} greenery={false}>
        {/* Compound perimeter walls with a front gate opening */}
        {[
          { p: [0, 0.65, -4.85] as [number, number, number], s: [7.2, 1.3, 0.2] as [number, number, number] },
          { p: [-3.8, 0.65, 0] as [number, number, number], s: [0.2, 1.3, 9.9] as [number, number, number] },
          { p: [3.8, 0.65, 0] as [number, number, number], s: [0.2, 1.3, 9.9] as [number, number, number] },
          { p: [-2.2, 0.65, 4.85] as [number, number, number], s: [3.0, 1.3, 0.2] as [number, number, number] },
          { p: [2.2, 0.65, 4.85] as [number, number, number], s: [3.0, 1.3, 0.2] as [number, number, number] },
        ].map((wall, i) => (
          <mesh key={i} position={wall.p} castShadow receiveShadow>
            <boxGeometry args={wall.s} />
            <meshStandardMaterial color="#e7e5e4" roughness={0.85} />
          </mesh>
        ))}

        {/* Main villa */}
        <mesh position={[0, 0.6, -1.8]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 1.2, 2.6]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.75} />
        </mesh>
        <mesh position={[0, 1.25, -1.8]} castShadow>
          <boxGeometry args={[4.1, 0.12, 2.9]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        {[-1.2, -0.4, 0.4, 1.2].map((x) => (
          <mesh key={x} position={[x, 0.75, -0.48]}>
            <boxGeometry args={[0.35, 0.5, 0.03]} />
            <meshStandardMaterial color="#7dd3fc" roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[0, 0.35, -0.47]}>
          <boxGeometry args={[0.5, 0.7, 0.05]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 1.42, -0.47]}>
          <boxGeometry args={[2.0, 0.25, 0.05]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <Text position={[0, 1.42, -0.44]} fontSize={0.11} color="#f8fafc" anchorX="center" anchorY="middle">
          PRESIDENTIAL VILLA
        </Text>

        {/* Pool */}
        <mesh position={[2.2, 0.06, -1.8]} receiveShadow>
          <boxGeometry args={[2.0, 0.12, 2.4]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[2.2, 0.13, -1.8]}>
          <boxGeometry args={[1.8, 0.05, 2.2]} />
          <meshStandardMaterial color="#0ea5e9" metalness={0.15} roughness={0.22} />
        </mesh>

        {/* Helipad and H */}
        <mesh position={[-1.8, 0.04, 1.8]} receiveShadow>
          <cylinderGeometry args={[1.1, 1.1, 0.08, 32]} />
          <meshStandardMaterial color="#64748b" />
        </mesh>
        <Text position={[-1.8, 0.09, 1.8]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.9} color="#f8fafc" anchorX="center" anchorY="middle">
          H
        </Text>

        {/* Gatehouse and driveway */}
        <mesh position={[0, 0.5, 4.6]} castShadow>
          <boxGeometry args={[1.2, 1.0, 0.4]} />
          <meshStandardMaterial color="#d6d3d1" />
        </mesh>
        <mesh position={[0, 1.05, 4.6]}>
          <boxGeometry args={[1.3, 0.1, 0.5]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <mesh position={[0, 0.025, 3.2]} receiveShadow>
          <boxGeometry args={[2.2, 0.05, 2.6]} />
          <meshStandardMaterial color="#9ca3af" />
        </mesh>
        {[-3.2, 3.2].map((x) => (
          <group key={x} position={[x, 0, 3.2]}>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.2, 8]} />
              <meshStandardMaterial color="#b8a58a" />
            </mesh>
            <mesh position={[0, 0.5, 0]} castShadow>
              <dodecahedronGeometry args={[0.35, 0]} />
              <meshStandardMaterial color="#15803d" />
            </mesh>
          </group>
        ))}

      <BuildingPins emoji="🏛️" label="Presidential Compound" height={PRESIDENTIAL_COMPOUND_HEIGHT} nameOverride={nameOverride} />
      </UrbanLot>
    </group>
  );
}
