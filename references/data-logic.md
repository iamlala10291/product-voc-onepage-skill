# Data logic and evidence rules

## Scope header

Every management-facing output must show:

- date range;
- channel and shop;
- product and SKU scope;
- conversation, customer, and order sample size;
- deduplication unit;
- data sources and unavailable fields;
- whether counts are conversations, unique customers, orders, refunds, phrases, or SKUs.

## Event layers must not be mixed

| Layer | Meaning | Not equivalent to |
|---|---|---|
| Broad candidate hit | keyword/product/customer-chain candidate | actual inquiry |
| Actual inquiry | customer actively asks about target product/need | generic recommendation |
| Product-associated order | target product appears in order linkage | proven conversation-driven sale |
| Payment | paid order | retained revenue |
| Quick refund | refund soon after payment | product-use dissatisfaction |
| Post-shipment after-sale | request after shipment status | received and used |
| Activity refund/rebate | refund caused by activity settlement or reorder | product defect/experience refund |
| Actual return | goods return confirmed | refund-only accounting event |
| Re-order | subsequent paid order linked to customer/order | retained repurchase unless later refund excluded |

## Matching sequence

Use the strongest available path in this order:

1. direct order ID;
2. payload/associated order IDs;
3. conversation product fields;
4. same-customer temporal chain;
5. customer-service notes and buyer/refund messages;
6. manual case verification.

A direct order ID miss means “not matched by this field,” not “no conversation.” Customer-chain matching is weaker evidence and must be labeled.

## Refund classification

Use strict actual-event logic:

1. Determine refund timing relative to payment, shipment, delivery, and any re-order.
2. Identify refund type: activity settlement, cancel/intercept, return, refund-only, or exchange.
3. Read buyer message, customer-service note, logistics note, and original conversation where available.
4. Assign a cause only when the evidence supports it.
5. Keep blank/ambiguous reasons as unknown.

Recommended classes:

- mistaken/duplicate purchase;
- price or activity restructuring;
- address/privacy change;
- specification/scene mismatch;
- delivery timing/logistics;
- policy or service-path friction;
- product-experience complaint;
- unknown.

## People data

- Visitor profile can describe the traffic pool only.
- Buyer/payment profile is required for buyer-demographic statements.
- Conversation text may support role, use scene, concern, urgency, and decision state.
- Zero explicit age statements means age is unknown, even if BI predicts an age distribution.
- Avoid inferring gender or relationship status solely from the category.

## Theme counting

State whether themes are single-label or multi-label. For multi-label themes, percentages may sum above 100%. Deduplicate repeated messages from the same conversation unless message frequency itself is the metric.

## Core metrics

Use only those supported by the available data:

- actual inquiry conversations and unique inquiry customers;
- need-confirmation rate;
- user/scene/specification confirmation rate;
- concern closure rate;
- coupon sent, read, used, and paid conversion;
- payment and net retained payment;
- 30-minute and 24-hour re-order rate;
- quick refund and post-shipment after-sale rate;
- product-experience refund rate after exclusions;
- risky/unsupported promise count;
- unknown-reason share.

## Evidence language

Use explicit labels in the report:

- `Verified`: direct data or official evidence.
- `Supported candidate`: linked but incomplete chain.
- `Inferred`: interpretation to be tested.
- `Unknown`: insufficient evidence.

If a figure comes from a screenshot or daily manual reading, record the date coverage and aggregation method.

