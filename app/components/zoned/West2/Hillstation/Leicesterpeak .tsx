'use client';

import { Text } from '@react-three/drei';
import { useMemo } from 'react';
import type { ZoneConfig } from '@/app/components/zoned/BuildingImports';
import { scatterGroundPoints, Trees } from '@/app/components/zoned/West2/Landmarks/Scatter';

import LeicesterPeak from '../Landmarks/LeicesterPeak';
import SugarLoaf from '../Landmarks/SugarLoaf';
//import Mountain from './Landmarks/';
import { HillstationEmbassyTwo as EmbassyTwo } from '@/app/components/zoned/BuildingImports';

export const zone: ZoneConfig = {
    id: 'mainland',
    c: [-9, -53], // centre [x, z]
    size: [50, 40], // [width, depth]
    color: '#b9d49c',
    label: { text: 'LeicesterPeak', size: 0.7 },
};

const BEACH_DEPTH = 2;
const ROAD_DEPTH = 1.2;
const ROAD_INSET = 2.4; // distance from the back edge to the road's centre
const TREE_COUNT = 9;
const TREE_SPACING = 3.2;
const BUILDING_CLEARANCE = 3.5;
const TREE_SEED = 741;

// One rectangular plot of land. Its top face sits at y = 0.
// Camera looks north, so the "back" is the smaller-z edge and the "front" is the larger-z edge.
export default function Leicesterpeak() {
    const [cx, cz] = zone.c;
    const [width, depth] = zone.size;

    const backEdge = cz - depth / 2;
    const frontEdge = cz + depth / 2;
    const roadZ = backEdge + ROAD_INSET;
    const labelZ = (backEdge + (roadZ - ROAD_DEPTH / 2)) / 2; // midway between the back edge and the road
    const vegetation = useMemo(() => scatterGroundPoints(
        { minX: cx - width / 2, maxX: cx + width / 2, minZ: backEdge, maxZ: frontEdge },
        {
            count: 12,
            seed: 888,
            minSpacing: 3.5,
            edgePadding: 2,
            obstacles: [
                { x: -4, z: cz - 10, radius: 10 },
                { x: cx - 5.5, z: cz + 5, radius: 3.5 },
                { x: cx, z: labelZ, radius: 5 },
            ],
            roads: [{ x: cx, z: cz, width, depth: ROAD_DEPTH }],
        },
    ), [cx, cz, width, backEdge, frontEdge, labelZ]);

    return (
        <group>
            {/* Land */}
            <mesh position={[cx, -0.25, cz]} receiveShadow>
                <boxGeometry args={[width, 0.5, depth]} />
                <meshStandardMaterial color={zone.color} />
            </mesh>

            {/* Horizontal road through the middle of Leicesterpeak */}
            <mesh position={[cx, 0.03, cz]} receiveShadow>
                <boxGeometry args={[width, 0.06, ROAD_DEPTH]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            <LeicesterPeak position={[-4, 0, cz - 10]} nameOverride="Leicester Peak Viewpoint" />
            <SugarLoaf position={[70, 0, cz - 10]} nameOverride="Sugar Loaf Summit" showPin />
            <SugarLoaf position={[60, 0, cz - 10]} nameOverride="Sugar Loaf Trail" />
            <SugarLoaf position={[77, 0, cz + 1]} nameOverride="Sugar Loaf Lookout" />
            <EmbassyTwo position={[cx - 5.5, 0, cz + 5]} nameOverride="US Embassy Freetown" />

            <Trees points={vegetation} seed={888} size={0.95} />

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
        </group>
    );
}
