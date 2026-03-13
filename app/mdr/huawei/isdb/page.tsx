import Link from "next/link";
import NavBar from "@/components/NavBar";
import CustomBuilder from "./custom-builder";
import {
  HUAWEI_ISDB_BUNDLES,
  HUAWEI_ISDB_PROVIDERS,
} from "@/lib/huawei-isdb";

const cardCls = "glass rounded-xl border border-black/[0.06] bg-white/[0.72]";
const actionCls =
  "inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-all";
const softPanelCls = "rounded-xl border border-slate-200 bg-slate-50/90 p-4";
const subCardCls = "rounded-xl border border-slate-200 bg-slate-50/90 p-4";
const codeBlockCls =
  "mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-[11px] text-slate-800";

const RECOMMENDED_OBJECTS = [
  {
    bundle: "sdwan-core",
    objectName: "ISDB_SDWAN_CORE",
    usage: "通用互联网 SaaS / CDN / 云平台混合出口匹配。",
  },
  {
    bundle: "public-cloud",
    objectName: "ISDB_CLOUD_PUBLIC",
    usage: "AWS + Azure Public + Google Cloud 公有云流量匹配。",
  },
  {
    bundle: "microsoft-cloud",
    objectName: "ISDB_M365_AZURE",
    usage: "Microsoft 365 + Azure Public 统一匹配，适合微软生态办公出口。",
  },
  {
    bundle: "m365-optimize",
    objectName: "ISDB_M365_OPTIMIZE",
    usage: "仅匹配 M365 Optimize 流量，适合低时延直连优先策略。",
  },
  {
    bundle: "azure-sovereign",
    objectName: "ISDB_AZURE_SOVEREIGN",
    usage: "Azure China / USGov 专线或专用出口策略。",
  },
  {
    bundle: "dev-platforms",
    objectName: "ISDB_DEV_PLATFORMS",
    usage: "GitHub / Cloudflare / Google Services 研发与供应链出口。",
  },
] as const;

const POLICY_TEMPLATES = [
  {
    title: "Microsoft 365 Optimize 低时延优先",
    summary: "适合办公与 Teams / Exchange / SharePoint 前台访问。",
    objectName: "ISDB_M365_OPTIMIZE",
    routeName: "PBR_M365_OPT",
    nextHop: "WAN_INET_LOW_LATENCY",
    note: "如果你有双出口，建议把这条规则放在默认互联网策略之前。",
  },
  {
    title: "Azure Public 云业务专用链路",
    summary: "适合应用托管在 Azure、公网回源或跨云业务互访。",
    objectName: "ISDB_AZURE_PUBLIC",
    routeName: "PBR_AZURE_PUBLIC",
    nextHop: "WAN_CLOUD_PRIMARY",
    note: "如果有 Azure ExpressRoute 或质量更好的公网链路，可定向到对应出口。",
  },
  {
    title: "研发平台分流",
    summary: "适合 GitHub / Cloudflare / Google Services 单独走研发出口。",
    objectName: "ISDB_DEV_PLATFORMS",
    routeName: "PBR_DEV_SAAS",
    nextHop: "WAN_DEVTOOLS",
    note: "可与代码仓库审计、DLP 或开发代理链路组合使用。",
  },
] as const;

const SECURITY_POLICY_TEMPLATES = [
  {
    title: "只放行 Microsoft 365 Optimize 的 HTTPS",
    summary: "允许办公终端访问 M365 Optimize 地址库的 443 流量。",
    policyName: "SEC_M365_OPT_PERMIT",
    objectName: "ISDB_M365_OPTIMIZE",
    service: "https",
    action: "permit",
    note: "如果设备版本支持直接引用 ISP 地址集，可把 `destination-address address-set` 替换成对应 `isp/address-set` 引用方式。",
    config: `security-policy
 rule name SEC_M365_OPT_PERMIT
  source-zone trust
  destination-zone untrust
  destination-address address-set ISDB_M365_OPTIMIZE
  service https
  action permit`,
  },
  {
    title: "只允许 GitHub HTTPS，其他端口阻断",
    summary: "先放行 443，再用下一条 deny 规则压掉 GitHub 地址库上的其他服务。",
    policyName: "SEC_GITHUB_WEBONLY",
    objectName: "ISDB_GITHUB",
    service: "https",
    action: "permit + deny",
    note: "这类模板要保证 permit 规则排在 deny 规则前面。",
    config: `security-policy
 rule name SEC_GITHUB_WEBONLY_PERMIT
  source-zone trust
  destination-zone untrust
  destination-address address-set ISDB_GITHUB
  service https
  action permit

 rule name SEC_GITHUB_WEBONLY_DENY
  source-zone trust
  destination-zone untrust
  destination-address address-set ISDB_GITHUB
  action deny`,
  },
  {
    title: "显式阻断 Sovereign / 非授权云实例",
    summary: "适合需要把 Azure China / USGov 与默认互联网出口隔离开的场景。",
    policyName: "SEC_AZURE_SOV_DENY",
    objectName: "ISDB_AZURE_SOVEREIGN",
    service: "any",
    action: "deny",
    note: "建议放在默认 permit 互联网访问规则之前，避免先被泛放行策略命中。",
    config: `security-policy
 rule name SEC_AZURE_SOV_DENY
  source-zone trust
  destination-zone untrust
  destination-address address-set ISDB_AZURE_SOVEREIGN
  action deny`,
  },
] as const;

