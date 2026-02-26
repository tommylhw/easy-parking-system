import { ParkingItem } from "@/src/types/domain";
import { fetchWithCache } from "@/src/utils/cache";
import { parseCsv } from "@/src/utils/csv";
import { fetchJson, fetchText } from "@/src/utils/http";

const CACHE_MAX_AGE_MS = 3 * 60 * 1000;

const CARPARK_INFO_URL =
  "https://api.data.gov.hk/v1/carpark-info-vacancy?data=info&lang=zh_TW";
const CARPARK_VACANCY_URL =
  "https://api.data.gov.hk/v1/carpark-info-vacancy?data=vacancy";
const METERED_SPACES_CSV_URL =
  "https://resource.data.one.gov.hk/td/psiparkingspaces/spaceinfo/parkingspaces.csv";
const METERED_OCCUPANCY_CSV_URL =
  "https://resource.data.one.gov.hk/td/psiparkingspaces/occupancystatus/occupancystatus.csv";

type CarparkInfoApiResponse = {
  results: {
    park_Id: string;
    name: string;
    district?: string;
    displayAddress?: string;
    latitude: number;
    longitude: number;
    opening_status?: string;
    openingHours?: { periodStart?: string; periodEnd?: string }[];
    privateCar?: {
      space?: number;
      hourlyCharges?: {
        price?: number;
        periodStart?: string;
        periodEnd?: string;
      }[];
      dayNightParks?: {
        price?: number;
        periodStart?: string;
        periodEnd?: string;
        type?: string;
      }[];
    };
  }[];
};

type CarparkVacancyApiResponse = {
  results: {
    park_Id: string;
    privateCar?: {
      vacancy?: number;
      lastupdate?: string;
      vacancy_type?: string;
    }[];
  }[];
};

function formatCarparkRate(
  privateCar?: CarparkInfoApiResponse["results"][number]["privateCar"],
) {
  if (!privateCar) {
    return undefined;
  }

  const hourly = privateCar.hourlyCharges?.[0];
  const dayNight = privateCar.dayNightParks?.[0];

  if (hourly?.price) {
    return `HK$${hourly.price}/hr`;
  }

  if (dayNight?.price) {
    const label = dayNight.type === "night-park" ? "night" : "day";
    return `HK$${dayNight.price}/${label}`;
  }

  return undefined;
}

function formatOpeningHours(
  openingHours?: CarparkInfoApiResponse["results"][number]["openingHours"],
  openingStatus?: string,
) {
  const first = openingHours?.[0];
  if (first?.periodStart && first?.periodEnd) {
    return `${first.periodStart}-${first.periodEnd}`;
  }

  return openingStatus || undefined;
}

async function fetchCarparksNetwork(): Promise<ParkingItem[]> {
  const [info, vacancy] = await Promise.all([
    fetchJson<CarparkInfoApiResponse>(CARPARK_INFO_URL),
    fetchJson<CarparkVacancyApiResponse>(CARPARK_VACANCY_URL),
  ]);

  const vacancyMap = new Map<
    string,
    { vacancy?: number; lastupdate?: string }
  >();

  for (const item of vacancy.results) {
    const match =
      item.privateCar?.find((slot) => slot.vacancy_type === "A") ??
      item.privateCar?.[0];
    vacancyMap.set(item.park_Id, {
      vacancy: match?.vacancy,
      lastupdate: match?.lastupdate,
    });
  }

  return info.results
    .filter(
      (item) =>
        Number.isFinite(item.latitude) && Number.isFinite(item.longitude),
    )
    .map((item) => {
      const vacancyInfo = vacancyMap.get(item.park_Id);
      return {
        id: `carpark-${item.park_Id}`,
        source: "carpark" as const,
        name: item.name,
        district: item.district || "Unknown",
        address: item.displayAddress || "Address unavailable",
        coordinates: {
          latitude: Number(item.latitude),
          longitude: Number(item.longitude),
        },
        totalSpaces: item.privateCar?.space,
        vacancy: vacancyInfo?.vacancy,
        lastUpdated: vacancyInfo?.lastupdate,
        rateSummary: formatCarparkRate(item.privateCar),
        openingHours: formatOpeningHours(
          item.openingHours,
          item.opening_status,
        ),
      };
    });
}

