import type { CampaignData } from "@/app/intelligence/data";

function StatusPill({ label, tone }: { label: string; tone?: string }) {
  return <div className={`status-pill${tone ? ` ${tone}` : ""}`}>{label}</div>;
}

function ActionRow({
  actions,
}: {
  actions?: Array<{ label: string; tone?: string }>;
}) {
  if (!actions?.length) return null;

  return (
    <div className="action-row">
      {actions.map((action) => (
        <div key={`${action.label}-${action.tone ?? "default"}`} className={`action${action.tone ? ` ${action.tone}` : ""}`}>
          {action.label}
        </div>
      ))}
    </div>
  );
}

function CampaignCard({
  item,
  className = "",
}: {
  item: CampaignData["timeline"][number];
  className?: string;
}) {
  return (
    <article className={["panel", className].filter(Boolean).join(" ")}>
      <div className="timeline-top">
        <StatusPill label={item.badge} tone={item.badgeTone} />
        <div className="meta-label">{item.meta}</div>
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <div className="detail-list">
        {item.details.map((detail) => (
          <span key={detail}>{detail}</span>
        ))}
      </div>
      <ActionRow actions={item.actions} />
    </article>
  );
}

export default function WhatChanged({ campaigns }: { campaigns: CampaignData }) {
  const [primaryCampaign, ...remainingCampaigns] = campaigns.timeline;
  const secondaryCampaigns = remainingCampaigns.slice(0, 2);

  return (
    <section className="what-changed section" id={campaigns.sectionId} aria-label="重点攻击活动">
      <div className="bridge-headline">
        <div>
          <div className="eyebrow">{campaigns.eyebrow}</div>
          <h2>{campaigns.title}</h2>
          <p>{campaigns.description}</p>
        </div>
        <StatusPill label={campaigns.badge} tone="warning" />
      </div>

      <div className="campaign-briefing">
        <article className="panel primary-campaign">
          <div className="panel-header">
            <div>
              <div className="meta-label">What changed in 72h</div>
              <h3>{campaigns.panelTitle}</h3>
              <p>{campaigns.panelDescription}</p>
            </div>
            <StatusPill label={campaigns.panelBadge.replace("{time}", "08:40")} tone="info" />
          </div>
          {primaryCampaign ? <CampaignCard item={primaryCampaign} /> : null}
        </article>

        <div className="secondary-campaigns">
          {secondaryCampaigns.map((item) => (
            <CampaignCard key={item.title} item={item} className="secondary-campaign" />
          ))}
        </div>
      </div>
    </section>
  );
}
