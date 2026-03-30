import path from 'path'
import dotenv from 'dotenv'
// Load .env.development before anything else — ts-node doesn't pick up Next.js env files
dotenv.config({ path: path.resolve(__dirname, '../.env.development') })

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ---------------------------------------------------------------------------
// User definitions
// ---------------------------------------------------------------------------

const USERS = [
  {
    email: 'emma.chen@queensu.ca',
    password: 'password123',
    full_name: 'Emma Chen',
    home_university: 'University of British Columbia',
    university: "Queen's University",
    program: 'Commerce',
    year_of_study: 3,
    age: 22,
    bio: 'Exchange student from UBC. Fitness junkie and avid traveller — always planning the next trip. Looking for clean, social housemates.',
    sleep_habits: 'early_bird',
    party_level: 'once_a_month',
    cleanliness: 'very_clean',
    personality_traits: ['social', 'adventurous', 'organised'],
    interests: ['fitness', 'travel', 'photography'],
    substance_preferences: [] as string[],
    budget_min: 700,
    budget_max: 1100,
    move_in_date: new Date('2026-09-01'),
    move_out_date: new Date('2027-04-30'),
  },
  {
    email: 'liam.obrien@queensu.ca',
    password: 'password123',
    full_name: "Liam O'Brien",
    home_university: 'Trinity College Dublin',
    university: "Queen's University",
    program: 'Engineering',
    year_of_study: 2,
    age: 21,
    bio: "Engineering student from Dublin. Easygoing and tidy. Big into sports and gaming — I won't be a difficult housemate, I promise.",
    sleep_habits: 'night_owl',
    party_level: 'once_a_week',
    cleanliness: 'clean',
    personality_traits: ['easygoing', 'social', 'creative'],
    interests: ['sports', 'gaming', 'live music'],
    substance_preferences: ['alcohol'],
    budget_min: 600,
    budget_max: 950,
    move_in_date: new Date('2026-09-01'),
    move_out_date: new Date('2027-04-30'),
  },
  {
    email: 'sofia.martinez@queensu.ca',
    password: 'password123',
    full_name: 'Sofia Martinez',
    home_university: 'Universidad de Buenos Aires',
    university: "Queen's University",
    program: 'Arts',
    year_of_study: 4,
    age: 23,
    bio: 'Arts student from Buenos Aires. I love cooking elaborate meals and going to local music shows. Very chill, never loud at home.',
    sleep_habits: 'flexible',
    party_level: 'never',
    cleanliness: 'moderate',
    personality_traits: ['creative', 'adventurous', 'independent'],
    interests: ['music', 'cooking', 'art', 'travel'],
    substance_preferences: [] as string[],
    budget_min: 650,
    budget_max: 900,
    move_in_date: new Date('2026-09-01'),
    move_out_date: new Date('2027-04-30'),
  },
  {
    email: 'james.wilson@queensu.ca',
    password: 'password123',
    full_name: 'James Wilson',
    home_university: "Queen's University",
    university: "Queen's University",
    program: 'Commerce',
    year_of_study: 3,
    age: 22,
    bio: "Queen's student subletting my room for the fall/winter exchange term. Social guy, big sports fan. The house has a great vibe.",
    sleep_habits: 'night_owl',
    party_level: 'multiple_per_week',
    cleanliness: 'moderate',
    personality_traits: ['social', 'outgoing', 'sporty'],
    interests: ['sports', 'nightlife', 'travel'],
    substance_preferences: ['alcohol'],
    budget_min: 0,
    budget_max: 0,
    move_in_date: new Date('2026-09-01'),
    move_out_date: new Date('2027-04-30'),
  },
  {
    email: 'priya.patel@queensu.ca',
    password: 'password123',
    full_name: 'Priya Patel',
    home_university: "Queen's University",
    university: "Queen's University",
    program: 'Computing',
    year_of_study: 2,
    age: 21,
    bio: "CS student subletting while on co-op. Looking for structured, respectful housemates who keep common spaces tidy. Early risers preferred.",
    sleep_habits: 'early_bird',
    party_level: 'once_a_month',
    cleanliness: 'very_clean',
    personality_traits: ['studious', 'structured', 'independent'],
    interests: ['reading', 'coding', 'yoga'],
    substance_preferences: [] as string[],
    budget_min: 0,
    budget_max: 0,
    move_in_date: new Date('2026-09-01'),
    move_out_date: new Date('2027-04-30'),
  },
  {
    email: 'marcus.johnson@queensu.ca',
    password: 'password123',
    full_name: 'Marcus Johnson',
    home_university: "Queen's University",
    university: "Queen's University",
    program: 'Kinesiology',
    year_of_study: 4,
    age: 24,
    bio: "Kin student subletting my furnished room near campus. I love to cook — there's always food in the kitchen. Relaxed house, great group of people.",
    sleep_habits: 'flexible',
    party_level: 'once_a_week',
    cleanliness: 'clean',
    personality_traits: ['easygoing', 'social', 'active'],
    interests: ['fitness', 'cooking', 'soccer'],
    substance_preferences: ['alcohol'],
    budget_min: 0,
    budget_max: 0,
    move_in_date: new Date('2026-09-01'),
    move_out_date: new Date('2027-04-30'),
  },
  {
    email: 'aisha.rahman@queensu.ca',
    password: 'password123',
    full_name: 'Aisha Rahman',
    home_university: 'University of Edinburgh',
    university: "Queen's University",
    program: 'Political Studies',
    year_of_study: 3,
    age: 22,
    bio: 'Exchange student from Edinburgh studying Political Studies. Independent, loves to travel on weekends. Looking for a quiet place to come home to.',
    sleep_habits: 'night_owl',
    party_level: 'once_a_month',
    cleanliness: 'clean',
    personality_traits: ['independent', 'intellectual', 'adventurous'],
    interests: ['travel', 'writing', 'politics', 'cinema'],
    substance_preferences: [] as string[],
    budget_min: 700,
    budget_max: 1000,
    move_in_date: new Date('2026-09-01'),
    move_out_date: new Date('2027-04-30'),
  },
  {
    email: 'tom.anderson@queensu.ca',
    password: 'password123',
    full_name: 'Tom Anderson',
    home_university: 'University of Sydney',
    university: "Queen's University",
    program: 'Business',
    year_of_study: 2,
    age: 21,
    bio: "G'day! Coming from Sydney for the winter term. Pretty social, love watching sports and playing guitar. Easy to live with, won't trash the place.",
    sleep_habits: 'flexible',
    party_level: 'once_a_week',
    cleanliness: 'clean',
    personality_traits: ['social', 'easygoing', 'sporty'],
    interests: ['sports', 'music', 'surfing', 'travel'],
    substance_preferences: ['alcohol'],
    budget_min: 650,
    budget_max: 1000,
    move_in_date: new Date('2026-09-01'),
    move_out_date: new Date('2027-04-30'),
  },
  {
    email: 'sarah.kim@queensu.ca',
    password: 'password123',
    full_name: 'Sarah Kim',
    home_university: "Queen's University",
    university: "Queen's University",
    program: 'Nursing',
    year_of_study: 3,
    age: 22,
    bio: "Nursing student subletting for the fall term. I have early clinical shifts so I keep a quiet, tidy home. Looking for like-minded housemates.",
    sleep_habits: 'early_bird',
    party_level: 'never',
    cleanliness: 'very_clean',
    personality_traits: ['studious', 'structured', 'caring'],
    interests: ['yoga', 'cooking', 'hiking', 'reading'],
    substance_preferences: [] as string[],
    budget_min: 0,
    budget_max: 0,
    move_in_date: new Date('2026-09-01'),
    move_out_date: new Date('2027-04-30'),
  },
  {
    email: 'alex.dubois@queensu.ca',
    password: 'password123',
    full_name: 'Alex Dubois',
    home_university: 'McGill University',
    university: "Queen's University",
    program: 'Engineering',
    year_of_study: 4,
    age: 23,
    bio: "Exchange student from McGill. Night owl who codes and plays games late but always keeps the place clean. Up for hiking on weekends.",
    sleep_habits: 'night_owl',
    party_level: 'once_a_week',
    cleanliness: 'clean',
    personality_traits: ['introverted', 'studious', 'easygoing'],
    interests: ['gaming', 'hiking', 'coding', 'cycling'],
    substance_preferences: ['alcohol'],
    budget_min: 700,
    budget_max: 1050,
    move_in_date: new Date('2026-09-01'),
    move_out_date: new Date('2027-04-30'),
  },
]

