import type { JSX, SVGProps } from "react";

export type SystemIconName =
  | "activity"
  | "alert"
  | "arrowRight"
  | "briefcase"
  | "case"
  | "chart"
  | "check"
  | "clock"
  | "database"
  | "download"
  | "external"
  | "eye"
  | "file"
  | "filter"
  | "globe"
  | "list"
  | "lock"
  | "map"
  | "network"
  | "plug"
  | "radar"
  | "refresh"
  | "save"
  | "search"
  | "server"
  | "shield"
  | "spark"
  | "target"
  | "timeline"
  | "user"
  | "users"
  | "workflow"
  | "x";

const ICON_PATHS: Record<SystemIconName, JSX.Element> = {
  activity: <path d="M4 12h4l2-6 4 12 2-6h4" />,
  alert: (
    <>
      <path d="M12 4 3.6 18.5h16.8L12 4Z" />
      <path d="M12 9v4" />
      <path d="M12 16h.01" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  briefcase: (
    <>
      <rect x="3.5" y="7" width="17" height="12" rx="2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M3.5 12h17" />
    </>
  ),
  case: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 16v-4M12 16V8M16 16v-6" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="3" />
      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6" />
      <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v10" />
      <path d="m8 10 4 4 4-4" />
      <path d="M5 20h14" />
    </>
  ),
  external: <path d="M7 17 17 7M17 7H8M17 7v9" />,
  eye: (
    <>
      <path d="M3.5 12s3-5 8.5-5 8.5 5 8.5 5-3 5-8.5 5-8.5-5-8.5-5Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  file: (
    <>
      <path d="M7 3h7l4 4v14H7V3Z" />
      <path d="M14 3v5h4" />
      <path d="M9 13h6M9 17h5" />
    </>
  ),
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4a13 13 0 0 1 0 16" />
      <path d="M12 4a13 13 0 0 0 0 16" />
    </>
  ),
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  map: (
    <>
      <path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2V6Z" />
      <path d="M9 4v14M15 6v14" />
    </>
  ),
  network: (
    <>
      <rect x="4" y="4" width="6" height="6" rx="1.5" />
      <rect x="14" y="4" width="6" height="6" rx="1.5" />
      <rect x="9" y="14" width="6" height="6" rx="1.5" />
      <path d="M10 7h4M12 10v4" />
    </>
  ),
  plug: (
    <>
      <path d="M8 4v5M16 4v5" />
      <path d="M6 9h12v3a6 6 0 0 1-12 0V9Z" />
      <path d="M12 18v3" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 4a8 8 0 0 1 8 8" />
      <path d="M12 8a4 4 0 0 1 4 4" />
      <path d="M12 20a8 8 0 0 1-8-8" />
      <path d="m12 12 5-5" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 0 1-13.5 5.8" />
      <path d="M4 12A8 8 0 0 1 17.5 6.2" />
      <path d="M17 3v4h-4" />
      <path d="M7 21v-4h4" />
    </>
  ),
  save: (
    <>
      <path d="M5 4h12l2 2v14H5V4Z" />
      <path d="M8 4v6h8" />
      <path d="M8 20v-6h8v6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </>
  ),
  server: (
    <>
      <rect x="4" y="4" width="16" height="6" rx="2" />
      <rect x="4" y="14" width="16" height="6" rx="2" />
      <path d="M8 7h.01M8 17h.01" />
    </>
  ),
  shield: <path d="m12 3 7 3v6c0 4.5-2.8 7.6-7 9-4.2-1.4-7-4.5-7-9V6l7-3Z" />,
  spark: (
    <>
      <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
      <path d="m18 16 .8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8L18 16Z" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  timeline: (
    <>
      <path d="M5 5v14" />
      <circle cx="5" cy="7" r="2" />
      <circle cx="5" cy="17" r="2" />
      <path d="M9 7h10M9 17h10" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M15 5.5a3 3 0 0 1 0 5" />
      <path d="M17 14a5 5 0 0 1 3.5 4.5" />
    </>
  ),
  workflow: (
    <>
      <rect x="3.5" y="4" width="6" height="6" rx="1.5" />
      <rect x="14.5" y="14" width="6" height="6" rx="1.5" />
      <path d="M9.5 7h3a4 4 0 0 1 4 4v3" />
      <path d="m13.5 11 3 3 3-3" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
};

export function SystemIcon({
  name,
  size = 18,
  strokeWidth = 1.8,
  title,
  className = "",
  ...props
}: SVGProps<SVGSVGElement> & {
  name: SystemIconName;
  size?: number;
  title?: string;
}) {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={className}
      fill="none"
      height={size}
      role={title ? "img" : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {ICON_PATHS[name]}
    </svg>
  );
}
