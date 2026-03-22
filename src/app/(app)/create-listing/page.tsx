'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LISTING_TAGS, NEIGHBORHOODS, MAX_IMAGES, LISTING_IMAGE_BUCKET } from '@/lib/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function CreateListingPage() {
  const router = useRouter();
  const supabase = useRef(createClient()).current;
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    neighborhood: '',
    bedrooms: '',
    bathrooms: '',
    isFurnished: false,
    utilitiesIncluded: false,
    availableFrom: '',
    availableTo: '',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const newFiles = files.slice(0, MAX_IMAGES - images.length);
    setImages((prev) => [...prev, ...newFiles]);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { setError('You must be signed in.'); return; }
    setError('');
    setLoading(true);

    // Insert listing
    const { data: listing, error: insertError } = await supabase
      .from('listings')
      .insert({
        user_id: user.id,
        title: form.title,
        description: form.description || null,
        price_per_month: parseFloat(form.price),
        address: form.address || null,
        neighborhood: form.neighborhood || null,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        is_furnished: form.isFurnished,
        utilities_included: form.utilitiesIncluded,
        available_from: form.availableFrom,
        available_to: form.availableTo,
        tags: selectedTags.length > 0 ? selectedTags : null,
        status: 'active',
      })
      .select()
      .single();

    if (insertError || !listing) {
      setError(insertError?.message ?? 'Failed to create listing.');
      setLoading(false);
      return;
    }

    // Upload images
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${listing.id}/${i}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(LISTING_IMAGE_BUCKET)
        .upload(path, file, { contentType: file.type });

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from(LISTING_IMAGE_BUCKET).getPublicUrl(path);
        await supabase.from('listing_images').insert({
          listing_id: listing.id,
          image_url: urlData.publicUrl,
          display_order: i,
        });
      }
    }

    router.push('/marketplace');
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#1a2035] px-4 pt-safe-top pb-3 flex items-center gap-3">
        <Link href="/marketplace" className="text-white/70 hover:text-white">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-bold text-white">New listing</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-5 max-w-2xl mx-auto">
        {/* Photos */}
        <div>
          <Label className="mb-2 block">Photos <span className="text-gray-400 font-normal">(up to {MAX_IMAGES})</span></Label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 flex items-center justify-center text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
              >
                <Upload className="h-5 w-5" />
                <span className="text-[10px] mt-1">Add photo</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="e.g. Cozy 1-bedroom near Queen's campus"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the place, what's included, house rules…"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <Label htmlFor="price">Price per month (CA$) *</Label>
          <Input
            id="price"
            type="number"
            placeholder="1200"
            min={0}
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            required
          />
        </div>

        {/* Neighborhood */}
        <div className="space-y-1.5">
          <Label>Neighbourhood</Label>
          <Select value={form.neighborhood} onValueChange={(v) => update('neighborhood', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select neighbourhood" />
            </SelectTrigger>
            <SelectContent>
              {NEIGHBORHOODS.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label htmlFor="address">Address <span className="text-gray-400 font-normal">(optional)</span></Label>
          <Input
            id="address"
            placeholder="123 University Ave, Kingston, ON"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
          />
        </div>

        {/* Beds & Baths */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <Label>Bedrooms</Label>
            <Select value={form.bedrooms} onValueChange={(v) => update('bedrooms', v)}>
              <SelectTrigger><SelectValue placeholder="–" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Studio</SelectItem>
                {[1, 2, 3, 4].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1.5">
            <Label>Bathrooms</Label>
            <Select value={form.bathrooms} onValueChange={(v) => update('bathrooms', v)}>
              <SelectTrigger><SelectValue placeholder="–" /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-4">
          <div className="flex flex-1 items-center justify-between rounded-lg border border-gray-200 px-3 py-3">
            <Label>Furnished</Label>
            <Switch checked={form.isFurnished} onCheckedChange={(v) => update('isFurnished', v)} />
          </div>
          <div className="flex flex-1 items-center justify-between rounded-lg border border-gray-200 px-3 py-3">
            <Label className="text-xs">Utilities incl.</Label>
            <Switch checked={form.utilitiesIncluded} onCheckedChange={(v) => update('utilitiesIncluded', v)} />
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="from">Available from *</Label>
            <Input
              id="from"
              type="date"
              value={form.availableFrom}
              onChange={(e) => update('availableFrom', e.target.value)}
              required
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="to">Available to *</Label>
            <Input
              id="to"
              type="date"
              value={form.availableTo}
              onChange={(e) => update('availableTo', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {LISTING_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-200">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? 'Publishing…' : 'Publish listing'}
        </Button>
      </form>
    </>
  );
}
