export const ALLOWED_EMAIL_DOMAINS = ['queensu.ca'] as const;

export const UNIVERSITIES: Record<string, string> = {
  'queensu.ca': "Queen's University",
};

export const LISTING_TAGS = [
  'Near campus',
  'Parking',
  'Laundry',
  'Pet-friendly',
  'Female-only',
  'Male-only',
  'Private bathroom',
  'Shared bathroom',
  'Gym access',
  'Balcony',
  'Air conditioning',
  'Internet included',
  'No smoking',
] as const;

export const NEIGHBORHOODS = [
  'University District',
  'Sydenham Ward',
  'Williamsville',
  'Portsmouth Village',
  'Inner Harbour',
  'Kingscourt',
  'Strathcona Park',
  'Downtown',
  'Other',
] as const;

export const ROOM_FURNISHINGS = [
  'bed_frame', 'mattress', 'sheets', 'desk',
  'bedside_table', 'dresser', 'closet', 'chair',
] as const;

export const ROOM_FURNISHINGS_LABELS: Record<string, string> = {
  bed_frame: 'Bed frame', mattress: 'Mattress', sheets: 'Sheets', desk: 'Desk',
  bedside_table: 'Bedside table', dresser: 'Dresser', closet: 'Closet', chair: 'Chair',
};

export const SLEEP_HABITS_LABELS: Record<string, string> = {
  early_bird: 'Early bird', night_owl: 'Night owl', flexible: 'Flexible',
};

export const PARTY_LEVEL_LABELS: Record<string, string> = {
  never: 'Never', once_a_month: 'Once a month',
  once_a_week: 'Once a week', multiple_per_week: 'Multiple per week',
};

export const CLEANLINESS_LABELS: Record<string, string> = {
  very_clean: 'Very clean', clean: 'Clean', moderate: 'Moderate', relaxed: 'Relaxed',
};

export const KITCHEN_LABELS: Record<string, string> = {
  split_food: 'Split food costs', buy_your_own: 'Everyone buys their own', flexible: 'Flexible',
};

export const GUEST_POLICY_LABELS: Record<string, string> = {
  anytime: 'Guests welcome anytime', with_notice: 'With notice',
  rarely: 'Rarely', no_overnight: 'No overnight guests',
};

export const LAUNDRY_TYPE_LABELS: Record<string, string> = {
  in_unit: 'In-unit', in_building: 'In-building', none: 'None',
};

export const PERSONALITY_TRAITS = [
  'easygoing', 'structured', 'social', 'independent', 'quiet', 'adventurous',
] as const;

export const PERSONALITY_LABELS: Record<string, string> = {
  easygoing: 'Easygoing', structured: 'Structured', social: 'Social',
  independent: 'Independent', quiet: 'Quiet', adventurous: 'Adventurous',
};

export const COMMON_INTERESTS = [
  'sports', 'music', 'gaming', 'cooking', 'reading',
  'fitness', 'travel', 'art', 'film', 'outdoors',
] as const;

export const SUBSTANCE_OPTIONS = ['alcohol', 'cannabis', 'neither'] as const;

export const CURRENCY = 'CAD';
export const MAX_IMAGES = 6;
export const MAX_IMAGE_SIZE_MB = 5;
export const LISTING_IMAGE_BUCKET = 'listing-images';
