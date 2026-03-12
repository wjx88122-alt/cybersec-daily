"use client";

import { useState } from "react";
import type {
  HuaweiIsdbBundleId,
  HuaweiIsdbProviderId,
} from "@/lib/huawei-isdb";

type ProviderItem = {
  id: HuaweiIsdbProviderId;
  label: string;
  description: string;
};

type BundleItem = {
  id: HuaweiIsdbBundleId;
  label: string;
  providerIds: HuaweiIsdbProviderId[];
};

const cardCls = "glass rounded-xl border border-black/[0.06] bg-white/[0.72]";
const buttonCls =
  "inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-all";

export default function CustomBuilder({
  providers,
  bundles,
}: {
  providers: ProviderItem[];
  bundles: BundleItem[];
}) {
  const [selected, setSelected] = useState<HuaweiIsdbProviderId[]>([
    "cloudflare",
    "github",
  ]);

  const orderedSelected = providers
    .map((provider) => provider.id)
    .filter((providerId) => selected.includes(providerId));

  const params = new URLSearchParams();
  if (orderedSelected.length > 0) {
    params.set("providers", orderedSelected.join(","));
  }

  const csvHref = `/api/huawei/isdb?${params.toString()}`;
  const jsonHref = `/api/huawei/isdb?${params.toString()}&format=json`;

  function applyBundle(bundleId: HuaweiIsdbBundleId) {
    const bundle = bundles.find((item) => item.id === bundleId);
    if (!bundle) return;
    setSelected(bundle.providerIds);
  }

  function toggleProvider(providerId: HuaweiIsdbProviderId) {
    setSelected((current) => {
      let next = current.includes(providerId)
        ? current.filter((item) => item !== providerId)
        : [...current, providerId];

      if (providerId === "microsoft-365" && next.includes("microsoft-365")) {
        next = next.filter((item) => item !== "microsoft-365-optimize");
      }
      if (
        providerId === "microsoft-365-optimize" &&
        next.includes("microsoft-365-optimize")
      ) {
        next = next.filter((item) => item !== "microsoft-365");
      }

      return next;
    });
  }

  return (
    <section className={`${cardCls} p-5`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-semibold text-[#1a1a2e]">
            自定义组合下载
          </h2>
          <p className="mt-1 text-xs text-[#64748b]">
            自由组合 provider 生成一份专用地址库。`Microsoft 365` 与
            `M365 Optimize` 会自动互斥，避免重复下载。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSelected([])}
          className={`${buttonCls} border-black/[0.08] bg-black/[0.03] text-[#64748b] hover:bg-black/[0.05]`}
        >
          清空选择
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {bundles.map((bundle) => (
          <button
            key={bundle.id}
            type="button"
            onClick={() => applyBundle(bundle.id)}
            className={`${buttonCls} border-black/[0.08] bg-white text-[#1a1a2e] hover:bg-black/[0.03]`}
          >
            套用 {bundle.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {providers.map((provider) => {
          const checked = orderedSelected.includes(provider.id);
          return (
            <label
              key={provider.id}
              className={`rounded-xl border p-4 transition-all ${
                checked
                  ? "border-red-600/20 bg-red-600/8"
                  : "border-black/[0.06] bg-black/[0.02]"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleProvider(provider.id)}
                  className="mt-0.5 h-4 w-4 rounded accent-red-600"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1a1a2e]">
                      {provider.label}
                    </span>
                    <code className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[10px] text-[#64748b]">
                      {provider.id}
                    </code>
                  </div>
                  <div className="mt-1 text-xs text-[#64748b]">
                    {provider.description}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl bg-[#1e293b] p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[11px] text-gray-400">当前选择</div>
            <div className="mt-1 text-sm font-medium text-white">
              {orderedSelected.length > 0
                ? `${orderedSelected.length} 个 provider`
                : "尚未选择 provider"}
            </div>
          </div>
          <div className="flex gap-2">
            <a
              href={orderedSelected.length > 0 ? csvHref : "#"}
              className={`${buttonCls} ${
                orderedSelected.length > 0
                  ? "border-red-600/20 bg-red-600/10 text-red-400 hover:bg-red-600/20"
                  : "pointer-events-none border-white/10 bg-white/5 text-gray-500"
              }`}
            >
              下载 CSV
            </a>
            <a
              href={orderedSelected.length > 0 ? jsonHref : "#"}
              className={`${buttonCls} ${
                orderedSelected.length > 0
                  ? "border-white/10 bg-white/5 text-white hover:bg-white/10"
                  : "pointer-events-none border-white/10 bg-white/5 text-gray-500"
              }`}
            >
              JSON
            </a>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {orderedSelected.length > 0 ? (
            orderedSelected.map((providerId) => (
              <span
                key={providerId}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white"
              >
                {providerId}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-gray-500">
              选中后这里会显示组合结果
            </span>
          )}
        </div>

        {orderedSelected.length > 0 && (
          <div className="mt-3 space-y-2 text-[11px] text-gray-400">
            <div>CSV: {csvHref}</div>
            <div>JSON: {jsonHref}</div>
          </div>
        )}
      </div>
    </section>
  );
}
