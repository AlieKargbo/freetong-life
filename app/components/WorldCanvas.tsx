'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Home, Map as MapIcon } from 'lucide-react';
import * as THREE from 'three';

import {
    ArbadeenCivic as Civic,
    LumelyWorld as Mainland,
    lumelyZone,
    lumely2Zone,
    ArbadeenWorld as Arbadeen,
    GodrichWorld as Godrich,
    godrichZone,
    RegentWorld as Regent,
    regentZone,
    WilksonRoadWorld as Wilksonroad,
    wilksonZone,
    CongoCrossWorld as Congocross,
    congoZone,
    MurrytongWorld as Murrytong,
    murrytongZone,
    HillstationWorld as Hillstation,
    LeicesterpeakWorld as Leicesterpeak,
} from '@/app/components/zoned/BuildingImports';


import Hud from './Hud';
import InteriorScene from './utils/InteriorScene';
import BuildingPopup from './utils/BuildingPopup';
//import InteriorHud from './utils/InteriorHud';
import { AUTH_STORAGE_KEY, game, useGame } from './utils/Store';
import NeedSimulation from './utils/NeedSimulation';
import GamePersistence from './utils/GamePersistence';
import useGameClock from './utils/useGameClock';
import NeedActivityStatus from './utils/NeedActivityStatus';
import TravelTransition from './utils/TravelTransition';
import { calculateMood } from '@/app/Game/needs';
import { PLAYER_HOME_INFO } from './zoned/Interior/playerHomeInfo';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import WelcomeTour from './zoned/Interior/WelcomeTour';

// View from the screenshot: looking north from the south, tilted ~49° from straight down.
// The tilt is locked; the player can only pan and zoom.
// const TILT = 0.85; // radians from straight-down
// const DISTANCE = 32;
// const TARGET: [number, number, number] = [4, 0, 20]; // centre of the mainland
// const CAMERA_POSITION: [number, number, number] = [
//     TARGET[0],
//     DISTANCE * Math.cos(TILT),
//     TARGET[2] + DISTANCE * Math.sin(TILT),
// ];

// Settings extracted directly from lagoslife:
// Camera position: [3.75, 37.5, 26.25], FOV: 38, Near: 1, Far: 700
const CAMERA_POSITION: [number, number, number] = [3.75, 37.5, 26.25];
const TARGET: [number, number, number] = [3.75, 0, 0];
// Match the map's maximum OrbitControls distance for the fixed public overview.
const PUBLIC_CAMERA_POSITION: [number, number, number] = [3.75, 65.54, 45.88];
const HOUSE_CAMERA_POSITION: [number, number, number] = [0, 9, 15];
const HOUSE_TARGET: [number, number, number] = [0, 1, 0];

// Polar angle corresponding to y=37.5 and delta_z=26.25 (~35° tilt from vertical / top-down)
const TILT = Math.atan2(CAMERA_POSITION[2] - TARGET[2], CAMERA_POSITION[1] - TARGET[1]);
const ROAD_WIDTH = 1.2;

type StreetLampLocation = { position: [number, number, number]; side: 'x' | 'z'; sideSign: -1 | 1 };

function lampsAlongX(startX: number, endX: number, roadZ: number, count: number): StreetLampLocation[] {
    return Array.from({ length: count }, (_, index) => ({
        position: [startX + ((index + 1) / (count + 1)) * (endX - startX), 0, roadZ + (index % 2 === 0 ? -1 : 1) * 1.25] as [number, number, number],
        side: 'z' as const,
        sideSign: (index % 2 === 0 ? -1 : 1) as -1 | 1,
    }));
}

function lampsAlongZ(roadX: number, startZ: number, endZ: number, count: number): StreetLampLocation[] {
    return Array.from({ length: count }, (_, index) => ({
        position: [roadX + (index % 2 === 0 ? -1 : 1) * 1.25, 0, startZ + ((index + 1) / (count + 1)) * (endZ - startZ)] as [number, number, number],
        side: 'x' as const,
        sideSign: (index % 2 === 0 ? -1 : 1) as -1 | 1,
    }));
}

