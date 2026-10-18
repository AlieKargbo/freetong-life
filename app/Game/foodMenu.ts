import type { FoodCuisine } from '@/app/components/utils/Info';

export type FoodItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  hunger: number;
  fun: number;
};

export const FOOD_MENU: FoodItem[] = [
  { id: 'jollof-chicken', name: 'Jollof & chicken', description: 'A filling plate with a cold drink.', price: 2_500, hunger: 65, fun: 8 },
  { id: 'grilled-fish', name: 'Grilled fish and rice', description: 'Fresh catch, rice, and pepper sauce.', price: 3_500, hunger: 80, fun: 10 },
  { id: 'plantain-beans', name: 'Beans and plantain', description: 'A warm, satisfying local favourite.', price: 1_800, hunger: 50, fun: 6 },
  { id: 'fresh-juice', name: 'Fresh juice', description: 'A chilled mango or ginger juice.', price: 700, hunger: 8, fun: 12 },
];

export const FOOD_MENUS: Record<FoodCuisine, FoodItem[]> = {
  'sierra-leonean': [
    FOOD_MENU[0],
    FOOD_MENU[1],
    FOOD_MENU[2],
    { id: 'cassava-leaf-rice', name: 'Cassava leaf and rice', description: 'Slow-cooked cassava leaf with rice and pepper.', price: 2_800, hunger: 72, fun: 9 },
    FOOD_MENU[3],
  ],
  african: [
    { id: 'west-african-jollof', name: 'West African jollof', description: 'Tomato rice with a choice of grilled chicken.', price: 3_000, hunger: 72, fun: 10 },
    { id: 'suya-plantain', name: 'Suya and plantain', description: 'Pepper-spiced skewers with sweet fried plantain.', price: 3_200, hunger: 68, fun: 13 },
    { id: 'egusi-fufu', name: 'Egusi and fufu', description: 'A hearty melon-seed stew with soft fufu.', price: 3_500, hunger: 82, fun: 9 },
    { id: 'beans-plantain', name: 'Beans and plantain', description: 'A warm, satisfying local favourite.', price: 1_800, hunger: 50, fun: 6 },
    FOOD_MENU[3],
  ],
  world: [
    FOOD_MENU[1],
    { id: 'tomato-pasta', name: 'Tomato pasta', description: 'Pasta tossed with tomato, herbs, and vegetables.', price: 3_800, hunger: 74, fun: 12 },
    { id: 'world-curry-rice', name: 'World curry and rice', description: 'A fragrant curry served with steamed rice.', price: 3_400, hunger: 78, fun: 11 },
    { id: 'seasonal-salad', name: 'Seasonal salad plate', description: 'A fresh plate of greens, grains, and fruit.', price: 2_600, hunger: 48, fun: 10 },
    FOOD_MENU[3],
  ],
  dessert: [
    { id: 'ice-cream-cone', name: 'Two-scoop waffle cone', description: 'Choose two scoops of house-made ice cream.', price: 1_500, hunger: 24, fun: 28 },
    { id: 'mango-sundae', name: 'Mango sundae', description: 'Mango, ice cream, and a crisp wafer.', price: 2_100, hunger: 30, fun: 32 },
    { id: 'chocolate-milkshake', name: 'Chocolate milkshake', description: 'A cold, creamy chocolate shake.', price: 1_800, hunger: 20, fun: 26 },
    { id: 'birthday-cupcake', name: 'Birthday cupcake', description: 'A sweet treat with colourful icing.', price: 1_200, hunger: 16, fun: 22 },
  ],
};
