import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function validateListingData(data: any) {
  const errors: string[] = [];

  // Required fields
  if (!data.title?.trim()) errors.push('Title is required');
  if (!data.description?.trim()) errors.push('Description is required');
  if (!data.price) errors.push('Price is required');

  // Price validation
  const price = parseFloat(data.price);
  if (isNaN(price) || price <= 0 || price > 999999) {
    errors.push('Price must be a valid number between 1 and 999999');
  }

  // Bedrooms
  if (data.bedrooms) {
    const bedrooms = parseInt(data.bedrooms);
    if (isNaN(bedrooms) || bedrooms < 0 || bedrooms > 20) {
      errors.push('Bedrooms must be a number between 0 and 20');
    }
  }

  // Bathrooms
  if (data.bathrooms) {
    const bathrooms = parseInt(data.bathrooms);
    if (isNaN(bathrooms) || bathrooms < 0 || bathrooms > 10) {
      errors.push('Bathrooms must be a number between 0 and 10');
    }
  }

  // Coordinates
  if (data.latitude) {
    const lat = parseFloat(data.latitude);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.push('Latitude must be between -90 and 90');
    }
  }

  if (data.longitude) {
    const lng = parseFloat(data.longitude);
    if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.push('Longitude must be between -180 and 180');
    }
  }

  // Tags
  if (data.tags && Array.isArray(data.tags)) {
    if (data.tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }
    if (data.tags.some((tag: string) => tag.length > 50)) {
      errors.push('Tags must be less than 50 characters');
    }
  }

  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      address,
      neighborhood,
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      isFurnished,
      utilitiesIncluded,
      availableFrom,
      availableTo,
      tags,
    } = body;

    // Validate data
    const validationErrors = validateListingData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors.join(', ') }, { status: 400 });
    }

    // Insert listing
    const { data: listing, error: insertError } = await supabase
      .from('listings')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        price_per_month: parseFloat(price),
        address: address?.trim() || null,
        neighborhood: neighborhood || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        is_furnished: !!isFurnished,
        utilities_included: !!utilitiesIncluded,
        available_from: availableFrom || null,
        available_to: availableTo || null,
        tags: tags && tags.length > 0 ? tags : null,
        status: 'active',
      })
      .select()
      .single();

    if (insertError || !listing) {
      return NextResponse.json({ error: insertError?.message || 'Failed to create listing' }, { status: 500 });
    }

    return NextResponse.json({ listing });
  } catch (error) {
    console.error('Create listing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}