type MeteredGroup = {
  id: string;
  name: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  totalSpaces: number;
  vacantSpaces: number;
  operatingPeriod?: string;
  timeUnit?: string;
  paymentUnit?: string;
  latestUpdate?: string;
};

function formatMeteredRate(paymentUnit?: string, timeUnit?: string) {
  if (!paymentUnit || !timeUnit) {
    return undefined;
  }

  return `HK$${paymentUnit}/${timeUnit} min`;
}

function formatOperatingPeriod(code?: string) {
  if (!code) {
    return undefined;
  }

  const lookup: Record<string, string> = {
    D: "Daily",
    "3D": "Daily (special period)",
    "3A": "Extended period",
  };

  return lookup[code] ?? code;
}

async function fetchMeteredNetwork(): Promise<ParkingItem[]> {
  const [spacesCsv, occupancyCsv] = await Promise.all([
    fetchText(METERED_SPACES_CSV_URL),
    fetchText(METERED_OCCUPANCY_CSV_URL),
  ]);

  const spacesRows = parseCsv(spacesCsv);
  const occupancyRows = parseCsv(occupancyCsv);

  const occupancyMap = new Map<string, { status: string; updated?: string }>();

  for (const row of occupancyRows) {
    const parkingSpaceId = row.ParkingSpaceId;
    if (!parkingSpaceId) {
      continue;
    }

    occupancyMap.set(parkingSpaceId, {
      status: row.OccupancyStatus,
      updated: row.OccupancyDateChanged,
    });
  }

  const groups = new Map<string, MeteredGroup>();

  for (const row of spacesRows) {
    const poleId = row.PoleId;
    const parkingSpaceId = row.ParkingSpaceId;
    const lat = Number(row.Latitude);
    const lng = Number(row.Longitude);

    if (!poleId || !parkingSpaceId || Number.isNaN(lat) || Number.isNaN(lng)) {
      continue;
    }

    const existing = groups.get(poleId);
    const occupancy = occupancyMap.get(parkingSpaceId);
    const isVacant = occupancy?.status === "V";

    if (!existing) {
      groups.set(poleId, {
        id: poleId,
        name: `${row.Street || "Metered Parking"} ${row.SectionOfStreet ? `(${row.SectionOfStreet})` : ""}`.trim(),
        district: row.District || "Unknown",
        address: `${row.Street || ""} ${row.SectionOfStreet || ""}`.trim(),
        latitude: lat,
        longitude: lng,
        totalSpaces: 1,
        vacantSpaces: isVacant ? 1 : 0,
        operatingPeriod: row.OperatingPeriod,
        timeUnit: row.TimeUnit,
        paymentUnit: row.PaymentUnit,
        latestUpdate: occupancy?.updated,
      });
      continue;
    }

    existing.totalSpaces += 1;
    if (isVacant) {
      existing.vacantSpaces += 1;
    }

    if (
      occupancy?.updated &&
      (!existing.latestUpdate || occupancy.updated > existing.latestUpdate)
    ) {
      existing.latestUpdate = occupancy.updated;
    }
  }

  return Array.from(groups.values()).map((group) => ({
    id: `metered-${group.id}`,
    source: "metered" as const,
    name: group.name,
    district: group.district,
    address: group.address || "On-street metered spaces",
    coordinates: {
      latitude: group.latitude,
      longitude: group.longitude,
    },
    totalSpaces: group.totalSpaces,
    vacancy: group.vacantSpaces,
    lastUpdated: group.latestUpdate,
    rateSummary: formatMeteredRate(group.paymentUnit, group.timeUnit),
    openingHours: formatOperatingPeriod(group.operatingPeriod),
  }));
}

export async function fetchParkingBundle() {
  const [carparks, metered] = await Promise.all([
    fetchWithCache(
      "easyparking:cache:carparks-v1",
      CACHE_MAX_AGE_MS,
      fetchCarparksNetwork,
    ),
    fetchWithCache(
      "easyparking:cache:metered-v1",
      CACHE_MAX_AGE_MS,
      fetchMeteredNetwork,
    ),
  ]);

  return {
    carparks: carparks.data,
    metered: metered.data,
    stale: carparks.stale || metered.stale,
    updatedAt: Math.max(carparks.savedAt, metered.savedAt),
  };
}
