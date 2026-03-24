-- Backfill approximate coordinates for seed listings based on neighborhood
update public.listings set latitude = 44.2253, longitude = -76.4951 where neighborhood = 'University District' and latitude is null;
update public.listings set latitude = 44.2312, longitude = -76.4810 where neighborhood = 'Sydenham Ward' and latitude is null;
update public.listings set latitude = 44.2340, longitude = -76.5050 where neighborhood = 'Williamsville' and latitude is null;
update public.listings set latitude = 44.2210, longitude = -76.5120 where neighborhood = 'Portsmouth Village' and latitude is null;
update public.listings set latitude = 44.2290, longitude = -76.4780 where neighborhood = 'Inner Harbour' and latitude is null;
update public.listings set latitude = 44.2380, longitude = -76.4920 where neighborhood = 'Kingscourt' and latitude is null;
