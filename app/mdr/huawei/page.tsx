"use client";

import { useState, useCallback } from "react";
import NavBar from "@/components/NavBar";

/* ── Types ── */
interface HuaweiConfig {
  host: string;
  port: string;
  protocol: "restconf" | "netconf" | "ssh";
  username: string;
  password: string;
  verifySsl: boolean;
  model: string;
}

type ActionType = "block_ip" | "block_domain" | "block_port" | "isolate_host" | "add_policy" | "add_blacklist";
type ActionStatus = "pending" | "executing" | "success" | "failed" | "rollback";

interface DisposalAction {
  id: string;
  type: ActionType;
  params: Record<string, string>;
  status: ActionStatus;
  ticketId?: string;
  operator: string;
  createdAt: string;
  executedAt?: string;
  result?: string;
  commands: string[];
}

interface TestResult {
  status: "idle" | "testing" | "success" | "error";
  message: string;
  model?: string;
  version?: string;
  hostname?: string;
}

const ACTION_LABELS: Record<ActionType, { label: string; icon: string; desc: string }> = {
  block_ip: { label: "封禁 IP", icon: "🚫", desc: "将恶意 IP 加入黑名单策略" },
  block_domain: { label: "封禁域名", icon: "🌐", desc: "DNS 过滤阻断恶意域名" },
  block_port: { label: "封禁端口", icon: "🔌", desc: "关闭指定端口的入站/出站" },
  isolate_host: { label: "隔离主机", icon: "🔒", desc: "将受感染主机移入隔离区" },
  add_policy: { label: "下发策略", icon: "📋", desc: "新增自定义安全策略规则" },
  add_blacklist: { label: "加入黑名单", icon: "⛔", desc: "IP/MAC 加入全局黑名单" },
};

const STATUS_STYLE: Record<ActionStatus, { label: string; color: string }> = {
  pending: { label: "待执行", color: "bg-gray-500/20 text-gray-400" },
  executing: { label: "执行中", color: "bg-cyan-500/20 text-cyan-400" },
  success: { label: "已完成", color: "bg-green-500/20 text-green-400" },
  failed: { label: "失败", color: "bg-red-500/20 text-red-400" },
  rollback: { label: "已回滚", color: "bg-yellow-500/20 text-yellow-400" },
};

const DEFAULT_CONFIG: HuaweiConfig = {
  host: "", port: "8443", protocol: "restconf",
  username: "", password: "", verifySsl: true, model: "USG6000E",
};

// Generate CLI commands for each action type
function genCommands(type: ActionType, params: Record<string, string>): string[] {
  switch (type) {
    case "block_ip": return [
      `system-view`,
      `ip address-set ${params.name || "MDR_Blocked"} type object`,
      `  address ${params.ip} mask ${params.mask || "32"}`,
      `quit`,
      `security-policy`,
      `  rule name MDR_Block_${params.ip?.replace(/\./g, "_")}`,
      `    source-address address-set ${params.name || "MDR_Blocked"}`,
      `    action deny`,
      `quit`,
    ];
    case "block_domain": return [
      `system-view`,
      `profile type dns-filter name MDR_DNS_Block`,
      `  dns-filter category custom action block`,
      `  custom-category name MDR_Blocked_Domains`,
      `    domain ${params.domain}`,
      `quit`,
    ];
    case "block_port": return [
      `system-view`,
      `security-policy`,
      `  rule name MDR_Block_Port_${params.port}`,
      `    source-zone ${params.srcZone || "untrust"}`,
      `    destination-zone ${params.dstZone || "trust"}`,
      `    service protocol ${params.protocol || "tcp"} destination-port ${params.port}`,
      `    action deny`,
      `quit`,
    ];
    case "isolate_host": return [
      `system-view`,
      `security-policy`,
      `  rule name MDR_Isolate_${params.ip?.replace(/\./g, "_")}`,
      `    source-address ${params.ip} mask 32`,
      `    action deny`,
      `  rule name MDR_Isolate_${params.ip?.replace(/\./g, "_")}_in`,
      `    destination-address ${params.ip} mask 32`,
      `    action deny`,
      `quit`,
    ];
    case "add_policy": return [
      `system-view`,
      `security-policy`,
      `  rule name ${params.name || "MDR_Custom_Rule"}`,
      `    source-zone ${params.srcZone || "any"}`,
      `    destination-zone ${params.dstZone || "any"}`,
      `    ${params.srcIp ? `source-address ${params.srcIp} mask ${params.srcMask || "32"}` : ""}`,
      `    ${params.dstIp ? `destination-address ${params.dstIp} mask ${params.dstMask || "32"}` : ""}`,
      `    ${params.service ? `service ${params.service}` : ""}`,
      `    action ${params.action || "deny"}`,
      `quit`,
    ].filter((c) => c.trim());
    case "add_blacklist": return [
      `system-view`,
      `firewall blacklist enable`,
      `firewall blacklist item ${params.ip} timeout ${params.timeout || "1440"}`,
      `quit`,
    ];
    default: return [];
  }
}

