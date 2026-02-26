export function formatTimestamp(value?: string | number) {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'number') {
    return new Date(value).toLocaleString();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export function formatDistanceKm(distance?: number) {
  if (distance === undefined) {
    return undefined;
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  return `${distance.toFixed(1)} km`;
}
