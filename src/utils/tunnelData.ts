import { TunnelInfo, TrafficIncident } from '@/src/types/domain';
import { fetchWithCache } from '@/src/utils/cache';
import { parseCsv } from '@/src/utils/csv';
import { fetchText } from '@/src/utils/http';

const TUNNEL_TOLL_CSV_URL = 'https://static.data.gov.hk/td/road-network-v2/TUN_BRIDGE_TOLL.csv';
const TUNNEL_TV_TOLL_CSV_URL = 'https://static.data.gov.hk/td/road-network-v2/TUN_BRIDGE_TV_TOLL.csv';

const CACHE_MAX_AGE_MS = 12 * 60 * 60 * 1000;

type BaseTunnelData = {
  tollRows: Record<string, string>[];
  tvRows: Record<string, string>[];
};

function toNumber(value: string | undefined) {
  const parsed = Number((value ?? '').trim());
  return Number.isNaN(parsed) ? undefined : parsed;
}

function dayCodeForNow(now: Date) {
  const day = now.getDay();
  return day === 0 || day === 6 ? 'B' : 'A';
}

function timeToSeconds(value: string) {
  const [hh = '0', mm = '0', ss = '0'] = value.split(':');
  return Number(hh) * 3600 + Number(mm) * 60 + Number(ss);
}

async function fetchTunnelBaseDataNetwork(): Promise<BaseTunnelData> {
  const [tollCsv, tvCsv] = await Promise.all([
    fetchText(TUNNEL_TOLL_CSV_URL),
    fetchText(TUNNEL_TV_TOLL_CSV_URL),
  ]);

  return {
    tollRows: parseCsv(tollCsv),
    tvRows: parseCsv(tvCsv),
  };
}

export async function fetchTunnelInfo(incidents: TrafficIncident[] = []): Promise<TunnelInfo[]> {
  const { data } = await fetchWithCache(
    'easyparking:cache:tunnel-data-v1',
    CACHE_MAX_AGE_MS,
    fetchTunnelBaseDataNetwork
  );

  const now = new Date();
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const dayCode = dayCodeForNow(now);

  const grouped = new Map<string, TunnelInfo>();

  for (const row of data.tollRows) {
    const name = row.TUNNEL_BRIDGE_NAME;
    if (!name || !name.toLowerCase().includes('tunnel')) {
      continue;
    }

    const vehicleClass = row.VEHICLE_CLASS_DESCRIPTION || '';
    const toll = toNumber(row.CONCESSION_TOLL) ?? toNumber(row.GAZETTED_TOLL);

    const existing =
      grouped.get(name) ??
      ({
        id: `tunnel-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        name,
        nameZh: row.TUNNEL_BRIDGE_CHINESE_NAME,
        vehicleClassCount: 0,
        currentPcToll: undefined,
        lastUpdated: row.LAST_UPDATED_DATE,
        status: 'Normal',
      } satisfies TunnelInfo);

    existing.vehicleClassCount += 1;

    if (vehicleClass === 'PC' && toll !== undefined) {
      existing.currentPcToll = toll;
    }

    if (!existing.lastUpdated && row.LAST_UPDATED_DATE) {
      existing.lastUpdated = row.LAST_UPDATED_DATE;
    }

    grouped.set(name, existing);
  }

  for (const row of data.tvRows) {
    const name = row.TUNNEL_BRIDGE_NAME;
    if (!name || !name.toLowerCase().includes('tunnel')) {
      continue;
    }

    const vehicleClass = row.VEHICLE_CLASS_DESCRIPTION;
    if (vehicleClass !== 'PC') {
      continue;
    }

    const rowDayCode = row.DAY_OF_WEEK;
    if (rowDayCode !== dayCode) {
      continue;
    }

    const startTime = row.START_TIME;
    const endTime = row.END_TIME;
    if (!startTime || !endTime) {
      continue;
    }

    const startSec = timeToSeconds(startTime);
    const endSec = timeToSeconds(endTime);
    if (nowSec < startSec || nowSec > endSec) {
      continue;
    }

    const existing = grouped.get(name);
    if (!existing) {
      continue;
    }

    const tvToll = toNumber(row.GAZETTED_TOLL);
    if (tvToll !== undefined) {
      existing.currentPcToll = tvToll;
    }
  }

  const searchableIncidents = incidents
    .filter((incident) => incident.isAccident || incident.isCongestion)
    .map((incident) => ({
      ...incident,
      normalizedSummary: incident.summary.toLowerCase(),
    }));

  for (const tunnel of grouped.values()) {
    const normalizedEn = tunnel.name.toLowerCase();
    const normalizedZh = (tunnel.nameZh || '').toLowerCase();

    const matched = searchableIncidents.find(
      (incident) =>
        incident.normalizedSummary.includes(normalizedEn) ||
        (normalizedZh.length > 0 && incident.summary.includes(tunnel.nameZh || ''))
    );

    if (matched) {
      tunnel.status = 'Incident reported';
      tunnel.relatedIncident = matched.summary;
    }
  }

  return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name));
}
