export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  university: string | null;
  program: string | null;
  year_of_study: number | null;
  bio: string | null;
  avatar_url: string | null;
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

export type ListingWithDetails = Listing & {
  profiles: Profile;
  listing_images: ListingImage[];
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
