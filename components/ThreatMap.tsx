"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SystemIcon } from "@/components/ui/SystemIcon";
import { getArcLiftFactor } from "@/lib/threat-map";
import { mdrDeviceStatusHex, mdrSeverityHex } from "@/app/(ops)/mdr/theme";
import type {
  AttackOperationsSnapshot,
  ThreatMapEvent,
  ThreatMapLocation,
} from "@/lib/attack-data-source";

/* ── Orthographic projection helpers ── */
function toRadians(deg: number) { return (deg * Math.PI) / 180; }
function roundSvgCoord(value: number) { return Number(value.toFixed(3)); }
function svgCoord(value: number) { return roundSvgCoord(value).toString(); }
function svgPoint(x: number, y: number) { return `${svgCoord(x)},${svgCoord(y)}`; }

// Project lat/lon to orthographic (returns null if on back side)
function orthoProject(lat: number, lon: number, centerLat: number, centerLon: number, R: number, cx: number, cy: number): { x: number; y: number; visible: boolean } {
  const φ = toRadians(lat);
  const λ = toRadians(lon);
  const φ0 = toRadians(centerLat);
  const λ0 = toRadians(centerLon);
  const cosC = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ - λ0);
  const x = cx + R * Math.cos(φ) * Math.sin(λ - λ0);
  const y = cy - R * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ - λ0));
  return { x: roundSvgCoord(x), y: roundSvgCoord(y), visible: cosC > 0 };
}

/* ── World coastline data (simplified lat/lon polygons) ── */
const LAND_POLYGONS: { name: string; coords: [number, number][] }[] = [
  // North America
  { name: "NA", coords: [[50,-130],[55,-125],[60,-140],[65,-165],[70,-160],[72,-155],[70,-140],[68,-130],[65,-120],[60,-110],[55,-105],[50,-100],[48,-90],[45,-82],[42,-78],[40,-75],[38,-76],[35,-78],[30,-82],[28,-85],[25,-80],[25,-82],[28,-90],[30,-95],[28,-97],[26,-97],[22,-98],[18,-96],[16,-92],[15,-88],[18,-88],[20,-87],[22,-85],[25,-80],[30,-82],[32,-80],[35,-75],[38,-72],[40,-70],[42,-68],[44,-66],[46,-64],[48,-66],[50,-60],[52,-58],[55,-60],[58,-65],[60,-70],[62,-75],[64,-80],[65,-85],[65,-95],[63,-100],[60,-105],[58,-110],[55,-115],[52,-120],[50,-125],[50,-130]] },
  // South America
  { name: "SA", coords: [[12,-72],[10,-75],[8,-77],[5,-77],[2,-80],[0,-80],[-2,-80],[-5,-78],[-8,-76],[-10,-78],[-12,-77],[-15,-75],[-18,-70],[-20,-65],[-22,-60],[-25,-55],[-28,-50],[-30,-50],[-33,-52],[-35,-55],[-38,-58],[-40,-62],[-42,-65],[-45,-68],[-48,-72],[-50,-74],[-52,-70],[-54,-68],[-55,-66],[-52,-62],[-48,-58],[-45,-55],[-42,-52],[-38,-48],[-35,-45],[-32,-42],[-28,-40],[-25,-38],[-22,-40],[-18,-42],[-15,-40],[-12,-38],[-8,-35],[-5,-35],[-2,-38],[0,-42],[2,-48],[5,-55],[8,-62],[10,-68],[12,-72]] },
  // Europe
  { name: "EU", coords: [[36,-8],[38,-5],[40,0],[42,3],[44,5],[46,2],[48,0],[50,-5],[52,-2],[54,0],[56,5],[58,8],[60,10],[62,12],[64,15],[66,18],[68,20],[70,25],[70,30],[68,32],[65,28],[62,22],[60,18],[58,15],[56,12],[54,10],[52,8],[50,5],[48,8],[46,10],[44,12],[42,15],[40,18],[38,22],[36,25],[35,22],[36,18],[38,15],[40,12],[42,8],[40,5],[38,2],[36,0],[36,-5],[36,-8]] },
  // Africa
  { name: "AF", coords: [[35,-5],[37,10],[35,12],[33,10],[30,10],[28,12],[25,15],[22,18],[20,20],[18,22],[15,20],[12,15],[10,10],[8,5],[5,2],[2,5],[0,8],[-2,10],[-5,12],[-8,15],[-10,18],[-12,22],[-15,25],[-18,28],[-20,30],[-22,32],[-25,35],[-28,32],[-30,30],[-32,28],[-34,25],[-35,20],[-33,18],[-30,15],[-28,12],[-25,15],[-22,18],[-18,20],[-15,18],[-12,15],[-10,12],[-8,8],[-5,5],[-2,2],[0,0],[2,-2],[5,-5],[8,-8],[10,-10],[12,-12],[15,-15],[18,-16],[20,-15],[22,-12],[25,-10],[28,-8],[30,-5],[32,-2],[35,-5]] },
  // Asia (mainland)
  { name: "AS", coords: [[42,30],[45,35],[48,40],[50,45],[52,50],[55,55],[58,60],[60,65],[62,70],[65,75],[68,80],[70,85],[72,90],[72,100],[70,110],[68,120],[65,125],[62,130],[60,135],[58,140],[55,135],[52,130],[50,125],[48,120],[45,115],[42,110],[40,108],[38,105],[35,100],[32,95],[30,90],[28,85],[25,80],[22,78],[20,75],[18,72],[15,70],[12,72],[10,75],[8,78],[5,80],[2,78],[0,75],[-2,72],[-5,70],[-8,72],[-5,75],[-2,78],[0,80],[5,82],[10,80],[15,78],[18,80],[20,82],[22,85],[25,88],[28,90],[30,85],[32,80],[35,75],[38,70],[40,65],[42,60],[40,55],[38,50],[36,45],[38,40],[40,35],[42,30]] },
  // India
  { name: "IN", coords: [[30,70],[28,72],[25,75],[22,78],[20,80],[18,78],[15,76],[12,78],[10,78],[8,77],[8,75],[10,72],[12,70],[15,72],[18,74],[20,75],[22,72],[25,70],[28,68],[30,70]] },
  // Australia
  { name: "AU", coords: [[-12,130],[-14,128],[-16,125],[-18,122],[-20,118],[-22,115],[-25,114],[-28,115],[-30,118],[-32,120],[-34,122],[-35,125],[-36,130],[-38,135],[-38,140],[-37,145],[-35,148],[-33,150],[-30,152],[-28,153],[-25,152],[-22,150],[-20,148],[-18,145],[-16,142],[-14,140],[-12,138],[-11,135],[-12,130]] },
  // Japan
  { name: "JP", coords: [[32,130],[34,132],[36,135],[38,138],[40,140],[42,142],[44,145],[43,144],[41,142],[39,140],[37,138],[35,136],[33,134],[31,132],[32,130]] },
  // UK
  { name: "UK", coords: [[50,-5],[51,-3],[52,-1],[53,0],[54,0],[55,-2],[56,-3],[57,-5],[58,-5],[59,-3],[58,-2],[56,0],[55,1],[54,1],[53,0],[52,-1],[51,-2],[50,-5]] },
];

