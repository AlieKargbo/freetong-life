// Types only. Every building file exports an `info: BuildingInfo` next to its 3D component.

export type FurnitureType =
  | 'bed'
  | 'sofa'
  | 'table'
  | 'chair'
  | 'desk'
  | 'counter'
  | 'plant'
  | 'shelf'
  | 'board'
  | 'bench'
  | 'rug'
  | 'pool'
  | 'tv'
  | 'lamp'
  | 'stage'
  | 'pitch'
  | 'crate'
  | 'machine'
  | 'shower'
  | 'toilet';

// Positions are relative to the room's centre. The two visible walls are the back wall (z = -depth/2)
// and the left wall (x = -width/2). rot = 0 faces +z (towards the camera side);
// Math.PI / 2 faces +x (use it for things against the left wall); Math.PI faces -z.
export type FurnitureSpec = {
  type: FurnitureType;
  at: [number, number]; // [x, z]
  rot?: number;
  color?: string;
  size?: [number, number]; // [width, depth] footprint
};

export type InteriorSpec = {
  size: [number, number]; // [width (x), depth (z)]
  floor: [string, string]; // two checkerboard colours
  wall: string;
  ground: string; // colour of the ellipse the room sits on
  furniture: FurnitureSpec[];
};

export type FoodCuisine = 'sierra-leonean' | 'african' | 'world' | 'dessert';

export type BuildingInfo = {
  id: string;
  name: string;
  area: string;
  emoji: string;
  tagline: string; // status line in the venue panel
  banner?: { badge?: string; line: string }; // card at the top while inside
  activities: { emoji: string; label: string }[];
  shops?: boolean; // shows the "Player shops here" row in the popup
  cuisine?: FoodCuisine;
  interior: InteriorSpec;
};