export default function HuaweiIsdbPage() {
  const today = new Date().toISOString().slice(0, 10);
  const providerMap = new Map(HUAWEI_ISDB_PROVIDERS.map((item) => [item.id, item]));

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at top left, rgba(37,99,235,0.08), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef4fb 100%)",
      }}
    >
      <NavBar active="MDR" />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="space-y-3">
          <Link
            href="/mdr/huawei"
            className="inline-flex items-center text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← 返回华为防火墙
          </Link>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
                Huawei SD-WAN
              </div>
              <h1 className="mt-1 text-2xl font-bold text-slate-950">
                ISDB 地址库生成器
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                按华为防火墙可导入的 ISP 地址文件格式输出，每行一个 CIDR，适合
                SD-WAN / 智能选路 / PBR 场景。数据源使用官方公开网段 feed，按下载时实时聚合。
              </p>
            </div>
            <div className={`${cardCls} px-4 py-3 text-xs text-slate-600`}>
              <div>导出日期：{today}</div>
              <div className="mt-1">格式：纯 CIDR 列表 `.csv`</div>
            </div>
          </div>
        </div>

        <section className={`${cardCls} p-5`}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-semibold text-slate-950">预置 Bundle</h2>
              <p className="mt-1 text-xs text-slate-600">
                直接下载聚合好的地址库，适合快速导入到华为防火墙。
              </p>
            </div>
            <a
              href="/api/huawei/isdb?bundle=sdwan-core"
              className={`${actionCls} border-red-600/20 bg-red-600/10 text-red-600 hover:bg-red-600/20`}
            >
              下载推荐 Bundle
            </a>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {HUAWEI_ISDB_BUNDLES.map((bundle) => (
              <div key={bundle.id} className={subCardCls}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">{bundle.label}</div>
                    <div className="mt-1 text-xs text-slate-600">{bundle.description}</div>
                  </div>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                    {bundle.id}
                  </code>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {bundle.providerIds.map((providerId) => (
                    <span
                      key={providerId}
                      className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600"
                    >
                      {providerMap.get(providerId)?.label}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <a
                    href={`/api/huawei/isdb?bundle=${bundle.id}`}
                    className={`${actionCls} flex-1 border-slate-200 bg-white text-slate-900 hover:bg-slate-100`}
                  >
                    下载 CSV
                  </a>
                  <a
                    href={`/api/huawei/isdb?bundle=${bundle.id}&format=json`}
                    className={`${actionCls} border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200`}
                  >
                    JSON
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={`${cardCls} p-5`}>
          <div>
            <h2 className="text-base font-semibold text-slate-950">单独 Provider 导出</h2>
            <p className="mt-1 text-xs text-slate-600">
              按官方网段源单独导出，适合为不同 SaaS / 云平台建立独立地址库对象。
            </p>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {HUAWEI_ISDB_PROVIDERS.map((provider) => (
              <div key={provider.id} className={subCardCls}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">{provider.label}</div>
                    <div className="mt-1 text-xs text-slate-600">{provider.description}</div>
                  </div>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                    {provider.id}
                  </code>
                </div>

                <div className="mt-3 space-y-1">
                  {provider.sources.map((source) => (
                    <a
                      key={source}
                      href={source}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-[11px] text-[#2563eb] hover:underline"
                    >
                      {source}
                    </a>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <a
                    href={`/api/huawei/isdb?providers=${provider.id}`}
                    className={`${actionCls} flex-1 border-slate-200 bg-white text-slate-900 hover:bg-slate-100`}
                  >
                    下载 CSV
                  </a>
                  <a
                    href={`/api/huawei/isdb?providers=${provider.id}&format=json`}
                    className={`${actionCls} border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200`}
                  >
                    JSON
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <CustomBuilder
          providers={HUAWEI_ISDB_PROVIDERS.map(({ id, label, description }) => ({
            id,
            label,
            description,
          }))}
          bundles={HUAWEI_ISDB_BUNDLES.map(({ id, label, providerIds }) => ({
            id,
            label,
            providerIds,
          }))}
        />

        <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className={`${cardCls} p-5`}>
            <h2 className="text-base font-semibold text-slate-950">
              推荐对象命名
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              导入后建议统一采用 `ISDB_*` 前缀，后面接用途或服务域，便于后续规则复用。
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                    <th className="py-2 pr-4">Bundle</th>
                    <th className="py-2 pr-4">对象名</th>
                    <th className="py-2">用途</th>
                  </tr>
                </thead>
                <tbody>
                  {RECOMMENDED_OBJECTS.map((item) => (
                    <tr key={item.objectName} className="border-b border-slate-100 align-top">
                      <td className="py-3 pr-4 text-[11px] text-slate-600">
                        <code className="rounded bg-slate-100 px-1.5 py-0.5">
                          {item.bundle}
                        </code>
                      </td>
                      <td className="py-3 pr-4 text-[12px] font-medium text-slate-950">
                        <code>{item.objectName}</code>
                      </td>
                      <td className="py-3 text-[12px] text-slate-600">{item.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`${softPanelCls} mt-4 text-sm text-slate-700`}>
              <div className="text-[11px] font-medium text-slate-950">
                命名补充
              </div>
              <div className="mt-2 space-y-1">
                <p>• 地址库对象：`ISDB_*`</p>
                <p>• 策略路由对象：`PBR_*`</p>
                <p>• 智能选路模板：`SDWAN_*`</p>
                <p>• 多实例场景建议追加区域后缀，如 `ISDB_AZURE_CHINA`</p>
              </div>
            </div>
          </div>

          <div className={`${cardCls} p-5`}>
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  选路规则模板
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  下面是偏工程化的策略示意，不是某个具体版本的厂商 CLI 原生命令。
                </p>
              </div>
              <div className="rounded-lg border border-red-600/20 bg-red-600/10 px-3 py-1.5 text-[11px] text-red-600">
                先导入地址库，再绑到 PBR / SD-WAN
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {POLICY_TEMPLATES.map((item) => (
                <div
                  key={item.routeName}
                  className={subCardCls}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">
                        {item.title}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {item.summary}
                      </div>
                    </div>
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                      {item.routeName}
                    </code>
                  </div>

                  <pre className={codeBlockCls}>
{`# 1) 地址库对象
address-set ${item.objectName}

# 2) 策略路由 / 智能选路规则
rule ${item.routeName}
  match destination-address-set ${item.objectName}
  action next-hop ${item.nextHop}
  priority 10`}
                  </pre>

                  <div className="mt-3 space-y-1 text-[12px] text-slate-600">
                    <p>
                      <span className="text-slate-500">地址对象:</span>{" "}
                      <code className="text-slate-950">{item.objectName}</code>
                    </p>
                    <p>
                      <span className="text-slate-500">策略对象:</span>{" "}
                      <code className="text-slate-950">{item.routeName}</code>
                    </p>
                    <p>
                      <span className="text-slate-500">目标出口:</span>{" "}
                      <code className="text-slate-950">{item.nextHop}</code>
                    </p>
                    <p>{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className={`${cardCls} p-5`}>
            <h2 className="text-base font-semibold text-slate-950">华为加载说明</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>1. 下载本页导出的 `.csv` 文件，内容为纯 CIDR 列表，每行一个地址段。</p>
              <p>2. 华为 GUI 一般可在 <span className="font-mono text-slate-950">Network &gt; Smart Policy Routing &gt; ISP Address Import</span> 进入导入。</p>
              <p>3. 导入后，给地址库对象命名，再在 SD-WAN / 智能选路 / 策略路由规则里引用它。</p>
              <p>4. 这类库本质是“地址库”，适合做目的地址匹配，不包含端口、协议和域名语义。</p>
            </div>

            <div className={softPanelCls + " mt-4"}>
              <div className="text-[11px] text-slate-500">运维侧下载与校验模板</div>
              <pre className="mt-2 overflow-x-auto text-[11px] text-slate-800">
{`# 把 https://your-host.example 替换成你的部署地址或本机地址
# 例如: http://localhost:3000

# 下载推荐库
curl -o huawei-isdb-sdwan-core.csv \\
  "https://your-host.example/api/huawei/isdb?bundle=sdwan-core"

# 下载微软云库
curl -o huawei-isdb-microsoft-cloud.csv \\
  "https://your-host.example/api/huawei/isdb?bundle=microsoft-cloud"

# 预览前 10 行
head huawei-isdb-microsoft-cloud.csv

# 统计总行数
wc -l huawei-isdb-microsoft-cloud.csv

# 做一次摘要校验
shasum -a 256 huawei-isdb-microsoft-cloud.csv

# 查看元数据
curl "https://your-host.example/api/huawei/isdb?bundle=sdwan-core&format=json"`}
              </pre>
            </div>

            <div className={softPanelCls + " mt-4"}>
              <div className="text-[11px] font-medium text-slate-950">CSV 内容示例</div>
              <pre className="mt-2 overflow-x-auto text-[11px] text-slate-700">
{`13.107.128.0/22
40.96.0.0/13
52.96.0.0/14
104.47.0.0/17
2603:1006::/40`}
              </pre>
            </div>
          </div>

          <div className={`${cardCls} p-5`}>
            <h2 className="text-base font-semibold text-slate-950">GUI / 策略模板</h2>
            <div className="mt-3 space-y-3 text-sm text-slate-600">
              <div>
                <div className="text-[11px] font-medium text-slate-950">GUI 导入流程</div>
                <div className="mt-1 space-y-1">
                  <p>• 打开 <span className="font-mono text-slate-950">Network &gt; Smart Policy Routing &gt; ISP Address Import</span></p>
                  <p>• 新建地址库对象，例如 <span className="font-mono text-slate-950">ISDB_M365_WORLDWIDE</span></p>
                  <p>• 选择本页下载的 `.csv` 文件并导入</p>
                  <p>• 在智能选路 / PBR 规则中，把目的地址匹配到这个地址库对象</p>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-medium text-slate-950">命名建议</div>
                <div className="mt-1 space-y-1">
                  <p>• `ISDB_AZURE_PUBLIC`</p>
                  <p>• `ISDB_M365_WORLDWIDE`</p>
                  <p>• `ISDB_GITHUB` / `ISDB_CLOUDFLARE`</p>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-medium text-slate-950">策略示意</div>
                <div className="mt-1 space-y-1">
                  <p>• 目的地址命中 `ISDB_M365_WORLDWIDE` 时，优先走低时延互联网出口</p>
                  <p>• 目的地址命中 `ISDB_AZURE_PUBLIC` 时，导向与 Azure 互联质量更稳定的 WAN 链路</p>
                  <p>• 把 `ISDB_GITHUB` / `ISDB_CLOUDFLARE` 归到研发或 SaaS 专用策略组</p>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <h3 className="text-[11px] font-medium text-slate-950">设计边界</h3>
              <div className="mt-2 space-y-2 text-sm text-slate-600">
                <p>• 这里导出的不是 FortiGate 风格的“服务签名库”，而是华为可导入的地址库文件。</p>
                <p>• 只收录有官方公开网段源的服务，避免手写或抓 DNS 造成快速失效。</p>
                <p>• GitHub Meta API 本身不覆盖所有 GitHub 业务边界，适合作为工程化近似库，不是合同级承诺。</p>
                <p>• Microsoft 365 这里使用官方 Worldwide endpoints Web Service，只抽取其中带 IP 的项目。</p>
                <p>• 不同华为型号和版本菜单位置可能略有差异，导入前建议先在测试策略上验证命中。</p>
              </div>
            </div>
          </div>
        </section>

        <section className={`${cardCls} p-5`}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                安全策略模板
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                下面这组模板面向 `security-policy`，用于访问控制，不是做链路选路。
                如果你设备版本不支持直接在安全策略里引用 ISP 地址集，就把同样的
                CIDR 导入成 `address-set` 后再引用。
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-600">
              安全策略看“允不允许”，PBR / SD-WAN 看“走哪条链路”
            </div>
          </div>

          <div className="mt-4 space-y-4">
            {SECURITY_POLICY_TEMPLATES.map((item) => (
              <div
                key={item.policyName}
                className="rounded-xl border border-slate-200 bg-slate-50/90 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">
                      {item.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      {item.summary}
                    </div>
                  </div>
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                    {item.policyName}
                  </code>
                </div>

                <pre className={codeBlockCls}>{item.config}</pre>

                <div className="mt-3 grid gap-2 text-[12px] text-slate-600 md:grid-cols-2">
                  <p>
                    <span className="text-slate-500">地址对象:</span>{" "}
                    <code className="text-slate-950">{item.objectName}</code>
                  </p>
                  <p>
                    <span className="text-slate-500">服务对象:</span>{" "}
                    <code className="text-slate-950">{item.service}</code>
                  </p>
                  <p>
                    <span className="text-slate-500">动作:</span>{" "}
                    <code className="text-slate-950">{item.action}</code>
                  </p>
                  <p>{item.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="text-[11px] font-medium text-slate-950">
              下发顺序建议
            </div>
            <div className="mt-2 space-y-1">
              <p>1. 先导入地址库对象或 ISP 地址集对象。</p>
              <p>2. 再创建 `permit` 规则。</p>
              <p>3. 需要做服务收口时，再在后面补一条更宽的 `deny` 规则。</p>
              <p>4. 最后再看是否需要额外挂到 PBR / SD-WAN 做链路分流。</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