type VisualArc = ThreatMapEvent & {
  progress: number;
  speed: number;
};

const PROTECTED_FALLBACK_LOCATIONS: ThreatMapLocation[] = [
  { city: "Nanjing", countryCode: "CN", countryName: "China", lat: 32.1, lon: 118.8 },
  { city: "Shanghai", countryCode: "CN", countryName: "China", lat: 31.2, lon: 121.5 },
  { city: "Singapore", countryCode: "SG", countryName: "Singapore", lat: 1.3, lon: 103.8 },
  { city: "Tokyo", countryCode: "JP", countryName: "Japan", lat: 35.7, lon: 139.7 },
  { city: "Sydney", countryCode: "AU", countryName: "Australia", lat: -33.9, lon: 151.2 },
];
const EMPTY_MAP_EVENTS: ThreatMapEvent[] = [];

function speedForSeverity(severity: ThreatMapEvent["severity"]) {
  if (severity === "critical") return 0.006;
  if (severity === "high") return 0.0048;
  return 0.0038;
}

function formatCompact(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatSyncTime(value?: string) {
  if (!value) return "同步中";
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "同步中";

  return new Date(parsed).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function uniqueLocations(locations: ThreatMapLocation[]) {
  const seen = new Set<string>();
  return locations.filter((location) => {
    const key = `${location.city}-${location.countryCode}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildVisiblePathSegments(points: { x: number; y: number; visible: boolean }[]) {
  const segments: string[] = [];
  let current: string[] = [];

  for (const point of points) {
    if (!point.visible) {
      if (current.length > 1) segments.push(current.join(" "));
      current = [];
      continue;
    }

    current.push(`${current.length === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`);
  }

  if (current.length > 1) segments.push(current.join(" "));
  return segments;
}

// Great circle interpolation
function geoInterp(from: { lat: number; lon: number }, to: { lat: number; lon: number }, t: number): { lat: number; lon: number } {
  const φ1 = toRadians(from.lat), λ1 = toRadians(from.lon);
  const φ2 = toRadians(to.lat), λ2 = toRadians(to.lon);
  const d = Math.acos(Math.sin(φ1) * Math.sin(φ2) + Math.cos(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1));
  if (d < 0.001) return from;
  const A = Math.sin((1 - t) * d) / Math.sin(d);
  const B = Math.sin(t * d) / Math.sin(d);
  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
  const z = A * Math.sin(φ1) + B * Math.sin(φ2);
  return { lat: Math.atan2(z, Math.sqrt(x * x + y * y)) * 180 / Math.PI, lon: Math.atan2(y, x) * 180 / Math.PI };
}

const GLOBE_R = 175;
const GLOBE_CX = 400;
const GLOBE_CY = 210;

export default function ThreatMap({
  snapshot,
  loading = false,
  error = "",
}: {
  snapshot?: AttackOperationsSnapshot | null;
  loading?: boolean;
  error?: string;
}) {
  const [arcs, setArcs] = useState<VisualArc[]>([]);
  const [latestAttack, setLatestAttack] = useState<ThreatMapEvent | null>(null);
  const [rotation, setRotation] = useState(80); // center longitude
  const frameRef = useRef<number>(0);
  const events = snapshot?.mapEvents ?? EMPTY_MAP_EVENTS;
  const totalReports = events.reduce((sum, event) => sum + event.reports, 0);
  const protectedLocations = uniqueLocations(
    events.length > 0
      ? events.map((event) => event.destination)
      : PROTECTED_FALLBACK_LOCATIONS,
  );
  const sourceLocations = uniqueLocations(events.map((event) => event.source));

  const proj = useCallback((lat: number, lon: number) => {
    return orthoProject(lat, lon, 20, rotation, GLOBE_R, GLOBE_CX, GLOBE_CY);
  }, [rotation]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const visualArcs = events.map((event, index) => ({
        ...event,
        progress: (index * 0.17) % 0.82,
        speed: speedForSeverity(event.severity),
      }));

      setArcs(visualArcs);
      setLatestAttack(visualArcs[0] ?? null);
    });

    return () => cancelAnimationFrame(frame);
  }, [events]);

  useEffect(() => {
    const animate = () => {
      setArcs((prev) => {
        const completed: ThreatMapEvent[] = [];
        const next = prev.map((arc) => {
          const progress = arc.progress + arc.speed;
          if (progress >= 1) {
            completed.push(arc);
            return { ...arc, progress: 0 };
          }
          return { ...arc, progress };
        });

        if (completed.length > 0) {
          setLatestAttack(completed[0]);
        }

        return next;
      });
      setRotation((r) => (r + 0.08) % 360);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  // Project land polygons
  const landPaths = LAND_POLYGONS.map((poly) => {
    const points = poly.coords.map(([lat, lon]) => proj(lat, lon)).filter((p) => p.visible);
    if (points.length < 3) return null;
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
  });

  // Project attack arcs as great circle segments
  const projectedArcs = arcs.map((arc) => {
    const colors = {
      stroke: mdrSeverityHex(arc.severity),
      particle: mdrSeverityHex(arc.severity),
    };
    // Sample points along great circle up to progress
    const pts: { x: number; y: number; visible: boolean }[] = [];
    const steps = 30;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * arc.progress;
      const geo = geoInterp(arc.source, arc.destination, t);
      // Lift above surface
      const liftT = getArcLiftFactor(arc.progress, t);
      const p = orthoProject(geo.lat, geo.lon, 20, rotation, GLOBE_R * (1 + liftT), GLOBE_CX, GLOBE_CY);
      pts.push(p);
    }
    const visiblePts = pts.filter((p) => p.visible);
    const headGeo = geoInterp(arc.source, arc.destination, arc.progress);
    const head = orthoProject(
      headGeo.lat,
      headGeo.lon,
      20,
      rotation,
      GLOBE_R * (1 + getArcLiftFactor(1, arc.progress)),
      GLOBE_CX,
      GLOBE_CY,
    );
    const pathSegments = buildVisiblePathSegments(pts);
    // Impact point (on surface)
    const toProj = proj(arc.destination.lat, arc.destination.lon);
    return { arc, colors, pathSegments, head, toProj, visiblePts };
  });

  return (
    <div className="mdr-board-card rounded-xl p-4 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(circle at 50% 50%, rgba(37,99,235,0.05) 0%, transparent 70%)",
      }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-bold tracking-wide text-slate-800">
            <SystemIcon className="system-icon" name="globe" size={15} />
            全球威胁态势感知
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: mdrSeverityHex("critical") }} />
            <span className="text-[10px] font-medium text-red-700">LIVE</span>
          </span>
        </div>
        <div className="flex items-center gap-5 text-[11px]">
          <div className="text-center"><div className="font-mono font-bold text-base" style={{ color: mdrDeviceStatusHex("online") }}>{formatCompact(totalReports)}</div><div className="text-slate-500 text-[9px]">DShield reports</div></div>
          <div className="text-center"><div className="font-mono font-bold text-base" style={{ color: mdrSeverityHex("critical") }}>{events.length}</div><div className="text-slate-500 text-[9px]">真实事件</div></div>
          <div className="text-center"><div className="text-blue-600 font-mono font-bold text-base">{protectedLocations.length}</div><div className="text-slate-500 text-[9px]">防护节点</div></div>
        </div>
      </div>

      <svg viewBox="0 0 800 430" className="w-full relative z-10">
        <defs>
          <filter id="g-glow"><feGaussianBlur stdDeviation="3" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="g-glow-sm"><feGaussianBlur stdDeviation="1.5" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <radialGradient id="globe-bg" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#1e3a5f" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#0a1628" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#040810" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="globe-atmo" cx="50%" cy="50%">
            <stop offset="85%" stopColor="transparent" />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
          </radialGradient>
          <radialGradient id="def-glow"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></radialGradient>
        </defs>

        {/* Globe sphere */}
        <circle cx={GLOBE_CX} cy={GLOBE_CY} r={GLOBE_R + 8} fill="none" stroke="#3b82f6" strokeWidth="0.3" opacity="0.2" />
        <circle cx={GLOBE_CX} cy={GLOBE_CY} r={GLOBE_R} fill="url(#globe-bg)" stroke="#1e3a5f" strokeWidth="0.8" />

        {/* Graticule (lat/lon grid on sphere) */}
        {[-60, -30, 0, 30, 60].map((lat) => {
          const pts: { x: number; y: number; visible: boolean }[] = [];
          for (let lon = -180; lon <= 180; lon += 5) {
            pts.push(proj(lat, lon));
          }
          return buildVisiblePathSegments(pts).map((pathD, index) => (
            <path key={`lat${lat}-${index}`} d={pathD} fill="none" stroke="#1e3a5f" strokeWidth="0.3" opacity="0.5" />
          ));
        })}
        {Array.from({ length: 12 }, (_, i) => (i * 30) - 180).map((lon) => {
          const pts: { x: number; y: number; visible: boolean }[] = [];
          for (let lat = -80; lat <= 80; lat += 5) {
            pts.push(proj(lat, lon));
          }
          return buildVisiblePathSegments(pts).map((pathD, index) => (
            <path key={`lon${lon}-${index}`} d={pathD} fill="none" stroke="#1e3a5f" strokeWidth="0.3" opacity="0.5" />
          ));
        })}

        {/* Land masses */}
        {landPaths.map((d, i) => d && (
          <path key={i} d={d} fill="rgba(37,99,235,0.12)" stroke="rgba(96,165,250,0.3)" strokeWidth="0.6" strokeLinejoin="round" />
        ))}

        {/* Atmosphere glow */}
        <circle cx={GLOBE_CX} cy={GLOBE_CY} r={GLOBE_R} fill="url(#globe-atmo)" />

        {/* Attack arcs */}
        {projectedArcs.map(({ arc, colors, pathSegments, head, toProj, visiblePts }) => (
          <g key={arc.id}>
            {pathSegments.map((pathD, index) => (
              <g key={`${arc.id}-path-${index}`}>
                <path d={pathD} fill="none" stroke={colors.stroke} strokeWidth="1.5" opacity={0.55} />
                <path d={pathD} fill="none" stroke={colors.stroke} strokeWidth="4" opacity={0.08} filter="url(#g-glow)" />
              </g>
            ))}
            {head.visible && <>
              <circle cx={svgCoord(head.x)} cy={svgCoord(head.y)} r={3} fill={colors.particle} filter="url(#g-glow-sm)">
                <animate attributeName="r" values="2;4;2" dur="0.4s" repeatCount="indefinite" />
              </circle>
              {/* Trail particles */}
              {visiblePts.slice(-5).map((p, i) => (
                <circle key={i} cx={svgCoord(p.x)} cy={svgCoord(p.y)} r={1.5 - i * 0.2} fill={colors.particle} opacity={0.5 - i * 0.08} />
              ))}
            </>}
            {/* Impact */}
            {arc.progress > 0.88 && toProj.visible && (
              <circle cx={svgCoord(toProj.x)} cy={svgCoord(toProj.y)} r={(arc.progress - 0.88) * 120} fill="none" stroke={colors.stroke} strokeWidth="1" opacity={1 - (arc.progress - 0.88) * 8} />
            )}
          </g>
        ))}

        {/* Source locations */}
        {sourceLocations.map((location) => {
          const p = proj(location.lat, location.lon);
          if (!p.visible) return null;
          return (
            <g key={`${location.city}-${location.countryCode}`}>
              <circle cx={svgCoord(p.x)} cy={svgCoord(p.y)} r={2.4} fill="#ef4444" opacity={0.8} filter="url(#g-glow-sm)" />
              <text x={svgCoord(p.x)} y={svgCoord(p.y - 6)} textAnchor="middle" fontSize={6.4} fill="#64748b" opacity={0.75}>{location.city}</text>
            </g>
          );
        })}

        {/* Defended locations */}
        {protectedLocations.map((location) => {
          const p = proj(location.lat, location.lon);
          if (!p.visible) return null;
          return (
            <g key={`${location.city}-${location.countryCode}`}>
              <circle cx={svgCoord(p.x)} cy={svgCoord(p.y)} r={16} fill="url(#def-glow)" />
              <circle cx={svgCoord(p.x)} cy={svgCoord(p.y)} r={7} fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3">
                <animate attributeName="r" values="7;14;7" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
              </circle>
              <polygon points={`${svgPoint(p.x, p.y - 5)} ${svgPoint(p.x + 4.3, p.y - 2.5)} ${svgPoint(p.x + 4.3, p.y + 2.5)} ${svgPoint(p.x, p.y + 5)} ${svgPoint(p.x - 4.3, p.y + 2.5)} ${svgPoint(p.x - 4.3, p.y - 2.5)}`}
                fill="#3b82f6" fillOpacity="0.3" stroke="#60a5fa" strokeWidth="0.8" />
              <circle cx={svgCoord(p.x)} cy={svgCoord(p.y)} r={2} fill="#60a5fa" filter="url(#g-glow-sm)" />
              <text x={svgCoord(p.x)} y={svgCoord(p.y - 9)} textAnchor="middle" fontSize={7.5} fill="#93c5fd" fontWeight={600}>{location.city}</text>
            </g>
          );
        })}

        {/* Specular highlight */}
        <ellipse cx={GLOBE_CX - 40} cy={GLOBE_CY - 50} rx={60} ry={40} fill="white" opacity="0.015" />
      </svg>

      {/* Latest attack */}
      {latestAttack && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] relative z-10">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: mdrSeverityHex(latestAttack.severity) }} />
          <span className="text-slate-500">最新遥测:</span>
          <span className="text-slate-800 font-medium">{latestAttack.source.city}</span>
          <span className="text-slate-500">→</span>
          <span className="text-blue-600 font-medium">{latestAttack.destination.city}</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: `${mdrSeverityHex(latestAttack.severity)}15`, color: mdrSeverityHex(latestAttack.severity) }}>
            {latestAttack.category}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 font-medium" style={{ color: mdrDeviceStatusHex("online") }}>
            <SystemIcon className="system-icon" name="check" size={12} />
            {formatCompact(latestAttack.reports)} reports
          </span>
        </div>
      )}

      {!latestAttack && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-[10px] text-slate-500 relative z-10">
          <SystemIcon className="system-icon" name="radar" size={12} />
          {loading ? "正在同步 SANS ISC/DShield 全球攻击遥测..." : error || "暂无可绘制的全球威胁遥测"}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-100 bg-white/75 px-3 py-2 text-[9px] text-slate-500 relative z-10">
        <span className="flex items-center gap-1.5">
          <SystemIcon className="system-icon" name="database" size={11} />
          SANS ISC/DShield Top IP + CISA KEV
        </span>
        <span>同步 {formatSyncTime(snapshot?.updatedAt)} · {snapshot?.degraded ? "部分源降级" : "来源在线"}</span>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-2 text-[9px] text-slate-500 relative z-10">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: mdrSeverityHex("critical") }} />严重</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: mdrSeverityHex("high") }} />高危</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: mdrSeverityHex("medium") }} />中危</span>
        <span className="flex items-center gap-1">
          <svg width="10" height="10"><polygon points="5,0 8.7,2.5 8.7,7.5 5,10 1.3,7.5 1.3,2.5" fill="#3b82f6" fillOpacity="0.5" stroke="#60a5fa" strokeWidth="0.8" /></svg>
          防护节点
        </span>
      </div>
    </div>
  );
}
