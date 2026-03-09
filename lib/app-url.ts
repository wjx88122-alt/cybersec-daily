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
  return (
    normalizeBaseUrl(process.env.APP_BASE_URL) ??
    normalizeBaseUrl(process.env.VERCEL_URL) ??
    getLinkedVercelBaseUrl() ??
    normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL) ??
    normalizeBaseUrl(requestOrigin) ??
    "http://localhost:3000"
  );
}
