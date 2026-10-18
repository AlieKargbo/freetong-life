'use client';

//Lumely Zone, Arbadeen Zone, Wilkson Road Zone one building folder
import { Text } from '@react-three/drei';
import { useMemo } from 'react';
import { scatterGroundPoints, Trees } from '@/app/components/zoned/West2/Landmarks/Scatter';
import type { ZoneConfig } from '@/app/components/zoned/BuildingImports';
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
    GodrichFineDiningRestaurant as FineDiningRestaurant,
    Billboard,

} from '@/app/components/zoned/BuildingImports';

// SharedFamilyRestaurant as FamilyRestaurant,
// SharedMediumClassShop as MediumClassShop,
// SharedHighClassShop as HighClassShop,
import {
    GolfClub,
    AfricanMarket,
    BeachBuilding,
    OfficeTowerOne,
    OfficeTowerTwo,
    BusStation,
    RadioStation,
    MilitaryHQ,
} from '../../Buildings/CityLandmarks';


import {
    Bank,
    FamilyRestaurant,
    HighClassShop,
    LowClassShop,
    LowClassShopTwo,
    MediumClassShop,
    LowIncomeHouseOne,
    LowIncomeHouseTwo,
    MiddleIncomeHouseTwo,
    HighIncomeHouse,
} from '../../Buildings/CityBuildings';


// import ShoppingMall from './Buildings/ShoppingMall';

// import LocalRestaurant from './Buildings/LocalRestaurant';
// import EmbassyOne from './Buildings/EmbassyOne';
// import EmbassyTwo from './Buildings/EmbassyTwo';
// import PresidentialCompound from './Buildings/PresidentialCompound';

export const zone: ZoneConfig = {
    id: 'mainland',
    c: [-4, -0], // centre [x, z]
    size: [40, 20], // [width, depth]
    color: '#b9d49c',
    label: { text: 'Wilkson Road', size: 0.7 },
};

// const BEACH_DEPTH = 2;
const ROAD_DEPTH = 1.2;

