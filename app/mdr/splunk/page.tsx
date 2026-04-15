"use client";

import { useState, useCallback } from "react";
import NavBar from "@/components/NavBar";

/* ── Types ── */
interface SplunkConfig {
  host: string;
  port: string;
  scheme: "https" | "http";
  authType: "token" | "basic";
  token: string;
  username: string;
  password: string;
  verifySsl: boolean;
}

interface DataSource {
  id: string;
  type: "index" | "saved_search" | "notable" | "alert";
  name: string;
  query: string;
  interval: number; // seconds
  enabled: boolean;
  severity_field: string;
  host_field: string;
  description_field: string;
}

interface FieldMapping {
  splunkField: string;
  mdrField: string;
  transform: string;
}

interface TestResult {
  status: "idle" | "testing" | "success" | "error";
  message: string;
  version?: string;
  serverName?: string;
  latency?: number;
}

interface PreviewAlert {
  _time: string;
  source: string;
  severity: string;
  host: string;
  description: string;
  raw: string;
}

const DEFAULT_CONFIG: SplunkConfig = {
  host: "",
  port: "8089",
  scheme: "https",
  authType: "token",
  token: "",
  username: "",
  password: "",
  verifySsl: true,
};

const DEFAULT_SOURCES: DataSource[] = [
  {
    id: "ds-1", type: "notable", name: "ES Notable Events",
    query: '| `notable` | where urgency IN ("critical","high") | head 100',
    interval: 60, enabled: true,
    severity_field: "urgency", host_field: "dest", description_field: "rule_name",
  },
  {
    id: "ds-2", type: "saved_search", name: "EDR Alerts",
    query: 'savedsearch "EDR - Critical Alerts"',
    interval: 120, enabled: true,
    severity_field: "severity", host_field: "src_host", description_field: "alert_name",
  },
  {
    id: "ds-3", type: "index", name: "Firewall Blocks",
    query: 'index=firewall action=blocked | stats count by src_ip dest_ip | where count > 50',
    interval: 300, enabled: false,
    severity_field: "priority", host_field: "src_ip", description_field: "rule",
  },
];

const DEFAULT_MAPPINGS: FieldMapping[] = [
  { splunkField: "urgency / severity", mdrField: "severity", transform: "critical→critical, high→high, medium→medium, *→low" },
  { splunkField: "dest / src_host", mdrField: "host", transform: "直接映射" },
  { splunkField: "rule_name / alert_name", mdrField: "title", transform: "直接映射" },
  { splunkField: "search_name", mdrField: "source", transform: "ES→SIEM, EDR→EDR, Firewall→NDR" },
  { splunkField: "_time", mdrField: "timestamp", transform: "ISO 8601 转换" },
  { splunkField: "mitre_technique_id", mdrField: "mitreId", transform: "直接映射（如有）" },
  { splunkField: "_raw", mdrField: "raw", transform: "截取前 500 字符" },
];

const MOCK_PREVIEW: PreviewAlert[] = [
  { _time: "2026-02-26T09:15:23+08:00", source: "ES Notable", severity: "critical", host: "WS-FIN-032", description: "Cobalt Strike Beacon Communication Detected", raw: 'src=10.0.3.32 dest=185.xx.xx.42:443 app=ssl bytes_out=1024 action=allowed rule="C2 Beacon Detection"' },
  { _time: "2026-02-26T09:12:05+08:00", source: "EDR Alert", severity: "high", host: "DC-CORE-01", description: "Suspicious PsExec Remote Execution", raw: 'process=psexec.exe user=ADMIN parent=cmd.exe dest=DC-CORE-01 action=created service=PSEXESVC' },
  { _time: "2026-02-26T09:08:41+08:00", source: "ES Notable", severity: "critical", host: "DB-PROD-05", description: "DNS Tunneling Exfiltration Attempt", raw: 'query_type=TXT query=encoded.susp-domain.xyz answer_count=1 query_count=4500 bytes=200' },
  { _time: "2026-02-26T09:01:12+08:00", source: "EDR Alert", severity: "high", host: "FS-SHARE-01", description: "Ransomware File Encryption Activity", raw: 'process=svchost.exe files_modified=1200 extension=.locked vss_deleted=true' },
  { _time: "2026-02-26T08:55:30+08:00", source: "ES Notable", severity: "medium", host: "aad:tenant-prod", description: "Brute Force Authentication Attempts", raw: 'failed_logins=523 target=admin@corp.com unique_sources=12 geo=distributed timespan=600s' },
];

type SplunkTab = "connection" | "sources" | "mapping" | "preview";

const sevColor: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400 border-red-500/30",
  high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

