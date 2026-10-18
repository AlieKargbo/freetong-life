'use client';

//Lumely Zone, Arbadeen Zone, Wilkson Road Zone one building folder
import { Text } from '@react-three/drei';
import { useMemo } from 'react';
import type { ZoneConfig } from '../../../WorldCanvas';
import NightClub from '../Buildings/Nightclub';
import GulfSquare from '../Buildings/Gulfpark';
import Gym from '../Buildings/Gym';
import Hotel from '../Buildings/Hotel';
import IceCreamCafe from '../Buildings/Icecreamcafe';
import FishGrill from '../Buildings/Fishgrill';
import LifeguardTower from '../Buildings/Lifeguard';
import SurfShop from '../Buildings/Surfshop';
import TikiBar from '../Buildings/Tikibar';
import Lighthouse from '../Buildings/Lighthouse';
import {
    Bank,
    LowClassShop,
    LowClassShopTwo,
    LowIncomeHouseOne,
    LowIncomeHouseTwo,
    HighClassShop,
    MediumClassShop,
    MiddleIncomeHouseOne,
    MiddleIncomeHouseTwo,
    Pharmacy,
    FamilyRestaurant
} from '../../Buildings/CityBuildings';
import EmptyHousePlot from '../../Buildings/EmptyHousePlot';
import { SharedBusStation, SharedMilitaryHQ } from '@/app/components/zoned/BuildingImports';
import { scatterGroundPoints, Trees } from '@/app/components/zoned/West2/Landmarks/Scatter';
import Billboard from '../../Buildings/Billboard';

interface LumelyProps {
    roadConnectionZ?: number;
}

export const zone: ZoneConfig = {
    id: 'mainland',
    c: [4, 20], // centre [x, z]
    size: [50, 20], // [width, depth]
    color: '#b9d49c',
    label: { text: 'LUMELY', size: 0.7 },
};

export const lumely2Zone: ZoneConfig = {
    id: 'lumely-2',
    c: [40, 20],
    size: [25, 20],
    color: '#b9d49c',
    label: { text: 'LUMELY 2', size: 0.7 },
};

const malamaZone: ZoneConfig = {
    id: 'malama',
    c: [47, -10],
    size: [20, 40],
    color: '#b9d49c',
    label: { text: 'Malama', size: 0.7 },
};

const BEACH_DEPTH = 2;
const ROAD_DEPTH = 1.2;
const ROAD_INSET = 2.4; // distance from the back edge to the road's centre
const TREE_COUNT = 9;
const TREE_SPACING = 3.2;
const BUILDING_CLEARANCE = 3.5;
const TREE_SEED = 741;

// function makeTreePositions(cx: number, cz: number, width: number, backEdge: number, frontEdge: number, roadZ: number): [number, number][] {
//     let seed = TREE_SEED;
//     const random = () => {
//         seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
//         return seed / 4294967296;
//     };
//     const buildingPositions: [number, number][] = [
//         [cx + 16, cz + 4.5], [cx + 8, cz + 4.5], [cx, cz + 4.5], [cx - 8, cz + 4.5], [cx - 16, cz + 4.5],
//         [cx - 12, cz - 3.8], [cx, cz - 3.8], [cx - 4, cz - 3.8], [cx + 12, cz - 3.8],
//     ];
//     const positions: [number, number][] = [];
//     const minX = cx - width / 2 + 1.5;
//     const maxX = cx + width / 2 - 1.5;
//     const minZ = backEdge + 1.5;
//     const maxZ = frontEdge - BEACH_DEPTH - 1.5;

//     for (let attempt = 0; attempt < 1500 && positions.length < TREE_COUNT; attempt++) {
//         const x = minX + random() * (maxX - minX);
//         const z = minZ + random() * (maxZ - minZ);
//         if (Math.abs(z - roadZ) < ROAD_DEPTH / 2 + 1.2) continue;
//         if (buildingPositions.some(([buildingX, buildingZ]) => Math.hypot(x - buildingX, z - buildingZ) < BUILDING_CLEARANCE)) continue;
//         if (positions.some(([treeX, treeZ]) => Math.hypot(x - treeX, z - treeZ) < TREE_SPACING)) continue;
//         positions.push([x, z]);
//     }

