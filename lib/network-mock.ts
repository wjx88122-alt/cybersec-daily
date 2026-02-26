// 客户网络运维 - Mock 数据

export type DeviceType = "firewall" | "switch" | "router" | "server" | "endpoint" | "waf" | "ids" | "vpn";
export type DeviceStatus = "online" | "warning" | "critical" | "offline";
export type ClientTier = "platinum" | "gold" | "silver";

export interface Client {
  id: string;
  name: string;
  industry: string;
  tier: ClientTier;
  contactName: string;
  contactPhone: string;
  deviceCount: number;
  alertCount: number;
  networkScore: number; // 0-100
  region: string;
  contract: string;
}

export interface NetworkDevice {
  id: string;
  clientId: string;
  name: string;
  type: DeviceType;
  ip: string;
  status: DeviceStatus;
  cpu: number;
  memory: number;
  uptime: string;
  firmware: string;
  lastSeen: string;
  zone: string;
}

export interface NetworkAlert {
  id: string;
  clientId: string;
  deviceId: string;
  deviceName: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface OpsTicket {
  id: string;
  clientId: string;
  title: string;
  type: "incident" | "change" | "maintenance" | "request";
  priority: "P1" | "P2" | "P3" | "P4";
  status: "open" | "in_progress" | "pending" | "resolved";
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  firewall: "防火墙", switch: "交换机", router: "路由器", server: "服务器",
  endpoint: "终端", waf: "WAF", ids: "IDS/IPS", vpn: "VPN 网关",
};

export const DEVICE_TYPE_ICONS: Record<DeviceType, string> = {
  firewall: "🛡️", switch: "🔀", router: "📡", server: "🖥️",
  endpoint: "💻", waf: "🌐", ids: "🔍", vpn: "🔒",
};

export const TIER_LABELS: Record<ClientTier, string> = { platinum: "铂金", gold: "黄金", silver: "白银" };
export const TIER_COLORS: Record<ClientTier, string> = {
  platinum: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  gold: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  silver: "bg-gray-400/20 text-gray-400 border-gray-400/30",
};

export const STATUS_COLORS: Record<DeviceStatus, string> = {
  online: "bg-green-500", warning: "bg-yellow-500", critical: "bg-red-500", offline: "bg-gray-500",
};

const now = Date.now();
const m = (mins: number) => new Date(now - mins * 60000).toISOString();

export const MOCK_CLIENTS: Client[] = [
  { id: "c1", name: "星辰金融集团", industry: "金融", tier: "platinum", contactName: "刘总", contactPhone: "138****1001", deviceCount: 86, alertCount: 3, networkScore: 92, region: "华东", contract: "2026-12-31" },
  { id: "c2", name: "云帆科技", industry: "互联网", tier: "gold", contactName: "陈经理", contactPhone: "139****2002", deviceCount: 45, alertCount: 7, networkScore: 78, region: "华南", contract: "2026-09-30" },
  { id: "c3", name: "博远医疗", industry: "医疗", tier: "platinum", contactName: "王院长", contactPhone: "137****3003", deviceCount: 62, alertCount: 1, networkScore: 95, region: "华北", contract: "2027-03-31" },
  { id: "c4", name: "鼎盛制造", industry: "制造", tier: "silver", contactName: "赵厂长", contactPhone: "136****4004", deviceCount: 38, alertCount: 12, networkScore: 65, region: "华中", contract: "2026-06-30" },
  { id: "c5", name: "天启教育", industry: "教育", tier: "gold", contactName: "孙主任", contactPhone: "135****5005", deviceCount: 28, alertCount: 0, networkScore: 88, region: "西南", contract: "2026-11-30" },
];

export const MOCK_DEVICES: NetworkDevice[] = [
  // 星辰金融
  { id: "d1", clientId: "c1", name: "FW-CORE-01", type: "firewall", ip: "10.1.0.1", status: "online", cpu: 35, memory: 48, uptime: "186d 4h", firmware: "FortiOS 7.4.3", lastSeen: m(1), zone: "核心区" },
  { id: "d2", clientId: "c1", name: "FW-DMZ-01", type: "firewall", ip: "10.1.0.2", status: "warning", cpu: 78, memory: 82, uptime: "186d 4h", firmware: "FortiOS 7.4.3", lastSeen: m(1), zone: "DMZ" },
  { id: "d3", clientId: "c1", name: "SW-CORE-01", type: "switch", ip: "10.1.1.1", status: "online", cpu: 22, memory: 35, uptime: "365d 2h", firmware: "Cisco IOS 17.9", lastSeen: m(0.5), zone: "核心区" },
  { id: "d4", clientId: "c1", name: "SRV-DC-01", type: "server", ip: "10.1.10.1", status: "online", cpu: 45, memory: 67, uptime: "90d 8h", firmware: "Windows Server 2022", lastSeen: m(0.5), zone: "服务器区" },
  { id: "d5", clientId: "c1", name: "WAF-WEB-01", type: "waf", ip: "10.1.0.10", status: "online", cpu: 28, memory: 41, uptime: "120d 6h", firmware: "ModSecurity 3.0", lastSeen: m(1), zone: "DMZ" },
  { id: "d6", clientId: "c1", name: "IDS-NET-01", type: "ids", ip: "10.1.0.20", status: "critical", cpu: 92, memory: 88, uptime: "45d 3h", firmware: "Suricata 7.0.3", lastSeen: m(3), zone: "核心区" },
  { id: "d7", clientId: "c1", name: "VPN-GW-01", type: "vpn", ip: "10.1.0.5", status: "online", cpu: 15, memory: 30, uptime: "200d 1h", firmware: "OpenVPN 2.6", lastSeen: m(1), zone: "边界" },
  // 云帆科技
  { id: "d8", clientId: "c2", name: "FW-EDGE-01", type: "firewall", ip: "172.16.0.1", status: "online", cpu: 42, memory: 55, uptime: "95d 7h", firmware: "PAN-OS 11.1", lastSeen: m(2), zone: "边界" },
  { id: "d9", clientId: "c2", name: "RT-WAN-01", type: "router", ip: "172.16.0.254", status: "warning", cpu: 65, memory: 70, uptime: "300d 5h", firmware: "Cisco IOS-XE 17.12", lastSeen: m(5), zone: "WAN" },
  { id: "d10", clientId: "c2", name: "SRV-APP-01", type: "server", ip: "172.16.10.1", status: "critical", cpu: 95, memory: 91, uptime: "30d 2h", firmware: "Ubuntu 24.04 LTS", lastSeen: m(1), zone: "应用区" },
  { id: "d11", clientId: "c2", name: "SRV-DB-01", type: "server", ip: "172.16.10.2", status: "online", cpu: 55, memory: 72, uptime: "60d 4h", firmware: "CentOS 9 Stream", lastSeen: m(1), zone: "数据区" },
  // 博远医疗
  { id: "d12", clientId: "c3", name: "FW-HIS-01", type: "firewall", ip: "192.168.1.1", status: "online", cpu: 20, memory: 35, uptime: "250d 3h", firmware: "Hillstone SG-6000", lastSeen: m(1), zone: "HIS 区" },
  { id: "d13", clientId: "c3", name: "SW-MED-01", type: "switch", ip: "192.168.1.2", status: "online", cpu: 18, memory: 28, uptime: "400d 1h", firmware: "H3C S5560", lastSeen: m(0.5), zone: "医疗设备区" },
  // 鼎盛制造
  { id: "d14", clientId: "c4", name: "FW-OT-01", type: "firewall", ip: "10.100.0.1", status: "warning", cpu: 72, memory: 68, uptime: "500d 6h", firmware: "FortiOS 7.2.1", lastSeen: m(2), zone: "OT 边界" },
  { id: "d15", clientId: "c4", name: "RT-PLANT-01", type: "router", ip: "10.100.0.254", status: "offline", cpu: 0, memory: 0, uptime: "-", firmware: "Cisco ISR 4331", lastSeen: m(120), zone: "车间网络" },
  { id: "d16", clientId: "c4", name: "SRV-SCADA-01", type: "server", ip: "10.100.10.1", status: "critical", cpu: 88, memory: 85, uptime: "15d 8h", firmware: "Windows Server 2019", lastSeen: m(1), zone: "SCADA 区" },
];

export const MOCK_NET_ALERTS: NetworkAlert[] = [
  { id: "na1", clientId: "c1", deviceId: "d6", deviceName: "IDS-NET-01", severity: "critical", title: "IDS 引擎 CPU 过载，检测能力下降", timestamp: m(3), acknowledged: false },
  { id: "na2", clientId: "c1", deviceId: "d2", deviceName: "FW-DMZ-01", severity: "high", title: "DMZ 防火墙内存使用率超过 80%", timestamp: m(15), acknowledged: false },
  { id: "na3", clientId: "c1", deviceId: "d2", deviceName: "FW-DMZ-01", severity: "medium", title: "异常出站连接数激增 300%", timestamp: m(20), acknowledged: true },
  { id: "na4", clientId: "c2", deviceId: "d10", deviceName: "SRV-APP-01", severity: "critical", title: "应用服务器 CPU/内存双高，服务响应超时", timestamp: m(8), acknowledged: false },
  { id: "na5", clientId: "c2", deviceId: "d9", deviceName: "RT-WAN-01", severity: "high", title: "WAN 链路丢包率 > 5%", timestamp: m(30), acknowledged: false },
  { id: "na6", clientId: "c2", deviceId: "d10", deviceName: "SRV-APP-01", severity: "high", title: "磁盘 I/O 延迟异常", timestamp: m(12), acknowledged: true },
  { id: "na7", clientId: "c4", deviceId: "d15", deviceName: "RT-PLANT-01", severity: "critical", title: "车间路由器离线超过 2 小时", timestamp: m(120), acknowledged: false },
  { id: "na8", clientId: "c4", deviceId: "d16", deviceName: "SRV-SCADA-01", severity: "high", title: "SCADA 服务器异常进程检测", timestamp: m(10), acknowledged: false },
  { id: "na9", clientId: "c4", deviceId: "d14", deviceName: "FW-OT-01", severity: "medium", title: "OT 防火墙固件版本过旧", timestamp: m(60), acknowledged: true },
  { id: "na10", clientId: "c3", deviceId: "d12", deviceName: "FW-HIS-01", severity: "low", title: "HIS 防火墙策略审计提醒", timestamp: m(180), acknowledged: true },
];

export const MOCK_OPS_TICKETS: OpsTicket[] = [
  { id: "OPS-001", clientId: "c1", title: "IDS 引擎性能优化", type: "incident", priority: "P1", status: "in_progress", assignee: "张明", createdAt: m(3), updatedAt: m(1) },
  { id: "OPS-002", clientId: "c2", title: "应用服务器扩容评估", type: "change", priority: "P2", status: "open", assignee: "李薇", createdAt: m(8), updatedAt: m(8) },
  { id: "OPS-003", clientId: "c4", title: "车间路由器故障排查", type: "incident", priority: "P1", status: "in_progress", assignee: "王强", createdAt: m(120), updatedAt: m(30) },
  { id: "OPS-004", clientId: "c1", title: "DMZ 防火墙内存泄漏排查", type: "incident", priority: "P2", status: "pending", assignee: "张明", createdAt: m(15), updatedAt: m(10) },
  { id: "OPS-005", clientId: "c3", title: "季度安全策略审计", type: "maintenance", priority: "P3", status: "open", assignee: "赵磊", createdAt: m(180), updatedAt: m(180) },
  { id: "OPS-006", clientId: "c4", title: "OT 防火墙固件升级", type: "change", priority: "P3", status: "open", assignee: "陈雪", createdAt: m(60), updatedAt: m(60) },
  { id: "OPS-007", clientId: "c2", title: "WAN 链路质量优化", type: "request", priority: "P2", status: "in_progress", assignee: "王强", createdAt: m(30), updatedAt: m(15) },
  { id: "OPS-008", clientId: "c5", title: "新学期网络扩容方案", type: "change", priority: "P4", status: "resolved", assignee: "李薇", createdAt: m(500), updatedAt: m(100) },
];
