import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const METHODOLOGY_CONTENT = `# The Vector Risk Framework

Philidor scores DeFi vault risk on a 0-10 scale using four vectors:

- Asset Composition: 30%
- Platform and Strategy: 30%
- Control and Governance: 20%
- History: 20%

## Score Meaning

The score is a relative resilience measure under the active methodology and evidence state. It is not a safety guarantee, return guarantee, or investment recommendation.

## Asset Methodology

Asset scoring uses category-specific dimensions and applies non-compensatory caps.

final_asset_score = min(
  weighted_dimension_score,
  overlay_cap,
  review_status_cap,
  hard_fail_cap,
  override_cap,
  staleness_cap
)

Key controls include:

- review status caps of reviewed 10.0, provisional 9.0, and unreviewed 7.9
- hard-fail flags with cooldown behavior
- evidence freshness penalties and staleness caps
- unresolved-address conservative fallback
- concentration and wrong-way portfolio adjustments at vault level

Expired evidence is reduced to 75% of the last observed value with no floor. When more than half of weighted evidence is stale or expired, the asset score is capped at 8.0.

## Platform And Strategy

Platform and Strategy is a deterministic 30% component based on maturity, audits, strategy risk, dependency penalties, and incident caps.

Dependencies use a worst-of model. The platform score is bounded by the weakest dependency safety factor, with Prime at 0.95x, Core at 0.80x, and Edge at 0.50x, plus a 3% count discount per additional dependency with a 0.85 floor.

Missing audits zero the audit component of this vector in the current scoring path.

## Control And Governance

Control and Governance is a deterministic 20% component based primarily on timelock, immutability, pause controls, and depositor reaction window (EVM chains). On Solana the same vector scores captured on-chain control evidence instead: program upgrade authority (including burned authorities and resolvable multisigs) and market emergency powers, worst-program-first across every program a vault depends on. Oracle attribution on Solana walks Kamino's Scope aggregator chains with worst-of scoring; Scope/Switchboard-attributed feeds score 6 and unresolved attribution scores 2. Full detail: https://docs.philidor.io/docs/methodology/governance-vector and https://docs.philidor.io/docs/reference/oracle-providers

## History

History is a deterministic 20% component based on recent instability and confirmed loss history.

History consumes vault-scoped Critical and Warning events of the incident-class allowlist (realized adverse events: incidents, bad debt, emergency pauses/shutdowns, detected proxy mutations) over a 365-day window — governance and cap-management events are priced by the Control and concentration vectors instead (methodology v4). RatingChange events are excluded. Confirmed lifetime Critical loss events carry a capped non-decaying penalty.

History also applies a post-composite ceiling:

- History below 4.0 caps the vault at 4.9
- History below 7.0 caps the vault at 7.5
- History at or above 7.0 applies no history ceiling

## Composite

raw_total = 0.30 * asset_vector
  + 0.30 * platform_vector
  + 0.20 * control_vector
  + 0.20 * history_vector

final_total = post_composite_ceilings(raw_total)

Post-composite ceilings are applied in order: asset-quality drag, history ceiling, vault-level override, then active-incident ceiling.

Asset-quality drag uses assetQualityAnchor, which includes caps but excludes LLTV haircuts and portfolio adjustments.

## Tiers And Suitability

Tier mapping:

- Prime: 8.0-10.0
- Core: 5.0-7.9
- Edge: 0.0-4.9

Published tiers use stability dwell. Promotions dwell for 6 hours, demotions dwell for 24 hours, and hard floors publish severe deterioration immediately.

Suitability labels:

- institutional
- qualified
- speculative
- not_assessed

Suitability adds review status, confidence, and flag constraints on top of score range.

## Governance And Reliability

The framework includes:

- bitemporal asset records and point-in-time lookups
- maker-checker approval workflow for score-affecting changes
- evidence lineage
- score run provenance
- fail-safe modes of normal, degraded, and fail_closed
`;

export function registerMethodologyResource(server: McpServer) {
  server.resource(
    'methodology',
    'philidor://methodology',
    {
      description:
        'The Vector Risk Framework methodology used by Philidor to score DeFi vault risk.',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'text/markdown',
          text: METHODOLOGY_CONTENT,
        },
      ],
    })
  );
}
