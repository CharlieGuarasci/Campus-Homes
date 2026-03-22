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

export const CURRENCY = 'CAD';

export const MAX_IMAGES = 6;
export const MAX_IMAGE_SIZE_MB = 5;
export const LISTING_IMAGE_BUCKET = 'listing-images';
