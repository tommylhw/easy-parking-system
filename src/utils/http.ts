const DEFAULT_TIMEOUT_MS = 12000;

async function fetchWithTimeout(url: string, timeoutMs = DEFAULT_TIMEOUT_MS, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} for ${url}`);
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchJson<T>(url: string, timeoutMs?: number): Promise<T> {
  const response = await fetchWithTimeout(url, timeoutMs);
  return (await response.json()) as T;
}

export async function fetchText(url: string, timeoutMs?: number): Promise<string> {
  const response = await fetchWithTimeout(url, timeoutMs);
  return response.text();
}
