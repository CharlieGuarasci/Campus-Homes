interface ListingMapProps {
  latitude: number;
  longitude: number;
  address?: string | null;
}

export function ListingMap({ latitude, longitude, address }: ListingMapProps) {
  const src = `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  return (
    <div>
      {address && (
        <p className="text-sm text-[#6B6B6B] mb-2">{address}</p>
      )}
      <iframe
        src={src}
        width="100%"
        height="260"
        style={{ border: 0, borderRadius: 8, display: 'block' }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Listing location"
      />
    </div>
  );
}
