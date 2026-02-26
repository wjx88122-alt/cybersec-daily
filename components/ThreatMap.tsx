"use client";

import { useState, useEffect, useRef } from "react";

/* ── City coordinates on a 800x400 equirectangular projection ── */
const CITIES: Record<string, { x: number; y: number; label: string }> = {
  beijing: { x: 580, y: 140, label: "北京" },
  shanghai: { x: 600, y: 165, label: "上海" },
  nanjing: { x: 592, y: 158, label: "南京" },
  shenzhen: { x: 575, y: 185, label: "深圳" },
  moscow: { x: 440, y: 105, label: "莫斯科" },
  tokyo: { x: 645, y: 145, label: "东京" },
  seoul: { x: 620, y: 145, label: "首尔" },
  mumbai: { x: 500, y: 195, label: "孟买" },
  singapore: { x: 560, y: 230, label: "新加坡" },
  sydney: { x: 670, y: 310, label: "悉尼" },
  london: { x: 350, y: 110, label: "伦敦" },
  berlin: { x: 375, y: 108, label: "柏林" },
  paris: { x: 355, y: 118, label: "巴黎" },
  newYork: { x: 195, y: 140, label: "纽约" },
  washington: { x: 200, y: 148, label: "华盛顿" },
  losAngeles: { x: 130, y: 155, label: "洛杉矶" },
  chicago: { x: 175, y: 135, label: "芝加哥" },
  saoPaulo: { x: 240, y: 285, label: "圣保罗" },
  dubai: { x: 470, y: 180, label: "迪拜" },
  cairo: { x: 415, y: 170, label: "开罗" },
  lagos: { x: 360, y: 220, label: "拉各斯" },
  johannesburg: { x: 410, y: 300, label: "约翰内斯堡" },
  toronto: { x: 190, y: 128, label: "多伦多" },
  tehran: { x: 465, y: 155, label: "德黑兰" },
  pyongyang: { x: 618, y: 138, label: "平壤" },
};

interface AttackArc {
  id: number;
  from: { x: number; y: number; label: string };
  to: { x: number; y: number; label: string };
  severity: "critical" | "high" | "medium";
  type: string;
  progress: number;
  speed: number;
}

const ATTACK_TYPES = [
  "DDoS 攻击", "APT 渗透", "勒索软件", "钓鱼攻击", "暴力破解",
  "C2 通信", "数据窃取", "漏洞利用", "供应链攻击", "DNS 劫持",
  "Web Shell", "零日攻击", "横向移动", "挖矿木马", "僵尸网络",
];

const SEV_COLORS = {
  critical: { stroke: "#ef4444", glow: "rgba(239,68,68,0.6)", particle: "#ff6b6b" },
  high: { stroke: "#f97316", glow: "rgba(249,115,22,0.5)", particle: "#ffaa44" },
  medium: { stroke: "#eab308", glow: "rgba(234,179,8,0.4)", particle: "#ffd644" },
};

// Defended cities (our clients)
const DEFENDED = ["nanjing", "shanghai", "beijing", "shenzhen", "singapore"];

function randomAttack(id: number): AttackArc {
  const sources = Object.keys(CITIES).filter((c) => !DEFENDED.includes(c));
  const fromKey = sources[Math.floor(Math.random() * sources.length)];
  const toKey = DEFENDED[Math.floor(Math.random() * DEFENDED.length)];
  const sevs: ("critical" | "high" | "medium")[] = ["critical", "high", "medium", "medium", "high"];
  return {
    id,
    from: CITIES[fromKey],
    to: CITIES[toKey],
    severity: sevs[Math.floor(Math.random() * sevs.length)],
    type: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
    progress: 0,
    speed: 0.008 + Math.random() * 0.012,
  };
}

