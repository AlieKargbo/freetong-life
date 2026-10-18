'use client';

import { Text } from '@react-three/drei';
import { useMemo } from 'react';
import type { ZoneConfig } from '@/app/components/WorldCanvas';
import {
    ArbadeenSecondarySchool as SecondarySchool,
    RegentEmbassyOne as EmbassyOne,
    RegentPresidentialCompound as PresidentialCompound,
} from '@/app/components/zoned/BuildingImports';
import {
    BeautySalon,
    OfficeTowerTwo,
    RadioStation,
} from '../../Buildings/CityLandmarks';
import {
    MediumClassShop,
    MiddleIncomeHouseOne,
    Pharmacy,
} from '../../Buildings/CityBuildings';
import Hotel from '../../West1/Buildings/Hotel';

interface MainlandProps {
    roadConnectionZ?: number;
}

export const zone: ZoneConfig = {
    id: 'regent',
    c: [25.5, -10], // second row, centered between Lumely and Godrich
    size: [20, 40], // vertical footprint: [width, depth]
    color: '#b9d49c',
    label: { text: 'REGENT', size: 0.7 },
};

const BEACH_DEPTH = 2;
const ROAD_DEPTH = 1.2;
const ROAD_INSET = 2.4; // distance from the back edge to the road's centre
const TREE_COUNT = 9;
const TREE_SPACING = 3.2;
const BUILDING_CLEARANCE = 3.5;
const TREE_SEED = 741;

const southernZone: ZoneConfig = {
    id: 'regent-south',
    c: [25.5, -50],
    size: [20, 40],
    color: '#b9d49c',
    label: { text: 'REGENT', size: 0.7 },
};

function makeTreePositions(cx: number, cz: number, width: number, backEdge: number, frontEdge: number, roadX: number): [number, number][] {
    let seed = TREE_SEED;
    const random = () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed / 4294967296;
    };
    const buildingPositions: [number, number][] = [
        [cx - 5.5, cz + 5], [cx + 5.5, cz + 4],
        [cx - 5.5, cz - 3], [cx + 5.5, cz - 4],
        [cx - 5.5, cz - 11], [cx + 5.5, cz - 12],
        [cx - 5.5, cz - 19], [cx + 5.5, cz - 20],
        [cx - 5.5, cz - 25],
    ];
    const positions: [number, number][] = [];
    const minX = cx - width / 2 + 1.5;
    const maxX = cx + width / 2 - 1.5;
    const minZ = backEdge + 1.5;
    const maxZ = frontEdge - BEACH_DEPTH - 1.5;

    for (let attempt = 0; attempt < 1500 && positions.length < TREE_COUNT; attempt++) {
        const x = minX + random() * (maxX - minX);
        const z = minZ + random() * (maxZ - minZ);
        if (Math.abs(x - roadX) < ROAD_DEPTH / 2 + 1.2) continue;
        if (buildingPositions.some(([buildingX, buildingZ]) => Math.hypot(x - buildingX, z - buildingZ) < BUILDING_CLEARANCE)) continue;
        if (positions.some(([treeX, treeZ]) => Math.hypot(x - treeX, z - treeZ) < TREE_SPACING)) continue;
        positions.push([x, z]);
    }

    return positions;
}

function Tree({ position }: { position: [number, number, number] }) {
    return (
        <group position={position}>
            <mesh position={[0, 0.65, 0]} castShadow>
                <cylinderGeometry args={[0.12, 0.18, 1.3, 8]} />
                <meshStandardMaterial color="#7c5a3a" />
            </mesh>
            <mesh position={[0, 1.75, 0]} castShadow>
                <coneGeometry args={[0.85, 2.1, 8]} />
                <meshStandardMaterial color="#3f9142" />
            </mesh>
        </group>
    );
}