const MOCK_HISTORY: DisposalAction[] = [
  {
    id: "DA-001", type: "block_ip", params: { ip: "185.220.101.42", mask: "32", name: "MDR_C2_Block" },
    status: "success", ticketId: "TK-20260226-002", operator: "张明", createdAt: "2026-02-26T09:05:00+08:00",
    executedAt: "2026-02-26T09:05:03+08:00", result: "策略下发成功，已生效",
    commands: genCommands("block_ip", { ip: "185.220.101.42", mask: "32", name: "MDR_C2_Block" }),
  },
  {
    id: "DA-002", type: "isolate_host", params: { ip: "10.1.10.32" },
    status: "success", ticketId: "TK-20260226-001", operator: "张明", createdAt: "2026-02-26T09:02:00+08:00",
    executedAt: "2026-02-26T09:02:05+08:00", result: "主机已隔离，双向流量阻断",
    commands: genCommands("isolate_host", { ip: "10.1.10.32" }),
  },
  {
    id: "DA-003", type: "block_domain", params: { domain: "susp-domain.xyz" },
    status: "success", ticketId: "TK-20260226-003", operator: "王强", createdAt: "2026-02-26T09:10:00+08:00",
    executedAt: "2026-02-26T09:10:02+08:00", result: "DNS 过滤策略已生效",
    commands: genCommands("block_domain", { domain: "susp-domain.xyz" }),
  },
  {
    id: "DA-004", type: "add_blacklist", params: { ip: "103.45.67.89", timeout: "720" },
    status: "failed", operator: "李薇", createdAt: "2026-02-26T09:15:00+08:00",
    result: "连接超时，防火墙未响应",
    commands: genCommands("add_blacklist", { ip: "103.45.67.89", timeout: "720" }),
  },
];

const inputCls = "w-full px-3 py-2 text-sm rounded-lg bg-black/[0.03] border border-black/[0.06] text-[#1a1a2e] placeholder-[#94a3b8] focus:outline-none focus:border-black/[0.15] transition-all";
const selectCls = inputCls + " appearance-none";