// Quadratic bezier arc path
function arcPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  // Arc height proportional to distance
  const arcH = Math.min(dist * 0.35, 120);
  const cx = midX;
  const cy = midY - arcH;
  return { path: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`, cx, cy };
}

// Point on quadratic bezier at t
function bezierPoint(from: { x: number; y: number }, to: { x: number; y: number }, cx: number, cy: number, t: number) {
  const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cx + t * t * to.x;
  const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cy + t * t * to.y;
  return { x, y };
}

export default function ThreatMap() {
  const [arcs, setArcs] = useState<AttackArc[]>([]);
  const [stats, setStats] = useState({ blocked: 0, active: 0 });
  const [latestAttack, setLatestAttack] = useState<AttackArc | null>(null);
  const idRef = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    // Seed initial attacks
    const initial: AttackArc[] = [];
    for (let i = 0; i < 6; i++) {
      const a = randomAttack(idRef.current++);
      a.progress = Math.random() * 0.8;
      initial.push(a);
    }
    setArcs(initial);

    let blocked = 47283;
    // Animation loop
    const animate = () => {
      setArcs((prev) => {
        let newArcs = prev.map((a) => ({ ...a, progress: a.progress + a.speed }));
        const done = newArcs.filter((a) => a.progress >= 1);
        if (done.length > 0) {
          blocked += done.length;
          setStats({ blocked, active: newArcs.length - done.length });
        }
        newArcs = newArcs.filter((a) => a.progress < 1);
        // Spawn new attacks randomly
        if (Math.random() < 0.03 && newArcs.length < 10) {
          const na = randomAttack(idRef.current++);
          newArcs.push(na);
          setLatestAttack(na);
        }
        return newArcs;
      });
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="rounded-xl bg-[#0a0e1a] border border-white/[0.06] p-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">🌍 全球威胁态势</span>
          <span className="flex items-center gap-1 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400">LIVE</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="text-gray-500">已拦截: <span className="text-green-400 font-mono font-bold">{stats.blocked.toLocaleString()}</span></span>
          <span className="text-gray-500">活跃攻击: <span className="text-red-400 font-mono font-bold">{arcs.length}</span></span>
        </div>
      </div>

      <svg viewBox="0 0 800 400" className="w-full" style={{ filter: "drop-shadow(0 0 20px rgba(37,99,235,0.1))" }}>
        <defs>
          {/* Glow filters */}
          <filter id="glow-red"><feGaussianBlur stdDeviation="3" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="glow-orange"><feGaussianBlur stdDeviation="2.5" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="glow-city"><feGaussianBlur stdDeviation="4" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          {/* Grid pattern */}
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(37,99,235,0.06)" strokeWidth="0.5" />
          </pattern>
          {/* Gradient for arcs */}
          <linearGradient id="arc-critical" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="arc-high" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="arc-medium" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0" />
            <stop offset="50%" stopColor="#eab308" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Background grid */}
        <rect width="800" height="400" fill="url(#grid)" />

        {/* Simplified world map outline */}
        <g opacity="0.15" fill="none" stroke="#3b82f6" strokeWidth="0.8">
          {/* North America */}
          <path d="M80,90 L100,80 130,75 160,80 190,85 200,95 210,100 220,110 210,130 200,140 195,155 180,165 170,170 155,175 140,180 120,175 100,165 90,155 85,140 80,120 Z" fill="#3b82f6" fillOpacity="0.05" />
          {/* South America */}
          <path d="M190,220 L210,210 230,215 250,230 260,250 265,270 260,290 250,310 240,325 225,335 210,330 200,310 195,290 190,270 185,250 Z" fill="#3b82f6" fillOpacity="0.05" />
          {/* Europe */}
          <path d="M330,80 L340,75 360,78 380,82 400,85 410,90 405,100 395,110 385,115 370,118 355,120 340,115 335,105 330,95 Z" fill="#3b82f6" fillOpacity="0.05" />
          {/* Africa */}
          <path d="M350,160 L370,155 390,158 410,165 420,180 425,200 430,220 425,250 415,275 400,295 385,305 370,300 360,280 355,260 350,240 345,220 340,200 342,180 Z" fill="#3b82f6" fillOpacity="0.05" />
          {/* Asia */}
          <path d="M420,80 L450,75 480,78 510,82 540,90 570,95 600,100 630,110 650,120 660,135 650,150 630,160 600,170 570,180 540,185 510,180 480,170 460,160 440,145 430,130 425,110 Z" fill="#3b82f6" fillOpacity="0.05" />
          {/* Australia */}
          <path d="M620,270 L650,265 680,270 700,280 710,295 705,310 690,320 670,325 650,320 635,310 625,295 620,280 Z" fill="#3b82f6" fillOpacity="0.05" />
        </g>

        {/* Latitude/longitude lines */}
        <g opacity="0.04" stroke="#3b82f6" strokeWidth="0.5">
          {[80, 160, 200, 280, 320].map((y) => <line key={`h${y}`} x1="0" y1={y} x2="800" y2={y} />)}
          {[100, 200, 300, 400, 500, 600, 700].map((x) => <line key={`v${x}`} x1={x} y1="0" x2={x} y2="400" />)}
        </g>

        {/* Attack arcs */}
        {arcs.map((arc) => {
          const { path, cx, cy } = arcPath(arc.from, arc.to);
          const colors = SEV_COLORS[arc.severity];
          const point = bezierPoint(arc.from, arc.to, cx, cy, arc.progress);
          const trailStart = Math.max(0, arc.progress - 0.15);
          return (
            <g key={arc.id}>
              {/* Arc trail */}
              <path d={path} fill="none" stroke={colors.stroke} strokeWidth="1.5" opacity={0.3}
                strokeDasharray={`${arc.progress * 300} 1000`} />
              {/* Glowing head */}
              <circle cx={point.x} cy={point.y} r={4} fill={colors.particle} filter="url(#glow-red)" opacity={0.9}>
                <animate attributeName="r" values="3;5;3" dur="0.5s" repeatCount="indefinite" />
              </circle>
              {/* Particle trail */}
              {[0.02, 0.04, 0.06, 0.08].map((offset, i) => {
                const t = Math.max(0, arc.progress - offset);
                const tp = bezierPoint(arc.from, arc.to, cx, cy, t);
                return <circle key={i} cx={tp.x} cy={tp.y} r={2 - i * 0.4} fill={colors.particle} opacity={0.5 - i * 0.1} />;
              })}
              {/* Impact ring at destination when close */}
              {arc.progress > 0.85 && (
                <circle cx={arc.to.x} cy={arc.to.y} r={(arc.progress - 0.85) * 200} fill="none" stroke={colors.stroke} strokeWidth="1" opacity={1 - (arc.progress - 0.85) * 6} />
              )}
            </g>
          );
        })}

        {/* City dots - sources */}
        {Object.entries(CITIES).filter(([k]) => !DEFENDED.includes(k)).map(([key, city]) => (
          <g key={key}>
            <circle cx={city.x} cy={city.y} r={2} fill="#64748b" opacity={0.5} />
            <text x={city.x} y={city.y - 6} textAnchor="middle" fontSize={7} fill="#475569" opacity={0.6}>{city.label}</text>
          </g>
        ))}

        {/* Defended cities - with shield glow */}
        {DEFENDED.map((key) => {
          const city = CITIES[key];
          return (
            <g key={key}>
              <circle cx={city.x} cy={city.y} r={12} fill="rgba(37,99,235,0.1)" filter="url(#glow-city)">
                <animate attributeName="r" values="10;14;10" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={city.x} cy={city.y} r={6} fill="none" stroke="#3b82f6" strokeWidth="1" opacity="0.5">
                <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={city.x} cy={city.y} r={3} fill="#3b82f6" />
              <text x={city.x} y={city.y - 10} textAnchor="middle" fontSize={8} fill="#60a5fa" fontWeight={600}>{city.label}</text>
              <text x={city.x} y={city.y + 16} textAnchor="middle" fontSize={6} fill="#3b82f6" opacity="0.6">🛡️ 防护中</text>
            </g>
          );
        })}
      </svg>

      {/* Latest attack info bar */}
      {latestAttack && (
        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: SEV_COLORS[latestAttack.severity].stroke }} />
          <span className="text-gray-500">最新攻击:</span>
          <span className="text-gray-300">{latestAttack.from.label} → {latestAttack.to.label}</span>
          <span className="px-1.5 py-0.5 rounded text-[9px]" style={{ background: `${SEV_COLORS[latestAttack.severity].stroke}20`, color: SEV_COLORS[latestAttack.severity].stroke }}>
            {latestAttack.type}
          </span>
          <span className="text-gray-600 ml-auto">已拦截 ✓</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-2 text-[9px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />严重</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />高危</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />中危</span>
        <span className="flex items-center gap-1"><span className="w-2 h-0.5 bg-blue-500 rounded" />防护节点</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-500 opacity-50" />攻击源</span>
      </div>
    </div>
  );
}