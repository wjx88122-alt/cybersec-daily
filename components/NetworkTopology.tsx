"use client";

import { useState } from "react";
import {
  DEVICE_TYPE_ICONS, DEVICE_TYPE_LABELS,
  type NetworkDevice, type NetworkAlert, type DeviceStatus,
} from "@/lib/network-mock";
import {
  mdrDeviceStatusDotClass,
  mdrDeviceStatusHex,
  mdrSeverityHex,
} from "@/app/(ops)/mdr/theme";

// Vendor logo mapping based on firmware string
function getVendorLogo(firmware: string): { url: string; name: string } | null {
  const fw = firmware.toLowerCase();
  if (fw.includes("fortios")) return { url: "https://www.fortinet.com/favicon.ico", name: "Fortinet" };
  if (fw.includes("cisco") || fw.includes("ios-xe") || fw.includes("isr")) return { url: "https://www.cisco.com/favicon.ico", name: "Cisco" };
  if (fw.includes("pan-os")) return { url: "https://www.paloaltonetworks.com/favicon.ico", name: "Palo Alto" };
  if (fw.includes("windows")) return { url: "https://www.microsoft.com/favicon.ico", name: "Microsoft" };
  if (fw.includes("ubuntu")) return { url: "https://assets.ubuntu.com/v1/49a1a858-favicon-32x32.png", name: "Ubuntu" };
  if (fw.includes("centos")) return { url: "https://www.centos.org/favicon.ico", name: "CentOS" };
  if (fw.includes("hillstone")) return { url: "https://www.hillstonenet.com/favicon.ico", name: "Hillstone" };
  if (fw.includes("h3c")) return { url: "https://www.h3c.com/favicon.ico", name: "H3C" };
  if (fw.includes("suricata")) return { url: "https://suricata.io/favicon.ico", name: "Suricata" };
  if (fw.includes("openvpn")) return { url: "https://openvpn.net/favicon.ico", name: "OpenVPN" };
  if (fw.includes("modsecurity")) return { url: "https://owasp.org/favicon.ico", name: "ModSecurity" };
  return null;
}

interface TopoNode {
  id: string;
  device: NetworkDevice;
  x: number;
  y: number;
}

interface TopoLink {
  from: string;
  to: string;
  label?: string;
}

