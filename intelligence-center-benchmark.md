# 情报中心能力对标与补齐建议

> 调研时间：2026-04-13  
> 范围：基于主流安全厂商截至当前可访问的官方公开资料，聚焦“威胁情报中心 / 外部威胁情报 / 暴露面与漏洞情报 / 研判工作台”能力。

## 一、主流厂商在做什么

| 厂商 | 公开能力重点 | 对我们最值得借鉴的点 |
| --- | --- | --- |
| Microsoft | 在 Defender 门户内统一威胁情报，包含 `Intel profiles`、`Intel explorer`、`Intel projects`，并通过 Sentinel 做 STIX/IOC 规模化管理和导入。 | 把“情报内容库”和“情报运营管理”放在同一入口，不让分析师在多个系统之间来回跳。 |
| Google Threat Intelligence | 以 Google + Mandiant + VirusTotal 的联合视角输出统一结论；强调按组织相关性聚焦威胁、AI 总结、工作台、图谱、规则共享、Collections。 | 情报必须“组织相关”，并且要有统一 verdict、图谱、协同工作台，不只是资讯流。 |
| CrowdStrike | 以一方遥测、资产、暴露面、检测结果驱动个性化情报；提供暗网跟踪、Threat Profiles、Hunting Guides、统一 Intelligence Explorer。 | 把“外部情报”直接和客户环境、当前暴露、实时检测拼起来，做真正可行动的优先级。 |
| Recorded Future | Intelligence Cloud 强调 `External data + Internal telemetry`；覆盖 open web、dark web、technical sources；Attack Surface Intelligence 提供资产发现、暴露评分、持续映射与 SOAR/SIEM 集成。 | 情报中心要把资产暴露和外部威胁源纳入同一张图，不然无法形成面向资产的优先级。 |
| Palo Alto Networks | Cortex Xpanse 强调外部攻击面管理、持续发现互联网资产、第三方/供应链视角、攻击者视角、与 XSOAR 联动自动修复。 | 情报中心要有“攻击者视角资产盘点”和“剧本联动”，否则发现问题后仍然需要人工搬运。 |
| Trend Micro | 强调行业/国家维度的前瞻洞察、IoC 自动 sweeping、XDR 告警情报增强、漏洞情报、感染链和 MITRE ATT&CK 映射。 | 情报中心不能只看 IOC，必须能把告警、漏洞、感染链、ATT&CK 技术串起来。 |

## 二、逐家拆解

### 1. Microsoft

**公开能力**

- Defender 门户把威胁情报集中到一个导航下，明确拆成 `Intel profiles`、`Intel explorer`、`Intel projects`。
- 门户内同时承接微软情报、Sentinel threat intelligence 和自定义上传情报。
- `Intel management` 支持基于 STIX 的情报运营，包含导入、上传 API 接入、手工创建与规模化管理。

**说明**

- 这条路线更像“情报资产化管理平台”。
- 强项不是单个图表，而是把 IOC、TTP、威胁行为体、基础设施和运营流程放进统一模型。

**我们该补什么**

- 情报项目/专题管理，而不是只有列表与详情。
- 自定义情报导入、标准化、标签化、结构化关系管理。
- 支持 IOC、TTP、Actor、Campaign、Victim、Infrastructure 六类核心实体统一浏览。

### 2. Google Threat Intelligence

**公开能力**

- 明确强调“知道谁在针对你”，并围绕组织相关性持续更新威胁态势。
- 工作台集中放置恶意样本、图谱、hunting 结果、规则共享和 collections。
- 统一 verdict 来自 Google 自有视角、Mandiant 人工研判和 VirusTotal 数据库。
- 提供 AI 总结与自然语言摘要，帮助快速理解威胁与地缘话题。
- 在漏洞侧强调活动攻击活动、威胁行为体、相关 Campaign、MITRE ATT&CK 与优先级联动。

**说明**

- 这是目前最完整的“情报工作台”范式之一。
- 它不是把情报做成知识库，而是做成“分析与决策台”。

**我们该补什么**

- 组织定制的威胁态势首页。
- Campaign / Actor / Malware / Vulnerability 联动卡片。
- 图谱区、Collection 区、Hunt 区和 Rule 区在同一页面内可切换。
- AI 摘要不单独成页，而应嵌入每个关键对象卡片。

### 3. CrowdStrike

**公开能力**

- 用客户的一方遥测、资产、暴露面、检测数据来个性化情报优先级。
- 自动根据行业、技术栈、检测结果和暗网活动上报最相关威胁。
- Threat Profiles 内聚合行为体归因、TTP、目标偏好、近期活动和响应建议。
- Hunting Guides 直接把情报跳到查询与狩猎动作，减少多步手工研判。
- `Intelligence Explorer` 作为统一工作空间承接调查与关联分析。

