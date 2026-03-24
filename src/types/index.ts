export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  university: string | null;
  home_university: string | null;
  program: string | null;
  year_of_study: number | null;
  age: number | null;
  bio: string | null;
  avatar_url: string | null;
  sleep_habits: 'early_bird' | 'night_owl' | 'flexible' | null;
  party_level: 'never' | 'once_a_month' | 'once_a_week' | 'multiple_per_week' | null;
  substance_preferences: string[] | null;
  cleanliness: 'very_clean' | 'clean' | 'moderate' | 'relaxed' | null;
  personality_traits: string[] | null;
  interests: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  move_in_date: string | null;
  move_out_date: string | null;
  created_at: string;
};

export type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price_per_month: number;
  currency: string;
  address: string | null;
  neighborhood: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  is_furnished: boolean;
  utilities_included: boolean;
  available_from: string;
  available_to: string;
  tags: string[] | null;
  status: 'active' | 'rented' | 'expired';
  room_size_sqft: number | null;
  room_furnishings: string[] | null;
  has_ac: boolean;
  has_heating: boolean;
  has_laundry: boolean;
  laundry_type: 'in_unit' | 'in_building' | 'none' | null;
  has_dishwasher: boolean;
  has_parking: boolean;
  kitchen_arrangement: 'split_food' | 'buy_your_own' | 'flexible' | null;
  guest_policy: 'anytime' | 'with_notice' | 'rarely' | 'no_overnight' | null;
  house_cleanliness: 'very_clean' | 'clean' | 'moderate' | 'relaxed' | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
};

export type ListingImage = {
  id: string;
  listing_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
};

export type ListingHousemate = {
  id: string;
  listing_id: string;
  name: string;
  program: string | null;
  year_of_study: number | null;
  sleep_habits: string | null;
  party_level: string | null;
  personality_traits: string[] | null;
  interests: string[] | null;
  substance_preferences: string[] | null;
  display_order: number;
  cleanliness: 'very_clean' | 'clean' | 'moderate' | 'relaxed' | null;
  bio: string | null;
};

export type ListingWithDetails = Listing & {
  profiles: Profile;
  listing_images: ListingImage[];
  listing_housemates?: ListingHousemate[];
  is_saved?: boolean;
};

export type Conversation = {
  id: string;
  listing_id: string | null;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
};

export type ConversationWithDetails = Conversation & {
  listing: Pick<Listing, 'id' | 'title' | 'price_per_month'> | null;
  other_participant: Profile;
  last_message: Message | null;
  unread_count: number;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export type SavedListing = {
  user_id: string;
  listing_id: string;
  created_at: string;
};

export type ListingFilters = {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  availableFrom?: string;
  availableTo?: string;
  bedrooms?: number;
  isFurnished?: boolean;
  utilitiesIncluded?: boolean;
};