// Build topology layout per client
function buildTopology(devices: NetworkDevice[]): { nodes: TopoNode[]; links: TopoLink[]; zones: { name: string; x: number; y: number; w: number; h: number }[] } {
  const zones = [...new Set(devices.map((d) => d.zone))];
  const zoneMap: Record<string, { name: string; x: number; y: number; w: number; h: number }> = {};

  // Layout zones top-to-bottom, centered
  const zoneW = 700;
  const zoneH = 100;
  const zoneGap = 20;
  const startY = 30;

  // Assign zone positions - layered architecture
  const zoneOrder = ["边界", "WAN", "DMZ", "核心区", "应用区", "服务器区", "数据区", "HIS 区", "医疗设备区", "OT 边界", "车间网络", "SCADA 区"];
  const sorted = zones.sort((a, b) => {
    const ia = zoneOrder.indexOf(a);
    const ib = zoneOrder.indexOf(b);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  sorted.forEach((z, i) => {
    zoneMap[z] = { name: z, x: 30, y: startY + i * (zoneH + zoneGap), w: zoneW, h: zoneH };
  });

  // Place devices within zones
  const nodes: TopoNode[] = [];
  sorted.forEach((z) => {
    const zDevices = devices.filter((d) => d.zone === z);
    const zone = zoneMap[z];
    const spacing = Math.min(140, (zone.w - 40) / Math.max(zDevices.length, 1));
    const offsetX = (zone.w - spacing * zDevices.length) / 2;
    zDevices.forEach((d, i) => {
      nodes.push({ id: d.id, device: d, x: zone.x + offsetX + spacing * i + spacing / 2, y: zone.y + zone.h / 2 });
    });
  });

  // Build links: connect devices between adjacent zones
  const links: TopoLink[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const upperDevices = nodes.filter((n) => n.device.zone === sorted[i]);
    const lowerDevices = nodes.filter((n) => n.device.zone === sorted[i + 1]);
    // Connect firewalls/routers/switches to next zone
    const connectors = upperDevices.filter((n) => ["firewall", "switch", "router", "vpn"].includes(n.device.type));
    const targets = lowerDevices.length > 0 ? lowerDevices : [];
    if (connectors.length === 0 && upperDevices.length > 0) {
      // fallback: connect first device
      targets.forEach((t) => { links.push({ from: upperDevices[0].id, to: t.id }); });
    } else {
      connectors.forEach((c) => {
        targets.forEach((t) => { links.push({ from: c.id, to: t.id }); });
      });
    }
  }
  // Also connect devices within same zone if there's a switch
  sorted.forEach((z) => {
    const zNodes = nodes.filter((n) => n.device.zone === z);
    const sw = zNodes.find((n) => n.device.type === "switch");
    if (sw) {
      zNodes.filter((n) => n.id !== sw.id).forEach((n) => {
        links.push({ from: sw.id, to: n.id });
      });
    }
  });

  return { nodes, links, zones: Object.values(zoneMap) };
}

export default function NetworkTopology({ devices, alerts = [] }: { devices: NetworkDevice[]; alerts?: NetworkAlert[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const { nodes, links, zones } = buildTopology(devices);

  // Build alert map: deviceId → alerts
  const alertMap: Record<string, NetworkAlert[]> = {};
  alerts.forEach((a) => {
    if (!alertMap[a.deviceId]) alertMap[a.deviceId] = [];
    alertMap[a.deviceId].push(a);
  });

  if (devices.length === 0) {
    return <div className="text-xs text-[#94a3b8] text-center py-8">暂无设备数据</div>;
  }

  const svgH = zones.length > 0 ? zones[zones.length - 1].y + zones[zones.length - 1].h + 50 : 300;
  const svgW = 760;

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="glass rounded-xl p-4 overflow-x-auto">
      <div className="text-xs text-[#64748b] font-medium mb-3">🗺️ 网络拓扑图</div>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="mx-auto">
        {/* Zone backgrounds */}
        {zones.map((z) => (
          <g key={z.name}>
            <rect x={z.x} y={z.y} width={z.w} height={z.h} rx={12} fill="#f0f4f8" stroke="#e2e8f0" strokeWidth={1} />
            <text x={z.x + 12} y={z.y + 18} fontSize={11} fill="#64748b" fontWeight={600}>{z.name}</text>
          </g>
        ))}

        {/* Links */}
        {links.map((l, i) => {
          const from = nodeMap[l.from];
          const to = nodeMap[l.to];
          if (!from || !to) return null;
          const isHighlight = hovered === l.from || hovered === l.to;
          // Curved path for same-zone links
          const sameZone = from.device.zone === to.device.zone;
          if (sameZone) {
            const midY = Math.min(from.y, to.y) - 20;
            return (
              <path key={i}
                d={`M ${from.x} ${from.y - 18} Q ${(from.x + to.x) / 2} ${midY} ${to.x} ${to.y - 18}`}
                fill="none" stroke={isHighlight ? "#2563eb" : "#cbd5e1"} strokeWidth={isHighlight ? 2 : 1}
                strokeDasharray={sameZone ? "4 2" : "none"} opacity={isHighlight ? 1 : 0.5} />
            );
          }
          return (
            <line key={i} x1={from.x} y1={from.y + 18} x2={to.x} y2={to.y - 18}
              stroke={isHighlight ? "#2563eb" : "#cbd5e1"} strokeWidth={isHighlight ? 2 : 1}
              opacity={isHighlight ? 1 : 0.5} />
          );
        })}

        {/* Device nodes */}
        {nodes.map((n) => {
          const isHov = hovered === n.id;
          const color = mdrDeviceStatusHex(n.device.status);
          const devAlerts = alertMap[n.id] || [];
          const unacked = devAlerts.filter((a) => !a.acknowledged);
          const worstSev = unacked.find((a) => a.severity === "critical")?.severity
            || unacked.find((a) => a.severity === "high")?.severity
            || unacked.find((a) => a.severity === "medium")?.severity
            || unacked[0]?.severity;
          const hasAlerts = unacked.length > 0;
          const vendor = getVendorLogo(n.device.firmware);
          // Tooltip height depends on alerts
          const tipBaseH = 50;
          const tipAlertH = Math.min(unacked.length, 3) * 14;
          const tipH = tipBaseH + (hasAlerts ? tipAlertH + 18 : 0);
          const tipW = hasAlerts ? 220 : 160;

          return (
            <g key={n.id}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer">
              {/* Shadow */}
              <ellipse cx={n.x} cy={n.y + 20} rx={22} ry={4} fill="rgba(0,0,0,0.06)" />
              {/* Alert glow ring */}
              {hasAlerts && (
                <rect x={n.x - 27} y={n.y - 21} width={54} height={42} rx={10}
                  fill="none" stroke={mdrSeverityHex((worstSev as "critical" | "high" | "medium" | "low") || "medium")} strokeWidth={2} opacity={0.3}>
                  <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
                </rect>
              )}
              {/* Node body */}
              <rect x={n.x - 24} y={n.y - 18} width={48} height={36} rx={8}
                fill={isHov ? "#f8fafc" : "#ffffff"} stroke={color} strokeWidth={isHov ? 2.5 : 1.5}
                filter={isHov ? "url(#glow)" : undefined} />
              {/* Status dot */}
              <circle cx={n.x + 18} cy={n.y - 12} r={4} fill={color}>
                {n.device.status === "critical" && <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />}
              </circle>
              {/* Alert badge */}
              {hasAlerts && (
                <g>
                  <circle cx={n.x - 18} cy={n.y - 14} r={8} fill={mdrSeverityHex((worstSev as "critical" | "high" | "medium" | "low") || "medium")} />
                  <text x={n.x - 18} y={n.y - 10} textAnchor="middle" fontSize={8} fill="#fff" fontWeight={700}>{unacked.length}</text>
                </g>
              )}
              {/* Icon text */}
              <text x={n.x} y={n.y + 5} textAnchor="middle" fontSize={18}>{DEVICE_TYPE_ICONS[n.device.type]}</text>
              {/* Vendor logo */}
              {vendor && (
                <g>
                  <rect x={n.x + 22} y={n.y - 8} width={18} height={18} rx={4} fill="#ffffff" stroke="#e2e8f0" strokeWidth={0.5} />
                  <image href={vendor.url} x={n.x + 24} y={n.y - 6} width={14} height={14} />
                </g>
              )}
              {/* Label */}
              <text x={n.x} y={n.y + 30} textAnchor="middle" fontSize={9} fill="#64748b" fontWeight={500}>{n.device.name}</text>
              <text x={n.x} y={n.y + 41} textAnchor="middle" fontSize={8} fill="#94a3b8">{n.device.ip}</text>

              {/* Tooltip on hover */}
              {isHov && (
                <g>
                  <rect x={n.x - tipW / 2} y={n.y - tipH - 24} width={tipW} height={tipH} rx={8} fill="#1e293b" opacity={0.95} />
                  {/* Arrow */}
                  <polygon points={`${n.x - 5},${n.y - 24} ${n.x + 5},${n.y - 24} ${n.x},${n.y - 18}`} fill="#1e293b" opacity={0.95} />
                  <text x={n.x} y={n.y - tipH - 6} textAnchor="middle" fontSize={10} fill="#f8fafc" fontWeight={600}>
                    {n.device.name} ({DEVICE_TYPE_LABELS[n.device.type]})
                  </text>
                  <text x={n.x} y={n.y - tipH + 8} textAnchor="middle" fontSize={9} fill="#94a3b8">
                    CPU: {n.device.cpu}% · 内存: {n.device.memory}% · ⏱ {n.device.uptime}
                  </text>
                  <text x={n.x} y={n.y - tipH + 20} textAnchor="middle" fontSize={8} fill="#78859b">
                    {vendor ? `${vendor.name} · ` : ""}{n.device.firmware}
                  </text>
                  {/* Alert list in tooltip */}
                  {hasAlerts && (
                    <g>
                      <line x1={n.x - tipW / 2 + 10} y1={n.y - tipH + 28} x2={n.x + tipW / 2 - 10} y2={n.y - tipH + 28} stroke="#334155" strokeWidth={0.5} />
                      <text x={n.x - tipW / 2 + 12} y={n.y - tipH + 40} fontSize={8} fill={mdrSeverityHex((worstSev as "critical" | "high" | "medium" | "low") || "medium")} fontWeight={600}>
                        ⚠ {unacked.length} 条安全事件:
                      </text>
                      {unacked.slice(0, 3).map((a, ai) => (
                        <g key={a.id}>
                          <circle cx={n.x - tipW / 2 + 16} cy={n.y - tipH + 51 + ai * 14} r={2.5} fill={mdrSeverityHex(a.severity)} />
                          <text x={n.x - tipW / 2 + 24} y={n.y - tipH + 54 + ai * 14} fontSize={8} fill="#cbd5e1">
                            {a.title.length > 28 ? a.title.slice(0, 28) + "…" : a.title}
                          </text>
                        </g>
                      ))}
                      {unacked.length > 3 && (
                        <text x={n.x - tipW / 2 + 24} y={n.y - tipH + 54 + 3 * 14} fontSize={8} fill="#64748b">
                          +{unacked.length - 3} 更多...
                        </text>
                      )}
                    </g>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-[#64748b] flex-wrap">
        {(["online", "warning", "critical", "offline"] as DeviceStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${mdrDeviceStatusDotClass(s)}`} />
            {{ online: "正常", warning: "警告", critical: "严重", offline: "离线" }[s]}
          </div>
        ))}
        <span className="text-[#cbd5e1]">|</span>
        <span>━ 跨区连接</span>
        <span>╌ 区内连接</span>
        <span className="text-[#cbd5e1]">|</span>
        <div className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded-full text-[8px] text-white text-center leading-4 font-bold" style={{ background: mdrSeverityHex("critical") }}>3</span>
          安全事件数
        </div>
      </div>
    </div>
  );
}
