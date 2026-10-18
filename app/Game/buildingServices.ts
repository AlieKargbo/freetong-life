import type { NeedName } from './needs';

export type BuildingService = {
  id: string;
  name: string;
  description: string;
  price: number;
  effects: Partial<Record<NeedName, number>>;
};

export const BUILDING_SERVICES: Record<string, BuildingService[]> = {
  gym: [
    {
      id: 'gym-guided-workout',
      name: 'Guided workout session',
      description: 'Train with a coach and meet other members. Restores fun and social needs, while using some energy.',
      price: 1_800,
      effects: { fun: 28, social: 12, energy: -8 },
    },
    {
      id: 'gym-yoga-class',
      name: 'Yoga class',
      description: 'A group class to unwind and connect. Restores fun and social needs.',
      price: 1_200,
      effects: { fun: 20, social: 16, energy: -3 },
    },
  ],
  hospital: [
    {
      id: 'hospital-doctor-consultation',
      name: 'Doctor consultation',
      description: 'Get a routine check-up and rest in the recovery ward. Restores energy and hygiene.',
      price: 3_500,
      effects: { energy: 30, hygiene: 14, social: 4 },
    },
    {
      id: 'hospital-rest-care',
      name: 'Rest and recovery care',
      description: 'Take a supervised break and freshen up. Restores energy and hygiene.',
      price: 1_800,
      effects: { energy: 22, hygiene: 10 },
    },
  ],
  'police-station': [
    {
      id: 'police-community-checkin',
      name: 'Community safety check-in',
      description: 'Speak with an officer about local safety and support. Restores social and fun needs.',
      price: 500,
      effects: { social: 18, fun: 8 },
    },
    {
      id: 'police-safety-escort',
      name: 'Request a safety escort',
      description: 'Arrange a local safety escort and get help planning your route. Restores social need.',
      price: 1_000,
      effects: { social: 22 },
    },
  ],
};
