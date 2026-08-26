const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000_000],
  ["month", 2_592_000_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function relativeTime(date: string | Date) {
  const elapsed = new Date(date).getTime() - Date.now();
  const magnitude = Math.abs(elapsed);

  for (const [unit, ms] of UNITS) {
    if (magnitude >= ms) {
      return formatter.format(Math.round(elapsed / ms), unit);
    }
  }
  return "just now";
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDurationMs(ms: number) {
  return `${Number(ms.toFixed(2))}ms`;
}
