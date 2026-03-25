export function getShanghaiDateStamp(value: string | number | Date = new Date()): string {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
