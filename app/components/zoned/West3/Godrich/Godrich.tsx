'use client';

import { Text } from '@react-three/drei';
import { useMemo } from 'react';
import type { ZoneConfig } from '@/app/components/WorldCanvas';
import {
    ArbadeenSecondarySchool as SecondarySchool,
    GodrichFineDiningRestaurant as FineDiningRestaurant,
    GodrichChurch as Church,
} from '@/app/components/zoned/BuildingImports';

export const zone: ZoneConfig = {
    id: 'Godrich',
    c: [60, 20], // centre [x, z]
    size: [40, 20], // [width, depth]
    color: '#b9d49c',
    label: { text: 'Godrich', size: 0.7 },
};

const godrich2Zone: ZoneConfig = {
    id: 'Godrich 2',
    c: [85, -10],
    size: [50, 40],
    color: '#b9d49c',
    label: { text: 'Godrich 2', size: 0.7 },
};

const BEACH_DEPTH = 2;
const ROAD_DEPTH = 1.2;

// One rectangular plot of land. Its top face sits at y = 0.
// Camera looks north, so the "back" is the smaller-z edge and the "front" is the larger-z edge.
export default function Godrich() {
    const [cx, cz] = zone.c;
    const [width, depth] = zone.size;

    const backEdge = cz - depth / 2;
    const frontEdge = cz + depth / 2;
    const roadZ = cz;
    const labelZ = (backEdge + (roadZ - ROAD_DEPTH / 2)) / 2; // midway between the back edge and the road

    const [godrich2X, godrich2Z] = godrich2Zone.c;
    const [godrich2Width, godrich2Depth] = godrich2Zone.size;
    const godrich2BackEdge = godrich2Z - godrich2Depth / 2;
    const godrich2RoadZ = godrich2Z;
    const godrich2LabelZ =
        (godrich2BackEdge + (godrich2RoadZ - ROAD_DEPTH / 2)) / 2;

    return (
        <group>
            {/* Land */}
            <mesh position={[cx, -0.25, cz]} receiveShadow>
                <boxGeometry args={[width, 0.5, depth]} />
                <meshStandardMaterial color={zone.color} />
            </mesh>

            {/* Road through the middle of the land mass */}
            <mesh position={[cx, 0.03, roadZ]} receiveShadow>
                <boxGeometry args={[width, 0.06, ROAD_DEPTH]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            {/*Godrich landmass */}
            <mesh position={[godrich2X, -0.25, godrich2Z]} receiveShadow>
                <boxGeometry args={[godrich2Width, 0.5, godrich2Depth]} />
                <meshStandardMaterial color={godrich2Zone.color} />
            </mesh>

            <mesh position={[godrich2X, 0.03, godrich2RoadZ]} receiveShadow>
                <boxGeometry args={[godrich2Width, 0.06, ROAD_DEPTH]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            <Church position={[50, 0, 15]} nameOverride="Good Shepherd Chapel" />
            <SecondarySchool position={[75, 0, 26]} nameOverride="Hill Valley Academy" />
            
            <FineDiningRestaurant position={[60, 0, 25]} nameOverride="LOR" />

            {/* Beach along the front */}
            <mesh position={[cx, 0.03, frontEdge - BEACH_DEPTH / 2]} receiveShadow>
                <boxGeometry args={[width, 0.06, BEACH_DEPTH]} />
                <meshStandardMaterial color="#e8cf9a" />
            </mesh>

            {/* Name, painted on the ground behind the road */}
            {zone.label && (
                <Text
                    position={[cx, 0.08, labelZ]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={zone.label.size ?? 0.55}
                    letterSpacing={0.35}
                    color="#475569"
                    fillOpacity={0.6}
                    anchorX="center"
                    anchorY="middle"
                >
                    {zone.label.text}
                </Text>
            )}

            {godrich2Zone.label && (
                <Text
                    position={[godrich2X, 0.08, godrich2LabelZ]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={godrich2Zone.label.size ?? 0.55}
                    letterSpacing={0.35}
                    color="#475569"
                    fillOpacity={0.6}
                    anchorX="center"
                    anchorY="middle"
                >
                    {godrich2Zone.label.text}
                </Text>
            )}
        </group>
    );
}
