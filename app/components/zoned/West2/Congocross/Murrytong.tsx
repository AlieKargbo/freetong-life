'use client';

import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';
import type { ZoneConfig } from '@/app/components/zoned/BuildingImports';
import { ArbadeenGrammarSchool as GrammarSchool } from '@/app/components/zoned/BuildingImports';

import { SharedBusStation, SharedMilitaryHQ } from '@/app/components/zoned/BuildingImports';
import { scatterGroundPoints, Trees } from '@/app/components/zoned/West2/Landmarks/Scatter';

export const zone: ZoneConfig = {
    id: 'lumely-2',
    c: [-36, -0.5],
    size: [24, 11],
    color: '#b9d49c',
    label: { text: 'Murrytong', size: 0.7 },
};

const ROAD_DEPTH = 1.2;

export default function Murrytong() {
    const [centerX, centerZ] = zone.c;
    const [width, depth] = zone.size;

    // Nearest edges of the two landmasses.
    const bridgeStartZ = centerZ + depth / 2; // 5
    const bridgeEndZ = 20 - 11 / 2; // 14.5
    const bridgeLength = bridgeEndZ - bridgeStartZ;
    const bridgeCenterZ = (bridgeStartZ + bridgeEndZ) / 2;

    const steelMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#64748b',
                metalness: 0.9,
                roughness: 0.3,
            }),
        []
    );

    const railMaterial = useMemo(
        () =>
            new THREE.MeshStandardMaterial({
                color: '#cbd5e1',
                metalness: 0.95,
                roughness: 0.22,
            }),
        []
    );

    const [cx, cz] = zone.c;

    const backEdge = cz - depth / 2;
    const frontEdge = cz + depth / 2;
    //road in the middle
    const roadZ = cz;
    const labelZ = (backEdge + (roadZ - ROAD_DEPTH / 2)) / 2; // midway between the back edge and the road
    const backRowZ = cz - 3.8;
    const frontRowZ = cz + 4.5;
    const vegetation = useMemo(() => scatterGroundPoints(
        {
            minX: centerX - width / 2,
            maxX: centerX + width / 2,
            minZ: centerZ - depth / 2,
            maxZ: centerZ + depth / 2,
        },
        {
            count: 5,
            seed: 666,
            minSpacing: 2.2,
            edgePadding: 0.75,
            obstacles: [
                { x: -43, z: 2, radius: 2.5 },
                { x: -40, z: 2, radius: 3 },
                { x: -30, z: 2, radius: 3 },
            ],
            roads: [
                { x: cx, z: roadZ, width, depth: ROAD_DEPTH },
                { x: centerX, z: bridgeCenterZ, width: ROAD_DEPTH, depth: bridgeLength },
            ],
        },
    ), [centerX, centerZ, width, depth, cx, roadZ, bridgeCenterZ, bridgeLength]);

    return (
        <group>
            {/* Murrytong landmass */}
            <mesh
                position={[centerX, -0.25, centerZ]}
                receiveShadow
            >
                <boxGeometry args={[width, 0.5, depth]} />
                <meshStandardMaterial color={zone.color} />
            </mesh>

            <GrammarSchool position={[-43, 0, 2]} nameOverride="Sierra Leone Grammar School" />
            {/* Road through the middle of the land mass */}
            <mesh position={[cx, 0.03, roadZ]} receiveShadow>
                <boxGeometry args={[width, 0.06, ROAD_DEPTH]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            <Trees points={vegetation} seed={666} size={0.7} />

            {/* Jetty on the left (west) side of Murrytong */}
            <group position={[centerX - width / 2 - 3, 0, centerZ]}>
                {/* Wooden jetty deck */}
                <mesh
                    position={[.5, 0.08, 0]}
                    castShadow
                    receiveShadow
                >
                    <boxGeometry args={[5, 0.2, 2]} />
                    <meshStandardMaterial
                        color="#795548"
                        roughness={0.85}
                    />
                </mesh>

                {/* Wooden deck planks */}
                {Array.from({ length: 10 }, (_, i) => (
                    <mesh
                        key={`jetty-plank-${i}`}
                        position={[
                            -3.7 + i * 0.48,
                            0.19,
                            0,
                        ]}
                    >
                        <boxGeometry args={[0.42, 0.04, 1.9]} />
                        <meshStandardMaterial color="#a07850" />
                    </mesh>
                ))}

                {/* Support posts beneath the jetty */}
                {[-3.7, -1.5, 0.7].map((x) =>
                    [-0.8, 0.8].map((z) => (
                        <mesh
                            key={`jetty-post-${x}-${z}`}
                            position={[x, -0.2, z]}
                            castShadow
                        >
                            <cylinderGeometry args={[0.12, 0.15, 0.8, 8]} />
                            <meshStandardMaterial color="#5d4037" />
                        </mesh>
                    ))
                )}
            </group>

            {/* Two boats floating beside the jetty */}
            {[
                { x: centerX - width / 2 - 5.2, z: centerZ - 2.3, r: 0.12 },
                { x: centerX - width / 2 - 5.2, z: centerZ + 2.5, r: -0.12 },
            ].map((boat, i) => (
                <group
                    key={`murrytong-boat-${i}`}
                    position={[boat.x, -0.02, boat.z]}
                    rotation={[0, boat.r, 0]}
                >
                    {/* Boat hull */}
                    <mesh castShadow>
                        <boxGeometry args={[2.8, 0.35, 1.1]} />
                        <meshStandardMaterial
                            color={i === 0 ? '#f8fafc' : '#f59e0b'}
                            roughness={0.45}
                        />
                    </mesh>

                    {/* Raised bow */}
                    <mesh
                        position={[1.45, 0.02, 0]}
                        rotation={[0, 0, -Math.PI / 2]}
                    >
                        <coneGeometry args={[0.55, 0.6, 4]} />
                        <meshStandardMaterial
                            color={i === 0 ? '#f8fafc' : '#f59e0b'}
                        />
                    </mesh>

                    {/* Interior seating */}
                    <mesh position={[-0.15, 0.22, 0]}>
                        <boxGeometry args={[0.9, 0.12, 0.75]} />
                        <meshStandardMaterial color="#795548" />
                    </mesh>

                    {/* Small center console */}
                    <mesh position={[-0.75, 0.35, 0]}>
                        <boxGeometry args={[0.35, 0.3, 0.4]} />
                        <meshStandardMaterial color="#cbd5e1" />
                    </mesh>
                </group>
            ))}

            {/* Road connecting Murrytong's main road to the metal bridge */}
            <mesh
                position={[centerX, 0.065, (centerZ + bridgeStartZ) / 2]}
                receiveShadow
            >
                <boxGeometry
                    args={[ROAD_DEPTH, 0.08, bridgeStartZ - centerZ]}
                />
                <meshStandardMaterial color="#6b7280" roughness={0.95} />
            </mesh>

            {/* Metal bridge connecting Murrytong and Arbadeen */}
            <group position={[centerX, 0, bridgeCenterZ]}>
                {/* Steel deck */}
                <mesh
                    position={[0, 0.12, 0]}
                    castShadow
                    receiveShadow
                    material={steelMaterial}
                >
                    <boxGeometry
                        args={[3.2, 0.24, bridgeLength]}
                    />
                </mesh>

                {/* Anti-slip metal deck strips */}
                {Array.from({ length: 12 }, (_, i) => (
                    <mesh
                        key={`deck-${i}`}
                        position={[
                            0,
                            0.251,
                            -bridgeLength / 2 +
                            ((i + 0.5) * bridgeLength) / 12,
                        ]}
                        material={railMaterial}
                    >
                        <boxGeometry args={[3.05, 0.025, 0.045]} />
                    </mesh>
                ))}

                {/* Side railings */}
                {[-1.55, 1.55].map((xOffset) => (
                    <group
                        key={`side-${xOffset}`}
                        position={[xOffset, 0, 0]}
                    >
                        {/* Top handrail */}
                        <mesh
                            position={[0, 1.05, 0]}
                            castShadow
                            material={railMaterial}
                        >
                            <boxGeometry
                                args={[0.12, 0.12, bridgeLength]}
                            />
                        </mesh>

                        {/* Bottom rail */}
                        <mesh
                            position={[0, 0.48, 0]}
                            material={steelMaterial}
                        >
                            <boxGeometry
                                args={[0.08, 0.08, bridgeLength]}
                            />
                        </mesh>

                        {/* Vertical metal posts */}
                        {Array.from({ length: 12 }, (_, i) => (
                            <mesh
                                key={`post-${i}`}
                                position={[
                                    0,
                                    0.69,
                                    -bridgeLength / 2 +
                                    (i * bridgeLength) / 11,
                                ]}
                                castShadow
                                material={steelMaterial}
                            >
                                <boxGeometry
                                    args={[0.09, 0.82, 0.12]}
                                />
                            </mesh>
                        ))}
                    </group>
                ))}

                {/* Longitudinal steel girders */}
                {[-1.1, 1.1].map((xOffset) => (
                    <mesh
                        key={`girder-${xOffset}`}
                        position={[xOffset, -0.12, 0]}
                        castShadow
                        material={steelMaterial}
                    >
                        <boxGeometry
                            args={[0.2, 0.3, bridgeLength]}
                        />
                    </mesh>
                ))}

                {/* Cross-beams underneath */}
                {Array.from({ length: 6 }, (_, i) => (
                    <mesh
                        key={`crossbeam-${i}`}
                        position={[
                            0,
                            -0.13,
                            -bridgeLength / 2 +
                            ((i + 0.5) * bridgeLength) / 6,
                        ]}
                        castShadow
                        material={steelMaterial}
                    >
                        <boxGeometry args={[3.1, 0.16, 0.14]} />
                    </mesh>
                ))}
            </group>

            <SharedMilitaryHQ position={[-30, 0, 2]} nameOverride="Cockerill Barracks" />


            {/* Murrytong label */}
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