// One rectangular plot of land. Its top face sits at y = 0.
// Camera looks north, so the "back" is the smaller-z edge and the "front" is the larger-z edge.
export default function Regent({ roadConnectionZ }: MainlandProps) {
    const [cx, cz] = zone.c;
    const [width, depth] = zone.size;
    const backEdge = cz - depth / 2;
    const frontEdge = cz + depth / 2;
    const roadStartZ = backEdge + ROAD_INSET;

    // Use the passed roadConnectionZ if available, otherwise default to frontEdge    
    const targetRoadEndZ = roadConnectionZ ?? frontEdge;
    const roadLength = targetRoadEndZ - roadStartZ;
    const roadCenterZ = roadStartZ + roadLength / 2;

    const labelZ = backEdge + 1.5;
    const [southernCx, southernCz] = southernZone.c;
    const [southernWidth, southernDepth] = southernZone.size;
    const southernBackEdge = southernCz - southernDepth / 2;
    const southernFrontEdge = southernCz + southernDepth / 2;
    const southernRoadStartZ = southernBackEdge + ROAD_INSET;
    const southernRoadEndZ = backEdge + ROAD_INSET;
    const southernRoadLength = southernRoadEndZ - southernRoadStartZ;
    const southernRoadCenterZ = southernRoadStartZ + southernRoadLength / 2;
    const southernLabelZ = southernBackEdge + 1.5;
    const treePositions = useMemo(
        () => makeTreePositions(southernCx, southernCz, southernWidth, southernBackEdge, southernFrontEdge, southernCx),
        [southernCx, southernCz, southernWidth, southernBackEdge, southernFrontEdge],
    );

    return (
        <group>
            {/* Land */}
            <mesh position={[cx, -0.25, cz]} receiveShadow>
                <boxGeometry args={[width, 0.5, depth]} />
                <meshStandardMaterial color={zone.color} />
            </mesh>

            {/* Center road runs through the island and joins the roundabout. */}
            <mesh position={[cx, 0.03, roadCenterZ]} receiveShadow>
                <boxGeometry args={[ROAD_DEPTH, 0.06, roadLength]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            {/* Southern Regent landmass */}
            <mesh position={[southernCx, -0.25, southernCz]} receiveShadow>
                <boxGeometry args={[southernWidth, 0.5, southernDepth]} />
                <meshStandardMaterial color={southernZone.color} />
            </mesh>

            <mesh position={[southernCx, 0.03, southernRoadCenterZ]} receiveShadow>
                <boxGeometry args={[ROAD_DEPTH, 0.06, southernRoadLength]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            <EmbassyOne position={[20, 0, -15]} nameOverride="British High Commission" />


            <BeautySalon position={[29, 0, - 15]} nameOverride="Golden Comb Studio" />
            <RadioStation position={[15, 0, -23]} nameOverride="SLBC" />
            <Pharmacy position={[28.5, 0, - 1]} nameOverride="City Pharmacy" />
            <MediumClassShop position={[22, 0, - 26]} nameOverride="St Mary's Supermarket" />
            <MiddleIncomeHouseOne position={[28.5, 0, 4]} />
            <MiddleIncomeHouseOne position={[33, 0, 4]} />
             <Hotel position={[29, 0, - 10]} nameOverride="Swiss Hotel" />
            <SecondarySchool position={[20, 0, - 33]} nameOverride="American International School of Freetown" />

            <PresidentialCompound position={[southernCx + 8, 0, southernCz + 10]} nameOverride="State Lodge" />
            <OfficeTowerTwo position={[29.5, 0, - 55]} nameOverride="Orange Office" />
            {treePositions.map(([x, z], index) => (
                <Tree key={index} position={[x, 0, z]} />
            ))}

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

            {southernZone.label && (
                <Text
                    position={[southernCx, 0.08, southernLabelZ]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={southernZone.label.size ?? 0.55}
                    letterSpacing={0.35}
                    color="#475569"
                    fillOpacity={0.6}
                    anchorX="center"
                    anchorY="middle"
                >
                    {southernZone.label.text}
                </Text>
            )}
        </group>
    );
}