function StreetLamp({ position, side, sideSign, night }: StreetLampLocation & { night: number }) {
    const armOffset: [number, number, number] = side === 'z'
        ? [0, 2.6, -sideSign * 0.3]
        : [-sideSign * 0.3, 2.6, 0];
    const fixtureOffset: [number, number, number] = side === 'z'
        ? [0, 2.56, -sideSign * 0.62]
        : [-sideSign * 0.62, 2.56, 0];

    return (
        <group position={position}>
            <mesh position={[0, 1.35, 0]} castShadow>
                <cylinderGeometry args={[0.055, 0.09, 2.7, 8]} />
                <meshStandardMaterial color="#334155" metalness={0.55} roughness={0.55} />
            </mesh>
            <mesh position={armOffset} castShadow>
                <boxGeometry args={side === 'z' ? [0.08, 0.08, 0.7] : [0.7, 0.08, 0.08]} />
                <meshStandardMaterial color="#334155" metalness={0.55} roughness={0.55} />
            </mesh>
            <mesh position={fixtureOffset}>
                <boxGeometry args={[0.28, 0.12, 0.24]} />
                <meshStandardMaterial color="#475569" metalness={0.45} roughness={0.5} />
            </mesh>
            <mesh position={[fixtureOffset[0], 2.48, fixtureOffset[2]]}>
                <sphereGeometry args={[0.11, 10, 8]} />
                <meshStandardMaterial
                    color="#fff1bd"
                    emissive="#ffbf5b"
                    emissiveIntensity={night * 2.4}
                    roughness={0.3}
                />
            </mesh>
            <pointLight position={[fixtureOffset[0], 2.42, fixtureOffset[2]]} color="#ffd58a" intensity={night * 1.6} distance={8} decay={2} />
        </group>
    );
}

function StreetLights({ night }: { night: number }) {
    const locations: StreetLampLocation[] = [
        ...lampsAlongX(lumelyZone.c[0] - lumelyZone.size[0] / 2 + 3, lumelyZone.c[0] + lumelyZone.size[0] / 2 - 3, lumelyZone.c[1], 3),
        ...lampsAlongX(lumely2Zone.c[0] - lumely2Zone.size[0] / 2 + 2, lumely2Zone.c[0] + lumely2Zone.size[0] / 2 - 2, lumely2Zone.c[1], 2),
        ...lampsAlongX(wilksonZone.c[0] - wilksonZone.size[0] / 2 + 3, wilksonZone.c[0] + wilksonZone.size[0] / 2 - 3, wilksonZone.c[1] + wilksonZone.size[1] / 2 - ROAD_WIDTH / 2, 3),
        ...lampsAlongX(congoZone.c[0] - congoZone.size[0] / 2 + 3, congoZone.c[0] + congoZone.size[0] / 2 - 3, congoZone.c[1], 2),
        ...lampsAlongX(murrytongZone.c[0] - murrytongZone.size[0] / 2 + 2, murrytongZone.c[0] + murrytongZone.size[0] / 2 - 2, murrytongZone.c[1], 2),
        ...lampsAlongX(godrichZone.c[0] - godrichZone.size[0] / 2 + 3, godrichZone.c[0] + godrichZone.size[0] / 2 - 3, godrichZone.c[1], 2),
        ...lampsAlongX(63, 107, -10, 2),
        ...lampsAlongZ(47, -27.6, 20, 2),
        ...lampsAlongZ(regentZone.c[0], regentZone.c[1] - regentZone.size[1] / 2 + 3, ROUNDABOUT_POSITION[2] - 2, 2),
        ...lampsAlongZ(regentZone.c[0], regentZone.c[1] - regentZone.size[1] / 2 - regentZone.size[1] + 2.4, regentZone.c[1] - regentZone.size[1] / 2 + 2.4, 2),
    ];

    return <group>{locations.map((location, index) => <StreetLamp key={index} {...location} night={night} />)}</group>;
}

function SceneCamera({
    interior,
    authenticated,
}: {
    interior: { id: string } | null;
    authenticated: boolean;
}) {
    const camera = useThree((state) => state.camera);

    useLayoutEffect(() => {
        if (interior) {
            camera.position.set(0, 14, 18);
            camera.lookAt(0, 0.6, 0);
        } else {
            camera.position.set(...(authenticated ? CAMERA_POSITION : PUBLIC_CAMERA_POSITION));
            camera.lookAt(...TARGET);
        }

        if (camera instanceof THREE.PerspectiveCamera) {
            camera.fov = interior ? 42 : 38;
            camera.updateProjectionMatrix();
        }
    }, [camera, interior?.id, authenticated]);

    return null;
}

