export function formatShanghaiDateTime(date = new Date()) {
  return date.toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour12: false,
  });
}

export function getArcLiftFactor(progress: number, t: number) {
  if (!Number.isFinite(progress) || progress <= 0) {
    return 0;
  }

  const normalized = Math.min(Math.max(t / progress, 0), 1);
  return Math.sin(normalized * Math.PI) * 0.15;
}
