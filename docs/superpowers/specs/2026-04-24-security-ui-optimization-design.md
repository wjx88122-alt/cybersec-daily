# Security UI Optimization Design

Date: 2026-04-24

## Summary

The redesign will move `cybersec-daily` toward a professional security operations product. Public news pages remain calm and readable, while Intelligence, MDR, Network, Splunk, and Team surfaces become more task-oriented: priority, severity, ownership, evidence, SLA, entity context, and next action should be visible before decorative narrative.

The user approved this direction and selected moderate system icons. Icons should improve scanning through consistent line-style symbols for navigation, metrics, state, list rows, form fields, and command buttons. Icons must not replace text labels, and emoji should be removed from operational UI except where existing persona data intentionally uses it.

## External UX References

- Elastic Security's Detection & Response dashboard focuses on recent and high-priority alerts and cases, with host and user context and direct drill-downs to detail pages: https://www.elastic.co/docs/solutions/security/dashboards/detection-response-dashboard
- Microsoft Sentinel frames incident investigation around timeline, entities, insights, logs, comments, and lowering MTTR: https://learn.microsoft.com/en-us/azure/sentinel/incident-investigation
- Splunk Enterprise Security's SOC Operations dashboard uses SOC metrics, workflows, dispositions, mean time to triage, mean time to resolution, assigned/unassigned notables, analyst close rate, and true/false-positive dispositions: https://help.splunk.com/en/splunk-enterprise-security-8/user-guide/8.4/analytics/soc-operations-dashboard
- Splunk's Security Posture dashboard emphasizes 24-hour security posture, trends, real-time updates, notable event urgency, top notables, and event sources for SOC display: https://help.splunk.com/splunk-enterprise-security-8/user-guide/8.1/analytics/security-posture-dashboard
- Apple HIG recommends streamlined interface icons with limited color to communicate straightforward ideas: https://developer.apple.com/design/human-interface-guidelines/icons
- WCAG 2.2 AA requires 4.5:1 contrast for normal text, 3:1 contrast for required non-text UI/graphics, and 24 by 24 CSS pixel minimum pointer targets where applicable: https://www.w3.org/TR/WCAG22/

## Current Problems Observed

1. The shared visual system still leans on large-radius glass cards, soft glows, and oversized display type. This makes operational pages feel more like presentation surfaces than daily-use tools.
2. `/intelligence` has strong content but the hero headline is too large for the decision workflow. On mobile, chips wrap into narrow vertical pills and the first viewport becomes hard to scan.
3. `/mdr` is closest to the target workflow, but it still uses very large panels and text-heavy explanations. More rows should expose state, evidence, owner, SLA, and next action in compact structures.
4. `/mdr/dashboard`, `/mdr/network`, and `/mdr/splunk` rely heavily on emoji and mixed icon language. This weakens professional tone and makes the UI less coherent.
5. `/team` and related decision pages still read as polished narrative pages. They should keep warmth but use clearer workbench affordances: tabs, query controls, archive index, replay, and related entries.
6. Public pages currently degrade into large empty-stat layouts when data is unavailable. The empty state should feel like a service state with clearer recovery expectations.
7. Some interactive controls have subtle focus treatment or small click targets. The redesign should standardize focus and target sizing.

## Design Direction

### System Language

- Keep the Apple-inspired calm material direction, but reduce exaggerated radii, heavy shadows, and decorative glow.
- Use smaller, denser panels for tools and dashboards. Reserve large type for actual editorial/public hero contexts only.
- Replace negative letter spacing in operational surfaces with default letter spacing.
- Use semantic status colors consistently: red for critical, orange/amber for high/SLA risk, blue/cyan for investigation/intake, green for resolved/healthy, slate for neutral.
- Add focus-visible styles and larger minimum target dimensions for buttons, links, tabs, filter pills, inputs, and icon buttons.
- Introduce a small inline SVG icon system in code instead of adding a dependency. The icons should be line-based, consistent in stroke, and accessible with `aria-hidden` when paired with text.

### Public News And AI Pages

- Preserve bright editorial tone, but reduce hero text size and card radius.
- First viewport should communicate source freshness, available count, and fallback state without looking broken when no items exist.
- News cards should expose source, category, time, and external-link affordance with moderate icons.
- Search and category filters should look like tool controls, not decorative pills.
- Empty state should include a concise operational explanation and a reset path.