type HwTab = "connect" | "dispose" | "history" | "api";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m}分钟前`;
  return `${Math.floor(m / 60)}小时前`;
}

/* ── Connection Panel ── */
function ConnPanel({ config, setConfig, test, onTest }: {
  config: HuaweiConfig; setConfig: (c: HuaweiConfig) => void; test: TestResult; onTest: () => void;
}) {
  const upd = (k: keyof HuaweiConfig, v: string | boolean) => setConfig({ ...config, [k]: v });
  return (
    <div className="space-y-5">
      <div className="glass rounded-xl p-5">
        <div className="text-sm font-medium text-[#1a1a2e] mb-4">🔌 华为防火墙连接配置</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="block text-xs text-[#64748b] mb-1">防火墙地址</label>
            <input className={inputCls} placeholder="192.168.1.1" value={config.host} onChange={(e) => upd("host", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs text-[#64748b] mb-1">端口</label>
              <input className={inputCls} placeholder="8443" value={config.port} onChange={(e) => upd("port", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">设备型号</label>
              <select className={selectCls} value={config.model} onChange={(e) => upd("model", e.target.value)}>
                <option value="USG6000E">USG6000E</option>
                <option value="USG6000">USG6000</option>
                <option value="USG9500">USG9500</option>
                <option value="HiSecEngine">HiSecEngine</option>
              </select></div>
          </div>
        </div>
        <div className="mt-4"><label className="block text-xs text-[#64748b] mb-1">接口协议</label>
          <div className="flex gap-3">
            {(["restconf", "netconf", "ssh"] as const).map((p) => (
              <button key={p} onClick={() => upd("protocol", p)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${config.protocol === p ? "bg-red-600/10 text-red-600 border-red-600/30" : "bg-black/[0.03] text-[#64748b] border-black/[0.06]"}`}>
                {p === "restconf" ? "RESTCONF (8443)" : p === "netconf" ? "NETCONF (830)" : "SSH (22)"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><label className="block text-xs text-[#64748b] mb-1">用户名</label>
            <input className={inputCls} placeholder="admin" value={config.username} onChange={(e) => upd("username", e.target.value)} /></div>
          <div><label className="block text-xs text-[#64748b] mb-1">密码</label>
            <input className={inputCls} type="password" placeholder="••••••••" value={config.password} onChange={(e) => upd("password", e.target.value)} /></div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input type="checkbox" id="hwssl" checked={config.verifySsl} onChange={(e) => upd("verifySsl", e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-red-600" />
          <label htmlFor="hwssl" className="text-xs text-[#64748b]">验证 SSL 证书</label>
        </div>
      </div>
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-[#1a1a2e]">🧪 连接测试</div>
          <button onClick={onTest} disabled={test.status === "testing"}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600/10 text-red-600 border border-red-600/20 hover:bg-red-600/20 disabled:opacity-50 transition-all">
            {test.status === "testing" ? "测试中..." : "测试连接"}
          </button>
        </div>
        {test.status !== "idle" && (
          <div className={`rounded-lg p-3 text-xs ${test.status === "success" ? "bg-green-500/10 border border-green-500/20" : test.status === "error" ? "bg-red-500/10 border border-red-500/20" : "bg-black/[0.03] border border-black/[0.06]"}`}>
            {test.status === "testing" && <div className="flex items-center gap-2 text-[#64748b]"><div className="w-3 h-3 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />正在连接华为防火墙...</div>}
            {test.status === "success" && <div className="space-y-1"><div className="text-green-600 font-medium">✅ 连接成功</div><div className="text-[#64748b]">设备: {test.hostname} · 型号: {test.model} · 版本: {test.version}</div></div>}
            {test.status === "error" && <div className="text-red-500">❌ {test.message}</div>}
          </div>
        )}
        <div className="mt-4 text-[10px] text-[#94a3b8] space-y-0.5">
          <div className="text-[#64748b] font-medium mb-1">华为防火墙 API 端点：</div>
          <div>▸ RESTCONF: https://host:8443/restconf/data/huawei-security-policy:sec-policy</div>
          <div>▸ NETCONF: ssh://host:830 (RFC 6241, YANG model)</div>
          <div>▸ SSH CLI: ssh://host:22 (交互式命令行)</div>
        </div>
      </div>
    </div>
  );
}

/* ── Disposal Panel ── */
function DisposePanel({ onExecute }: { onExecute: (action: DisposalAction) => void }) {
  const [actionType, setActionType] = useState<ActionType>("block_ip");
  const [params, setParams] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);

  const commands = genCommands(actionType, params);
  const updParam = (k: string, v: string) => setParams({ ...params, [k]: v });

  const handleExecute = () => {
    const action: DisposalAction = {
      id: `DA-${Date.now()}`, type: actionType, params: { ...params },
      status: "executing", operator: "当前用户", createdAt: new Date().toISOString(),
      commands,
    };
    onExecute(action);
  };

  return (
    <div className="space-y-4">
      {/* Action type selector */}
      <div className="glass rounded-xl p-4">
        <div className="text-sm font-medium text-[#1a1a2e] mb-3">🎯 选择处置动作</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.entries(ACTION_LABELS) as [ActionType, typeof ACTION_LABELS[ActionType]][]).map(([key, val]) => (
            <button key={key} onClick={() => { setActionType(key); setParams({}); setPreview(false); }}
              className={`p-3 rounded-lg border text-left transition-all ${actionType === key ? "bg-red-600/10 border-red-600/20" : "bg-black/[0.02] border-black/[0.06] hover:bg-black/[0.04]"}`}>
              <div className="text-lg mb-1">{val.icon}</div>
              <div className={`text-xs font-medium ${actionType === key ? "text-red-600" : "text-[#1a1a2e]"}`}>{val.label}</div>
              <div className="text-[10px] text-[#94a3b8] mt-0.5">{val.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Params form */}
      <div className="glass rounded-xl p-4">
        <div className="text-sm font-medium text-[#1a1a2e] mb-3">📝 参数配置</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {actionType === "block_ip" && <>
            <div><label className="block text-xs text-[#64748b] mb-1">恶意 IP 地址 *</label><input className={inputCls} placeholder="185.220.101.42" value={params.ip || ""} onChange={(e) => updParam("ip", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">子网掩码</label><input className={inputCls} placeholder="32" value={params.mask || ""} onChange={(e) => updParam("mask", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">地址集名称</label><input className={inputCls} placeholder="MDR_Blocked" value={params.name || ""} onChange={(e) => updParam("name", e.target.value)} /></div>
          </>}
          {actionType === "block_domain" && <>
            <div className="sm:col-span-2"><label className="block text-xs text-[#64748b] mb-1">恶意域名 *</label><input className={inputCls} placeholder="malware-c2.example.com" value={params.domain || ""} onChange={(e) => updParam("domain", e.target.value)} /></div>
          </>}
          {actionType === "block_port" && <>
            <div><label className="block text-xs text-[#64748b] mb-1">端口号 *</label><input className={inputCls} placeholder="4444" value={params.port || ""} onChange={(e) => updParam("port", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">协议</label><select className={selectCls} value={params.protocol || "tcp"} onChange={(e) => updParam("protocol", e.target.value)}><option value="tcp">TCP</option><option value="udp">UDP</option></select></div>
            <div><label className="block text-xs text-[#64748b] mb-1">源区域</label><input className={inputCls} placeholder="untrust" value={params.srcZone || ""} onChange={(e) => updParam("srcZone", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">目标区域</label><input className={inputCls} placeholder="trust" value={params.dstZone || ""} onChange={(e) => updParam("dstZone", e.target.value)} /></div>
          </>}
          {actionType === "isolate_host" && <>
            <div className="sm:col-span-2"><label className="block text-xs text-[#64748b] mb-1">主机 IP *</label><input className={inputCls} placeholder="10.1.10.32" value={params.ip || ""} onChange={(e) => updParam("ip", e.target.value)} /></div>
          </>}
          {actionType === "add_policy" && <>
            <div><label className="block text-xs text-[#64748b] mb-1">策略名称 *</label><input className={inputCls} placeholder="MDR_Custom_Rule" value={params.name || ""} onChange={(e) => updParam("name", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">动作</label><select className={selectCls} value={params.action || "deny"} onChange={(e) => updParam("action", e.target.value)}><option value="deny">拒绝 (deny)</option><option value="permit">允许 (permit)</option></select></div>
            <div><label className="block text-xs text-[#64748b] mb-1">源 IP</label><input className={inputCls} placeholder="any" value={params.srcIp || ""} onChange={(e) => updParam("srcIp", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">目标 IP</label><input className={inputCls} placeholder="any" value={params.dstIp || ""} onChange={(e) => updParam("dstIp", e.target.value)} /></div>
          </>}
          {actionType === "add_blacklist" && <>
            <div><label className="block text-xs text-[#64748b] mb-1">IP 地址 *</label><input className={inputCls} placeholder="103.45.67.89" value={params.ip || ""} onChange={(e) => updParam("ip", e.target.value)} /></div>
            <div><label className="block text-xs text-[#64748b] mb-1">超时(分钟)</label><input className={inputCls} placeholder="1440" value={params.timeout || ""} onChange={(e) => updParam("timeout", e.target.value)} /></div>
          </>}
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={() => setPreview(!preview)}
            className="px-3 py-1.5 text-xs rounded-lg bg-black/[0.03] text-[#64748b] border border-black/[0.06] hover:bg-black/[0.05] transition-all">
            {preview ? "隐藏预览" : "📋 预览命令"}
          </button>
          <button onClick={handleExecute}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all">
            ⚡ 立即执行
          </button>
        </div>

        {preview && (
          <div className="mt-3 rounded-lg bg-[#1e293b] p-3 overflow-x-auto">
            <div className="text-[10px] text-gray-500 mb-2">华为 USG CLI 命令预览：</div>
            {commands.map((cmd, i) => (
              <div key={i} className="font-mono text-[11px] text-green-400 leading-5">
                <span className="text-gray-600 mr-2">{String(i + 1).padStart(2, "0")}</span>{cmd}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESTCONF API example */}
      <div className="glass rounded-xl p-4">
        <div className="text-[10px] text-[#94a3b8] space-y-0.5">
          <div className="text-[#64748b] font-medium mb-1">RESTCONF API 调用示例：</div>
          <div className="rounded-lg bg-[#1e293b] p-3 font-mono text-[10px] text-cyan-400 overflow-x-auto">
            <div className="text-gray-500">PUT /restconf/data/huawei-security-policy:sec-policy/static-policy</div>
            <div className="text-gray-500">Content-Type: application/yang-data+json</div>
            <div className="text-gray-500">Authorization: Basic {"<base64>"}</div>
            <div className="mt-1 text-cyan-400">{"{"}</div>
            <div className="ml-2">{'"rule": [{'}</div>
            <div className="ml-4">{'"name": "MDR_Block_Rule",'}</div>
            <div className="ml-4">{'"source-ip": { "address": "185.x.x.42/32" },'}</div>
            <div className="ml-4">{'"action": "deny"'}</div>
            <div className="ml-2">{"}]"}</div>
            <div>{"}"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── History Item ── */
function HistoryItem({ action: a }: { action: DisposalAction }) {
  const [showCmd, setShowCmd] = useState(false);
  const meta = ACTION_LABELS[a.type];
  const st = STATUS_STYLE[a.status];
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="text-[10px] text-[#94a3b8] font-mono">{a.id}</span>
        <span className="text-sm">{meta.icon}</span>
        <span className="text-xs font-medium text-[#1a1a2e]">{meta.label}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
        {a.ticketId && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">🔗 {a.ticketId}</span>}
      </div>
      <div className="text-xs text-[#64748b] mt-1">
        {Object.entries(a.params).map(([k, v]) => <span key={k} className="mr-3"><span className="text-[#94a3b8]">{k}:</span> <span className="font-mono">{v}</span></span>)}
      </div>
      {a.result && <div className={`text-xs mt-1 ${a.status === "success" ? "text-green-600" : a.status === "failed" ? "text-red-500" : "text-[#64748b]"}`}>{a.result}</div>}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-[#94a3b8]">
        <span>👤 {a.operator}</span>
        <span>📅 {timeAgo(a.createdAt)}</span>
        {a.executedAt && <span>⚡ 耗时 {Math.round((new Date(a.executedAt).getTime() - new Date(a.createdAt).getTime()) / 1000)}s</span>}
        <button onClick={() => setShowCmd(!showCmd)} className="text-blue-500 hover:underline ml-auto">{showCmd ? "隐藏命令" : "查看命令"}</button>
      </div>
      {showCmd && (
        <div className="mt-2 rounded-lg bg-[#1e293b] p-2 overflow-x-auto">
          {a.commands.map((cmd, i) => (
            <div key={i} className="font-mono text-[10px] text-green-400 leading-4">{cmd}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main Huawei Page
   ══════════════════════════════════════════════ */
export default function HuaweiPage() {
  const [tab, setTab] = useState<HwTab>("connect");
  const [config, setConfig] = useState<HuaweiConfig>(DEFAULT_CONFIG);
  const [test, setTest] = useState<TestResult>({ status: "idle", message: "" });
  const [history, setHistory] = useState<DisposalAction[]>(MOCK_HISTORY);

  const handleTest = useCallback(() => {
    setTest({ status: "testing", message: "" });
    setTimeout(() => {
      if (config.host) {
        setTest({ status: "success", message: "", hostname: config.host, model: config.model, version: "V500R005C20SPC600" });
      } else {
        setTest({ status: "error", message: "请填写防火墙地址" });
      }
    }, 1500);
  }, [config.host, config.model]);

  const handleExecute = useCallback((action: DisposalAction) => {
    setHistory((prev) => [action, ...prev]);
    setTab("history");
    // Simulate execution
    setTimeout(() => {
      setHistory((prev) => prev.map((a) => a.id === action.id ? { ...a, status: "success" as ActionStatus, executedAt: new Date().toISOString(), result: "策略下发成功，已生效" } : a));
    }, 2000);
  }, []);

  const tabs: { key: HwTab; label: string; icon: string }[] = [
    { key: "connect", label: "连接配置", icon: "🔌" },
    { key: "dispose", label: "处置下发", icon: "⚡" },
    { key: "history", label: "执行记录", icon: "📜" },
    { key: "api", label: "API 参考", icon: "📖" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <NavBar active="MDR" />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <a href="/mdr" className="text-xs text-[#94a3b8] hover:text-[#64748b] transition-colors">← MDR 工单系统</a>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center text-white font-bold text-sm">HW</div>
            <div>
              <h1 className="text-xl font-bold text-[#1a1a2e]">华为防火墙处置下发</h1>
              <p className="text-xs text-[#94a3b8]">USG6000E / USG9500 · RESTCONF / NETCONF / SSH · 安全策略自动化下发</p>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="glass rounded-xl p-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${test.status === "success" ? "bg-green-500 animate-pulse" : "bg-[#94a3b8]"}`} />
              <span className="text-[#64748b]">{test.status === "success" ? `已连接 · ${config.model}` : "未连接"}</span>
            </div>
            <div className="text-[#94a3b8]">协议: {config.protocol.toUpperCase()}</div>
            <div className="text-[#94a3b8]">执行记录: {history.length} 条</div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-[11px] rounded-lg bg-black/[0.03] text-[#64748b] hover:bg-black/[0.05] transition-all">导出日志</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                tab === t.key ? "text-[#1a1a2e] bg-black/[0.05] border border-black/[0.08]" : "text-[#64748b] hover:text-[#1a1a2e] hover:bg-black/[0.04]"
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === "connect" && <ConnPanel config={config} setConfig={setConfig} test={test} onTest={handleTest} />}
        {tab === "dispose" && <DisposePanel onExecute={handleExecute} />}

        {/* History */}
        {tab === "history" && (
          <div className="space-y-3">
            <div className="text-xs text-[#64748b] mb-2">{history.length} 条执行记录</div>
            {history.map((a) => <HistoryItem key={a.id} action={a} />)}
          </div>
        )}

        {/* API Reference */}
        {tab === "api" && (
          <div className="space-y-4">
            <div className="glass rounded-xl p-5">
              <div className="text-sm font-medium text-[#1a1a2e] mb-3">📖 华为防火墙 API 参考</div>
              <div className="space-y-4">
                {[
                  { title: "RESTCONF API", port: "8443", desc: "基于 HTTPS 的 RESTful 接口，支持 YANG 数据模型", endpoints: [
                    "GET /restconf/data/huawei-system:system — 设备信息",
                    "GET /restconf/data/huawei-security-policy:sec-policy — 查询安全策略",
                    "PUT /restconf/data/huawei-security-policy:sec-policy/static-policy — 下发策略",
                    "POST /restconf/data/huawei-security-policy:sec-policy/static-policy/rule — 新增规则",
                    "DELETE /restconf/data/.../rule={name} — 删除规则",
                    "GET /restconf/data/huawei-aaa:aaa — 用户认证信息",
                  ]},
                  { title: "NETCONF API", port: "830", desc: "基于 SSH 的 XML-RPC 接口，RFC 6241", endpoints: [
                    "<get-config> — 获取当前配置",
                    "<edit-config> — 编辑配置（策略下发）",
                    "<commit> — 提交配置变更",
                    "<validate> — 验证配置合法性",
                    "<lock> / <unlock> — 配置锁定",
                  ]},
                  { title: "SSH CLI", port: "22", desc: "交互式命令行，适合批量脚本执行", endpoints: [
                    "display security-policy rule all — 查看所有策略",
                    "display firewall blacklist — 查看黑名单",
                    "display zone — 查看安全区域",
                    "display interface brief — 查看接口状态",
                    "display firewall session table — 查看会话表",
                  ]},
                ].map((api) => (
                  <div key={api.title} className="rounded-lg bg-black/[0.02] border border-black/[0.04] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-[#1a1a2e]">{api.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600/10 text-red-600">Port {api.port}</span>
                    </div>
                    <div className="text-[10px] text-[#94a3b8] mb-2">{api.desc}</div>
                    <div className="space-y-1">
                      {api.endpoints.map((ep, i) => (
                        <div key={i} className="font-mono text-[10px] text-[#64748b]">▸ {ep}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}