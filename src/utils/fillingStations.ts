import { fetchWithCache } from '@/src/utils/cache';
import { parseCsv } from '@/src/utils/csv';
import { fetchJson, fetchText } from '@/src/utils/http';
import { FillingStation } from '@/src/types/domain';

const CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

const STATIONS_CSV_URL =
  'https://www.emsd.gov.hk/filemanager/en/content_268/dataset/lpg_filling_station.csv';
const OIL_PRICE_JSON_URL = 'https://www.consumer.org.hk/pricewatch/oilwatch/opendata/oilprice.json';

type OilPriceItem = {
  type?: { en?: string };
  prices?: {
    vendor?: { en?: string };
    price?: string;
  }[];
};

function normalizeBrand(brand: string) {
  const normalized = brand.trim().toLowerCase();
  if (normalized.includes('exxon')) {
    return 'esso';
  }

  return normalized;
}

async function fetchStationsNetwork(): Promise<FillingStation[]> {
  const [stationsCsv, oilPriceData] = await Promise.all([
    fetchText(STATIONS_CSV_URL),
    fetchJson<OilPriceItem[]>(OIL_PRICE_JSON_URL),
  ]);

  const rows = parseCsv(stationsCsv);

  const priceLookup = new Map<string, string[]>();

  for (const fuelType of oilPriceData) {
    const fuelName = fuelType.type?.en;
    if (!fuelName) {
      continue;
    }

    for (const vendor of fuelType.prices ?? []) {
      const vendorName = vendor.vendor?.en;
      const price = vendor.price?.trim();

      if (!vendorName || !price) {
        continue;
      }

      const key = normalizeBrand(vendorName);
      const existing = priceLookup.get(key) ?? [];
      existing.push(`${fuelName}: HK$${price}/L`);
      priceLookup.set(key, existing);
    }
  }

  const stations: FillingStation[] = [];

  for (const row of rows) {
    const latitude = Number(row.Latitude);
    const longitude = Number(row.Longitude);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      continue;
    }

    const brand = row['Company (English)'] || 'Unknown';
    const normalizedBrand = normalizeBrand(brand);

    stations.push({
      id: `station-${row['Sequence No.'] ?? `${latitude}-${longitude}`}`,
      brand,
      district: row['District (English)'] || 'Unknown',
      location: row['Location (English)'] || 'Unknown location',
      phone: row['Telephone No.'] || undefined,
      dedicatedSite: (row['Dedicated Site (English)'] || '').toLowerCase() === 'yes',
      coordinates: { latitude, longitude },
      prices: priceLookup.get(normalizedBrand),
    });
  }

  return stations;
}

export async function fetchFillingStations() {
  return fetchWithCache('easyparking:cache:filling-stations-v1', CACHE_MAX_AGE_MS, fetchStationsNetwork);
}