// One rectangular plot of land. Its top face sits at y = 0.
// Camera looks north, so the "back" is the smaller-z edge and the "front" is the larger-z edge.
export default function Wilksonroad() {
    const [cx, cz] = zone.c;
    const [width, depth] = zone.size;

    const backEdge = cz - depth / 2;
    const frontEdge = cz + depth / 2;
    const roadZ = frontEdge - ROAD_DEPTH / 2;
    const labelZ = (backEdge + (cz - ROAD_DEPTH / 2)) / 2;
    const backRowZ = cz - 3.8;
    const frontRowZ = cz + 4.5;
    const vegetation = useMemo(() => scatterGroundPoints(
        { minX: cx - width / 2, maxX: cx + width / 2, minZ: backEdge, maxZ: frontEdge },
        {
            count: 10,
            seed: 444,
            minSpacing: 2.7,
            obstacles: [
                { x: 8, z: 5.5, radius: 3 },
                { x: 14, z: 5.5, radius: 3 },
                { x: -10, z: 2.5, radius: 3.2 },
                { x: 0, z: 0, radius: 4 },
                { x: 18, z: 0, radius: 7 },
                { x: 8, z: -10, radius: 4 },
                { x: 14, z: -10, radius: 4 },
                { x: -10, z: -10, radius: 3 },
            ],
            roads: [{ x: cx, z: roadZ, width, depth: ROAD_DEPTH }],
        },
    ), [cx, cz, width, backEdge, frontEdge, roadZ]);
    const billboardPoints = useMemo(() => scatterGroundPoints(
        { minX: 9, maxX: 13, minZ: -8, maxZ: -3 },
        {
            count: 1,
            seed: 2902,
            minSpacing: 1,
            edgePadding: 0.2,
            obstacles: [
                { x: 8, z: 5.5, radius: 3.5 },
                { x: 14, z: 5.5, radius: 3.5 },
                { x: 8, z: 1, radius: 3.5 },
                { x: 0, z: 0, radius: 5 },
                { x: 18, z: 0, radius: 5 },
            ],
            roads: [{ x: cx, z: roadZ, width, depth: ROAD_DEPTH }],
        },
    ), [cx, width, roadZ]);
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

            {/* Road through the middle of the land mass */}
            <mesh position={[cx, 0.03, roadZ]} receiveShadow>
                <boxGeometry args={[width, 0.06, ROAD_DEPTH]} />
                <meshStandardMaterial color="#6b7280" />
            </mesh>
            x, y, z
            <Hospital position={[8, 0, 5.5]} nameOverride="Life Care" />
            <SecondarySchool position={[8, 0, 1]} nameOverride="Eureka Prep" />
            <PoliceStation position={[14, 0, 5.5]} nameOverride="Lumely Police" />
            <YouthSportCenter position={[-10, 0, 2.5]} nameOverride="YSC" />

            <FineDiningRestaurant position={[0, 0, 0]} nameOverride="Basha Bakery" />
            <FamilyRestaurant position={[18, 0, 0]} nameOverride="Roofgarden" cuisine="world" />
            <LowIncomeHouseOne position={[-4.5, 0, -6.5]} nameOverride="Wilkson Road Family Home" />
            <LowIncomeHouseTwo position={[4.5, 0, -6.5]} nameOverride="Congo Cross Courtyard Home" />
            {/* <LowClassShop position={[-10, 0, 14]} /> */}
            {/* <MediumClassShop position={[-3, 0, 14]} />
            <HighClassShop position={[4, 0, 14]} /> */}
            {/* <LocalRestaurant position={[12, 0, 14]} />
            <EmbassyOne position={[24, 0, 14]} />
            <EmbassyTwo position={[36, 0, 14]} />
            <PresidentialCompound position={[54, 0, 8]} /> */}


            {/* 
            <GolfClub position={[-15, 0, -10]} />
            <AfricanMarket position={[-8, 0, -10]} />
            <BeachBuilding position={[0, 0, -10]} /> */}

            <OfficeTowerOne position={[-19, 0, -10]} nameOverride="Africell Office" />
            {/* 
            <BusStation position={[-8, 0, -16]} />
            <MilitaryHQ position={[8, 0, -16]} /> */}


            <Bank position={[-19, 0, -0]} nameOverride="Rokel Bank" />
            {/* <FamilyRestaurant position={[-2, 0, -10]} />
            <HighClassShop position={[7, 0, -10]} /> */}
            {/* <LowClassShop position={[-10, 0, -19]} />
            <LowClassShopTwo position={[-5, 0, -19]} />
             */}


            <LowIncomeHouseOne position={[-4, 0, - 15]} showPin={false} />
            <LowIncomeHouseTwo position={[7, 0, - 15]} showPin={false} />
            <MiddleIncomeHouseTwo position={[-15, 0, - 15]} />

            <Trees points={vegetation} seed={444} size={0.8} />
            {billboardPoints.map((position, index) => (
                <Billboard key={`wilkson-billboard-${index}`} position={position} />
            ))}

            // Food advertisement near a busy intersection
            <Billboard
                position={[10, 0, -15]}
                title="TASTE FREENET"
                subtitle="Fresh food, every day"
                brand="JUBA KITCHEN"
                emoji="🍲"
                backgroundColor="#14532d"
                accentColor="#facc15"
            />

            {/* // Mobile network advertisement */}
            <Billboard
                position={[18, 0, -25]}
                title="MORE DATA"
                subtitle="Stay connected across Sierra Leone"
                brand="SALONE CONNECT"
                emoji="📱"
                backgroundColor="#075985"
                accentColor="#38bdf8"
                rotation={Math.PI / 4}
            />

            {/* // Business promotion */}
            <Billboard
                position={[-12, 0, -20]}
                title="SHOP LOCAL"
                subtitle="Support Freetown businesses"
                brand="FREETOWN LIFE"
                emoji="🛍️"
                backgroundColor="#7f1d1d"
                accentColor="#fbbf24"
                width={5}
                height={2.5}
            />

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