**说明**

- 强项在“运营化”。
- 不是告诉你世界上发生了什么，而是告诉你“此刻哪些事和你最相关，先看什么”。

**我们该补什么**

- 风险优先级必须接组织画像，而不是纯 CVSS 或纯热度。
- 情报详情页必须能一跳到预置狩猎动作。
- 暗网、凭据泄露、品牌滥用等外部风险要进入同一优先级模型。

### 4. Recorded Future

**公开能力**

- Intelligence Cloud 把 `External data + Internal telemetry` 作为现代防御起点。
- 覆盖 open web、dark web、technical sources，并强调 adversaries、infrastructure、targets 三端到端视角。
- Attack Surface Intelligence 提供未知资产发现、暴露评分、持续资产映射、优先级评估。
- 可集成到 ticket、SOAR、SIEM 等现有流程中。

**说明**

- Recorded Future 的核心价值不是单一内容，而是大规模外部数据覆盖后形成的资产级风险判断。
- 它把“外部威胁情报”和“外部攻击面”做了天然耦合。

**我们该补什么**

- 情报中心里增加外部攻击面视图，而不是把它留给别的模块。
- 资产暴露需要有评分、时间趋势和待办动作，不只是资产清单。
- 每条高风险暴露要能看到其相关威胁行为体、漏洞、勒索团伙偏好和历史利用情况。

### 5. Palo Alto Networks

**公开能力**

- Xpanse 持续建立和更新互联网暴露资产记录，包含未知资产和供应链资产。
- 攻击者视角看外部攻击面，强调“你看不到的东西也会被攻击者看见”。
- 暴露面发现与 XSOAR 联动，用 playbook 自动路由和处置。
- 官方内容持续围绕 `discover`, `evaluate`, `mitigate attack surface risks` 展开。

**说明**

- 情报中心不一定自己做 ASM 全量能力，但必须吃到 ASM 的结果。
- 特别适合安全运营团队做“威胁情报驱动的资产处置优先级”。

**我们该补什么**

- 将互联网资产、端口、证书、WAF 状态、第三方依赖放进情报视角。
- 高危暴露要有 playbook 建议，而不是只显示“有问题”。
- 支持第三方 / 供应链 / 子公司风险分层。

### 6. Trend Micro

**公开能力**

- 从行业、国家、威胁行为体和热点事件维度给出前瞻洞察。
- 提供 threat hunting queries 和自动 sweeping，用来快速定位 IoC。
- 为 XDR workbench 告警补充“谁、为什么、怎么做”的上下文。
- 漏洞情报强调感染链、TTP、MITRE ATT&CK、与环境内 CVE 的关联。

**说明**

- Trend 的路线很强调“把情报嵌进检测与响应”。
- 页面逻辑更偏“从威胁到告警再到动作”的闭环。

**我们该补什么**

- 告警详情要能直接引用情报上下文。
- IoC 命中不能只显示命中数量，要解释其行为体、感染链和常见后续动作。
- 漏洞页要同时给出利用上下文和 Hunting Query。

## 三、从这些厂商里能提炼出的共性

> 下面是基于各家官方公开能力的归纳推断，不是任一家单独原话。

### 共同规律 1：情报中心已经不再是“资讯中心”

头部厂商都在把情报从报告和 IOC 集合，转成围绕资产、检测、处置动作的工作空间。

### 共同规律 2：个性化相关性是第一优先级

不是“最新最热”，而是“与你的行业、地区、资产、暴露面、告警最相关”的威胁。

### 共同规律 3：实体关系比列表更重要

Actor、Campaign、Malware、Vulnerability、IOC、Asset 需要形成可 pivot 的关系图，而不是互相孤立的详情页。

### 共同规律 4：暴露面和漏洞优先级必须纳入情报中心

如果情报中心看不到你的暴露资产和真实利用趋势，它就无法给出可信的优先级。

### 共同规律 5：必须从情报直达狩猎和处置

优秀产品都会在情报卡片里直接提供 Hunting Query、规则、剧本或工单动作。

### 共同规律 6：AI 正在从“聊天框”变成“嵌入式助手”

更有效的做法不是单独放一个 AI 页面，而是在摘要、优先级说明、建议动作、变化解释里嵌入 AI。

## 四、你的情报中心应该补齐什么

### P0：必须补齐

#### 1. 组织威胁态势

- 按组织行业、地域、技术栈、关键资产生成“今日最相关威胁”。
- 展示活跃 Campaign、重点 Actor、相关恶意家族、关联漏洞。
- 支持每日/每周变化摘要。

#### 2. 重点攻击活动中心

- 不是简单新闻流，而是按 `Campaign` 聚合。
- 每个活动显示：目标行业、攻击链阶段、涉及 IOC、利用漏洞、置信度、影响范围、建议动作。

