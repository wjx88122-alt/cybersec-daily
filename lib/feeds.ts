import { xUserUrl, wechatBizUrl } from "./rsshub.ts";

export const FEED_SOURCES_A = [
  {
    name: "The Hacker News",
    url: "https://feeds.feedburner.com/TheHackersNews",
    category: "综合资讯",
    description:
      "全球访问量最高的网络安全新闻网站之一，覆盖漏洞、数据泄露、恶意软件等热点事件。",
  },
  {
    name: "Bleeping Computer",
    url: "https://www.bleepingcomputer.com/feed/",
    category: "综合资讯",
    description:
      "专注于网络安全与技术支持的新闻网站，以快速报道勒索软件和恶意软件事件闻名。",
  },
  {
    name: "Dark Reading",
    url: "https://www.darkreading.com/rss.xml",
    category: "综合资讯",
    description:
      "面向安全专业人员的综合性新闻平台，涵盖威胁情报、漏洞、合规等多个领域。",
  },
  {
    name: "CISA Advisories",
    url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
    category: "政府/监管",
    description: "美国网络安全和基础设施安全局官方发布的安全公告与漏洞预警。",
  },
  {
    name: "Krebs on Security",
    url: "https://krebsonsecurity.com/feed/",
    category: "深度分析",
    description:
      "前《华盛顿邮报》记者 Brian Krebs 主理，以深度调查报道网络犯罪和安全事件著称。",
  },
  {
    name: "Schneier on Security",
    url: "https://www.schneier.com/blog/atom.xml",
    category: "深度分析",
    description:
      "安全领域权威专家 Bruce Schneier 的个人博客，聚焦安全政策、密码学与技术评论。",
  },
  {
    name: "Cisco Talos Intelligence",
    url: "https://blog.talosintelligence.com/feeds/posts/default",
    category: "威胁情报",
    description:
      "Cisco Talos 威胁情报团队发布的恶意软件分析、APT 追踪与漏洞研究。",
  },
  {
    name: "SANS Internet Storm Center",
    url: "https://isc.sans.edu/rssfeed.xml",
    category: "威胁情报",
    description:
      "SANS ISC 每日安全日志，由全球志愿者分析师实时监测互联网威胁动态。",
  },
  {
    name: "Malwarebytes Labs",
    url: "https://blog.malwarebytes.com/feed/",
    category: "恶意软件",
    description:
      "Malwarebytes 安全研究团队发布的恶意软件分析、勒索软件追踪与消费者安全威胁报告。",
  },
  {
    name: "Ars Technica Security",
    url: "https://feeds.arstechnica.com/arstechnica/security",
    category: "综合资讯",
    description:
      "Ars Technica 安全频道，以深度技术报道覆盖漏洞披露、隐私政策与安全研究。",
  },
  {
    name: "SecurityWeek",
    url: "https://www.securityweek.com/rss",
    category: "综合资讯",
    description:
      "面向企业安全专业人员的新闻平台，每日发布漏洞、数据泄露和网络攻击报道。",
  },
  {
    name: "Lumen Black Lotus Labs",
    url: "https://blog.lumen.com/feed/",
    category: "威胁情报",
    description:
      "Lumen Technologies 威胁研究团队，专注于僵尸网络追踪、路由器恶意软件和高级持续性威胁分析。",
  },
  {
    name: "SC Magazine",
    url: "https://www.scmagazine.com/feed",
    category: "综合资讯",
    description: "面向安全专业人员的行业媒体，覆盖企业安全、合规和威胁情报。",
  },
  {
    name: "Cybersecurity Dive",
    url: "https://www.cybersecuritydive.com/feeds/news/",
    category: "综合资讯",
    description:
      "专注于企业网络安全新闻，报道行业动态、政策法规和重大安全事件。",
  },
  {
    name: "Wired Security",
    url: "https://www.wired.com/feed/category/security/latest/rss",
    category: "综合资讯",
    description:
      "Wired 安全频道，以深度报道覆盖黑客攻击、隐私政策和国家级网络战。",
  },
  {
    name: "Help Net Security",
    url: "https://www.helpnetsecurity.com/feed/",
    category: "综合资讯",
    description: "每日多篇发布漏洞、数据泄露、产品安全和行业动态资讯。",
  },
  {
    name: "Security Affairs",
    url: "https://securityaffairs.com/feed",
    category: "综合资讯",
    description: "每日多篇报道黑客攻击、APT 和数据泄露事件的独立安全博客。",
  },
  {
    name: "Hackread",
    url: "https://www.hackread.com/feed/",
    category: "综合资讯",
    description: "专注于网络犯罪、黑客攻击、数据泄露和隐私安全的新闻网站。",
  },
  {
    name: "Google Security Blog",
    url: "https://security.googleblog.com/feeds/posts/default",
    category: "综合资讯",
    description:
      "Google 官方安全博客，发布 Google 产品安全研究、漏洞披露和行业安全动态。",
  },
  {
    name: "Cloudflare Blog",
    url: "https://blog.cloudflare.com/rss/",
    category: "深度分析",
    description:
      "Cloudflare 安全团队发布的 DDoS 防护、零信任架构和网络威胁深度分析。",
  },
  {
    name: "CyberScoop",
    url: "https://www.cyberscoop.com/feed/",
    category: "综合资讯",
    description:
      "专注于政府和企业网络安全的新闻媒体，深度报道国家级网络攻击和政策动态。",
  },
  {
    name: "CSO Online",
    url: "https://www.csoonline.com/feed",
    category: "综合资讯",
    description:
      "面向首席安全官的专业媒体，覆盖企业安全战略、数据泄露和合规管理。",
  },
  {
    name: "The Record",
    url: "https://therecord.media/feed/",
    category: "综合资讯",
    description:
      "Recorded Future 旗下新闻媒体，专注于网络犯罪、国家级黑客和政策报道。",
  },
  {
    name: "Cybercrime Magazine",
    url: "https://cybersecurityventures.com/feed/",
    category: "综合资讯",
    description: "网络安全行业数据与趋势报告，覆盖网络犯罪经济规模和行业动态。",
  },
  {
    name: "Troy Hunt",
    url: "https://www.troyhunt.com/rss/",
    category: "深度分析",
    description:
      "Have I Been Pwned 创始人 Troy Hunt 的博客，深度分析数据泄露和密码安全。",
  },
  // —— 中文安全媒体（对齐 AI HOT 的中文源覆盖） ——
  {
    name: "FreeBuf",
    url: "https://www.freebuf.com/feed",
    category: "综合资讯",
    description: "国内老牌安全社区，每日发布漏洞预警、安全事件与技术分析。",
  },
  {
    name: "安全客",
    url: "https://api.anquanke.com/data/v1/rss",
    category: "综合资讯",
    description: "360 支持的安全资讯平台，覆盖威胁情报、漏洞与攻防技术。",
  },
  // —— 安全播客（对齐 AI HOT 的播客/Newsletter 源） ——
  {
    name: "Risky Business News",
    url: "https://risky.biz/feeds/risky-business-news/",
    category: "综合资讯",
    description: "Patrick Gray 主理的每日安全要闻，资深安全播客的新闻简报。",
  },
  {
    name: "Smashing Security",
    url: "https://feeds.feedburner.com/smashingsecurity",
    category: "综合资讯",
    description: "Graham Cluley 与 Carole Theriault 主理的安全播客，讨论每周网络犯罪与隐私事件。",
  },
  {
    name: "Darknet Diaries",
    url: "https://feeds.megaphone.fm/darknetdiaries",
    category: "深度分析",
    description: "Jack Rhysider 主理的真实黑客故事播客，深度讲述暗网与网络犯罪案例。",
  },
  {
    name: "Security Now",
    url: "https://feeds.twit.tv/sn.xml",
    category: "深度分析",
    description: "Steve Gibson 与 Leo Laporte 主理的长青安全播客，详解漏洞与加密技术。",
  },
  {
    name: "Brakeing Down Security",
    url: "https://brakeingsecurity.libsyn.com/rss",
    category: "威胁情报",
    description: "安全从业者播客，讨论防御、取证与威胁狩猎实战。",
  },
  {
    name: "Defensive Security",
    url: "https://defensivesecurity.org/feed/",
    category: "威胁情报",
    description: "防御视角安全播客，聚焦蓝队、事件响应与安全运营。",
  },
];

