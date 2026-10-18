'use client';

//Lumely Zone, Arbadeen Zone, Wilkson Road Zone one building folder
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';
import type { ZoneConfig } from '@/app/components/zoned/BuildingImports';
import { zone as murrytongZone } from '../../West2/Congocross/Murrytong';
import {
    ArbadeenChurch as Church,
    ArbadeenGrammarSchool as GrammarSchool,
    ArbadeenHospital as Hospital,
    ArbadeenMosque as Mosque,
    ArbadeenNurserySchool as NurserySchool,
    ArbadeenPoliceStation as PoliceStation,
    ArbadeenPrimarySchool as PrimarySchool,
    ArbadeenScienceAcademy as ScienceAcademy,
    ArbadeenSecondarySchool as SecondarySchool,
    ArbadeenStadium as Stadium,
    ArbadeenTechnicalCollege as TechnicalCollege,
    ArbadeenUniversityHall as UniversityHall,
    ArbadeenWhiteTower as WhiteTower,
    ArbadeenYouthSportCenter as YouthSportCenter,
    SharedFamilyRestaurant as FamilyRestaurant,
    LumelyFishgrill as FishGrill,
    LumelyHotel as Hotel,
    LumelyLighthouse as Lighthouse,
} from '@/app/components/zoned/BuildingImports';

export const zone: ZoneConfig = {
    id: 'Aberdeen',
    c: [-30, 20],
    size: [24, 11],
    color: '#b9d49c',
    label: { text: 'Aberdeen', size: 0.7 },
};

const ROAD_DEPTH = 1.2;

export default function Aberdeen() {
    const [centerX, centerZ] = zone.c;
    const [width, depth] = zone.size;
    const bridgeStartX = centerX + width / 2;
    const bridgeEndX = 4 - 40 / 2;
    const bridgeCenterX = (bridgeStartX + bridgeEndX) / 2;

    // Create the custom shape matching your ASCII diagram:
    // Top-left, Top-right, Bottom-right, Bottom-left-angled vertices relative to local origin (0,0)
    const customShape = useMemo(() => {
        const shape = new THREE.Shape();
        const halfW = width / 2;
        const halfD = depth / 2;

        // Start at top-left
        shape.moveTo(-halfW, -halfD);
        // Line to top-right
        shape.lineTo(halfW, -halfD);
        // Line down to bottom-right
        shape.lineTo(halfW, halfD);
        // Line left to bottom section
        shape.lineTo(-halfW + 6, halfD);
        // Diagonal slope up-left (the \ shape on the left side)
        shape.lineTo(-halfW, -halfD + 4);
        // Close path back to start
        shape.closePath();

        return shape;
    }, [width, depth]);

    const extrudeSettings = {
        depth: 0.5,
        bevelEnabled: false,
    };

    return (
        <group>
            {/* Custom shaped land mass with Arbadeen's center position */}
            <mesh position={[centerX, 0, centerZ]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
                <extrudeGeometry args={[customShape, extrudeSettings]} />
                <meshStandardMaterial color={zone.color} />
            </mesh>

            {/* Aberdeen buildings arranged in compact rows across the island. */}
            {/* <group position={[centerX, 0, centerZ]} scale={0.6}>
                {/* <Stadium position={[-8, 0, -3.5]} /> */}
            {/* <Hospital position={[-4, 0, -3.5]} /> */}
            {/* <PoliceStation position={[0, 0, -3.5]} /> */}
            {/* <Church position={[4, 0, -3.5]} /> */}
            {/* <Mosque position={[8, 0, -3.5]} /> */}

            {/* <YouthSportCenter position={[-8, 0, 0]} /> */}
            {/* <WhiteTower position={[-4, 0, 0]} /> */}
            {/* <NurserySchool position={[0, 0, 0]} />
                <PrimarySchool position={[4, 0, 0]} />
                <SecondarySchool position={[8, 0, 0]} />

                <GrammarSchool position={[-6, 0, 3.5]} />
                <TechnicalCollege position={[-2, 0, 3.5]} />
                <UniversityHall position={[2, 0, 3.5]} />
                <ScienceAcademy position={[6, 0, 3.5]} />
            </group> */}

            {/* Road continuing from the metal bridge into Aberdeen */}
            <mesh
                position={[
                    centerX - 6,
                    0.065,
                    (20 - 11 / 2 + 20) / 2,
                ]}
                receiveShadow
            >
                <boxGeometry args={[ROAD_DEPTH, 0.08, 5.5]} />
                <meshStandardMaterial color="#6b7280" roughness={0.95} />
            </mesh>

            {/* Horizontal road turning right toward the existing road */}
            <mesh
                position={[-24, 0.065, 20]}
                receiveShadow
            >
                <boxGeometry args={[24, 0.08, ROAD_DEPTH]} />
                <meshStandardMaterial color="#6b7280" roughness={0.95} />
            </mesh>

            <Hotel position={[-31, 0, 17]} nameOverride="Bintumani Hotel" />
            <Lighthouse position={[-38, 0, 17]} nameOverride="Aberdeen Lighthouse" />
            <FishGrill position={[-33, 0, 24]} nameOverride="Lagoonda" />
            <group position={[-24, 0, 22.9]} scale={0.6}>
                <FamilyRestaurant position={[0, 0, 0]} nameOverride="Olba Restaurant" cuisine="sierra-leonean" />
            </group>

            {/* Zone Label */}
            {zone.label && (
                <Text
                    position={[centerX, 0.08, centerZ]}
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
