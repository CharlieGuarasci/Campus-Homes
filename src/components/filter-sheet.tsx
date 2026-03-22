'use client';
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ListingFilters } from '@/types';

interface FilterSheetProps {
  filters: ListingFilters;
  onApply: (filters: ListingFilters) => void;
}

export function FilterSheet({ filters, onApply }: FilterSheetProps) {
  const [local, setLocal] = useState<ListingFilters>(filters);
  const [open, setOpen] = useState(false);

  function handleApply() {
    onApply(local);
    setOpen(false);
  }

  function handleReset() {
    const empty: ListingFilters = {};
    setLocal(empty);
    onApply(empty);
    setOpen(false);
  }

  const hasFilters = Object.values(filters).some((v) => v !== undefined && v !== '');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50">
          <SlidersHorizontal className="h-4 w-4" />
          {hasFilters && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto pb-safe">
        <SheetHeader>
          <SheetTitle>Filter Listings</SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-4 space-y-5">
          {/* Price range */}
          <div>
            <Label className="mb-2 block">Price range (CA$/mo)</Label>
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                placeholder="Min"
                value={local.minPrice ?? ''}
                onChange={(e) => setLocal((p) => ({ ...p, minPrice: e.target.value ? Number(e.target.value) : undefined }))}
              />
              <span className="text-gray-400">–</span>
              <Input
                type="number"
                placeholder="Max"
                value={local.maxPrice ?? ''}
                onChange={(e) => setLocal((p) => ({ ...p, maxPrice: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <Label className="mb-2 block">Bedrooms</Label>
            <Select
              value={local.bedrooms?.toString() ?? ''}
              onValueChange={(v) => setLocal((p) => ({ ...p, bedrooms: v === 'any' ? undefined : Number(v) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="0">Studio</SelectItem>
                <SelectItem value="1">1 bedroom</SelectItem>
                <SelectItem value="2">2 bedrooms</SelectItem>
                <SelectItem value="3">3+ bedrooms</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Available from */}
          <div>
            <Label className="mb-2 block">Available from</Label>
            <Input
              type="date"
              value={local.availableFrom ?? ''}
              onChange={(e) => setLocal((p) => ({ ...p, availableFrom: e.target.value || undefined }))}
            />
          </div>

          {/* Furnished */}
          <div className="flex items-center justify-between">
            <Label>Furnished only</Label>
            <Switch
              checked={local.isFurnished ?? false}
              onCheckedChange={(v) => setLocal((p) => ({ ...p, isFurnished: v || undefined }))}
            />
          </div>

          {/* Utilities */}
          <div className="flex items-center justify-between">
            <Label>Utilities included</Label>
            <Switch
              checked={local.utilitiesIncluded ?? false}
              onCheckedChange={(v) => setLocal((p) => ({ ...p, utilitiesIncluded: v || undefined }))}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleReset}>
              Reset
            </Button>
            <Button className="flex-1" onClick={handleApply}>
              Apply filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
