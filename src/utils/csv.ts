function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

export function parseCsv(csvText: string): Record<string, string>[] {
  const sanitized = csvText.replace(/^\uFEFF/, '');
  const rawLines = sanitized.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (rawLines.length < 2) {
    return [];
  }

  let headerIndex = 0;
  while (headerIndex < rawLines.length && !rawLines[headerIndex].includes(',')) {
    headerIndex += 1;
  }

  if (headerIndex >= rawLines.length) {
    return [];
  }

  const headers = splitCsvLine(rawLines[headerIndex]);
  const rows: Record<string, string>[] = [];

  for (let i = headerIndex + 1; i < rawLines.length; i += 1) {
    const values = splitCsvLine(rawLines[i]);
    if (values.length === 1 && values[0] === '') {
      continue;
    }

    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]] = values[j] ?? '';
    }
    rows.push(row);
  }

  return rows;
}