export const FEED_SOURCES_B = [
  {
    name: "Microsoft Security Response Center",
    url: "https://msrc.microsoft.com/blog/feed/",
    category: "漏洞预警",
    description:
      "微软安全响应中心官方博客，发布补丁公告、漏洞研究及安全更新指南。",
  },
  {
    name: "Google Project Zero",
    url: "https://googleprojectzero.blogspot.com/feeds/posts/default",
    category: "漏洞预警",
    description: "Google 精英漏洞研究团队发布的零日漏洞深度技术分析报告。",
  },
  {
    name: "Securelist by Kaspersky",
    url: "https://securelist.com/feed/",
    category: "威胁情报",
    description:
      "卡巴斯基实验室的威胁研究博客，提供 APT 报告、恶意软件分析和全球威胁态势。",
  },
  {
    name: "The Register Security",
    url: "https://www.theregister.com/security/headlines.atom",
    category: "综合资讯",
    description:
      "英国老牌科技媒体 The Register 的安全频道，以犀利风格报道全球安全事件与政策动态。",
  },
  {
    name: "AWS Security Blog",
    url: "https://aws.amazon.com/blogs/security/feed/",
    category: "深度分析",
    description:
      "亚马逊云服务官方安全博客，发布云安全最佳实践、漏洞公告与合规指南。",
  },
  {
    name: "Google Cloud Security Blog",
    url: "https://cloud.google.com/blog/products/identity-security/rss/",
    category: "深度分析",
    description:
      "Google Cloud 安全团队发布的云安全研究、威胁分析与 Mandiant 情报报告。",
  },
  {
    name: "Infosecurity Magazine",
    url: "https://www.infosecurity-magazine.com/rss/news/",
    category: "综合资讯",
    description:
      "面向信息安全专业人员的行业媒体，覆盖数据泄露、合规监管与安全技术趋势。",
  },
  {
    name: "Naked Security by Sophos",
    url: "https://nakedsecurity.sophos.com/feed/",
    category: "恶意软件",
    description:
      "Sophos 安全研究团队的博客，以通俗易懂的方式报道恶意软件、诈骗与隐私威胁。",
  },
  {
    name: "Ubuntu Security Notices",
    url: "https://ubuntu.com/security/notices/rss.xml",
    category: "漏洞预警",
    description:
      "Canonical 官方发布的 Ubuntu 系统安全公告，涵盖所有已修复的 CVE 漏洞更新。",
  },
  {
    name: "Recorded Future Blog",
    url: "https://www.recordedfuture.com/feed",
    category: "威胁情报",
    description:
      "Recorded Future 威胁情报平台博客，提供 APT 组织追踪、地缘政治网络威胁分析。",
  },
  {
    name: "Palo Alto Unit 42",
    url: "https://unit42.paloaltonetworks.com/feed/",
    category: "威胁情报",
    description:
      "Palo Alto Networks 威胁研究团队，发布 APT 分析、勒索软件追踪和漏洞研究。",
  },
  {
    name: "Check Point Research",
    url: "https://research.checkpoint.com/feed/",
    category: "威胁情报",
    description:
      "Check Point 安全研究团队发布的威胁分析、恶意软件研究和漏洞披露报告。",
  },
  {
    name: "Crowdstrike Blog",
    url: "https://www.crowdstrike.com/blog/feed/",
    category: "威胁情报",
    description:
      "CrowdStrike 威胁情报团队发布的 APT 追踪、勒索软件分析和端点安全研究。",
  },
  {
    name: "Mandiant Blog",
    url: "https://www.mandiant.com/resources/blog/rss.xml",
    category: "威胁情报",
    description:
      "Mandiant（Google 旗下）发布的高级威胁研究、APT 组织分析和事件响应报告。",
  },
  {
    name: "NVD Recent CVEs",
    url: "https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss-analyzed.xml",
    category: "漏洞预警",
    description:
      "美国国家漏洞数据库最新 CVE 漏洞公告，覆盖所有已分析的安全漏洞。",
  },
  {
    name: "ESET Research",
    url: "https://feeds.feedburner.com/eset/blog",
    category: "恶意软件",
    description:
      "ESET 安全研究团队发布的恶意软件分析、APT 追踪和网络威胁报告。",
  },
  {
    name: "Graham Cluley",
    url: "https://grahamcluley.com/feed/",
    category: "综合资讯",
    description:
      "资深安全专家 Graham Cluley 的博客，每日报道网络安全新闻和评论。",
  },
  {
    name: "Packet Storm",
    url: "https://packetstormsecurity.com/headlines.xml",
    category: "漏洞预警",
    description: "每日发布最新漏洞利用、安全工具和安全公告的权威安全资源站。",
  },
  {
    name: "SentinelOne Blog",
    url: "https://www.sentinelone.com/blog/feed/",
    category: "威胁情报",
    description:
      "SentinelOne 威胁研究团队发布的 APT 分析、勒索软件追踪和端点安全研究。",
  },
  {
    name: "Tenable Blog",
    url: "https://www.tenable.com/blog/feed",
    category: "漏洞预警",
    description:
      "Tenable 安全研究团队发布的漏洞分析、CVE 深度解读和风险管理指南。",
  },
  {
    name: "Red Canary Blog",
    url: "https://redcanary.com/blog/feed/",
    category: "威胁情报",
    description:
      "Red Canary 威胁检测团队发布的攻击技术分析、ATT&CK 映射和事件响应报告。",
  },
  {
    name: "Elastic Security Labs",
    url: "https://www.elastic.co/security-labs/rss/feed.xml",
    category: "威胁情报",
    description:
      "Elastic 安全研究团队发布的恶意软件分析、威胁狩猎技术和检测规则研究。",
  },
  {
    name: "Qualys Blog",
    url: "https://blog.qualys.com/feed",
    category: "漏洞预警",
    description:
      "Qualys 安全研究团队发布的漏洞管理、云安全和合规性深度分析报告。",
  },
  {
    name: "Microsoft Security Blog",
    url: "https://www.microsoft.com/en-us/security/blog/feed/",
    category: "威胁情报",
    description: "微软安全团队发布的威胁分析、攻击活动追踪和安全产品研究报告。",
  },
  {
    name: "Rapid7 Blog",
    url: "https://blog.rapid7.com/rss/",
    category: "漏洞预警",
    description:
      "Rapid7 安全研究团队发布的漏洞分析、渗透测试技术和攻击面管理研究。",
  },
  {
    name: "Unsupervised Learning",
    url: "https://danielmiessler.com/feed/",
    category: "深度分析",
    description:
      "安全专家 Daniel Miessler 的博客，聚焦 AI 安全、威胁情报和安全趋势分析。",
  },
  {
    name: "Cybereason Blog",
    url: "https://www.cybereason.com/blog/rss.xml",
    category: "威胁情报",
    description:
      "Cybereason 安全研究团队发布的恶意软件分析、APT 追踪和企业安全研究。",
  },
  {
    name: "Proofpoint Blog",
    url: "https://www.proofpoint.com/us/rss.xml",
    category: "威胁情报",
    description:
      "Proofpoint 安全团队发布的电子邮件安全、钓鱼攻击和人为中心威胁分析。",
  },
  {
    name: "TechRepublic Security",
    url: "https://www.techrepublic.com/rssfeeds/topic/cybersecurity/",
    category: "综合资讯",
    description:
      "TechRepublic 网络安全频道，覆盖企业安全新闻、最佳实践和技术分析。",
  },
  {
    name: "CyberInsider",
    url: "https://cyberinsider.com/security/feed/",
    category: "综合资讯",
    description: "网络安全新闻聚合，覆盖漏洞警报、数据泄露和威胁分析。",
  },
  {
    name: "Exploit-DB",
    url: "https://www.exploit-db.com/rss.xml",
    category: "漏洞预警",
    description: "公开漏洞利用代码数据库，每日更新最新安全漏洞和 PoC 代码。",
  },
  {
    name: "The DFIR Report",
    url: "https://thedfirreport.com/feed/",
    category: "威胁情报",
    description: "数字取证与事件响应团队发布的真实攻击案例深度分析报告。",
  },
  {
    name: "Huntress Blog",
    url: "https://www.huntress.com/blog/rss.xml",
    category: "威胁情报",
    description:
      "Huntress 安全研究团队发布的中小企业威胁分析和攻击活动追踪报告。",
  },
  // —— 政府 / CERT（对齐 AI HOT 多源类型，补充国家级权威公告） ——
  {
    name: "NCSC UK",
    url: "https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml",
    category: "政府/监管",
    description: "英国国家网络安全中心，发布威胁报告、漏洞公告与安全指南。",
  },
  {
    name: "CERT-FR",
    url: "https://www.cert.ssi.gouv.fr/alerte/feed/",
    category: "政府/监管",
    description: "法国国家网络安全事件响应团队（ANSSI），发布安全警报与漏洞通告。",
  },
  {
    name: "MS-ISAC / CIS",
    url: "https://www.cisecurity.org/feed",
    category: "政府/监管",
    description: "美国多州信息共享与分析中心，发布面向州/地方政府的威胁公告与建议。",
  },
  // —— 研究 / Newsletter / 播客（对齐 AI HOT 的独立内容源） ——
  {
    name: "PortSwigger Research",
    url: "https://portswigger.net/research/rss",
    category: "深度分析",
    description: "PortSwigger 安全研究团队发布的 Web 漏洞深度技术分析。",
  },
  {
    name: "GreyNoise",
    url: "https://www.greynoise.io/blog/rss.xml",
    category: "威胁情报",
    description: "GreyNoise 互联网背景噪音监测，发布扫描活动与攻击趋势研究。",
  },
  {
    name: "Black Hills InfoSec",
    url: "https://www.blackhillsinfosec.com/feed/",
    category: "深度分析",
    description: "Black Hills 信息安全团队的红队实战与攻防技术研究博客。",
  },
  // —— 供应链 / 漏洞专项 ——
  {
    name: "Patchstack",
    url: "https://patchstack.com/feed/",
    category: "漏洞预警",
    description: "Patchstack 漏洞数据库，专注 CMS/插件生态的漏洞披露与补丁追踪。",
  },
  {
    name: "Sonatype Research",
    url: "https://www.sonatype.com/blog/rss.xml",
    category: "漏洞预警",
    description: "Sonatype 软件供应链安全研究，发布开源组件漏洞与供应链攻击分析。",
  },
  // —— 安全 KOL 独立博客（X 大V 的稳定博客形态，弥补 X 无 RSS 的缺口） ——
  {
    name: "Robert Heaton",
    url: "https://robertheaton.com/feed.xml",
    category: "深度分析",
    description: "安全工程师 Robert Heaton 的博客，专注支付安全、浏览器隔离与逆向工程。",
  },
  {
    name: "Jeremy Jordan",
    url: "https://www.jeremyjordan.me/rss/",
    category: "深度分析",
    description: "安全工程师 Jeremy Jordan 的博客，覆盖 ML 安全、云原生与防御工程。",
  },
  {
    name: "SecWiki",
    url: "https://www.sec-wiki.com/news/rss",
    category: "综合资讯",
    description: "中文安全知识社区，聚合国内安全文章、工具与会议资讯。",
  },
];

