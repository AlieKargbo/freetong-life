import type { BuildingInfo, InteriorSpec } from '../../utils/Info';

export const SIERRA_LEONEAN_INTERIOR: InteriorSpec = {
  size: [10, 8],
  floor: ['#a64b2a', '#c9823d'],
  wall: '#d9b77e',
  ground: '#496b3d',
  furniture: [
    { type: 'counter', at: [0, -3.05], color: '#70401e', size: [3.6, 0.75] },
    { type: 'board', at: [0, -3.8], color: '#7c2d12', size: [2.8, 0.1] },
    { type: 'table', at: [-2.1, -0.75], color: '#8b451f', size: [1.35, 0.9] },
    { type: 'chair', at: [-2.1, -1.55], color: '#166534' },
    { type: 'chair', at: [-2.1, 0.05], color: '#166534', rot: Math.PI },
    { type: 'table', at: [1.8, -0.75], color: '#8b451f', size: [1.35, 0.9] },
    { type: 'chair', at: [1.8, -1.55], color: '#166534' },
    { type: 'chair', at: [1.8, 0.05], color: '#166534', rot: Math.PI },
    { type: 'table', at: [-0.2, 1.65], color: '#8b451f', size: [1.5, 1] },
    { type: 'chair', at: [-1.15, 1.65], color: '#166534', rot: Math.PI / 2 },
    { type: 'chair', at: [0.75, 1.65], color: '#166534', rot: -Math.PI / 2 },
    { type: 'rug', at: [0, 0.75], color: '#b45309', size: [3.4, 1.8] },
    { type: 'shelf', at: [3.75, -2.3], color: '#70401e', size: [1.4, 0.45] },
    { type: 'lamp', at: [-4.1, 2.8] },
    { type: 'lamp', at: [4.1, 2.8] },
  ],
};

export const AFRICAN_INTERIOR: InteriorSpec = {
  size: [10, 8],
  floor: ['#a64b2a', '#e1a64f'],
  wall: '#bd7042',
  ground: '#4f6d3a',
  furniture: [
    { type: 'counter', at: [0, -3.05], color: '#713f24', size: [3.4, 0.75] },
    { type: 'board', at: [0, -3.8], color: '#14532d', size: [2.8, 0.1] },
    { type: 'table', at: [-2, -0.9], color: '#92400e', size: [1.3, 0.9] },
    { type: 'chair', at: [-2, -1.7], color: '#b45309' },
    { type: 'chair', at: [-2, -0.1], color: '#166534', rot: Math.PI },
    { type: 'table', at: [2, -0.9], color: '#92400e', size: [1.3, 0.9] },
    { type: 'chair', at: [2, -1.7], color: '#b45309' },
    { type: 'chair', at: [2, -0.1], color: '#166534', rot: Math.PI },
    { type: 'table', at: [0, 1.5], color: '#92400e', size: [1.5, 1] },
    { type: 'chair', at: [-1, 1.5], color: '#166534', rot: Math.PI / 2 },
    { type: 'chair', at: [1, 1.5], color: '#b45309', rot: -Math.PI / 2 },
    { type: 'rug', at: [0, 0.6], color: '#9f1239', size: [3.8, 2] },
    { type: 'shelf', at: [-3.8, -2.2], color: '#713f24', size: [1.4, 0.45] },
    { type: 'plant', at: [4, 2.6] },
    { type: 'lamp', at: [-4.1, 2.8] },
    { type: 'lamp', at: [4.1, -2.8] },
  ],
};

export const FISH_GRILL_INTERIOR: InteriorSpec = {
  size: [9, 8],
  floor: ['#9a3412', '#b45309'],
  wall: '#c2410c',
  ground: '#e7c78b',
  furniture: [
    { type: 'counter', at: [0, -3.05], color: '#7c2d12', size: [3.8, 0.8] },
    { type: 'machine', at: [-3.4, -2.25], color: '#1f2937', size: [1, 1] },
    { type: 'board', at: [0, -3.8], color: '#7c2d12', size: [2.8, 0.1] },
    { type: 'crate', at: [3.4, -2.8] },
    { type: 'crate', at: [3.4, -2] },
    { type: 'table', at: [-1.8, -0.65], color: '#92400e', size: [1.3, 0.9] },
    { type: 'chair', at: [-1.8, -1.45], color: '#1f2937' },
    { type: 'chair', at: [-1.8, 0.15], color: '#1f2937', rot: Math.PI },
    { type: 'table', at: [1.8, -0.65], color: '#92400e', size: [1.3, 0.9] },
    { type: 'chair', at: [1.8, -1.45], color: '#1f2937' },
    { type: 'chair', at: [1.8, 0.15], color: '#1f2937', rot: Math.PI },
    { type: 'rug', at: [0, 1.8], color: '#d97706', size: [3.6, 1.1] },
    { type: 'plant', at: [3.8, 2.8] },
    { type: 'lamp', at: [-3.8, 2.8] },
  ],
};

