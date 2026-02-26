"use client";

import { useState, useEffect, useRef } from "react";

/* ── Detailed continent paths (equirectangular 800x400) ── */
const CONTINENTS = {
  northAmerica: "M62,58 L68,52 78,48 92,44 108,42 125,44 140,48 152,52 160,58 168,62 178,68 186,74 192,82 196,92 198,102 200,112 202,122 198,132 194,140 190,148 186,155 180,162 172,168 164,172 156,174 148,176 140,178 130,176 120,172 112,168 106,164 100,160 96,156 92,150 88,142 84,132 82,120 80,108 78,96 76,84 72,72 66,64 Z M130,170 L138,172 146,176 152,180 156,186 158,192 156,196 150,198 142,196 136,190 132,184 130,178 Z",
  centralAmerica: "M148,178 L154,180 160,184 164,190 166,196 168,202 170,208 168,212 164,214 158,212 154,208 150,202 148,196 146,190 146,184 Z",
  southAmerica: "M186,218 L196,212 208,210 218,212 228,218 236,228 242,240 248,254 252,268 254,282 252,296 248,308 242,318 234,326 224,332 214,334 206,330 200,322 196,312 192,300 190,286 188,272 186,258 184,244 184,232 Z",
  europe: "M338,62 L344,58 352,56 362,56 372,58 382,60 392,64 400,68 406,74 410,80 412,88 410,96 406,102 400,108 394,112 386,116 378,118 370,118 362,116 354,112 348,108 342,102 338,96 336,88 336,78 336,68 Z M348,56 L356,52 364,50 372,50 380,52 Z",
  uk: "M332,68 L336,64 340,62 344,64 346,68 344,74 340,78 336,76 332,72 Z M330,78 L334,76 338,80 336,84 332,82 Z",
  africa: "M356,148 L366,142 378,140 390,142 402,148 412,156 418,166 424,178 428,192 430,208 430,224 428,240 424,256 418,270 410,282 400,292 388,298 376,300 366,296 358,288 352,276 348,262 346,248 344,234 342,218 342,202 344,188 348,174 352,162 Z",
  middleEast: "M420,132 L432,128 444,130 456,134 466,140 474,148 478,158 476,168 470,176 462,180 452,182 442,178 434,172 428,164 424,154 420,144 Z",
  russia: "M412,48 L430,42 450,38 472,36 496,38 520,42 544,48 566,52 586,54 604,56 620,58 636,56 650,52 660,50 668,52 672,58 668,66 660,72 648,76 634,78 618,78 600,76 582,74 564,72 546,72 530,74 516,78 504,82 494,86 484,88 474,86 464,82 454,76 444,70 434,64 424,58 416,52 Z",
  india: "M488,152 L496,148 506,150 514,156 520,164 524,174 526,186 524,198 518,206 510,210 500,208 492,202 486,194 484,184 484,174 484,164 Z",
  china: "M540,82 L554,78 568,76 582,78 596,84 608,92 618,102 624,114 628,126 628,138 624,150 618,160 608,168 596,172 584,174 572,172 560,168 550,162 542,154 536,144 532,132 530,120 530,108 532,96 536,88 Z",
  seAsia: "M556,186 L566,182 576,184 584,190 588,198 586,206 580,212 572,214 564,210 558,204 556,196 Z M592,196 L600,192 608,196 612,204 608,212 600,214 594,208 Z M548,218 L558,214 568,218 574,226 570,234 560,236 552,230 Z",
  japan: "M636,108 L640,104 646,102 652,106 654,114 650,122 644,128 638,130 634,126 632,118 634,112 Z M642,130 L648,128 652,132 650,138 644,140 640,136 Z",
  korea: "M618,112 L622,108 628,108 632,112 632,120 628,126 622,128 618,124 616,118 Z",
  australia: "M612,268 L628,262 646,258 664,260 680,266 694,276 704,288 708,302 706,314 698,324 686,330 672,332 656,330 642,324 630,314 622,302 618,290 614,278 Z M710,260 L718,256 724,260 722,268 716,270 710,266 Z",
  newZealand: "M726,310 L730,306 736,308 738,314 734,320 728,318 Z M732,320 L736,318 740,322 738,328 734,326 Z",
};

