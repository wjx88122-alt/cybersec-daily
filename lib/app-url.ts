import { readFileSync } from "node:fs";
import { join } from "node:path";

function normalizeBaseUrl(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "");
  }

  return `https://${trimmed.replace(/\/+$/, "")}`;
}

export function resolveAppBaseUrlFromSources({
  appBaseUrl,
  vercelUrl,
  linkedVercelBaseUrl,
  nextPublicAppUrl,
  requestOrigin,
}: {
  appBaseUrl?: string | null;
  vercelUrl?: string | null;
  linkedVercelBaseUrl?: string | null;
  nextPublicAppUrl?: string | null;
  requestOrigin?: string | null;
}): string {
  return (
    normalizeBaseUrl(appBaseUrl) ??
    normalizeBaseUrl(vercelUrl) ??
    normalizeBaseUrl(nextPublicAppUrl) ??
    normalizeBaseUrl(requestOrigin) ??
    normalizeBaseUrl(linkedVercelBaseUrl) ??
    "http://localhost:3000"
  );
}

function getLinkedVercelBaseUrl(): string | null {
  try {
    const file = readFileSync(join(process.cwd(), ".vercel", "project.json"), "utf8");
    const project = JSON.parse(file) as { projectName?: string };
    return normalizeBaseUrl(
      project.projectName ? `${project.projectName}.vercel.app` : null,
    );
  } catch {
    return null;
  }
}

export function resolveAppBaseUrl(requestOrigin?: string): string {
  return resolveAppBaseUrlFromSources({
    appBaseUrl: process.env.APP_BASE_URL,
    vercelUrl: process.env.VERCEL_URL,
    nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    requestOrigin,
    linkedVercelBaseUrl: getLinkedVercelBaseUrl(),
  });
}
