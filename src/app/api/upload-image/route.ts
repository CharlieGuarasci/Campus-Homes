import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Check file type by reading first few bytes (magic numbers)
function validateFileType(buffer: Buffer, mimeType: string): boolean {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) return false;

  // JPEG: FF D8 FF
  if (mimeType === 'image/jpeg' && buffer.length >= 3) {
    return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mimeType === 'image/png' && buffer.length >= 8) {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E &&
           buffer[3] === 0x47 && buffer[4] === 0x0D && buffer[5] === 0x0A &&
           buffer[6] === 0x1A && buffer[7] === 0x0A;
  }

  // WebP: RIFF .... WEBP
  if (mimeType === 'image/webp' && buffer.length >= 12) {
    return buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 &&
           buffer[3] === 0x46 && buffer[8] === 0x57 && buffer[9] === 0x45 &&
           buffer[10] === 0x42 && buffer[11] === 0x50;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const listingId = formData.get('listingId') as string;
    const displayOrder = parseInt(formData.get('displayOrder') as string);

    if (!file || !listingId || isNaN(displayOrder)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate file type by magic bytes
    if (!validateFileType(buffer, file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Verify user owns the listing
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id')
      .eq('id', listingId)
      .eq('user_id', user.id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found or not owned by user' }, { status: 403 });
    }

    // Generate random filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const randomName = `${uuidv4()}.${ext}`;

    // Upload to Supabase storage
    const path = `listings/${randomName}`;
    const { error: uploadError } = await supabase.storage
      .from('listing-images')
      .upload(path, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(path);

    // Insert into listing_images table
    const { error: insertError } = await supabase
      .from('listing_images')
      .insert({
        listing_id: listingId,
        image_url: urlData.publicUrl,
        display_order: displayOrder,
      });

    if (insertError) {
      // Clean up uploaded file if insert fails
      await supabase.storage.from('listing-images').remove([path]);
      return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
    }

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}