# 2026-04 Workbench UI Refactor

## 背景

这一轮重构的目标不是单纯“换一套皮肤”，而是把 `cybersec-daily` 从几块视觉上相互独立的页面，收回成一套更稳定的产品结构。

重构前的主要问题有三类：

- 公共页、`Team`、`MDR`、`Intelligence` 的样式边界不够清晰，容易互相污染
- `Team` 和 `MDR` 更像展示页和概念页，而不是可持续迭代的工作台
- 颜色、状态、强调层大量散落在页面本地，后续调视觉会越来越难维护

## 这轮做了什么

### 1. Public feed 收正成更稳定的内容页

- 修复分类筛选激活态
- 公共页样式重新约束到 `public.css`
- 把“24 小时内无内容”改成自动回退到“最近可用”结果
- 把这套回退逻辑抽到 `lib/feed-view-model.js`

### 2. Intelligence 收回到更明确的系统层

- 清理重复主题块
- 统一 `--intel-*` token 命名
- 收住会影响其他产品面的样式泄漏

### 3. Team 从角色展示页改造成 Executive workbench

- 首页改成 command deck / decision lanes / call matrix 结构
- `history`、`decisions`、`decision detail` 都切到同一套浅色工作台语言
- 删除旧的深色 utility 兼容层
- 新增 `app/(executive)/team/theme.ts`，把 badge、统计色、replay 渐变、时间线标签和 shell glow 收到统一 helper

### 4. MDR 从多块 demo 页面改造成统一工作台

- `/mdr` 首页先讲班次摘要、优先队列、分析师容量和来源覆盖
- `/mdr/dashboard`、`/mdr/network`、`/mdr/splunk` 与共享可视化统一到同一套语义主题
- 新增 `app/(ops)/mdr/theme.ts`，统一严重等级、来源、状态、连接状态、客户等级、优先级、健康分等视觉语义

## 架构影响

这轮之后，仓库里几条更重要的结构约束已经比较清楚：

- route groups 是产品边界，不再只是文件夹分类
- shell 决定页面骨架，页面本身只负责内容编排
- 样式按层拆分，`public`、`intelligence`、`mdr`、`team` 不应跨面覆盖
- 语义主题 helper 比页面内颜色映射更优先
- UI 回归约束通过 `tests/*.test.mjs` 固化，而不是只靠人工记忆

## 关键文件

- `app/styles/system.css`
- `app/styles/public.css`
- `app/styles/intelligence.css`
- `app/styles/team.css`
- `app/(executive)/team/theme.ts`
- `app/(ops)/mdr/theme.ts`
- `components/shells/*.tsx`
- `lib/feed-view-model.js`

## 验证

这轮重构收尾时通过了：

```bash
npm test
npm run build
```

并补了多组 UI 回归测试，覆盖 public、team、mdr 和共享样式边界。

## 下一步最值当的方向

- 用真实后端或实时源替换 `MDR` / `Intelligence` 的 mock 数据
- 为 `digest` 和翻译修复增加更明确的运营流程
- 继续减少页面内零散 copy 和一次性视觉例外
- 如果后续还会继续做产品演示，可以补一版截图型文档或设计对照页