// ---------------------------------------------------------------------------
// Listing definitions  (listers: James, Priya, Marcus, Sarah)
// ---------------------------------------------------------------------------

const LISTINGS = [
  // James Wilson — 2 listings
  {
    listerEmail: 'james.wilson@queensu.ca',
    title: 'Sunny 2BR near campus — Albert St',
    description:
      'Two private bedrooms available in a fully furnished student house on Albert St. Five-minute walk to Stauffer Library and the JDUC. Large shared living room, backyard for summer barbecues, and street parking available.',
    price_per_month: 850,
    address: '127 Albert St, Kingston, ON',
    neighborhood: 'University District',
    bedrooms: 2,
    bathrooms: 1,
    is_furnished: true,
    utilities_included: false,
    available_from: new Date('2026-09-01'),
    available_to: new Date('2027-04-30'),
    tags: ['Near campus', 'Furnished', 'Backyard', 'Parking'],
    status: 'active',
    room_size_sqft: 140,
    room_furnishings: ['bed', 'desk', 'wardrobe', 'bookshelf'],
    has_ac: false,
    has_heating: true,
    has_laundry: true,
    laundry_type: 'in_building',
    has_dishwasher: false,
    has_parking: true,
    kitchen_arrangement: 'split_food',
    guest_policy: 'with_notice',
    house_cleanliness: 'moderate',
    latitude: 44.2253,
    longitude: -76.4951,
    images: [
      'https://picsum.photos/seed/james1a/800/600',
      'https://picsum.photos/seed/james1b/800/600',
      'https://picsum.photos/seed/james1c/800/600',
    ],
    housemates: [
      {
        name: 'James Wilson',
        program: 'Commerce',
        year_of_study: 3,
        sleep_habits: 'night_owl',
        party_level: 'multiple_per_week',
        personality_traits: ['social', 'outgoing'],
        interests: ['sports', 'nightlife'],
        substance_preferences: ['alcohol'],
        display_order: 0,
      },
      {
        name: 'Connor Murphy',
        program: 'Economics',
        year_of_study: 3,
        sleep_habits: 'night_owl',
        party_level: 'once_a_week',
        personality_traits: ['social', 'easygoing'],
        interests: ['sports', 'gaming'],
        substance_preferences: ['alcohol'],
        display_order: 1,
      },
    ],
  },
  {
    listerEmail: 'james.wilson@queensu.ca',
    title: 'Private room in Sydenham Ward house',
    description:
      'One furnished private room in a 4-bedroom Victorian house in Sydenham Ward. Short walk to the waterfront and great local restaurants. Laid-back atmosphere, social house.',
    price_per_month: 780,
    address: '44 Bagot St, Kingston, ON',
    neighborhood: 'Sydenham Ward',
    bedrooms: 1,
    bathrooms: 2,
    is_furnished: true,
    utilities_included: false,
    available_from: new Date('2026-09-01'),
    available_to: new Date('2027-04-30'),
    tags: ['Near campus', 'Furnished', 'Social house'],
    status: 'active',
    room_size_sqft: 120,
    room_furnishings: ['bed', 'desk', 'wardrobe'],
    has_ac: false,
    has_heating: true,
    has_laundry: true,
    laundry_type: 'in_building',
    has_dishwasher: false,
    has_parking: false,
    kitchen_arrangement: 'buy_your_own',
    guest_policy: 'anytime',
    house_cleanliness: 'moderate',
    latitude: 44.2312,
    longitude: -76.481,
    images: [
      'https://picsum.photos/seed/james2a/800/600',
      'https://picsum.photos/seed/james2b/800/600',
      'https://picsum.photos/seed/james2c/800/600',
    ],
    housemates: [
      {
        name: 'James Wilson',
        program: 'Commerce',
        year_of_study: 3,
        sleep_habits: 'night_owl',
        party_level: 'multiple_per_week',
        personality_traits: ['social', 'outgoing'],
        interests: ['sports', 'nightlife'],
        substance_preferences: ['alcohol'],
        display_order: 0,
      },
      {
        name: 'Remi Tremblay',
        program: 'Sociology',
        year_of_study: 2,
        sleep_habits: 'flexible',
        party_level: 'once_a_week',
        personality_traits: ['social', 'adventurous'],
        interests: ['music', 'skateboarding'],
        substance_preferences: ['alcohol'],
        display_order: 1,
      },
      {
        name: 'Olivia Park',
        program: 'Film Studies',
        year_of_study: 3,
        sleep_habits: 'night_owl',
        party_level: 'once_a_month',
        personality_traits: ['creative', 'independent'],
        interests: ['cinema', 'art', 'cooking'],
        substance_preferences: [] as string[],
        display_order: 2,
      },
    ],
  },

  // Priya Patel — 2 listings
  {
    listerEmail: 'priya.patel@queensu.ca',
    title: 'Quiet furnished bedroom — Williamsville',
    description:
      "Private bedroom in a clean, quiet 3-bedroom house. Perfect for a studious exchange student. Early birds and quiet types preferred. The house has a dedicated study nook in the living room.",
    price_per_month: 720,
    address: '312 Frontenac St, Kingston, ON',
    neighborhood: 'Williamsville',
    bedrooms: 1,
    bathrooms: 1,
    is_furnished: true,
    utilities_included: true,
    available_from: new Date('2026-09-01'),
    available_to: new Date('2027-04-30'),
    tags: ['Near campus', 'Furnished', 'Utilities included', 'Quiet house', 'Internet included'],
    status: 'active',
    room_size_sqft: 110,
    room_furnishings: ['bed', 'desk', 'chair', 'wardrobe', 'lamp'],
    has_ac: false,
    has_heating: true,
    has_laundry: true,
    laundry_type: 'in_unit',
    has_dishwasher: true,
    has_parking: false,
    kitchen_arrangement: 'split_food',
    guest_policy: 'with_notice',
    house_cleanliness: 'very_clean',
    latitude: 44.234,
    longitude: -76.505,
    images: [
      'https://picsum.photos/seed/priya1a/800/600',
      'https://picsum.photos/seed/priya1b/800/600',
      'https://picsum.photos/seed/priya1c/800/600',
      'https://picsum.photos/seed/priya1d/800/600',
    ],
    housemates: [
      {
        name: 'Priya Patel',
        program: 'Computing',
        year_of_study: 2,
        sleep_habits: 'early_bird',
        party_level: 'once_a_month',
        personality_traits: ['studious', 'structured'],
        interests: ['coding', 'yoga'],
        substance_preferences: [] as string[],
        display_order: 0,
      },
      {
        name: 'Hannah Schulz',
        program: 'Life Sciences',
        year_of_study: 2,
        sleep_habits: 'early_bird',
        party_level: 'never',
        personality_traits: ['studious', 'tidy'],
        interests: ['reading', 'running'],
        substance_preferences: [] as string[],
        display_order: 1,
      },
    ],
  },
  {
    listerEmail: 'priya.patel@queensu.ca',
    title: 'All-inclusive studio — Kingscourt',
    description:
      "Self-contained basement studio with a private entrance. All utilities and internet included in the rent. Ideal for a solo student who values privacy and quiet. 10-minute walk to main campus.",
    price_per_month: 900,
    address: '88 Collingwood St, Kingston, ON',
    neighborhood: 'Kingscourt',
    bedrooms: 0,
    bathrooms: 1,
    is_furnished: true,
    utilities_included: true,
    available_from: new Date('2026-09-01'),
    available_to: new Date('2027-04-30'),
    tags: ['Utilities included', 'Internet included', 'Private entrance', 'Near campus'],
    status: 'active',
    room_size_sqft: 180,
    room_furnishings: ['bed', 'desk', 'wardrobe', 'mini-fridge', 'microwave', 'sofa'],
    has_ac: true,
    has_heating: true,
    has_laundry: false,
    laundry_type: 'none',
    has_dishwasher: false,
    has_parking: false,
    kitchen_arrangement: 'buy_your_own',
    guest_policy: 'with_notice',
    house_cleanliness: 'very_clean',
    latitude: 44.238,
    longitude: -76.492,
    images: [
      'https://picsum.photos/seed/priya2a/800/600',
      'https://picsum.photos/seed/priya2b/800/600',
      'https://picsum.photos/seed/priya2c/800/600',
    ],
    housemates: [],
  },

  // Marcus Johnson — 2 listings
  {
    listerEmail: 'marcus.johnson@queensu.ca',
    title: 'Furnished room — Portsmouth Village home',
    description:
      "Private room in a spacious house near the waterfront in Portsmouth Village. Two other housemates who are active and social. Large kitchen — Marcus loves to cook and shares meals often.",
    price_per_month: 750,
    address: '91 Mowat Ave, Kingston, ON',
    neighborhood: 'Portsmouth Village',
    bedrooms: 1,
    bathrooms: 2,
    is_furnished: true,
    utilities_included: false,
    available_from: new Date('2026-09-01'),
    available_to: new Date('2027-04-30'),
    tags: ['Furnished', 'Parking', 'Backyard', 'Near waterfront'],
    status: 'active',
    room_size_sqft: 150,
    room_furnishings: ['bed', 'desk', 'wardrobe', 'bookshelf'],
    has_ac: false,
    has_heating: true,
    has_laundry: true,
    laundry_type: 'in_unit',
    has_dishwasher: true,
    has_parking: true,
    kitchen_arrangement: 'flexible',
    guest_policy: 'with_notice',
    house_cleanliness: 'clean',
    latitude: 44.221,
    longitude: -76.512,
    images: [
      'https://picsum.photos/seed/marcus1a/800/600',
      'https://picsum.photos/seed/marcus1b/800/600',
      'https://picsum.photos/seed/marcus1c/800/600',
      'https://picsum.photos/seed/marcus1d/800/600',
    ],
    housemates: [
      {
        name: 'Marcus Johnson',
        program: 'Kinesiology',
        year_of_study: 4,
        sleep_habits: 'flexible',
        party_level: 'once_a_week',
        personality_traits: ['easygoing', 'active'],
        interests: ['fitness', 'cooking', 'soccer'],
        substance_preferences: ['alcohol'],
        display_order: 0,
      },
      {
        name: 'Devon Clarke',
        program: 'Physical Education',
        year_of_study: 3,
        sleep_habits: 'early_bird',
        party_level: 'once_a_week',
        personality_traits: ['active', 'social'],
        interests: ['basketball', 'hiking'],
        substance_preferences: ['alcohol'],
        display_order: 1,
      },
    ],
  },
  {
    listerEmail: 'marcus.johnson@queensu.ca',
    title: 'Cozy room in Inner Harbour flat',
    description:
      "Bright private room in a modern 3-bedroom apartment overlooking the harbour. 15-minute bus ride to campus. Building has a gym, bike storage, and underground parking available.",
    price_per_month: 880,
    address: '18 Ontario St, Kingston, ON',
    neighborhood: 'Inner Harbour',
    bedrooms: 1,
    bathrooms: 1,
    is_furnished: true,
    utilities_included: false,
    available_from: new Date('2026-09-01'),
    available_to: new Date('2027-04-30'),
    tags: ['Harbour view', 'Gym access', 'Furnished', 'Bike storage'],
    status: 'active',
    room_size_sqft: 130,
    room_furnishings: ['bed', 'desk', 'wardrobe'],
    has_ac: true,
    has_heating: true,
    has_laundry: true,
    laundry_type: 'in_building',
    has_dishwasher: true,
    has_parking: true,
    kitchen_arrangement: 'split_food',
    guest_policy: 'with_notice',
    house_cleanliness: 'clean',
    latitude: 44.229,
    longitude: -76.478,
    images: [
      'https://picsum.photos/seed/marcus2a/800/600',
      'https://picsum.photos/seed/marcus2b/800/600',
      'https://picsum.photos/seed/marcus2c/800/600',
    ],
    housemates: [
      {
        name: 'Marcus Johnson',
        program: 'Kinesiology',
        year_of_study: 4,
        sleep_habits: 'flexible',
        party_level: 'once_a_week',
        personality_traits: ['easygoing', 'active'],
        interests: ['fitness', 'cooking'],
        substance_preferences: ['alcohol'],
        display_order: 0,
      },
    ],
  },

  // Sarah Kim — 2 listings
  {
    listerEmail: 'sarah.kim@queensu.ca',
    title: 'Quiet 2BR — Williamsville (female preferred)',
    description:
      "Two bedrooms available in a very clean, quiet house. Looking for two respectful female students. I have early clinical placements so a quiet, tidy home is essential. All utilities split fairly.",
    price_per_month: 700,
    address: '204 Brock St, Kingston, ON',
    neighborhood: 'Williamsville',
    bedrooms: 2,
    bathrooms: 1,
    is_furnished: true,
    utilities_included: false,
    available_from: new Date('2026-09-01'),
    available_to: new Date('2027-04-30'),
    tags: ['Near campus', 'Furnished', 'Female preferred', 'Quiet house', 'Laundry'],
    status: 'active',
    room_size_sqft: 125,
    room_furnishings: ['bed', 'desk', 'wardrobe', 'nightstand'],
    has_ac: false,
    has_heating: true,
    has_laundry: true,
    laundry_type: 'in_unit',
    has_dishwasher: false,
    has_parking: false,
    kitchen_arrangement: 'split_food',
    guest_policy: 'rarely',
    house_cleanliness: 'very_clean',
    latitude: 44.234,
    longitude: -76.504,
    images: [
      'https://picsum.photos/seed/sarah1a/800/600',
      'https://picsum.photos/seed/sarah1b/800/600',
      'https://picsum.photos/seed/sarah1c/800/600',
    ],
    housemates: [
      {
        name: 'Sarah Kim',
        program: 'Nursing',
        year_of_study: 3,
        sleep_habits: 'early_bird',
        party_level: 'never',
        personality_traits: ['studious', 'caring'],
        interests: ['yoga', 'cooking'],
        substance_preferences: [] as string[],
        display_order: 0,
      },
    ],
  },
  {
    listerEmail: 'sarah.kim@queensu.ca',
    title: 'Single room — Kingscourt student house',
    description:
      "One private room in a 5-bedroom student house. Renovated kitchen, large backyard, and street parking. 10 minutes from main campus on foot. Mixed group of students — quiet during the week.",
    price_per_month: 675,
    address: '37 Collingwood St, Kingston, ON',
    neighborhood: 'Kingscourt',
    bedrooms: 1,
    bathrooms: 2,
    is_furnished: false,
    utilities_included: false,
    available_from: new Date('2026-09-01'),
    available_to: new Date('2027-04-30'),
    tags: ['Near campus', 'Backyard', 'Parking', 'Laundry'],
    status: 'active',
    room_size_sqft: 100,
    room_furnishings: [] as string[],
    has_ac: false,
    has_heating: true,
    has_laundry: true,
    laundry_type: 'in_building',
    has_dishwasher: false,
    has_parking: true,
    kitchen_arrangement: 'buy_your_own',
    guest_policy: 'with_notice',
    house_cleanliness: 'clean',
    latitude: 44.238,
    longitude: -76.492,
    images: [
      'https://picsum.photos/seed/sarah2a/800/600',
      'https://picsum.photos/seed/sarah2b/800/600',
      'https://picsum.photos/seed/sarah2c/800/600',
      'https://picsum.photos/seed/sarah2d/800/600',
      'https://picsum.photos/seed/sarah2e/800/600',
    ],
    housemates: [
      {
        name: 'Sarah Kim',
        program: 'Nursing',
        year_of_study: 3,
        sleep_habits: 'early_bird',
        party_level: 'never',
        personality_traits: ['studious', 'structured'],
        interests: ['yoga', 'hiking'],
        substance_preferences: [] as string[],
        display_order: 0,
      },
      {
        name: 'Noah Bergeron',
        program: 'Commerce',
        year_of_study: 2,
        sleep_habits: 'flexible',
        party_level: 'once_a_month',
        personality_traits: ['easygoing', 'tidy'],
        interests: ['cooking', 'cycling'],
        substance_preferences: ['alcohol'],
        display_order: 1,
      },
      {
        name: 'Mei Zhang',
        program: 'Life Sciences',
        year_of_study: 3,
        sleep_habits: 'early_bird',
        party_level: 'never',
        personality_traits: ['studious', 'organised'],
        interests: ['reading', 'piano'],
        substance_preferences: [] as string[],
        display_order: 2,
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns [smaller, larger] so participant_1 < participant_2 (DB constraint). */
function orderParticipants(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a]
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('🌱 Starting seed...\n')

  // -------------------------------------------------------------------------
  // 1. Clear existing data (reverse dependency order)
  // -------------------------------------------------------------------------
  console.log('🗑️  Clearing existing data...')
  await prisma.message.deleteMany()
  await prisma.conversation.deleteMany()
  await prisma.savedListing.deleteMany()
  await prisma.listingImage.deleteMany()
  await prisma.listingHousemate.deleteMany()
  await prisma.listing.deleteMany()
  await prisma.profile.deleteMany()

  // Delete all auth users directly via SQL (bypasses JWT auth requirement)
  const deleted = await prisma.$executeRaw`DELETE FROM auth.users WHERE email LIKE '%@queensu.ca'`
  console.log(`   Cleared ${deleted} existing auth users.\n`)

  // -------------------------------------------------------------------------
  // 2. Create auth users directly via SQL
  //    Uses pgcrypto's crypt() to hash passwords — no admin JWT needed.
  // -------------------------------------------------------------------------
  console.log('👤 Creating auth users...')
  const createdUsers: Record<string, string> = {} // email → uuid

  for (const u of USERS) {
    const id = crypto.randomUUID()
    await prisma.$executeRaw`
      INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin, is_anonymous,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) VALUES (
        ${id}::uuid,
        '00000000-0000-0000-0000-000000000000'::uuid,
        'authenticated',
        'authenticated',
        ${u.email},
        crypt(${u.password}, gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        ${JSON.stringify({ full_name: u.full_name })}::jsonb,
        false,
        false,
        '', '', '', ''
      )
    `
    createdUsers[u.email] = id
    console.log(`   ✓ ${u.full_name} (${u.email})`)
  }
  console.log()

  // -------------------------------------------------------------------------
  // 3. Update profiles via Prisma
  //    The on_auth_user_created trigger already inserted a basic profile row.
  // -------------------------------------------------------------------------
  console.log('📝 Updating profiles...')
  for (const u of USERS) {
    const id = createdUsers[u.email]
    await prisma.profile.upsert({
      where: { id },
      update: {
        full_name: u.full_name,
        university: u.university,
        program: u.program,
        year_of_study: u.year_of_study,
        bio: u.bio,
        home_university: u.home_university,
        age: u.age,
        sleep_habits: u.sleep_habits,
        party_level: u.party_level,
        cleanliness: u.cleanliness,
        personality_traits: u.personality_traits,
        interests: u.interests,
        substance_preferences: u.substance_preferences,
        budget_min: u.budget_min > 0 ? u.budget_min : null,
        budget_max: u.budget_max > 0 ? u.budget_max : null,
        move_in_date: u.move_in_date,
        move_out_date: u.move_out_date,
      },
      create: {
        id,
        email: u.email,
        full_name: u.full_name,
        university: u.university,
        program: u.program,
        year_of_study: u.year_of_study,
        bio: u.bio,
        home_university: u.home_university,
        age: u.age,
        sleep_habits: u.sleep_habits,
        party_level: u.party_level,
        cleanliness: u.cleanliness,
        personality_traits: u.personality_traits,
        interests: u.interests,
        substance_preferences: u.substance_preferences,
        budget_min: u.budget_min > 0 ? u.budget_min : null,
        budget_max: u.budget_max > 0 ? u.budget_max : null,
        move_in_date: u.move_in_date,
        move_out_date: u.move_out_date,
      },
    })
    console.log(`   ✓ ${u.full_name}`)
  }
  console.log()

  // -------------------------------------------------------------------------
  // 4. Create listings, housemates, and images
  // -------------------------------------------------------------------------
  console.log('🏠 Creating listings...')
  const createdListings: Record<string, string> = {} // title → listing id

  for (const l of LISTINGS) {
    const userId = createdUsers[l.listerEmail]
    const listing = await prisma.listing.create({
      data: {
        user_id: userId,
        title: l.title,
        description: l.description,
        price_per_month: l.price_per_month,
        address: l.address,
        neighborhood: l.neighborhood,
        bedrooms: l.bedrooms,
        bathrooms: l.bathrooms,
        is_furnished: l.is_furnished,
        utilities_included: l.utilities_included,
        available_from: l.available_from,
        available_to: l.available_to,
        tags: l.tags,
        status: l.status,
        room_size_sqft: l.room_size_sqft,
        room_furnishings: l.room_furnishings,
        has_ac: l.has_ac,
        has_heating: l.has_heating,
        has_laundry: l.has_laundry,
        laundry_type: l.laundry_type,
        has_dishwasher: l.has_dishwasher,
        has_parking: l.has_parking,
        kitchen_arrangement: l.kitchen_arrangement,
        guest_policy: l.guest_policy,
        house_cleanliness: l.house_cleanliness,
        latitude: l.latitude,
        longitude: l.longitude,
      },
    })

    createdListings[l.title] = listing.id

    // Images
    for (let i = 0; i < l.images.length; i++) {
      await prisma.listingImage.create({
        data: { listing_id: listing.id, image_url: l.images[i], display_order: i },
      })
    }

    // Housemates
    for (const hm of l.housemates) {
      await prisma.listingHousemate.create({
        data: { listing_id: listing.id, ...hm },
      })
    }

    console.log(`   ✓ "${l.title}"`)
  }
  console.log()

  // -------------------------------------------------------------------------
  // 5. Conversations and messages
  // -------------------------------------------------------------------------
  console.log('💬 Creating conversations...')

  // Tom → James: Albert St listing
  {
    const tomId = createdUsers['tom.anderson@queensu.ca']
    const jamesId = createdUsers['james.wilson@queensu.ca']
    const listingId = createdListings['Sunny 2BR near campus — Albert St']
    const [p1, p2] = orderParticipants(tomId, jamesId)

    const convo = await prisma.conversation.create({
      data: { listing_id: listingId, participant_1: p1, participant_2: p2 },
    })

    await prisma.message.createMany({
      data: [
        {
          conversation_id: convo.id,
          sender_id: tomId,
          content:
            "Hey James! Saw your place on Albert St. I'm coming from Sydney for the winter term — are the rooms still available?",
          is_read: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          conversation_id: convo.id,
          sender_id: jamesId,
          content:
            "Hey Tom! Yeah both rooms are still up for grabs. Which term are you coming for — just fall/winter or the full year?",
          is_read: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        },
        {
          conversation_id: convo.id,
          sender_id: tomId,
          content:
            "Full year if possible — Sep 2026 through April 2027. Would that work? Also, is the $850 per room or total?",
          is_read: false,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
    })
    console.log('   ✓ Tom Anderson ↔ James Wilson (Albert St)')
  }

  // Emma → Priya: Williamsville listing
  {
    const emmaId = createdUsers['emma.chen@queensu.ca']
    const priyaId = createdUsers['priya.patel@queensu.ca']
    const listingId = createdListings['Quiet furnished bedroom — Williamsville']
    const [p1, p2] = orderParticipants(emmaId, priyaId)

    const convo = await prisma.conversation.create({
      data: { listing_id: listingId, participant_1: p1, participant_2: p2 },
    })

    await prisma.message.createMany({
      data: [
        {
          conversation_id: convo.id,
          sender_id: emmaId,
          content:
            "Hi Priya! I'm really interested in your place. I'm an early bird too so I think we'd be really compatible. Can you tell me more about the kitchen situation?",
          is_read: true,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          conversation_id: convo.id,
          sender_id: priyaId,
          content:
            "Hi Emma! Great to hear from you. We split groceries and each cook our own meals but we do share spices and condiments. The kitchen is fully equipped with a dishwasher. What's your program?",
          is_read: true,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        },
        {
          conversation_id: convo.id,
          sender_id: emmaId,
          content:
            "I'm in Commerce exchange from UBC. Honestly sounds perfect — I'm very tidy and usually in bed by 10:30. Would you be open to a quick video call this week?",
          is_read: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          conversation_id: convo.id,
          sender_id: priyaId,
          content:
            "Definitely! Thursday evening works well for me. I'll send you a link.",
          is_read: false,
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ],
    })
    console.log('   ↔ Emma Chen ↔ Priya Patel (Williamsville)')
  }

  // Aisha → Marcus: Portsmouth listing
  {
    const aishaId = createdUsers['aisha.rahman@queensu.ca']
    const marcusId = createdUsers['marcus.johnson@queensu.ca']
    const listingId = createdListings['Furnished room — Portsmouth Village home']
    const [p1, p2] = orderParticipants(aishaId, marcusId)

    const convo = await prisma.conversation.create({
      data: { listing_id: listingId, participant_1: p1, participant_2: p2 },
    })

    await prisma.message.createMany({
      data: [
        {
          conversation_id: convo.id,
          sender_id: aishaId,
          content:
            "Hi Marcus, your Portsmouth listing looks lovely. I'm coming from Edinburgh for the full year. How far is it from the main bus line?",
          is_read: true,
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
        {
          conversation_id: convo.id,
          sender_id: marcusId,
          content:
            "Hey Aisha! Route 2 stops about a 3-minute walk away, takes ~20 mins to campus. The neighbourhood is super quiet and safe. Are you looking for just the one room?",
          is_read: false,
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      ],
    })
    console.log('   ✓ Aisha Rahman ↔ Marcus Johnson (Portsmouth)')
  }
  console.log()

  // -------------------------------------------------------------------------
  // 6. Saved listings
  // -------------------------------------------------------------------------
  console.log('❤️  Creating saved listings...')

  const savedPairs = [
    { userEmail: 'emma.chen@queensu.ca',     listingTitle: 'Quiet furnished bedroom — Williamsville' },
    { userEmail: 'emma.chen@queensu.ca',     listingTitle: 'Quiet 2BR — Williamsville (female preferred)' },
    { userEmail: 'liam.obrien@queensu.ca',   listingTitle: 'Sunny 2BR near campus — Albert St' },
    { userEmail: 'liam.obrien@queensu.ca',   listingTitle: 'Private room in Sydenham Ward house' },
    { userEmail: 'sofia.martinez@queensu.ca', listingTitle: 'Furnished room — Portsmouth Village home' },
    { userEmail: 'tom.anderson@queensu.ca',  listingTitle: 'Sunny 2BR near campus — Albert St' },
    { userEmail: 'aisha.rahman@queensu.ca',  listingTitle: 'Furnished room — Portsmouth Village home' },
    { userEmail: 'alex.dubois@queensu.ca',   listingTitle: 'Cozy room in Inner Harbour flat' },
  ]

  for (const { userEmail, listingTitle } of savedPairs) {
    const userId = createdUsers[userEmail]
    const listingId = createdListings[listingTitle]
    if (!userId || !listingId) continue
    await prisma.savedListing.create({ data: { user_id: userId, listing_id: listingId } })
  }
  console.log(`   ✓ ${savedPairs.length} saved listings\n`)

  // -------------------------------------------------------------------------
  // Done
  // -------------------------------------------------------------------------
  console.log('✅ Seed complete!')
  console.log('\nTest accounts (password: password123):')
  for (const u of USERS) {
    console.log(`   ${u.email}`)
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