export const WORLD_CUISINE_INTERIOR: InteriorSpec = {
  size: [10, 8],
  floor: ['#334155', '#475569'],
  wall: '#172554',
  ground: '#334155',
  furniture: [
    { type: 'counter', at: [0, -3.05], color: '#3f2d20', size: [3.8, 0.8] },
    { type: 'board', at: [0, -3.8], color: '#1e3a8a', size: [2.8, 0.1] },
    { type: 'table', at: [-2.1, -0.9], color: '#7c5b3e', size: [1.25, 0.85] },
    { type: 'chair', at: [-2.1, -1.65], color: '#334155' },
    { type: 'chair', at: [-2.1, -0.15], color: '#334155', rot: Math.PI },
    { type: 'table', at: [2.1, -0.9], color: '#7c5b3e', size: [1.25, 0.85] },
    { type: 'chair', at: [2.1, -1.65], color: '#334155' },
    { type: 'chair', at: [2.1, -0.15], color: '#334155', rot: Math.PI },
    { type: 'table', at: [0, 1.5], color: '#7c5b3e', size: [1.5, 1] },
    { type: 'chair', at: [-1, 1.5], color: '#334155', rot: Math.PI / 2 },
    { type: 'chair', at: [1, 1.5], color: '#334155', rot: -Math.PI / 2 },
    { type: 'rug', at: [0, 0.5], color: '#7f1d1d', size: [3.6, 1.9] },
    { type: 'shelf', at: [3.8, -2.25], color: '#3f2d20', size: [1.4, 0.45] },
    { type: 'plant', at: [-4, 2.5] },
    { type: 'lamp', at: [-4.1, -2.8] },
    { type: 'lamp', at: [4.1, 2.8] },
  ],
};

export type RestaurantCuisine = 'sierra-leonean' | 'african' | 'world';

const CUISINE_COPY: Record<RestaurantCuisine, { tagline: string; activities: BuildingInfo['activities'] }> = {
  'sierra-leonean': {
    tagline: 'Home-style Sierra Leonean cooking, served around the family table.',
    activities: [
      { emoji: '🍚', label: 'Jollof rice and pepper stew' },
      { emoji: '🥬', label: 'Cassava leaf with rice' },
      { emoji: '🥜', label: 'Groundnut soup' },
      { emoji: '🥤', label: 'Fresh ginger drink' },
    ],
  },
  african: {
    tagline: 'A lively menu of favourite dishes from across West and Central Africa.',
    activities: [
      { emoji: '🍛', label: 'West African jollof' },
      { emoji: '🍗', label: 'Suya and grilled chicken' },
      { emoji: '🥘', label: 'Egusi and fufu' },
      { emoji: '🍌', label: 'Plantain and bean stew' },
    ],
  },
  world: {
    tagline: 'A welcoming dining room serving Sierra Leonean favourites and world cuisine.',
    activities: [
      { emoji: '🐟', label: 'Grilled Atlantic fish' },
      { emoji: '🍝', label: 'Italian pasta' },
      { emoji: '🍛', label: 'West African curry' },
      { emoji: '🥗', label: 'Seasonal world plates' },
    ],
  },
};

type RestaurantInfoOptions = {
  id: string;
  name: string;
  area: string;
  emoji: string;
  cuisine: RestaurantCuisine;
  tagline?: string;
  activities?: BuildingInfo['activities'];
};

export function createRestaurantInfo({
  id,
  name,
  area,
  emoji,
  cuisine,
  tagline,
  activities,
}: RestaurantInfoOptions): BuildingInfo {
  const interiors = {
    'sierra-leonean': SIERRA_LEONEAN_INTERIOR,
    african: AFRICAN_INTERIOR,
    world: WORLD_CUISINE_INTERIOR,
  };
  const cuisineCopy = CUISINE_COPY[cuisine];

  return {
    id,
    name,
    area,
    emoji,
    tagline: tagline ?? cuisineCopy.tagline,
    banner: { badge: cuisine === 'world' ? 'WORLD CUISINE' : cuisine === 'african' ? 'AFRICAN KITCHEN' : 'SIERRA LEONEAN', line: tagline ?? cuisineCopy.tagline },
    activities: activities ?? cuisineCopy.activities,
    shops: true,
    cuisine,
    interior: interiors[cuisine],
  };
}

export function restaurantInstanceId(prefix: string, name: string, fallback: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${prefix}-${slug || 'venue'}-${fallback}`;
}
