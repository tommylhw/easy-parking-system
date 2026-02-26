import { fetchWithCache } from '@/src/utils/cache';
import { fetchText } from '@/src/utils/http';
import { TrafficIncident } from '@/src/types/domain';

const CACHE_MAX_AGE_MS = 2 * 60 * 1000;

const RTHK_TRAFFIC_URL = 'https://programme.rthk.hk/channel/radio/trafficnews/index.php';
const TD_SPECIAL_TRAFFIC_NEWS_XML = 'https://resource.data.one.gov.hk/td/en/specialtrafficnews.xml';

function decodeEntities(text: string) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function buildIncident(summary: string, timestamp: string | undefined, source: 'RTHK' | 'TD', id: string) {
  const accidentRegex = /(accident|交通意外|意外|撞車|壞車|vehicle breakdown)/i;
  const congestionRegex = /(traffic jam|congestion|擠塞|塞車|車龍|slow traffic|慢駛)/i;

  return {
    id,
    summary,
    timestamp,
    source,
    isAccident: accidentRegex.test(summary),
    isCongestion: congestionRegex.test(summary),
  } satisfies TrafficIncident;
}

function parseRthkHtml(html: string): TrafficIncident[] {
  const incidents: TrafficIncident[] = [];
  const listRegex = /<li\s+class="inner">([\s\S]*?)<div\s+class="date">([\s\S]*?)<\/div>[\s\S]*?<\/li>/gi;

  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = listRegex.exec(html)) !== null) {
    const rawSummary = match[1].replace(/<[^>]+>/g, ' ').trim();
    const rawTimestamp = match[2].replace(/<[^>]+>/g, ' ').trim();

    const summary = decodeEntities(rawSummary);
    if (!summary) {
      continue;
    }

    incidents.push(buildIncident(summary, decodeEntities(rawTimestamp), 'RTHK', `rthk-${index}`));
    index += 1;
  }

  return incidents;
}

function parseSpecialTrafficNewsXml(xml: string): TrafficIncident[] {
  const incidents: TrafficIncident[] = [];
  const messageRegex = /<message>([\s\S]*?)<\/message>/gi;

  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = messageRegex.exec(xml)) !== null) {
    const block = match[1];

    const summaryMatch = block.match(/<EngShort>([\s\S]*?)<\/EngShort>/i);
    const dateMatch = block.match(/<ReferenceDate>([\s\S]*?)<\/ReferenceDate>/i);

    const summary = decodeEntities((summaryMatch?.[1] ?? '').replace(/<[^>]+>/g, ' '));
    if (!summary) {
      continue;
    }

    const timestamp = decodeEntities(dateMatch?.[1] ?? '');
    incidents.push(buildIncident(summary, timestamp || undefined, 'TD', `td-${index}`));
    index += 1;
  }

  return incidents;
}

async function fetchTrafficNetwork() {
  const [rthkHtml, tdXml] = await Promise.all([
    fetchText(RTHK_TRAFFIC_URL),
    fetchText(TD_SPECIAL_TRAFFIC_NEWS_XML),
  ]);

  const rthkIncidents = parseRthkHtml(rthkHtml);
  const tdIncidents = parseSpecialTrafficNewsXml(tdXml);

  const merged = [...rthkIncidents, ...tdIncidents];

  return {
    all: merged,
    alerts: merged.filter((item) => item.isAccident || item.isCongestion),
  };
}

export async function fetchTrafficIncidents() {
  return fetchWithCache('easyparking:cache:traffic-incidents-v1', CACHE_MAX_AGE_MS, fetchTrafficNetwork);
}