/**
 * 信源统一类型。
 * - 静态源：直接给 `url`（标准 RSS）。
 * - 动态源：给 `urlBuilder`（运行时解析，用于 RSSHub 桥接的 X/公众号等）。
 *   当依赖的环境变量（如 RSSHUB_BASE）未配置时，urlBuilder 返回空串，
 *   fetchSources 会跳过该源。
 */
export type FeedSource = {
  name: string;
  url?: string;
  /** 动态 URL 构造器（与 url 二选一）。返回空串表示该源不可用。 */
  urlBuilder?: () => string;
  category: string;
  description?: string;
};

/**
 * KOL 信源：X 安全大V + 安全公众号，经自建 RSSHub 桥接。
 * 对齐 AI HOT 的 X/公众号源（它的 source 字段标注 X：@handle / 公众号：xxx）。
 * RSSHUB_BASE 未配置时这组源整体跳过，不影响其他源。
 */
export const FEED_SOURCES_KOL: FeedSource[] = [
  // —— X 安全大V ——
  {
    name: "X：Brian Krebs (@briankrebs)",
    urlBuilder: () => xUserUrl("briankrebs"),
    category: "深度分析",
    description: "Krebs on Security 作者 Brian Krebs 的 X 动态，深度追踪网络犯罪。",
  },
  {
    name: "X：SwiftOnSecurity (@SwiftOnSecurity)",
    urlBuilder: () => xUserUrl("SwiftOnSecurity"),
    category: "综合资讯",
    description: "匿名安全社区 KOL SwiftOnSecurity，分享防御实践与安全科普。",
  },
  {
    name: "X：Troy Hunt (@troyhunt)",
    urlBuilder: () => xUserUrl("troyhunt"),
    category: "深度分析",
    description: "Have I Been Pwned 创始人 Troy Hunt 的 X 动态，关注数据泄露。",
  },
  {
    name: "X：Kevin Beaumont (@GossiTheDog)",
    urlBuilder: () => xUserUrl("GossiTheDog"),
    category: "威胁情报",
    description: "安全研究员 Kevin Beaumont，追踪勒索软件与重大漏洞事件。",
  },
  {
    name: "X：MalwareHunterTeam (@malaboratories)",
    urlBuilder: () => xUserUrl("malaboratories"),
    category: "恶意软件",
    description: "恶意软件猎手 MalwareHunterTeam，实时披露新型勒索与恶意样本。",
  },
  {
    name: "X：Vitali Kremez (@VitaliKremez)",
    urlBuilder: () => xUserUrl("VitaliKremez"),
    category: "威胁情报",
    description: "威胁情报分析师 Vitali Kremez，深度分析 APT 与勒索团伙。",
  },
  {
    name: "X：Jake Williams (@MalwareJake)",
    urlBuilder: () => xUserUrl("MalwareJake"),
    category: "威胁情报",
    description: "前 NSA 黑客 Jake Williams，分享红队、取证与事件响应洞察。",
  },
  {
    name: "X：Carlos Perez (@Carlos_Perez)",
    urlBuilder: () => xUserUrl("Carlos_Perez"),
    category: "威胁情报",
    description: "安全老兵 Carlos Perez，专注 PowerShell 安全与防御技术。",
  },
  // —— 安全公众号（RSSHub biz 路由，需在实例配公众号 cookie） ——
  // ⚠️ 占位 biz 值需替换为真实值：微信打开该公众号任一文章 → URL 取 __biz
  //     未替换时这些源会抓到空/错误（不影响其他源）。详见 docs/deploy-rsshub.md。
  {
    name: "公众号：奇安信威胁情报中心",
    urlBuilder: () => wechatBizUrl("REPLACE_WITH_BIZ_QIANXIN"),
    category: "威胁情报",
    description: "奇安信威胁情报中心公众号，发布 APT 追踪与威胁分析。",
  },
  {
    name: "公众号：腾讯安全威胁情报中心",
    urlBuilder: () => wechatBizUrl("REPLACE_WITH_BIZ_TENCENT"),
    category: "威胁情报",
    description: "腾讯安全威胁情报中心公众号，发布漏洞与攻击活动预警。",
  },
  {
    name: "公众号：微步在线研究响应中心",
    urlBuilder: () => wechatBizUrl("REPLACE_WITH_BIZ_THREATBOOK"),
    category: "威胁情报",
    description: "微步在线研究响应中心公众号，发布威胁情报与攻防分析。",
  },
  {
    name: "公众号：长亭科技",
    urlBuilder: () => wechatBizUrl("REPLACE_WITH_BIZ_CHAITIN"),
    category: "深度分析",
    description: "长亭科技公众号，发布攻防技术研究与安全方案。",
  },
  {
    name: "公众号：绿盟科技研究通讯",
    urlBuilder: () => wechatBizUrl("REPLACE_WITH_BIZ_NSFOCUS"),
    category: "威胁情报",
    description: "绿盟科技研究通讯公众号，发布漏洞分析与威胁研究。",
  },
];