//     return positions;
// }

// function Tree({ position }: { position: [number, number, number] }) {
//     return (
//         <group position={position}>
//             <mesh position={[0, 0.65, 0]} castShadow>
//                 <cylinderGeometry args={[0.12, 0.18, 1.3, 8]} />
//                 <meshStandardMaterial color="#7c5a3a" />
//             </mesh>
//             <mesh position={[0, 1.75, 0]} castShadow>
//                 <coneGeometry args={[0.85, 2.1, 8]} />
//                 <meshStandardMaterial color="#3f9142" />
//             </mesh>
//         </group>
//     );
// }

// One rectangular plot of land. Its top face sits at y = 0.
// Camera looks north, so the "back" is the smaller-z edge and the "front" is the larger-z edge.
export default function Lumely({ roadConnectionZ }: LumelyProps = {}) {
    const [cx, cz] = zone.c;
    const [width, depth] = zone.size;

    const backEdge = cz - depth / 2;
    const frontEdge = cz + depth / 2;
    const roadZ = backEdge + ROAD_INSET;
    const labelZ = (backEdge + (roadZ - ROAD_DEPTH / 2)) / 2; // midway between the back edge and the road
    const backRowZ = cz - 3.8;
    const frontRowZ = cz + 4.5;
    const [lumely2Cx, lumely2Cz] = lumely2Zone.c;
    const [lumely2Width, lumely2Depth] = lumely2Zone.size;
    const lumely2BackEdge = lumely2Cz - lumely2Depth / 2;
    const lumely2RoadZ = lumely2Cz;
    const lumely2LabelZ =
        (lumely2BackEdge + (lumely2RoadZ - ROAD_DEPTH / 2)) / 2;
    const [malamaCx, malamaCz] = malamaZone.c;
    const [malamaWidth, malamaDepth] = malamaZone.size;
    const malamaBackEdge = malamaCz - malamaDepth / 2;
    const malamaFrontEdge = malamaCz + malamaDepth / 2;
    const malamaRoadStartZ = malamaBackEdge + ROAD_INSET;
    const malamaRoadEndZ = roadConnectionZ ?? malamaFrontEdge;
    const malamaRoadLength = malamaRoadEndZ - malamaRoadStartZ;
    const malamaRoadCenterZ = malamaRoadStartZ + malamaRoadLength / 2;
    const malamaLabelZ = malamaBackEdge + 1.5;
    const lumelyTrees = useMemo(() => scatterGroundPoints(
        { minX: cx - width / 2, maxX: cx + width / 2, minZ: backEdge, maxZ: frontEdge },
        {
            count: 8,
            seed: 111,
            minSpacing: 2.8,
            obstacles: [
                { x: 20, z: frontRowZ, radius: 3 },
                { x: 12, z: frontRowZ, radius: 3 },
                { x: 4, z: frontRowZ, radius: 3 },
                { x: -8, z: frontRowZ, radius: 3 },
                { x: -4, z: frontRowZ, radius: 3 },
                { x: -12, z: frontRowZ, radius: 3 },
                { x: 9, z: backRowZ, radius: 4 },
                { x: 16, z: backRowZ, radius: 4 },
                { x: 4, z: backRowZ, radius: 3 },
                { x: 0, z: backRowZ, radius: 3 },
                { x: -8, z: backRowZ, radius: 3 },
                { x: -15, z: backRowZ, radius: 5 },
            ],
            roads: [{ x: cx, z: cz, width, depth: ROAD_DEPTH }],
        },
    ), [cx, cz, width, backEdge, frontEdge, frontRowZ, backRowZ]);
    const lumely2Trees = useMemo(() => scatterGroundPoints(
        {
            minX: lumely2Cx - lumely2Width / 2,
            maxX: lumely2Cx + lumely2Width / 2,
            minZ: lumely2Cz - lumely2Depth / 2,
            maxZ: lumely2Cz + lumely2Depth / 2,
        },
        {
            count: 6,
            seed: 222,
            minSpacing: 2.6,
            obstacles: [
                { x: lumely2Cx + 3.5, z: lumely2Cz - 5, radius: 2.4 },
                { x: lumely2Cx - 3, z: lumely2Cz - 5, radius: 2.4 },
                { x: lumely2Cx - 9, z: lumely2Cz - 5, radius: 2.4 },
                { x: lumely2Cx - 7, z: lumely2Cz + 5, radius: 3.2 },
                { x: lumely2Cx, z: lumely2Cz + 5, radius: 2.5 },
                { x: lumely2Cx + 5, z: lumely2Cz + 5, radius: 3.2 },
            ],
            roads: [{ x: lumely2Cx, z: lumely2RoadZ, width: lumely2Width, depth: ROAD_DEPTH }],
        },
    ), [lumely2Cx, lumely2Cz, lumely2Width, lumely2Depth, lumely2RoadZ]);
    const malamaTrees = useMemo(() => {
        const buildingOffsets: [number, number, number][] = [
            [-7.2, 20, 2.4], [-2.8, 20, 2.4], [-7.2, 15, 2.4], [-2.8, 15, 2.4],
            [-7.2, 10, 2.4], [-2.8, 10, 2.4], [-7.2, 5, 2.3], [-2.8, 5, 2.3],
            [-7.2, 0, 2.3], [-2.8, 0, 2.3], [-7.2, -5, 2.3], [-2.8, -5, 2.3],
            [-7.2, -10, 2.3], [-2.8, -10, 2.3], [-7.2, -15, 2], [-2.8, -15, 2],
            [3, 20, 2.4], [7.5, 20, 2.4], [3, 15, 2.4], [7.5, 15, 2.4],
            [3, 10, 2.4], [7.5, 10, 2.4], [3, 5, 2.4], [7.5, 5, 2.4],
            [3, 0, 2.3], [7.5, 0, 2.3], [3, -5, 2.3], [7.2, -5, 2.3],
            [3, -10, 2], [7.5, -10, 2], [3, -15, 2], [7.5, -15, 2],
        ];
        return scatterGroundPoints(
            {
                minX: malamaCx - malamaWidth / 2,
                maxX: malamaCx + malamaWidth / 2,
                minZ: malamaBackEdge,
                maxZ: malamaFrontEdge,
            },
            {
                count: 7,
                seed: 333,
                minSpacing: 2.2,
                edgePadding: 0.8,
                roadPadding: 0.5,
                obstacles: buildingOffsets.map(([x, z, radius]) => ({
                    x: malamaCx + x,
                    z: malamaCz + z,
                    radius,
                })),
                roads: [{
                    x: malamaCx,
                    z: malamaRoadCenterZ,
                    width: ROAD_DEPTH,
                    depth: malamaRoadLength,
                }],
            },
        );
    }, [malamaCx, malamaCz, malamaWidth, malamaBackEdge, malamaFrontEdge, malamaRoadCenterZ, malamaRoadLength]);
    const lumelyBillboardPoints = useMemo(() => scatterGroundPoints(
        { minX: 20, maxX: 27, minZ: 11.5, maxZ: 15.5 },
        {
            count: 1,
            seed: 1901,
            minSpacing: 1,
            edgePadding: 0.25,
            obstacles: [
                { x: lumely2Cx + 3.5, z: lumely2Cz - 5, radius: 4.7 },
                { x: lumely2Cx - 3, z: lumely2Cz - 5, radius: 4.5 },
                { x: lumely2Cx - 9, z: lumely2Cz - 5, radius: 4.5 },
                { x: cx + 12, z: backRowZ, radius: 6.5 },
            ],
            roads: [{ x: cx, z: cz, width, depth: ROAD_DEPTH }],
        },
    ), [cx, cz, width, lumely2Cx, lumely2Cz, backRowZ]);
    // const treePositions = useMemo(
    //     () => makeTreePositions(cx, cz, width, backEdge, frontEdge, roadZ),
    //     [cx, cz, width, backEdge, frontEdge, roadZ],
    // );

    return (
        <group>
            {/* Land */}
            <mesh position={[cx, -0.25, cz]} receiveShadow>
                <boxGeometry args={[width, 0.5, depth]} />
                <meshStandardMaterial color={zone.color} />
            </mesh>

            {/* Road through the middle of the landmass */}
            <mesh position={[cx, 0.03, cz]} receiveShadow>
                <boxGeometry args={[width, 0.06, ROAD_DEPTH]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            {/* Lumely 2 parcel */}
            <mesh position={[lumely2Cx, -0.25, lumely2Cz]} receiveShadow>
                <boxGeometry args={[lumely2Width, 0.5, lumely2Depth]} />
                <meshStandardMaterial color={lumely2Zone.color} />
            </mesh>

            <mesh position={[lumely2Cx, 0.03, lumely2RoadZ]} receiveShadow>
                <boxGeometry args={[lumely2Width, 0.06, ROAD_DEPTH]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            {lumely2Zone.label && (
                <Text
                    position={[lumely2Cx, 0.08, lumely2LabelZ]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={lumely2Zone.label.size ?? 0.55}
                    letterSpacing={0.35}
                    color="#475569"
                    fillOpacity={0.6}
                    anchorX="center"
                    anchorY="middle"
                >
                    {lumely2Zone.label.text}
                </Text>
            )}

            {/* Malama parcel */}
            <mesh position={[malamaCx, -0.25, malamaCz]} receiveShadow>
                <boxGeometry args={[malamaWidth, 0.5, malamaDepth]} />
                <meshStandardMaterial color={malamaZone.color} />
            </mesh>

            <mesh position={[malamaCx, 0.03, malamaRoadCenterZ]} receiveShadow>
                <boxGeometry args={[ROAD_DEPTH, 0.06, malamaRoadLength]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            {malamaZone.label && (
                <Text
                    position={[malamaCx, 0.08, malamaLabelZ]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={malamaZone.label.size ?? 0.55}
                    letterSpacing={0.35}
                    color="#475569"
                    fillOpacity={0.6}
                    anchorX="center"
                    anchorY="middle"
                >
                    {malamaZone.label.text}
                </Text>
            )}

            {/* Beach along the front */}
            <mesh position={[cx, 0.03, frontEdge - BEACH_DEPTH / 2]} receiveShadow>
                <boxGeometry args={[width, 0.06, BEACH_DEPTH]} />
                <meshStandardMaterial color="#e8cf9a" />
            </mesh>

            {/* Buildings in two rows, ordered from right to left */}
            <NightClub position={[cx + 16, 0, frontRowZ]} nameOverride="Chapter 1" />
            <Gym position={[cx + 8, 0, frontRowZ]} nameOverride="GYM" />
            <Hotel position={[cx, 0, frontRowZ]} nameOverride="Pearl Hotel" />
            <LifeguardTower position={[cx - 12, 0, frontRowZ]} nameOverride="Rescue Point" />
            {/* <Lighthouse position={[cx - 8, 0, frontRowZ]} nameOverride="Cape Lighthouse" /> */}
            <TikiBar position={[cx - 16, 0, frontRowZ]} nameOverride="Kololi Bar" />
            <GulfSquare position={[cx + 5, 0, backRowZ]} nameOverride="Gulf Club" />
            {/* Day’s Catch Grill */}
            <FishGrill position={[-0.5, 0, frontRowZ]} nameOverride="Grill" />
            {/* SurfShop nameOverride="Blue Fin Surf Co." */}
            <SurfShop position={[24.5, 0, frontRowZ]} />
            <IceCreamCafe position={[cx - 12, 0, backRowZ]} nameOverride="Gigibonta" />
            <FamilyRestaurant position={[cx - 19, 0, backRowZ]} nameOverride="The Kona" cuisine="african" />
            <Trees points={lumelyTrees} seed={111} size={0.75} />
            {lumelyBillboardPoints.map((position, index) => (
                <Billboard key={`lumely-billboard-${index}`} position={position} />
            ))}

            <HighClassShop position={[2, 0, backRowZ]} nameOverride="Freetown Mall" />

            <LowClassShop position={[lumely2Cx + 3.5, 0, lumely2Cz - 5]} />
            <LowClassShop position={[lumely2Cx - 3, 0, lumely2Cz - 5]} />
            <LowClassShop position={[lumely2Cx - 9, 0, lumely2Cz - 5]} />
            <MediumClassShop position={[lumely2Cx - 7, 0, lumely2Cz + 5]} nameOverride="Lumely Markit" />
            <Pharmacy position={[lumely2Cx, 0, lumely2Cz + 5]} nameOverride="Mack Pharmacy" />
            <Bank position={[lumely2Cx + 5, 0, lumely2Cz + 5]} nameOverride="UBA" />
            <Trees points={lumely2Trees} seed={222} size={0.75} />

            <SharedBusStation position={[cx + 12, 0, backRowZ]} nameOverride="Lumely Bus station" />

            {/* Malama buildings */}
            <LowClassShop position={[malamaCx - 7.2, 0, malamaCz + 20]} />
            <LowClassShop position={[malamaCx - 2.8, 0, malamaCz + 20]} />
            <LowClassShop position={[malamaCx - 7.2, 0, malamaCz + 15]} />
            <LowClassShop position={[malamaCx - 2.8, 0, malamaCz + 15]} />
            <LowClassShop position={[malamaCx - 7.2, 0, malamaCz + 10]} />
            <LowClassShop position={[malamaCx - 2.8, 0, malamaCz + 10]} />

            <LowIncomeHouseOne position={[malamaCx - 7.2, 0, malamaCz + 5]} showPin={false} />
            <LowIncomeHouseTwo position={[malamaCx - 2.8, 0, malamaCz + 5]} showPin={false} />
            <LowIncomeHouseTwo position={[malamaCx - 7.2, 0, malamaCz]} showPin={false} />
            <LowIncomeHouseOne position={[malamaCx - 2.8, 0, malamaCz]} showPin={false} />
            <LowIncomeHouseOne position={[malamaCx - 7.2, 0, malamaCz - 5]} showPin={false} />
            <LowIncomeHouseTwo position={[malamaCx - 2.8, 0, malamaCz - 5]} showPin={false} />
            <LowIncomeHouseTwo position={[malamaCx - 7.2, 0, malamaCz - 10]} showPin={false} />
            <EmptyHousePlot position={[malamaCx - 2.8, 0, malamaCz - 15]} />
            <EmptyHousePlot position={[malamaCx - 7.2, 0, malamaCz - 15]} />
            <EmptyHousePlot position={[malamaCx - 2.8, 0, malamaCz - 10]} />

            <LowClassShopTwo position={[malamaCx + 3, 0, malamaCz + 20]} />
            <LowClassShopTwo position={[malamaCx + 7.5, 0, malamaCz + 20]} />
            <LowClassShopTwo position={[malamaCx + 3, 0, malamaCz + 15]} />
            <LowClassShopTwo position={[malamaCx + 7.5, 0, malamaCz + 15]} />
            <LowClassShopTwo position={[malamaCx + 3, 0, malamaCz + 10]} />
            <LowClassShopTwo position={[malamaCx + 7.5, 0, malamaCz + 10]} />
            <LowClassShopTwo position={[malamaCx + 3, 0, malamaCz + 5]} />
            <LowClassShopTwo position={[malamaCx + 7.5, 0, malamaCz + 5]} />
            <MiddleIncomeHouseOne position={[malamaCx + 3, 0, malamaCz]} />
            <MiddleIncomeHouseTwo position={[malamaCx + 7.5, 0, malamaCz]} />
            <MiddleIncomeHouseTwo position={[malamaCx + 3, 0, malamaCz - 5]} />
            <MiddleIncomeHouseOne position={[malamaCx + 7.2, 0, malamaCz - 5]} />
            <EmptyHousePlot position={[malamaCx + 3, 0, malamaCz - 10]} />
            <EmptyHousePlot position={[malamaCx + 7.5, 0, malamaCz - 10]} />
            <EmptyHousePlot position={[malamaCx + 3, 0, malamaCz - 15]} />
            <EmptyHousePlot position={[malamaCx + 7.5, 0, malamaCz - 15]} />
            <Trees points={malamaTrees} seed={333} size={0.65} />
            {/* Baskball court representing sport sport zone */}

            {/* Trees fill the open strip between the building rows */}
            {/* {treePositions.map(([x, z], index) => (
                <Tree key={index} position={[x, 0, z]} />
            ))} */}

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