/* ── Input Component ── */
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs text-[#64748b] mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-[#94a3b8] mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm rounded-lg bg-black/[0.03] border border-black/[0.06] text-[#1a1a2e] placeholder-[#484f58] focus:outline-none focus:border-black/[0.1] focus:bg-black/[0.04] transition-all";
const selectCls = inputCls + " appearance-none";

/* ── Connection Panel ── */
function ConnectionPanel({ config, setConfig, testResult, onTest }: {
  config: SplunkConfig; setConfig: (c: SplunkConfig) => void; testResult: TestResult; onTest: () => void;
}) {
  const upd = (k: keyof SplunkConfig, v: string | boolean) => setConfig({ ...config, [k]: v });
  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-5">
        <div className="text-sm font-medium text-[#1a1a2e] mb-4">🔌 Splunk 连接配置</div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Splunk 地址" hint="Splunk Enterprise/Cloud 管理地址">
            <input className={inputCls} placeholder="splunk.example.com" value={config.host} onChange={(e) => upd("host", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="管理端口">
              <input className={inputCls} placeholder="8089" value={config.port} onChange={(e) => upd("port", e.target.value)} />
            </Field>
            <Field label="协议">
              <select className={selectCls} value={config.scheme} onChange={(e) => upd("scheme", e.target.value)}>
                <option value="https">HTTPS</option>
                <option value="http">HTTP</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="mt-4">
          <Field label="认证方式">
            <div className="flex gap-3">
              {(["token", "basic"] as const).map((t) => (
                <button key={t} onClick={() => upd("authType", t)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${config.authType === t ? "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/30" : "bg-black/[0.03] text-[#64748b] border-black/[0.06] hover:bg-black/[0.04]"}`}>
                  {t === "token" ? "Bearer Token" : "用户名/密码"}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {config.authType === "token" ? (
          <div className="mt-4">
            <Field label="API Token" hint="Splunk Settings → Tokens 中创建">
              <input className={inputCls} type="password" placeholder="eyJraWQiOi..." value={config.token} onChange={(e) => upd("token", e.target.value)} />
            </Field>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="用户名">
              <input className={inputCls} placeholder="admin" value={config.username} onChange={(e) => upd("username", e.target.value)} />
            </Field>
            <Field label="密码">
              <input className={inputCls} type="password" placeholder="••••••••" value={config.password} onChange={(e) => upd("password", e.target.value)} />
            </Field>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2">
          <input type="checkbox" id="ssl" checked={config.verifySsl} onChange={(e) => upd("verifySsl", e.target.checked)}
            className="w-3.5 h-3.5 rounded border-black/[0.1] bg-black/[0.03] accent-[#2563eb]" />
          <label htmlFor="ssl" className="text-xs text-[#64748b]">验证 SSL 证书</label>
        </div>
      </div>

      {/* Test Connection */}
      <div className="glass rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-medium text-[#1a1a2e]">🧪 连接测试</div>
          <button onClick={onTest} disabled={testResult.status === "testing"}
            className="px-4 py-1.5 text-xs font-medium rounded-lg bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 hover:bg-[#2563eb]/20 disabled:opacity-50 transition-all">
            {testResult.status === "testing" ? "测试中..." : "测试连接"}
          </button>
        </div>
        {testResult.status !== "idle" && (
          <div className={`rounded-lg p-3 text-xs ${testResult.status === "success" ? "bg-green-500/10 border border-green-500/20" : testResult.status === "error" ? "bg-red-500/10 border border-red-500/20" : "bg-black/[0.03] border border-black/[0.06]"}`}>
            {testResult.status === "testing" && (
              <div className="flex items-center gap-2 text-[#64748b]">
                <div className="w-3 h-3 rounded-full border-2 border-[#2563eb] border-t-transparent animate-spin" />
                正在连接 Splunk...
              </div>
            )}
            {testResult.status === "success" && (
              <div className="space-y-1">
                <div className="text-green-400 font-medium">✅ 连接成功</div>
                <div className="text-[#64748b]">服务器: {testResult.serverName} · 版本: {testResult.version} · 延迟: {testResult.latency}ms</div>
              </div>
            )}
            {testResult.status === "error" && (
              <div className="text-red-400">❌ {testResult.message}</div>
            )}
          </div>
        )}

        {/* API Endpoints Reference */}
        <div className="mt-4 text-[10px] text-[#94a3b8] space-y-0.5">
          <div className="text-[#78859b] font-medium mb-1">使用的 Splunk REST API 端点：</div>
          <div>▸ GET /services/server/info — 服务器信息与连接验证</div>
          <div>▸ POST /services/search/jobs — 创建搜索任务</div>
          <div>▸ GET /services/search/jobs/{"{sid}"}/results — 获取搜索结果</div>
          <div>▸ GET /services/alerts/fired_alerts — 已触发告警</div>
          <div>▸ GET /services/notable_update — ES Notable Events (需 ES 许可)</div>
        </div>
      </div>
    </div>
  );
}

/* ── Sources Panel ── */
function SourcesPanel({ sources, setSources }: { sources: DataSource[]; setSources: (s: DataSource[]) => void }) {
  const typeLabels: Record<string, string> = { index: "索引查询", saved_search: "Saved Search", notable: "Notable Events", alert: "Fired Alerts" };
  const typeIcons: Record<string, string> = { index: "🗄️", saved_search: "🔖", notable: "⚡", alert: "🔔" };
  const toggle = (id: string) => setSources(sources.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-[#1a1a2e]">📡 数据源配置</div>
        <div className="text-[10px] text-[#94a3b8]">配置 Splunk 告警拉取方式</div>
      </div>
      {sources.map((src) => (
        <div key={src.id} className={`glass rounded-xl p-4 transition-all ${src.enabled ? "" : "opacity-50"}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span>{typeIcons[src.type]}</span>
                <span className="text-sm font-medium text-[#1a1a2e]">{src.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.04] text-[#64748b]">{typeLabels[src.type]}</span>
              </div>
              <div className="font-mono text-[11px] text-[#78859b] bg-black/[0.02] rounded-lg p-2 mt-2 overflow-x-auto">
                {src.query}
              </div>
              <div className="flex gap-4 mt-2 text-[10px] text-[#94a3b8]">
                <span>⏱ 每 {src.interval}s 拉取</span>
                <span>severity: {src.severity_field}</span>
                <span>host: {src.host_field}</span>
                <span>desc: {src.description_field}</span>
              </div>
            </div>
            <button onClick={() => toggle(src.id)}
              className={`shrink-0 w-10 h-5 rounded-full transition-all relative ${src.enabled ? "bg-[#2563eb]/30" : "bg-black/[0.05]"}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${src.enabled ? "left-5 bg-[#2563eb]" : "left-0.5 bg-[#484f58]"}`} />
            </button>
          </div>
        </div>
      ))}
      <button className="w-full glass rounded-xl p-4 text-center text-xs text-[#94a3b8] hover:text-[#64748b] hover:border-black/[0.1] transition-all border border-dashed border-black/[0.06]">
        + 添加数据源
      </button>
    </div>
  );
}

/* ── Mapping Panel ── */
function MappingPanel({ mappings }: { mappings: FieldMapping[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-[#1a1a2e]">🔀 字段映射规则</div>
        <div className="text-[10px] text-[#94a3b8]">Splunk 字段 → MDR 工单字段</div>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 gap-px bg-black/[0.04] text-[10px] font-medium text-[#64748b]">
          <div className="bg-[var(--bg-card)] px-4 py-2.5">Splunk 字段</div>
          <div className="bg-[var(--bg-card)] px-4 py-2.5">MDR 字段</div>
          <div className="bg-[var(--bg-card)] px-4 py-2.5">转换规则</div>
        </div>
        {mappings.map((m, i) => (
          <div key={i} className="grid grid-cols-3 gap-px bg-black/[0.03] text-xs">
            <div className="bg-[var(--bg-card)] px-4 py-2.5 font-mono text-cyan-400/80">{m.splunkField}</div>
            <div className="bg-[var(--bg-card)] px-4 py-2.5 font-mono text-[#2563eb]/80">{m.mdrField}</div>
            <div className="bg-[var(--bg-card)] px-4 py-2.5 text-[#78859b]">{m.transform}</div>
          </div>
        ))}
      </div>
      <div className="glass rounded-xl p-4">
        <div className="text-xs text-[#64748b] font-medium mb-2">📊 严重等级映射</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { splunk: "critical / urgent", mdr: "critical", color: "text-red-400" },
            { splunk: "high", mdr: "high", color: "text-orange-400" },
            { splunk: "medium / notable", mdr: "medium", color: "text-yellow-400" },
            { splunk: "low / informational", mdr: "low", color: "text-blue-400" },
          ].map((s) => (
            <div key={s.mdr} className="bg-black/[0.02] rounded-lg p-2.5 text-center">
              <div className="text-[10px] text-[#94a3b8] mb-1">Splunk</div>
              <div className="text-xs font-mono text-[#64748b]">{s.splunk}</div>
              <div className="text-[#94a3b8] my-1">↓</div>
              <div className={`text-xs font-medium ${s.color}`}>{s.mdr.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Preview Panel ── */
function PreviewPanel({ alerts }: { alerts: PreviewAlert[] }) {
  const [syncing, setSyncing] = useState(false);
  const handleSync = () => { setSyncing(true); setTimeout(() => setSyncing(false), 2000); };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-[#1a1a2e]">👁 告警拉取预览</div>
        <button onClick={handleSync} disabled={syncing}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 disabled:opacity-50 transition-all">
          {syncing ? "同步中..." : "🔄 模拟拉取"}
        </button>
      </div>
      {syncing && (
        <div className="glass rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-[#64748b]">
            <div className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            正在从 Splunk 拉取告警...
          </div>
        </div>
      )}
      <div className="space-y-3">
        {alerts.map((a, i) => (
          <div key={i} className="glass rounded-xl p-4 hover:border-black/[0.12] transition-all">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${sevColor[a.severity] || sevColor.low}`}>
                {a.severity.toUpperCase()}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/[0.04] text-[#64748b]">{a.source}</span>
              <span className="text-[10px] text-[#94a3b8] ml-auto">{a._time.slice(11, 19)}</span>
            </div>
            <div className="text-sm text-[#1a1a2e] font-medium">{a.description}</div>
            <div className="text-xs text-[#94a3b8] mt-0.5">🖥 {a.host}</div>
            <div className="font-mono text-[10px] text-[#78859b] bg-black/[0.02] rounded-lg p-2 mt-2 overflow-x-auto">
              {a.raw}
            </div>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-400">✓ 字段映射成功</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400">→ 可创建 MDR 工单</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Main Splunk Page
   ══════════════════════════════════════════════ */
export default function SplunkPage() {
  const [tab, setTab] = useState<SplunkTab>("connection");
  const [config, setConfig] = useState<SplunkConfig>(DEFAULT_CONFIG);
  const [sources, setSources] = useState<DataSource[]>(DEFAULT_SOURCES);
  const [testResult, setTestResult] = useState<TestResult>({ status: "idle", message: "" });

  const handleTest = useCallback(() => {
    setTestResult({ status: "testing", message: "" });
    setTimeout(() => {
      if (config.host) {
        setTestResult({ status: "success", message: "连接成功", serverName: config.host, version: "9.3.1", latency: 42 });
      } else {
        setTestResult({ status: "error", message: "请填写 Splunk 地址" });
      }
    }, 1500);
  }, [config.host]);

  const tabs: { key: SplunkTab; label: string; icon: string }[] = [
    { key: "connection", label: "连接配置", icon: "🔌" },
    { key: "sources", label: "数据源", icon: "📡" },
    { key: "mapping", label: "字段映射", icon: "🔀" },
    { key: "preview", label: "拉取预览", icon: "👁" },
  ];

  return (
    <div className="min-h-screen mdr-shell system-shell system-shell-light">
      <NavBar active="MDR" />
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <a href="/mdr" className="text-xs text-[#94a3b8] hover:text-[#64748b] transition-colors">← MDR 工单系统</a>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#65A637] to-[#4B8A2A] flex items-center justify-center text-[#1a1a2e] font-bold text-lg">S</div>
            <div>
              <h1 className="text-xl font-bold text-[#1a1a2e]">Splunk 对接配置</h1>
              <p className="text-xs text-[#94a3b8]">Splunk Enterprise / Cloud → MDR 告警采集管道</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${testResult.status === "success" ? "bg-green-500 animate-pulse" : "bg-[#484f58]"}`} />
              <span className="text-[#64748b]">{testResult.status === "success" ? "已连接" : "未连接"}</span>
            </div>
            <div className="text-[#94a3b8]">数据源: {sources.filter((s) => s.enabled).length}/{sources.length} 启用</div>
            <div className="text-[#94a3b8]">映射规则: {DEFAULT_MAPPINGS.length} 条</div>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-[11px] rounded-lg bg-black/[0.03] text-[#64748b] hover:bg-black/[0.05] transition-all">导出配置</button>
            <button className="px-3 py-1 text-[11px] rounded-lg bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 hover:bg-[#2563eb]/20 transition-all">保存</button>
          </div>
        </div>

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

        {tab === "connection" && <ConnectionPanel config={config} setConfig={setConfig} testResult={testResult} onTest={handleTest} />}
        {tab === "sources" && <SourcesPanel sources={sources} setSources={setSources} />}
        {tab === "mapping" && <MappingPanel mappings={DEFAULT_MAPPINGS} />}
        {tab === "preview" && <PreviewPanel alerts={MOCK_PREVIEW} />}
      </main>
    </div>
  );
}
