
export type V3 = [number, number, number];

/** Global environment, rendering, and navigation settings. */
export type WorldSettings = {
  name: string;
  backgroundColor: string;
  oceanColor: string;
  oceanSize: number;
  oceanHeight: number;
  ambientLight: number;
  hemisphereLight: {
    skyColor: string;
    groundColor: string;
    intensity: number;
  };
  sunIntensity: number;
  sunPosition: V3;
  shadowMapSize: number;
  shadowBounds: number;
  shadowNear: number;
  shadowFar: number;
  cameraPosition: V3;
  cameraTarget: V3;
  cameraFov: number;
  cameraNear: number;
  cameraFar: number;
  cameraTilt: number;
  panMin: V3;
  panMax: V3;
  minZoom: number;
  maxZoom: number;
  enableDamping: boolean;
  dampingFactor: number;
  screenSpacePanning: boolean;
  treeSeed: number;
  treeCount: number;
  showTrees: boolean;
  showRoads: boolean;
  showZoneLabels: boolean;
};

export const DEFAULT_WORLD_SETTINGS: WorldSettings = {
  name: "Freetown Life",
  backgroundColor: "#5aa5cf",
  oceanColor: "#5aa5cf",
  oceanSize: 400,
  oceanHeight: -0.12,
  ambientLight: 0.95,
  hemisphereLight: {
    skyColor: "#ffffff",
    groundColor: "#5aa5cf",
    intensity: 0.4,
  },
  sunIntensity: 1.3,
  sunPosition: [18, 32, 16],
  shadowMapSize: 2048,
  shadowBounds: 40,
  shadowNear: 1,
  shadowFar: 90,
  cameraPosition: [0, 30, 38],
  cameraTarget: [0, 0, 3],
  cameraFov: 40,
  cameraNear: 0.1,
  cameraFar: 500,
  cameraTilt: 0.85,
  panMin: [-26, 0, -12],
  panMax: [26, 0, 18],
  minZoom: 14,
  maxZoom: 62,
  enableDamping: true,
  dampingFactor: 0.1,
  screenSpacePanning: false,

  treeSeed: 3,
  treeCount: 34,

  showTrees: true,
  showRoads: true,
  showZoneLabels: true,
};
