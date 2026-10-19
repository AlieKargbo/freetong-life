export type Body = 'Woman' | 'Man';
export type Hair = 'Braids' | 'Afro' | 'Bun' | 'Ponytail' | 'Long' | 'Locs' | 'Low cut' | 'Gele' | 'Classic';
export type Outfit = 'Casual' | 'Office' | 'Owambe' | 'Site work' | 'School' | 'Traditional';
export type Fabric = 'Plain' | 'Ankara' | 'Adire' | 'Aso-oke' | 'Kente' | 'Lace';

export type SimAppearance = {
    name: string;
    body: Body;
    hairstyle: Hair;
    outfit: Outfit;
    fabric: Fabric;
    skin: string;
    hairColor: string;
    accent: string;
};

export const HAIR: Hair[] = ['Braids', 'Afro', 'Bun', 'Ponytail', 'Long', 'Locs', 'Low cut', 'Gele', 'Classic'];
export const OUTFITS: Outfit[] = ['Casual', 'Office', 'Owambe', 'Site work', 'School', 'Traditional'];
export const FABRICS: Fabric[] = ['Plain', 'Ankara', 'Adire', 'Aso-oke', 'Kente', 'Lace'];
export const SKINS = ['#6f3b24', '#8d5524', '#a9683e', '#c68642', '#4b291b', '#d49a70'];
export const HAIR_COLORS = ['#171311', '#3b241b', '#6b4226', '#b45309', '#d6b37b'];

export const INITIAL: SimAppearance = {
    name: '@paaka',
    body: 'Woman',
    hairstyle: 'Braids',
    outfit: 'Owambe',
    fabric: 'Ankara',
    skin: '#8d5524',
    hairColor: '#171311',
    accent: '#f59e0b',
};

export const FABRIC_COLORS: Record<Fabric, [string, string, string]> = {
    Plain: ['#202938', '#202938', '#202938'],
    Ankara: ['#f4a62a', '#087f8c', '#f8df8b'],
    Adire: ['#123a70', '#eaf3f8', '#2c5a9a'],
    'Aso-oke': ['#c32d75', '#f4a4cb', '#79234d'],
    Kente: ['#eab308', '#dc2626', '#166534'],
    Lace: ['#e7e5e4', '#b8b8c0', '#f8fafc'],
};

export const HAIR_EMOJI: Record<Hair, string> = {
    Braids: '👩🏿‍🦱',
    Afro: '🧑🏿‍🦱',
    Bun: '👩🏿',
    Ponytail: '👱🏿‍♀️',
    Long: '👩🏿',
    Locs: '🧑🏿‍🦱',
    'Low cut': '👨🏿',
    Gele: '👳🏿‍♀️',
    Classic: '👩🏿',
};

export const OUTFIT_EMOJI: Record<Outfit, string> = {
    Casual: '👕',
    Office: '🧥',
    Owambe: '👗',
    'Site work': '🦺',
    School: '🎓',
    Traditional: '🥻',
};

export type Trait = {
    name: string;
    emoji: string;
    description: string;
};

export type Dream = {
    name: string;
    emoji: string;
    description: string;
};

export type BirthOutcome = {
    name: string;
    emoji: string;
    tagline: string;
    benefits: string[];
};

export type HomeOption = {
    name: string;
    area: string;
    description: string;
    badge: string;
    startingMoney: number;
    weeklyRent: number;
};

export const PERSONALITY_TRAITS: Trait[] = [
    { name: 'Striker', emoji: '💼', description: 'Sees money everywhere. Hustle skill grows faster and bosses notice.' },
    { name: 'Nosy', emoji: '💼', description: 'Wants to know everything about everyone. Gains information faster and notices details others miss.' },
    { name: 'Foodie', emoji: '🍲', description: 'Lives for jollof. Learns cooking fast and food is extra enjoyable.' },
    { name: 'Owambe Spirit', emoji: '🎉', description: 'Always ready to spray money. Parties and dancing hit different.' },
    { name: 'Gym Rat', emoji: '💪', description: 'Leg day every day. Fitness grows fast and workouts feel good.' },
    { name: 'Sabi Talk', emoji: '😏', description: 'Mouth sweet like honey. Charisma grows fast and socials land better.' },
    { name: 'Alafia Porsin', emoji: '😴', description: 'Why stand when you can sit? Energy lasts longer, work suffers a bit.' },
    { name: 'Clean Pikin', emoji: '🧼', description: 'Always fresh. Hygiene drops slower than others.' },
    { name: 'Night Owl', emoji: '🌙', description: 'You nor dey sleep way net reach. Loves nightlife.' },
    { name: 'Tech Bro or Sis', emoji: '💻', description: 'Has three startup ideas before breakfast. Coding grows faster.' },
    { name: 'Musical', emoji: '🎶', description: 'Hums KeniLavs in the shower. Music skill grows faster.' },
];