// Shape every zone file exports as `zone` (Mainland.tsx imports this with `import type`).
export type ZoneConfig = {
    id: string;
    c: [number, number]; // centre [x, z]
    size: [number, number]; // [width, depth]
    color: string;
    label?: { text: string; size?: number };
};

const LUMELY_BACK_ROAD_Z = lumelyZone.c[1] - lumelyZone.size[1] / 2 + 2.4;
const ROUNDABOUT_POSITION: [number, number, number] = [regentZone.c[0], 0.075, LUMELY_BACK_ROAD_Z];

function Roundabout() {
    return (
        <group position={ROUNDABOUT_POSITION}>
            {/* Road ring */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                receiveShadow
            >
                <ringGeometry args={[0.95, 2.2, 48]} />
                <meshStandardMaterial
                    color="#374151"
                    side={THREE.DoubleSide}
                    roughness={0.9}
                />
            </mesh>

            {/* Center island */}
            <mesh position={[0, -0.03, 0]} receiveShadow>
                <cylinderGeometry args={[0.9, 0.9, 0.08, 32]} />
                <meshStandardMaterial color="#75a85b" />
            </mesh>
        </group>
    );
}

function RoadConnections() {
    const congoRoadEndX = congoZone.c[0] + congoZone.size[0] / 2;
    const congoConnectorLength = regentZone.c[0] - congoRoadEndX;
    const edgeRoadX = (congoZone.c[0] - congoZone.size[0] / 2 + wilksonZone.c[0] - wilksonZone.size[0] / 2 + murrytongZone.c[0] + murrytongZone.size[0] / 2) / 3;
    const edgeRoadStartZ = congoZone.c[1] - congoZone.size[1] / 2;
    const lumelyRoadZ = lumelyZone.c[1];
    const edgeRoadLength = lumelyRoadZ - edgeRoadStartZ;
    const lumelyWestEdgeX = lumelyZone.c[0] - lumelyZone.size[0] / 2;
    const lumelySpurLength = lumelyWestEdgeX - edgeRoadX;

    const lumelyRoadEndX = lumely2Zone.c[0] - lumely2Zone.size[0] / 2;
    const roundaboutCenterX = ROUNDABOUT_POSITION[0];
    const roundaboutCenterZ = ROUNDABOUT_POSITION[2];
    const deltaX = lumelyRoadEndX - roundaboutCenterX;
    const deltaZ = lumely2Zone.c[1] - roundaboutCenterZ;
    const roundaboutRadius = 2.2;
    const diagonalDistance = Math.hypot(deltaX, deltaZ);
    const diagonalStartX = roundaboutCenterX + (deltaX / diagonalDistance) * roundaboutRadius;
    const diagonalStartZ = roundaboutCenterZ + (deltaZ / diagonalDistance) * roundaboutRadius;
    const diagonalLength = diagonalDistance - roundaboutRadius;
    const diagonalAngle = Math.atan2(deltaX, deltaZ);

    const wilksonRoadStartX = wilksonZone.c[0] + wilksonZone.size[0] / 2;
    const wilksonRoadStartZ = wilksonZone.c[1] + wilksonZone.size[1] / 2 - ROAD_WIDTH / 2;
    const roundaboutWestX = ROUNDABOUT_POSITION[0] - roundaboutRadius + ROAD_WIDTH / 2;
    const roundaboutZ = ROUNDABOUT_POSITION[2];
    const wilksonDeltaX = roundaboutWestX - wilksonRoadStartX;
    const wilksonDeltaZ = roundaboutZ - wilksonRoadStartZ;
    const wilksonConnectorLength = Math.hypot(wilksonDeltaX, wilksonDeltaZ);
    const wilksonConnectorAngle = Math.atan2(wilksonDeltaX, wilksonDeltaZ);

    return (
        <group>
            {/* West-edge arterial links Congo Cross, Murrytong, and Wilkson Road. */}
            <mesh position={[edgeRoadX, 0.03, edgeRoadStartZ + edgeRoadLength / 2]} receiveShadow>
                <boxGeometry args={[ROAD_WIDTH, 0.06, edgeRoadLength]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            {/* Short branch joins the edge arterial to Lumely's center road across Arbadeen. */}
            <mesh position={[edgeRoadX + lumelySpurLength / 2, 0.03, lumelyRoadZ]} receiveShadow>
                <boxGeometry args={[lumelySpurLength + ROAD_WIDTH / 2, 0.06, ROAD_WIDTH]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            {/* Congo Cross road extends to Regent's north-south center road. */}
            <mesh
                position={[congoRoadEndX + congoConnectorLength / 2, 0.03, congoZone.c[1]]}
                receiveShadow
            >
                <boxGeometry args={[congoConnectorLength, 0.06, ROAD_WIDTH]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            {/* Lumely 2 connects diagonally from its road to the roundabout rim. */}
            <mesh
                position={[
                    (diagonalStartX + lumelyRoadEndX) / 2,
                    0.03,
                    (diagonalStartZ + lumely2Zone.c[1]) / 2,
                ]}
                rotation={[0, diagonalAngle, 0]}
                receiveShadow
            >
                <boxGeometry args={[ROAD_WIDTH, 0.06, diagonalLength]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            {/* Wilkson Road's front road connects diagonally to the roundabout. */}
            <mesh
                position={[
                    (wilksonRoadStartX + roundaboutWestX) / 2,
                    0.03,
                    (wilksonRoadStartZ + roundaboutZ) / 2,
                ]}
                rotation={[0, wilksonConnectorAngle, 0]}
                receiveShadow
            >
                <boxGeometry args={[ROAD_WIDTH, 0.06, wilksonConnectorLength]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>
        </group>
    );
}

function AtlanticBoat({
    position,
    rotation,
    hullColor,
    cabinColor,
}: {
    position: [number, number, number];
    rotation: number;
    hullColor: string;
    cabinColor: string;
}) {
    return (
        <group position={position} rotation={[0, rotation, 0]}>
            <mesh position={[0, 0.16, 0]} castShadow>
                <boxGeometry args={[2.7, 0.34, 0.95]} />
                <meshStandardMaterial color={hullColor} roughness={0.72} />
            </mesh>
            <mesh
                position={[1.42, 0.16, 0]}
                rotation={[0, 0, -Math.PI / 2]}
                castShadow
            >
                <coneGeometry args={[0.5, 0.7, 4]} />
                <meshStandardMaterial color={hullColor} roughness={0.72} />
            </mesh>
            <mesh position={[-0.35, 0.52, 0]} castShadow>
                <boxGeometry args={[0.72, 0.48, 0.64]} />
                <meshStandardMaterial color={cabinColor} />
            </mesh>
            <mesh position={[-0.35, 0.78, 0]}>
                <boxGeometry args={[0.84, 0.08, 0.76]} />
                <meshStandardMaterial color="#f8fafc" />
            </mesh>
        </group>
    );
}

function LumelyConnectorRoad() {
    const roadWidth = 1.2;
    const roadY = 0.065;
    // Fixed world coordinates for the L-shaped road.
    const cornerX = 4;
    const cornerZ = 29;
    const endX = 28;

    return (
        <group>
            {/* Vertical part of the L */}
            <mesh position={[29.5, 0.065, 16]} receiveShadow>
                <boxGeometry args={[roadWidth, 0.08, 12]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>

            {/* Horizontal part of the L */}
            <mesh position={[40, 0.065, 22]} receiveShadow>
                <boxGeometry args={[22, 0.08, roadWidth]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>
        </group>
    );
}


export default function WorldCanvas() {
    const interior = useGame((s) => s.interior);
    const travel = useGame((s) => s.travel);
    const popup = useGame((s) => s.popup);
    const money = useGame((s) => s.money);
    const authenticated = useGame((s) => s.authenticated);
    const player = useGame((s) => s.player);
    const playerHome = useGame((s) => s.playerHome);
    const needs = useGame((s) => s.needs);
    const remotePlayers = useGame((s) => s.remotePlayers);
    const multiplayerStatus = useGame((s) => s.multiplayerStatus);
    const multiplayerError = useGame((s) => s.multiplayerError);
    const playersHere = interior
        ? (interior.id === 'player-home' ? 0 : remotePlayers.filter((remotePlayer) => remotePlayer.buildingId === interior.id).length) + (travel ? 0 : 1)
        : 0;
    const [authChecked, setAuthChecked] = useState(false);
    const [requiresSaveHydration, setRequiresSaveHydration] = useState(false);
    const [saveReady, setSaveReady] = useState(false);
    const [showWelcomeTour, setShowWelcomeTour] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const lightingTime = useGameClock(gameStarted);
    const { hourOfDay, daylight, night } = lightingTime;
    const citySkyColor = new THREE.Color('#101a34').lerp(new THREE.Color('#22d3ee'), daylight);
    const oceanColor = new THREE.Color('#082f49').lerp(new THREE.Color('#38bdf8'), daylight);
    const handleSaveReady = useCallback(() => setSaveReady(true), []);

    useEffect(() => {
        try {
            const isAuthenticated = localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
            setRequiresSaveHydration(isAuthenticated);
            game.setAuthenticated(isAuthenticated);
        } catch {
            setRequiresSaveHydration(false);
            game.setAuthenticated(false);
        }
        setAuthChecked(true);
    }, []);

    useEffect(() => {
        if (!authChecked || !saveReady || !authenticated) {
            setShowWelcomeTour(false);
            setGameStarted(false);
            return;
        }

        try {
            const pending =
                localStorage.getItem('lagos-life-welcome-tour-pending') === 'true';

            const completed =
                localStorage.getItem('lagos-life-welcome-tour-completed') === 'true';

            const tourIncomplete = pending && !completed;
            setShowWelcomeTour(tourIncomplete && interior?.id === 'player-home');
            setGameStarted(!tourIncomplete);
        } catch {
            setShowWelcomeTour(false);
            setGameStarted(true);
        }
    }, [authChecked, authenticated, interior?.id, saveReady]);

    const openHome = () => {
        const home = playerHome ?? PLAYER_HOME_INFO;
        const { currentLocation, interior } = game.get();

        if (currentLocation && currentLocation.id !== home.id) {
            game.openPopup(home);
            return;
        }

        if (interior?.id !== home.id) {
            game.enter(home);
        }
    };
    return (
        <div className="relative h-screen w-full overflow-hidden bg-cyan-400">
            <NeedSimulation active={authChecked && saveReady && authenticated && gameStarted} />
            <GamePersistence onReady={handleSaveReady} />
            <Canvas
                dpr={[1, 1.5]}
                camera={{
                    position: PUBLIC_CAMERA_POSITION,
                    fov: 38,
                    near: 0.1,
                    far: 700,
                }}
            >
                <SceneCamera interior={interior} authenticated={authenticated} />
                {interior ? (
                    <>
                        {/* Render the selected building's interior */}
                        <InteriorScene info={interior} hour={hourOfDay} daylight={daylight} night={night} />
                    </>
                ) : (
                    <>
                        {/* City map */}
                        <color attach="background" args={[citySkyColor]} />
                        <ambientLight intensity={0.08 + daylight * 0.72} color={night > 0.7 ? '#9db9ff' : '#ffffff'} />
                        <directionalLight
                            position={[Math.cos(((hourOfDay - 6) / 12) * Math.PI) * 10, 3 + daylight * 17, 10]}
                            color={daylight > 0.15 ? '#fff1d6' : '#9db9ff'}
                            intensity={0.02 + daylight * 1.48}
                            castShadow
                        />

                        {/* Ocean */}
                        <mesh
                            rotation={[-Math.PI / 2, 0, 0]}
                            position={[0, -0.2, 0]}
                        >
                            <planeGeometry args={[100, 100]} />
                            <meshStandardMaterial color={oceanColor} />
                        </mesh>

                        {/* Atlantic label */}
                        <Text
                            position={[4, -0.1, 35]}
                            rotation={[-Math.PI / 2, 0, 0]}
                            fontSize={1.5}
                            letterSpacing={0.2}
                            color="#ffffff"
                            fillOpacity={0.85}
                            anchorX="center"
                            anchorY="middle"
                        >
                            ATLANTIC
                        </Text>

                        {/* Boats */}
                        <AtlanticBoat
                            position={[-42, -0.08, 34]}
                            rotation={0.25}
                            hullColor="#b91c1c"
                            cabinColor="#f8fafc"
                        />
                        <AtlanticBoat
                            position={[37, -0.08, 38]}
                            rotation={-0.35}
                            hullColor="#f59e0b"
                            cabinColor="#1e3a8a"
                        />
                        <AtlanticBoat
                            position={[-24, -0.08, 43]}
                            rotation={0.6}
                            hullColor="#0f766e"
                            cabinColor="#f8fafc"
                        />

                        {/* Neighborhoods */}
                        <Mainland roadConnectionZ={godrichZone.c[1]} />
                        <Arbadeen />
                        <Godrich />
                        <Regent roadConnectionZ={ROUNDABOUT_POSITION[2]} />
                        <Wilksonroad />
                        <Congocross />
                        <Murrytong />

                        <RoadConnections />
                        <Roundabout />
                        <StreetLights night={night} />

                        <Hillstation />
                        <Leicesterpeak />

                        {/* Locked-angle city camera */}
                        <OrbitControls
                            key={authenticated ? 'map-unlocked' : 'map-locked'}
                            makeDefault
                            enabled={authChecked && authenticated}
                            target={TARGET}
                            enableRotate={false}
                            enableDamping
                            dampingFactor={0.1}
                            screenSpacePanning={false}
                            minPolarAngle={TILT}
                            maxPolarAngle={TILT}
                            minDistance={5}
                            maxDistance={80}
                            mouseButtons={{
                                LEFT: THREE.MOUSE.PAN,
                                MIDDLE: THREE.MOUSE.DOLLY,
                                RIGHT: THREE.MOUSE.PAN,
                            }}
                            touches={{
                                ONE: THREE.TOUCH.PAN,
                                TWO: THREE.TOUCH.DOLLY_PAN,
                            }}
                        />
                    </>
                )}
            </Canvas>

            {/* Keep the public map view static and prevent building interactions until sign-in. */}
            {(!authChecked || !authenticated) && (
                <div className="pointer-events-auto absolute inset-0 z-40" aria-hidden="true" />
            )}

            {(!authChecked || (requiresSaveHydration && !saveReady)) && (
                <div className="pointer-events-auto absolute inset-0 z-[200] flex items-center justify-center bg-slate-950/55 px-5 backdrop-blur-sm" role="status" aria-live="polite">
                    <div className="flex w-full max-w-sm flex-col items-center rounded-3xl border border-white/70 bg-white px-8 py-9 text-center shadow-2xl">
                        <span aria-hidden="true" className="mb-5 h-11 w-11 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-500" />
                        <h1 className="text-xl font-extrabold text-slate-900">Preparing your home</h1>
                        <p className="mt-2 text-sm text-slate-500">Loading your Sim and saved progress…</p>
                    </div>
                </div>
            )}


            {/* Building information popup */}
            <BuildingPopup />
            <NeedActivityStatus />
            <TravelTransition />
            {interior && !travel && (
                <aside
                    className="pointer-events-none absolute right-3 top-3 z-40 max-w-xs rounded-2xl bg-slate-950/75 px-4 py-3 text-sm text-white shadow-lg backdrop-blur"
                    role="status"
                    aria-live="polite"
                >
                    <p className="font-bold">{playersHere} player{playersHere === 1 ? '' : 's'} here now</p>
                    <p className="mt-1 text-xs text-slate-200">
                        {multiplayerStatus === 'connected'
                            ? 'Multiplayer connected'
                            : multiplayerStatus === 'connecting'
                                ? 'Connecting to multiplayer…'
                                : multiplayerStatus === 'error'
                                    ? multiplayerError ?? 'Multiplayer unavailable'
                                    : 'Multiplayer disconnected'}
                    </p>
                </aside>
            )}

            {/* City-map HUD: signup, login, status bar and home entry */}
            {authChecked && (
                <Hud
                    authenticated={authenticated || Boolean(interior)}
                    onHome={openHome}
                    onMap={() => game.exit()}
                    money={money}
                    mood={calculateMood(needs)}
                    gemCount={9166}
                    nextGemPrize={3000}
                    // chips={[
                    //     {
                    //         icon: '🏠',
                    //         label: 'Enter my home',
                    //         onClick: openHome,
                    //     },
                    // ]}
                    headline="Explore Freetown, find a place to call home, and meet other Freetonians."
                />
            )}

            {/* Show the welcome tour only inside the player's home */}
            {interior?.id === 'player-home' && showWelcomeTour && (
                <WelcomeTour
                    onClose={() => {
                        setShowWelcomeTour(false);
                        setGameStarted(true);

                        try {
                            localStorage.setItem(
                                'lagos-life-welcome-tour-completed',
                                'true'
                            );
                            localStorage.removeItem(
                                'lagos-life-welcome-tour-pending'
                            );
                        } catch {
                            // Storage may be unavailable.
                        }
                    }}
                />
            )}
        </div>
    );
}