export const FEED_SOURCES_AI = [
  // —— 官方一手：AI 实验室的安全/研究动态 ——
  {
    name: "OpenAI：动态",
    url: "https://openai.com/news/rss.xml",
    category: "AI 安全",
    description: "OpenAI 官方动态，含模型安全研究、红队报告与对齐工作。",
  },
  {
    name: "Google DeepMind：Blog",
    url: "https://deepmind.google/blog/rss.xml",
    category: "AI 安全",
    description: "Google DeepMind 前沿研究，含对齐、可解释性与前沿安全(Frontier Safety)成果。",
  },
  {
    name: "Google Research：Blog",
    url: "https://research.google/blog/rss/",
    category: "AI 安全",
    description: "Google Research，含 AI 安全、对抗鲁棒性与负责任 AI 研究。",
  },
  {
    name: "Microsoft Security：Blog",
    url: "https://www.microsoft.com/en-us/security/blog/feed/",
    category: "AI 安全",
    description: "微软安全博客，含 AI 红队(Microsoft AI Red Team)、AI 诈骗与防护研究。",
  },
  {
    name: "NVIDIA：Blog",
    url: "https://blogs.nvidia.com/feed/",
    category: "AI 安全",
    description: "NVIDIA 博客，含 AI 基础设施安全与可信 AI 相关动态。",
  },
  // —— 安全厂商：AI 安全专项研究 ——
  {
    name: "Wiz：Research",
    url: "https://www.wiz.io/blog/rss.xml",
    category: "AI 安全",
    description: "Wiz 安全研究，聚焦云原生 AI 与大模型基础设施安全威胁。",
  },
  {
    name: "Cisco Security：Blog",
    url: "https://blogs.cisco.com/security/feed",
    category: "AI 安全",
    description: "Cisco 安全博客，含 AI 驱动威胁检测与 LLM 防护研究。",
  },
  {
    name: "Cloudflare：Blog",
    url: "https://blog.cloudflare.com/rss/",
    category: "AI 安全",
    description: "Cloudflare 博客，含 AI API 防护、提示注入缓解与边缘 AI 安全。",
  },
  {
    name: "PortSwigger：Daily Swig",
    url: "https://portswigger.net/daily-swig/rss",
    category: "AI 安全",
    description: "PortSwigger 安全新闻，覆盖 Web 安全与新兴 AI/LLM 攻击研究。",
  },
  // —— 学术与论文 ——
  {
    name: "arXiv：密码学与安全 (cs.CR)",
    url: "https://export.arxiv.org/rss/cs.CR",
    category: "AI 安全",
    description: "arXiv 安全与密码学最新预印本，含对抗 ML、LLM 攻击与防御前沿。",
  },
  {
    name: "arXiv：机器学习 (cs.LG)",
    url: "https://export.arxiv.org/rss/cs.LG",
    category: "AI 安全",
    description: "arXiv 机器学习最新预印本，含鲁棒性、隐私与可信 ML 研究。",
  },
  // —— 监管与标准 ——
  {
    name: "NIST：News",
    url: "https://www.nist.gov/news-events/news/rss.xml",
    category: "AI 安全",
    description: "NIST 新闻，含 AI RMF、对抗机器学习分类(NIST AI 100-2)等标准动态。",
  },
  // —— 深度分析 / 独立观察 ——
  {
    name: "Daniel Miessler",
    url: "https://danielmiessler.com/feed/",
    category: "AI 安全",
    description: "安全专家 Daniel Miessler，聚焦 AI 安全、威胁情报与 LLM 应用风险(含 OWASP Top 10 for LLMs 实践)。",
  },
  {
    name: "Simon Willison",
    url: "https://simonwillison.net/atom/everything/",
    category: "AI 安全",
    description: "LLM 实践专家 Simon Willison，持续跟踪提示注入与 LLM 安全实践。",
  },
  {
    name: "AI Snake Oil",
    url: "https://www.aisnakeoil.com/feed",
    category: "AI 安全",
    description: "AI 批判性分析与政策评论，含 AI 滥用、隐私与风险评估。",
  },
  {
    name: "AI Village (DEF CON)",
    url: "https://aivillage.org/feed.xml",
    category: "AI 安全",
    description: "DEF CON AI Village，AI 安全社区攻防研究与大会议题。",
  },
  {
    name: "Securing AI (Dawn Song)",
    url: "https://medium.com/feed/@dawnsong",
    category: "AI 安全",
    description: "伯克利教授 Dawn Song 的 AI 安全与隐私研究洞察。",
  },
  // —— 中文源 ——
  {
    name: "机器之心",
    url: "https://www.jiqizhixin.com/rss",
    category: "AI 安全",
    description: "国内专业 AI 媒体，覆盖 AI 安全与大模型风险报道。",
  },
  {
    name: "量子位",
    url: "https://www.qbitai.com/feed",
    category: "AI 安全",
    description: "AI 媒体，跟踪 AI 安全事件与产业动态。",
  },
];

export const FEED_SOURCES = [...FEED_SOURCES_A, ...FEED_SOURCES_B];

export const CUTOFF_MS = 24 * 60 * 60 * 1000;

export type FeedItem = {
  id: string;
  title: string;
  link: string;
  summary: string;
  source: string;
  category: string;
  pubDate: string;
  image?: string;
  titleZh?: string;
  summaryZh?: string;
  summaryAi?: string;
};