export const DREAMS: Dream[] = [
    { name: 'Big Arlehjor', emoji: '👔', description: 'Reach the top level of any career.' },
    { name: 'Freetong Landlord', emoji: '🏡', description: 'Build a net worth of SLE 1,000,000.' },
    { name: 'Kriofusion Star', emoji: '🎤', description: 'Max out the Music skill (level 10).' },
    { name: "All Man Sabi Mi", emoji: '🤝', description: 'Become best friends with four people.' },
    { name: 'Tech Unicorn', emoji: '🦄', description: 'Get your startup funded at Christex, FBC.' },
    { name: 'Alaki', emoji: '💼', description: 'Unserious about life.' }
];

export const BIRTH_OUTCOMES: BirthOutcome[] = [
    {
        name: 'Born Meet Am!',
        emoji: '👶🏿💰',
        tagline: 'Daddy knows people.',
        benefits: [
            'Fully furnished Hill Station flat — Daddy pays the rent',
            'Your own car (just buy fuel)',
            "Branch Manager at Daddy's friend's bank, from day one",
            'SLE 500,000 pocket money',
        ],
    },
    {
        name: 'Fighter!',
        emoji: '🏦',
        tagline: 'Self-made hits different.',
        benefits: [
            'SLE 60,000 LAPO loan to start — repay SLE 12,000 every week',
            'Hustle skill starts at 2',
            'You learn every skill 25% faster',
            'Start in Malam or Congo Cross and work your way to Hill Station',
        ],
    },
];

export const HOMES: HomeOption[] = [
    {
        name: 'Self-contain',
        area: 'HillStation',
        description: 'Money man Ose up HillStation. More hours of electricity, Foggy weather, Less noise.',
        badge: 'Big spender',
        startingMoney: 250000,
        weeklyRent: 18000,
    },
    {
        name: "2'2 Rooms-en-Paller",
        area: 'Congo Cross',
        description: 'Shared rooms in a compound, loud neighbours. Cheap rent, less hours of electricity. Big dreams, Tin go Turn. ',
        badge: 'Hard start',
        startingMoney: 76000,
        weeklyRent: 2400,
    },
    {
        name: 'Decent Flat',
        area: 'Malama',
        description: 'Your own toilet and kitchen corner, near main roads. Balanced.',
        badge: 'Balanced',
        startingMoney: 96000,
        weeklyRent: 6000,
    },
    {
        name: 'Mini-flat',
        area: 'Godrich',
        description: 'A real mini-flat: bedroom, sitting room, kitchen and your own bathroom.',
        badge: 'Life Normal',
        startingMoney: 14000,
        weeklyRent: 1200,
    },

    //     {
    //     name: 'UNILAG Student',
    //     area: 'Godrich',
    //     description: 'Lectures, TDB in the library, exams and CGPA. A bunk space in a UNILAG hall.',
    //     badge: 'Student life',
    //     startingMoney: 14000,
    //     weeklyRent: 1200,
    // },
    // {
    //     name: 'Face-me-I-face-you',
    //     area: 'Congo Cross',
    //     description: 'One room, shared compound, loud neighbours. Cheap rent, big dreams.',
    //     badge: 'Hard start',
    //     startingMoney: 76000,
    //     weeklyRent: 2400,
    // },
    // {
    //     name: 'Self-contain',
    //     area: 'Malama',
    //     description: 'Your own toilet and kitchen corner, near the tech hubs. Balanced.',
    //     badge: 'Balanced',
    //     startingMoney: 96000,
    //     weeklyRent: 6000,
    // },
    // {
    //     name: 'Mini-flat',
    //     area: 'Hill Station',
    //     description: 'A real mini-flat: bedroom, sitting room, kitchen and your own bathroom.',
    //     badge: 'Big spender',
    //     startingMoney: 250000,
    //     weeklyRent: 18000,
    // },
];
