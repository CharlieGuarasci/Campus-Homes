'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, Upload, ChevronLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LISTING_TAGS, NEIGHBORHOODS, MAX_IMAGES } from '@/lib/constants';
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
    latitude: '',
    longitude: '',
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

    const listingData = {
      title: form.title,
      description: form.description || null,
      price: form.price,
      address: form.address || null,
      neighborhood: form.neighborhood || null,
      latitude: form.latitude ? form.latitude : null,
      longitude: form.longitude ? form.longitude : null,
      bedrooms: form.bedrooms || null,
      bathrooms: form.bathrooms || null,
      isFurnished: form.isFurnished,
      utilitiesIncluded: form.utilitiesIncluded,
      availableFrom: form.availableFrom,
      availableTo: form.availableTo,
      tags: selectedTags,
    };

    const response = await fetch('/api/listings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(listingData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      setError(errorData.error || 'Failed to create listing');
      setLoading(false);
      return;
    }

    const { listing } = await response.json();

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('listingId', listing.id);
      formData.append('displayOrder', i.toString());

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to upload image');
        setLoading(false);
        return;
      }
    }

    router.push('/marketplace');
  }

  const fieldClass = "w-full h-9 rounded-md border border-[#EBEBEA] bg-white px-3 text-sm text-[#191919] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#2383E2] transition-colors";
  const labelClass = "block text-xs font-medium text-[#6B6B6B] uppercase tracking-wide mb-1.5";

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-[#EBEBEA] px-4 py-3 flex items-center gap-3">
        <Link href="/marketplace" className="text-[#6B6B6B] hover:text-[#191919]">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-medium text-[#191919]">New listing</h1>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5 max-w-2xl mx-auto">
        {/* Photos */}
        <div>
          <label className={labelClass}>
            Photos <span className="normal-case font-normal text-[#A0A0A0]">(up to {MAX_IMAGES})</span>
          </label>
          <div className="flex gap-2 flex-wrap">
            {previews.map((src, i) => (
              <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden bg-[#F7F7F5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Preview ${i + 1}`} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/50 flex items-center justify-center text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-20 w-20 rounded-lg border-2 border-dashed border-[#EBEBEA] flex flex-col items-center justify-center text-[#A0A0A0] hover:border-[#2383E2] hover:text-[#2383E2] transition-colors"
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
        <div>
          <label htmlFor="title" className={labelClass}>Title *</label>
          <input
            id="title"
            placeholder="e.g. Cozy 1-bedroom near Queen's campus"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            required
            className={fieldClass}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea
            id="description"
            placeholder="Describe the place, what's included, house rules…"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={4}
            className="w-full rounded-md border border-[#EBEBEA] bg-white px-3 py-2 text-sm text-[#191919] placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#2383E2] transition-colors resize-none"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className={labelClass}>Price per month (CA$) *</label>
          <input
            id="price"
            type="number"
            placeholder="1200"
            min={0}
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            required
            className={fieldClass}
          />
        </div>

        {/* Neighbourhood */}
        <div>
          <label className={labelClass}>Neighbourhood</label>
          <Select value={form.neighborhood} onValueChange={(v) => update('neighborhood', v)}>
            <SelectTrigger className="border-[#EBEBEA]">
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
        <div>
          <label htmlFor="address" className={labelClass}>
            Address <span className="normal-case font-normal text-[#A0A0A0]">(optional)</span>
          </label>
          <input
            id="address"
            placeholder="123 University Ave, Kingston, ON"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            className={fieldClass}
          />
        </div>

        {/* Coordinates */}
        <div>
          <label className={labelClass}>
            Coordinates <span className="normal-case font-normal text-[#A0A0A0]">(optional — for map pin)</span>
          </label>
          <p className="text-xs text-[#A0A0A0] mb-2">
            Find coordinates at{' '}
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-[#2383E2] hover:underline">
              maps.google.com
            </a>
            {' '}— right-click your address and copy the lat/lng.
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              placeholder="Latitude (e.g. 44.2253)"
              value={form.latitude}
              onChange={(e) => update('latitude', e.target.value)}
              className={fieldClass + ' flex-1'}
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude (e.g. -76.4951)"
              value={form.longitude}
              onChange={(e) => update('longitude', e.target.value)}
              className={fieldClass + ' flex-1'}
            />
          </div>
        </div>

        {/* Beds & Baths */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className={labelClass}>Bedrooms</label>
            <Select value={form.bedrooms} onValueChange={(v) => update('bedrooms', v)}>
              <SelectTrigger className="border-[#EBEBEA]"><SelectValue placeholder="–" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Studio</SelectItem>
                {[1, 2, 3, 4].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className={labelClass}>Bathrooms</label>
            <Select value={form.bathrooms} onValueChange={(v) => update('bathrooms', v)}>
              <SelectTrigger className="border-[#EBEBEA]"><SelectValue placeholder="–" /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex gap-3">
          <div className="flex flex-1 items-center justify-between rounded-md border border-[#EBEBEA] px-3 py-2.5">
            <span className="text-sm text-[#191919]">Furnished</span>
            <Switch checked={form.isFurnished} onCheckedChange={(v) => update('isFurnished', v)} />
          </div>
          <div className="flex flex-1 items-center justify-between rounded-md border border-[#EBEBEA] px-3 py-2.5">
            <span className="text-sm text-[#191919]">Utilities incl.</span>
            <Switch checked={form.utilitiesIncluded} onCheckedChange={(v) => update('utilitiesIncluded', v)} />
          </div>
        </div>

        {/* Dates */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="from" className={labelClass}>Available from *</label>
            <input
              id="from"
              type="date"
              value={form.availableFrom}
              onChange={(e) => update('availableFrom', e.target.value)}
              required
              className={fieldClass}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="to" className={labelClass}>Available to *</label>
            <input
              id="to"
              type="date"
              value={form.availableTo}
              onChange={(e) => update('availableTo', e.target.value)}
              required
              className={fieldClass}
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className={labelClass}>Tags</label>
          <div className="flex flex-wrap gap-2">
            {LISTING_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium border transition-colors',
                  selectedTags.includes(tag)
                    ? 'bg-[#2383E2] border-[#2383E2] text-white'
                    : 'bg-white border-[#EBEBEA] text-[#6B6B6B] hover:border-[#2383E2] hover:text-[#2383E2]'
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-md bg-[#2383E2] text-white text-sm font-medium hover:bg-[#1a6fc9] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Publishing…' : 'Publish listing'}
        </button>
      </form>
    </>
  );
}
