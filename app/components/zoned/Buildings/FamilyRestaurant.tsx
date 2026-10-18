'use client';

import { Text } from '@react-three/drei';
import { BuildingPins } from '@/app/components/zoned/BuildingImports';
import UrbanLot from '../Utils/UrbanLot';
import { createRestaurantInfo, restaurantInstanceId } from './RestaurantInteriors';

type Props = { position: [number, number, number]; nameOverride?: string };
export const FAMILY_RESTAURANT_HEIGHT = 3.3;

export default function FamilyRestaurant({ position, nameOverride }: Props) {
  const restaurantName = nameOverride ?? 'Family Restaurant';
  const restaurantInfo = createRestaurantInfo({
    id: restaurantInstanceId('family-restaurant', restaurantName, position.map((part) => Math.round(part * 100)).join('-')),
    name: restaurantName,
    area: 'Freetown',
    emoji: '🍽️',
    cuisine: 'sierra-leonean',
    tagline: 'Home-style Sierra Leonean cooking, served around the family table.',
    activities: [
      { emoji: '🍚', label: 'Jollof rice and pepper stew' },
      { emoji: '🥬', label: 'Cassava leaf with rice' },
      { emoji: '🥜', label: 'Groundnut soup' },
      { emoji: '🥤', label: 'Fresh ginger drink' },
    ],
  });
  return (
    <group position={position}>
      <UrbanLot width={7.8} depth={8.2} walkwayWidth={2.2} walkwayDepth={1.7}>
        <mesh position={[0, 1.35, -0.45]} castShadow receiveShadow>
          <boxGeometry args={[5.4, 2.7, 4.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.75} />
        </mesh>
        <mesh position={[0, 2.78, -0.45]} castShadow>
          <boxGeometry args={[5.65, 0.16, 5.05]} />
          <meshStandardMaterial color="#0f766e" />
        </mesh>
        {[-1.55, 0, 1.55].map((x) => (
          <mesh key={x} position={[x, 1.45, 1.98]}>
            <boxGeometry args={[1.15, 1.25, 0.05]} />
            <meshStandardMaterial color="#7dd3fc" metalness={0.15} roughness={0.25} />
          </mesh>
        ))}
        <mesh position={[0, 0.78, 2.02]}>
          <boxGeometry args={[0.85, 1.55, 0.06]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <mesh position={[0, 2.25, 2.15]} castShadow>
          <boxGeometry args={[3.8, 0.14, 1.1]} />
          <meshStandardMaterial color="#0f766e" />
        </mesh>
        {[-1.65, 1.65].map((x) => (
          <group key={x} position={[x, 0, 3.0]}>
            <mesh position={[0, 0.55, 0]} castShadow>
              <cylinderGeometry args={[0.42, 0.42, 0.1, 16]} />
              <meshStandardMaterial color="#92400e" />
            </mesh>
            <mesh position={[0, 0.28, 0]}>
              <cylinderGeometry args={[0.06, 0.08, 0.5, 8]} />
              <meshStandardMaterial color="#475569" />
            </mesh>
            {[-0.55, 0.55].map((dx) => (
              <mesh key={dx} position={[dx, 0.25, 0]}>
                <boxGeometry args={[0.18, 0.45, 0.18]} />
                <meshStandardMaterial color="#475569" />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[0, 2.95, 2.05]}>
          <boxGeometry args={[4.1, 0.4, 0.08]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <Text position={[0, 2.95, 2.1]} fontSize={0.18} color="#f8fafc" anchorX="center" anchorY="middle">
          {restaurantName.toUpperCase()}
        </Text>
        <BuildingPins emoji="🍽️" label="Family Restaurant" height={3.3} nameOverride={restaurantName} info={restaurantInfo} />
      </UrbanLot>
    </group>
  );
}