/* ── City coordinates ── */
const CITIES: Record<string, { x: number; y: number; label: string }> = {
  beijing: { x: 580, y: 140, label: "北京" },
  shanghai: { x: 600, y: 165, label: "上海" },
  nanjing: { x: 592, y: 158, label: "南京" },
  shenzhen: { x: 575, y: 185, label: "深圳" },
  moscow: { x: 440, y: 62, label: "莫斯科" },
  tokyo: { x: 646, y: 118, label: "东京" },
  seoul: { x: 624, y: 118, label: "首尔" },
  mumbai: { x: 500, y: 198, label: "孟买" },
  singapore: { x: 568, y: 232, label: "新加坡" },
  sydney: { x: 670, y: 300, label: "悉尼" },
  london: { x: 348, y: 72, label: "伦敦" },
  berlin: { x: 378, y: 68, label: "柏林" },
  paris: { x: 356, y: 80, label: "巴黎" },
  newYork: { x: 196, y: 112, label: "纽约" },
  washington: { x: 198, y: 122, label: "华盛顿" },
  losAngeles: { x: 118, y: 148, label: "洛杉矶" },
  chicago: { x: 172, y: 108, label: "芝加哥" },
  saoPaulo: { x: 228, y: 290, label: "圣保罗" },
  dubai: { x: 462, y: 176, label: "迪拜" },
  cairo: { x: 408, y: 168, label: "开罗" },
  lagos: { x: 362, y: 222, label: "拉各斯" },
  johannesburg: { x: 400, y: 296, label: "约翰内斯堡" },
  toronto: { x: 188, y: 102, label: "多伦多" },
  tehran: { x: 456, y: 148, label: "德黑兰" },
  pyongyang: { x: 618, y: 112, label: "平壤" },
  taipei: { x: 608, y: 172, label: "台北" },
  hanoi: { x: 562, y: 192, label: "河内" },
  jakarta: { x: 562, y: 244, label: "雅加达" },
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

const DEFENDED = ["nanjing", "shanghai", "beijing", "shenzhen", "singapore"];

function randomAttack(id: number): AttackArc {
  const sources = Object.keys(CITIES).filter((c) => !DEFENDED.includes(c));
  const fromKey = sources[Math.floor(Math.random() * sources.length)];
  const toKey = DEFENDED[Math.floor(Math.random() * DEFENDED.length)];
  const sevs: ("critical" | "high" | "medium")[] = ["critical", "high", "medium", "medium", "high"];
  return {
    id, from: CITIES[fromKey], to: CITIES[toKey],
    severity: sevs[Math.floor(Math.random() * sevs.length)],
    type: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
    progress: 0, speed: 0.006 + Math.random() * 0.01,
  };
}

function arcPath(from: { x: number; y: number }, to: { x: number; y: number }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const arcH = Math.min(dist * 0.35, 120);
  const cx = midX;
  const cy = midY - arcH;
  return { path: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`, cx, cy };
}

function bezierPoint(from: { x: number; y: number }, to: { x: number; y: number }, cx: number, cy: number, t: number) {
  const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cx + t * t * to.x;
  const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cy + t * t * to.y;
  return { x, y };
}

export default function ThreatMap() {
  const [arcs, setArcs] = useState<AttackArc[]>([]);
  const [stats, setStats] = useState({ blocked: 47283, active: 0 });
  const [latestAttack, setLatestAttack] = useState<AttackArc | null>(null);
  const [radarAngle, setRadarAngle] = useState(0);
  const idRef = useRef(0);
  const frameRef = useRef<number>(0);
  const blockedRef = useRef(47283);

  useEffect(() => {
    const initial: AttackArc[] = [];
    for (let i = 0; i < 6; i++) {
      const a = randomAttack(idRef.current++);
      a.progress = Math.random() * 0.7;
      initial.push(a);
    }
    setArcs(initial);

    const animate = () => {
      setArcs((prev) => {
        let newArcs = prev.map((a) => ({ ...a, progress: a.progress + a.speed }));
        const done = newArcs.filter((a) => a.progress >= 1);
        if (done.length > 0) blockedRef.current += done.length;
        newArcs = newArcs.filter((a) => a.progress < 1);
        if (Math.random() < 0.035 && newArcs.length < 12) {
          const na = randomAttack(idRef.current++);
          newArcs.push(na);
          setLatestAttack(na);
        }
        setStats({ blocked: blockedRef.current, active: newArcs.length });
        return newArcs;
      });
      setRadarAngle((a) => (a + 0.8) % 360);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="rounded-xl bg-[#060a14] border border-white/[0.06] p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 70% 50%, rgba(37,99,235,0.06) 0%, transparent 60%), radial-gradient(ellipse at 30% 40%, rgba(6,182,212,0.04) 0%, transparent 50%)",
      }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-300 font-bold tracking-wide">🌍 全球威胁态势感知</span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] text-red-400 font-medium">LIVE</span>
          </span>
        </div>
        <div className="flex items-center gap-5 text-[11px]">
          <div className="text-center">
            <div className="text-green-400 font-mono font-bold text-base">{stats.blocked.toLocaleString()}</div>
            <div className="text-gray-600 text-[9px]">累计拦截</div>
          </div>
          <div className="text-center">
            <div className="text-red-400 font-mono font-bold text-base">{stats.active}</div>
            <div className="text-gray-600 text-[9px]">活跃攻击</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-mono font-bold text-base">{DEFENDED.length}</div>
            <div className="text-gray-600 text-[9px]">防护节点</div>
          </div>
        </div>
      </div>

      <svg viewBox="0 0 800 400" className="w-full relative z-10">
        <defs>
          <filter id="tm-glow"><feGaussianBlur stdDeviation="3" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="tm-glow-lg"><feGaussianBlur stdDeviation="6" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <filter id="tm-glow-sm"><feGaussianBlur stdDeviation="2" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <radialGradient id="radar-grad">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="defended-glow">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <pattern id="tm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(37,99,235,0.04)" strokeWidth="0.5" />
          </pattern>
          <linearGradient id="ocean-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#060a14" />
            <stop offset="50%" stopColor="#0a1628" />
            <stop offset="100%" stopColor="#060a14" />
          </linearGradient>
        </defs>

        {/* Ocean background */}
        <rect width="800" height="400" fill="url(#ocean-grad)" />
        <rect width="800" height="400" fill="url(#tm-grid)" />

        {/* Latitude lines with labels */}
        {[{ y: 80, label: "60°N" }, { y: 140, label: "30°N" }, { y: 200, label: "0°" }, { y: 260, label: "30°S" }, { y: 320, label: "60°S" }].map((l) => (
          <g key={l.y}>
            <line x1="0" y1={l.y} x2="800" y2={l.y} stroke="rgba(37,99,235,0.06)" strokeWidth="0.5" strokeDasharray="4 4" />
            <text x="6" y={l.y - 3} fontSize="7" fill="rgba(37,99,235,0.2)">{l.label}</text>
          </g>
        ))}
        {[{ x: 160, label: "90°W" }, { x: 320, label: "0°" }, { x: 480, label: "90°E" }, { x: 640, label: "180°" }].map((l) => (
          <g key={l.x}>
            <line x1={l.x} y1="0" x2={l.x} y2="400" stroke="rgba(37,99,235,0.06)" strokeWidth="0.5" strokeDasharray="4 4" />
            <text x={l.x + 3} y="395" fontSize="7" fill="rgba(37,99,235,0.2)">{l.label}</text>
          </g>
        ))}

        {/* Continents */}
        {Object.entries(CONTINENTS).map(([name, path]) => (
          <path key={name} d={path} fill="rgba(37,99,235,0.08)" stroke="rgba(37,99,235,0.25)" strokeWidth="0.8" strokeLinejoin="round" />
        ))}

        {/* Radar sweep on defended area */}
        <g transform={`rotate(${radarAngle}, 585, 165)`}>
          <path d={`M 585 165 L ${585 + 80 * Math.cos(-Math.PI / 6)} ${165 + 80 * Math.sin(-Math.PI / 6)} A 80 80 0 0 1 ${585 + 80} 165 Z`}
            fill="url(#radar-grad)" opacity="0.6" />
        </g>

        {/* Attack arcs */}
        {arcs.map((arc) => {
          const { path, cx, cy } = arcPath(arc.from, arc.to);
          const colors = SEV_COLORS[arc.severity];
          const point = bezierPoint(arc.from, arc.to, cx, cy, arc.progress);
          return (
            <g key={arc.id}>
              {/* Full arc ghost */}
              <path d={path} fill="none" stroke={colors.stroke} strokeWidth="0.5" opacity={0.1} />
              {/* Animated trail */}
              <path d={path} fill="none" stroke={colors.stroke} strokeWidth="1.5" opacity={0.4}
                strokeDasharray={`${arc.progress * 400} 1000`} />
              {/* Glow trail */}
              <path d={path} fill="none" stroke={colors.stroke} strokeWidth="4" opacity={0.08}
                strokeDasharray={`${arc.progress * 400} 1000`} filter="url(#tm-glow)" />
              {/* Head particle */}
              <circle cx={point.x} cy={point.y} r={3} fill={colors.particle} filter="url(#tm-glow-sm)">
                <animate attributeName="r" values="2;4;2" dur="0.4s" repeatCount="indefinite" />
              </circle>
              {/* Particle trail */}
              {[0.015, 0.03, 0.05, 0.07, 0.09].map((offset, i) => {
                const t = Math.max(0, arc.progress - offset);
                const tp = bezierPoint(arc.from, arc.to, cx, cy, t);
                return <circle key={i} cx={tp.x} cy={tp.y} r={2 - i * 0.3} fill={colors.particle} opacity={0.6 - i * 0.1} />;
              })}
              {/* Source pulse */}
              {arc.progress < 0.15 && (
                <circle cx={arc.from.x} cy={arc.from.y} r={arc.progress * 100} fill="none" stroke={colors.stroke} strokeWidth="0.8" opacity={0.3 - arc.progress * 2} />
              )}
              {/* Impact rings */}
              {arc.progress > 0.88 && (
                <g>
                  <circle cx={arc.to.x} cy={arc.to.y} r={(arc.progress - 0.88) * 150} fill="none" stroke={colors.stroke} strokeWidth="1.5" opacity={1 - (arc.progress - 0.88) * 8} />
                  <circle cx={arc.to.x} cy={arc.to.y} r={(arc.progress - 0.88) * 100} fill="none" stroke={colors.stroke} strokeWidth="0.8" opacity={0.8 - (arc.progress - 0.88) * 6} />
                </g>
              )}
              {/* Attack label near head */}
              {arc.progress > 0.3 && arc.progress < 0.7 && (
                <text x={point.x + 8} y={point.y - 6} fontSize="7" fill={colors.stroke} opacity="0.7">{arc.type}</text>
              )}
            </g>
          );
        })}

        {/* Source cities */}
        {Object.entries(CITIES).filter(([k]) => !DEFENDED.includes(k)).map(([key, city]) => (
          <g key={key}>
            <circle cx={city.x} cy={city.y} r={1.5} fill="#475569" opacity={0.6} />
            <text x={city.x} y={city.y - 5} textAnchor="middle" fontSize={6.5} fill="#475569" opacity={0.5}>{city.label}</text>
          </g>
        ))}

        {/* Defended cities */}
        {DEFENDED.map((key) => {
          const city = CITIES[key];
          return (
            <g key={key}>
              {/* Outer glow */}
              <circle cx={city.x} cy={city.y} r={20} fill="url(#defended-glow)" />
              {/* Pulse rings */}
              <circle cx={city.x} cy={city.y} r={8} fill="none" stroke="#3b82f6" strokeWidth="0.5" opacity="0.3">
                <animate attributeName="r" values="8;16;8" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx={city.x} cy={city.y} r={5} fill="none" stroke="#60a5fa" strokeWidth="0.8" opacity="0.5">
                <animate attributeName="r" values="5;12;5" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite" />
              </circle>
              {/* Hexagon shield */}
              <polygon points={`${city.x},${city.y - 5} ${city.x + 4.3},${city.y - 2.5} ${city.x + 4.3},${city.y + 2.5} ${city.x},${city.y + 5} ${city.x - 4.3},${city.y + 2.5} ${city.x - 4.3},${city.y - 2.5}`}
                fill="#3b82f6" fillOpacity="0.3" stroke="#60a5fa" strokeWidth="1" />
              {/* Center dot */}
              <circle cx={city.x} cy={city.y} r={2} fill="#60a5fa" filter="url(#tm-glow-sm)" />
              {/* Label */}
              <text x={city.x} y={city.y - 9} textAnchor="middle" fontSize={8} fill="#93c5fd" fontWeight={600}>{city.label}</text>
              <text x={city.x} y={city.y + 14} textAnchor="middle" fontSize={5.5} fill="#3b82f6" opacity="0.7">● 防护中</text>
            </g>
          );
        })}
      </svg>

      {/* Latest attack bar */}
      {latestAttack && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[10px] relative z-10">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: SEV_COLORS[latestAttack.severity].stroke }} />
          <span className="text-gray-500">最新威胁:</span>
          <span className="text-gray-300 font-medium">{latestAttack.from.label}</span>
          <span className="text-gray-600">→</span>
          <span className="text-blue-400 font-medium">{latestAttack.to.label}</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: `${SEV_COLORS[latestAttack.severity].stroke}15`, color: SEV_COLORS[latestAttack.severity].stroke }}>
            {latestAttack.type}
          </span>
          <span className="text-green-500 ml-auto font-medium">✓ 已拦截</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 mt-2 text-[9px] text-gray-500 relative z-10">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />严重威胁</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500" />高危攻击</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" />中危事件</span>
        <span className="flex items-center gap-1">
          <svg width="10" height="10"><polygon points="5,0 8.7,2.5 8.7,7.5 5,10 1.3,7.5 1.3,2.5" fill="#3b82f6" fillOpacity="0.5" stroke="#60a5fa" strokeWidth="0.8" /></svg>
          防护节点
        </span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-500 opacity-50" />攻击源</span>
      </div>
    </div>
  );
}