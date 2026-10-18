'use client';

import { Text } from '@react-three/drei';
import { BuildingPins } from '@/app/components/zoned/BuildingImports';
import {UrbanLot} from '@/app/components/zoned/BuildingImports';
import { createRestaurantInfo, restaurantInstanceId } from '../../Buildings/RestaurantInteriors';

type Props = {
  position: [number, number, number];
  nameOverride?: string;
};
export const FINE_DINING_HEIGHT = 3.3;

export default function FineDiningRestaurant({ position, nameOverride }: Props) {
  const restaurantName = nameOverride ?? 'The Supper Club';
  const restaurantInfo = createRestaurantInfo({
    id: restaurantInstanceId('fine-dining', restaurantName, position.map((part) => Math.round(part * 100)).join('-')),
    name: restaurantName,
    area: 'Freetown',
    emoji: '🥂',
    cuisine: 'world',
    tagline: 'A polished dining room for Sierra Leonean favourites and dishes from around the world.',
    activities: [
      { emoji: '🐟', label: 'Grilled Atlantic fish' },
      { emoji: '🍝', label: 'Italian pasta' },
      { emoji: '🍛', label: 'West African curry' },
      { emoji: '🥗', label: 'Seasonal world plates' },
    ],
  });

  return (
    <group position={position}>
      <UrbanLot width={7.8} depth={8.2} walkwayWidth={2.2} walkwayDepth={1.7}>
        <mesh position={[0, 1.35, -0.45]} castShadow receiveShadow>
          <boxGeometry args={[5.4, 2.7, 4.8]} />
          <meshStandardMaterial color="#334155" roughness={0.75} />
        </mesh>
        <mesh position={[0, 2.78, -0.45]} castShadow>
          <boxGeometry args={[5.65, 0.16, 5.05]} />
          <meshStandardMaterial color="#d4af37" />
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
          <meshStandardMaterial color="#d4af37" />
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
          {restaurantName}
        </Text>
        <BuildingPins emoji="🥂" label="Fine Dining" height={3.3} nameOverride={restaurantName} info={restaurantInfo} />
      </UrbanLot>
    </group>
  );
}
