#!/usr/bin/env node
/**
 * 一键部署 RSSHub 到你的 Vercel，并接入 cybersec-daily。
 *
 * 已执行记录（2026-06-26）：
 *   - RSSHub 项目已创建并部署：rsshub-wjx88122-alts-projects.vercel.app
 *   - RSSHUB_BASE 已写入 cybersec-daily 项目（production + preview）
 *   - 待办：配 WECHAT_cookies（公众号）；X 长期稳定主路径改用 cybersec-daily 的 X_BEARER_TOKEN
 *
 * 用法（如需重跑 / 迁移实例）：
 *   VERCEL_TOKEN=你的token node scripts/deploy-rsshub.mjs
 *
 * 获取 token：https://vercel.com/account/tokens → Create Token（scope 选 Full Account）
 *
 * 安全：token 只在本进程内用，不写入任何文件、不上传。用完即删 token。
 */
const TOKEN = process.env.VERCEL_TOKEN;
const GITHUB_REPO = "wjx88122-alt/RSSHub";
const PROJECT_NAME = "rsshub";

if (!TOKEN) {
  console.error("❌ 缺少 VERCEL_TOKEN。");
  console.error("   获取：https://vercel.com/account/tokens → Create Token（scope: Full Account）");
  console.error("   用法：VERCEL_TOKEN=xxxx node scripts/deploy-rsshub.mjs");
  process.exit(1);
}

const api = async (path, init = {}) => {
  const res = await fetch(`https://api.vercel.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Vercel API ${res.status}: ${JSON.stringify(body).slice(0, 300)}`);
  }
  return body;
};

async function main() {
  // 1. 创建项目（已存在则取回）
  let project;
  try {
    project = await api("/v12/projects", {
      method: "POST",
      body: JSON.stringify({
        name: PROJECT_NAME,
        gitRepository: { type: "github", repo: GITHUB_REPO },
      }),
    });
    console.log(`✅ 项目已创建：${project.id}`);
  } catch (e) {
    try {
      project = await api(`/v9/projects/${PROJECT_NAME}`);
      console.log(`ℹ 项目已存在：${project.id}`);
    } catch {
      throw new Error(`创建项目失败：${e.message}`);
    }
  }

  // 2. 触发部署（新项目必须带 projectSettings + skipAutoDetectionConfirmation）
  console.log(`▶ 触发部署（master 分支）…`);
  const deployment = await api(`/v13/deployments?skipAutoDetectionConfirmation=1`, {
    method: "POST",
    body: JSON.stringify({
      name: PROJECT_NAME,
      gitSource: { type: "github", org: "wjx88122-alt", repo: "RSSHub", ref: "master" },
      target: "production",
      projectSettings: { framework: null, buildCommand: null, installCommand: null, outputDirectory: null, rootDirectory: null },
    }),
  });
  const deployId = deployment.id;
  console.log(`✅ 部署已触发：${deployId}`);

  // 3. 轮询部署状态（RSSHub 构建较慢，最多等 ~8 分钟）
  let url = "";
  for (let i = 0; i < 48; i += 1) {
    await new Promise((r) => setTimeout(r, 10000));
    try {
      const d = await api(`/v6/deployments/${deployId}`);
      if (d.readyState === "READY") { url = `https://${d.url}`; break; }
      if (d.readyState === "ERROR" || d.readyState === "CANCELED") {
        throw new Error(`部署失败：${d.readyState}`);
      }
    } catch {
      // v13 与 v6 endpoint 差异：回退查项目最新部署
    }
    process.stdout.write(".");
  }
  console.log("");

  // 4. 取 production alias（比临时 url 更稳定）
  try {
    const aliases = await api(`/v13/deployments/${deployId}/aliases`);
    const prodAlias = (aliases.aliases || []).find((a) => /rsshub-.*wjx88122/.test(a.alias));
    if (prodAlias) url = `https://${prodAlias.alias}`;
  } catch {}

  if (!url) {
    console.log("⏳ 部署仍在进行，查看：https://vercel.com/dashboard");
    return;
  }

  console.log(`\n🎉 RSSHub 部署完成！`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`RSSHub 地址：${url}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`\n接下来配置环境变量（${url} 项目 → Settings → Environment Variables）：`);
  console.log(`  1. 公众号：WECHAT_cookies = <你的微信 cookie>`);
  console.log(`  2. 可选 X fallback：TWITTER_AUTH_TOKEN = <你的 X auth_token>`);
  console.log(`\n然后在 cybersec-daily 项目配置：`);
  console.log(`  RSSHUB_BASE=${url}`);
  console.log(`  X 长期稳定主路径请在 cybersec-daily 配 X_BEARER_TOKEN`);
}

main().catch((e) => {
  console.error(`\n❌ ${e.message}`);
  process.exit(1);
});