### Intelligence Center

- Convert the topbar and hero into a command-brief layout:
  - left: concise verdict and priority narrative
  - right: score, decision queue, filters, and scope
  - below: KPI cards and exposure priorities
- Reduce huge dark hero headline and narrow mobile chip wrapping.
- Add icons to section links, filters, verdict factors, exposure rows, playbook/action rows, and tables.
- Make graph and table sections scroll-safe on small screens.
- Keep dark mode, but reduce grid/glow atmosphere and improve contrast.

### MDR Workbench

- Keep `/mdr` as the operational center, but make it more compact and row-oriented.
- Priority queue rows should show: severity icon, title, host/source/MITRE, SLA, owner/tier, status, and next action.
- Stats should include more SOC-relevant metrics where mock data supports them: open cases, critical, SLA risk, unassigned, available capacity.
- Tabs should use icon+text labels.
- Alerts, tickets, analysts, routing notes, workflow steps, coverage matrix, and toast should use the shared icon system.

### MDR Dashboard

- Remove emoji KPI icons and replace them with system icons.
- Make the dashboard feel less like a show wall and more like a SOC overview:
  - top KPI strip
  - threat map with right-side summary
  - alert severity/source distribution
  - analyst workload and case status
  - client health
- Ensure the threat map remains framed and readable on desktop and mobile.

### Network Operations

- Replace emoji metadata and tab icons with line icons.
- Strengthen client sidebar and selected-client details.
- Device, alert, and ops rows should use consistent status and severity icon treatment.
- Network topology should use a professional header and legend, not emoji labels.
- Keep vendor logos if they load safely, but the UI must remain readable without them.

### Splunk Configuration

- Replace emoji headings and tab icons with system icons.
- Make the connection status strip and form fields more enterprise-like.
- Inputs should have clear labels, hints, focus styles, and consistent control height.
- Data sources, mapping table, and preview alerts should expose enable/disabled, severity, host, source, and mapping outcome with icons and labels.

### Team Workbench

- Preserve the executive warmth, but reduce decorative glow and nested card feel.
- Use icons in tabs, stats, call matrix, archive query, decision cards, and replay controls.
- Role cards should be easier to scan: identity, usage, boundaries, common questions, and tags should be grouped predictably.
- Decision archive should feel like a searchable knowledge/workbench surface rather than only a stacked presentation.

## Accessibility And Responsiveness

- Meet WCAG 2.2 AA contrast targets for text and non-text UI states.
- Ensure focus indicators are visible on buttons, links, filters, tabs, and form controls.
- Maintain minimum control target sizes around 24 by 24 CSS pixels, with larger targets for primary touch controls.
- Mobile layouts must avoid narrow vertical chips, overflowing headings, and clipped graph labels.
- Icons paired with text should be `aria-hidden`; icon-only controls should have accessible labels.

## Implementation Notes

- Prefer shared utilities/components over one-off replacements.
- Create a small icon component module, likely `components/ui/SystemIcon.tsx`, to avoid adding dependencies.
- Centralize reusable UI classes in `app/styles/system.css`, with product-specific refinements in `public.css`, `intelligence.css`, `mdr.css`, and `team.css`.
- Add or update tests that statically enforce:
  - no emoji in MDR operational page labels/headings after replacement
  - moderate icon system usage in key surfaces
  - shared focus/target-size tokens/classes exist
  - mobile intelligence chip/layout regressions are covered by CSS selectors where practical

## Out Of Scope

- Rebuilding data pipelines or replacing mock MDR/Team data with live backend data.
- Adding a third-party icon library unless local implementation becomes too costly.
- Creating a landing/marketing page.
- Changing route structure or product IA beyond UI and component organization.

## Success Criteria

- `npm test` passes.
- `npm run build` passes.
- Desktop screenshots of `/`, `/ai`, `/intelligence`, `/mdr`, `/mdr/dashboard`, `/mdr/network`, `/mdr/splunk`, `/team`, `/team/history`, and `/team/decisions` show a coherent professional system.
- Mobile screenshots of `/`, `/intelligence`, `/mdr`, `/mdr/network`, and `/team/decisions` show no incoherent overlap, narrow vertical chips, or clipped primary content.
- The final UI uses moderate system icons to improve scanning without turning operational pages into emoji-heavy dashboards.