#### 3. 资产暴露与漏洞优先级

- 统一展示：暴露资产、利用中的漏洞、对应 TTP、是否被勒索团伙偏好使用、当前互联网可达性。
- 优先级不能只靠 CVSS，应结合资产关键性、已知利用、业务归属、内外部命中情况。

#### 4. 实体关联图谱

- 支持 `Actor ↔ Campaign ↔ Malware ↔ IOC ↔ Vulnerability ↔ Asset` 的关系浏览。
- 点击任一实体都能沿关系链继续 pivot。

#### 5. 狩猎与研判工作台

- 每条重点情报提供：预置 Hunting Query、检测规则、关联日志字段、推荐调查路径。
- 支持收藏、批注、分享给事件处置。

#### 6. 自动化响应剧本入口

- 从情报卡片直接触发剧本，如封禁 IOC、下发 EDR 查询、提交工单、升级事件、通知相关负责人。

### P1：强烈建议补齐

#### 7. 外部风险监控

- 暗网提及、品牌仿冒、泄露凭据、第三方供应链暴露。

#### 8. 情报专题与协同

- Collections / Projects / Bookmarks / Notes / Review 状态。
- 支持将情报线索升级为事件或专题。

#### 9. 置信度与来源透明度

- 给每条研判结果提供来源、更新时间、采纳范围、置信度说明。

### P2：加分项

#### 10. AI 嵌入式总结

- 自动概括“为什么与你相关”“建议先做什么”“新增变化是什么”。

#### 11. API / STIX / 工单联动

- 让外部系统能消费情报结果，并把结果推回到 SIEM / SOAR / 工单系统。

## 五、建议的页面信息架构

### 顶部：组织威胁态势

- 今日相关威胁数量
- 新增高优先级 Campaign
- 互联网暴露资产风险
- 正在被利用的关键漏洞
- 过去 24 小时变化

### 中左：重点攻击活动

- Campaign 时间线
- 热门行为体卡片
- 行业/地域定向情况

### 中右：资产暴露与漏洞优先级

- 高风险资产列表
- Top CVE
- 暴露趋势
- 建议处置动作

### 下左：实体关联图谱

- 关系图
- 关键 IOC
- 关联资产
- 受影响系统

### 下中：狩猎与研判工作台

- Query 模板
- 命中记录
- 规则建议
- 分析笔记

### 下右：自动化响应剧本

- IOC 封禁
- EDR Sweep
- 工单升级
- 通知与审批

## 六、这次重构我采用的落地策略

### 能力策略

- 不做“面面俱到的全平台”，而是先把情报中心补到最像一线分析师会真正用的形态。
- 首页从内容消费页改成决策与行动页。
- 用固定模块承接厂商的共性能力：态势、活动、暴露、图谱、狩猎、自动化。

### 交互策略

- 每个区块都必须回答一个明确问题：
- `现在最该看什么？`
- `为什么与我们相关？`
- `影响哪些资产？`
- `接下来怎么查？`
- `接下来怎么处置？`

### 视觉策略

- 使用深色“指挥台”风格，而不是普通报表后台。
- 强调风险色、时间线、实体关系与战情优先级。
- 用 `DESIGN.md` 约束 AI 与后续开发统一视觉语言。

## 七、建议的迭代优先级

### 第一阶段

- 组织威胁态势
- 重点攻击活动
- 资产暴露与漏洞优先级

### 第二阶段

- 实体关联图谱
- 狩猎与研判工作台
- 自动化响应剧本入口

### 第三阶段

- 外部风险监控
- 协同与专题管理
- AI 摘要与推荐动作

## 参考资料

- Microsoft Defender Threat Intelligence / Defender portal overview  
  <https://learn.microsoft.com/en-us/unified-secops/threat-intelligence-overview>
- Google Threat Intelligence  
  <https://cloud.google.com/security/products/threat-intelligence>
- CrowdStrike Falcon Adversary Intelligence operational threat intelligence release  
  <https://www.crowdstrike.com/en-us/press-releases/crowdstrike-delivers-new-era-of-operational-threat-intelligence/>
- Recorded Future Intelligence Cloud overview  
  <https://assets.recordedfuture.com/Datasheets/DataSheet-Recorded-Future-Overview.pdf>
- Recorded Future Attack Surface Intelligence  
  <https://assets.recordedfuture.com/Datasheets/attack-surface-intelligence.pdf>
- Palo Alto Networks Cortex Xpanse Attack Surface Management  
  <https://www.paloaltonetworks.com/cortex/cortex-xpanse/attack-surface-management>
- Trend Micro Threat Intelligence  
  <https://www.trendmicro.com/en_us/business/products/threat-intelligence.html>
