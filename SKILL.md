---
name: product-voc-onepage
description: Use this skill whenever the user asks for a single-product VOC or inquiry-loss analysis, a customer/user insight report, empathy-map or user-task scenes, refund and conversion diagnosis, a product-detail-style one-page report, a 4K long infographic, or a reusable customer-service action plan. It is especially applicable when the input includes a product ID/link, conversations, orders/refunds, BI visitor or buyer profiles, product claims, SKU images, or an existing report that must be iterated without changing its structure. The skill produces an evidence-graded, management-ready whole-link diagnosis and a product-native 2160x5760 long-page artifact while protecting customer and internal data.
---

# Product VOC One-page Report

Build a defensible, directly usable single-product report. Diagnose the whole product link, not only customer-service execution. Keep facts, supported candidates, inferences, and unknowns visibly separate.

## Read first

Read only the references needed for the current task, but always read these three:

- `references/analysis-framework.md`
- `references/data-logic.md`
- `references/visual-language.md`

Before public release, also read `references/release-checklist.md`.

## Input contract

Collect or preserve these fields. Do not block on unavailable inputs; label missing evidence and continue with the strongest safe analysis.

- Product ID or product link, product name, SKU list
- Date range, channel, shop, agent scope, category, deduplication unit
- Conversation export or VOC database
- Order, payment, refund, return, logistics, re-order data
- Visitor or buyer profile from BI
- Product detail page or local screenshots
- Current official price/activity rules and customer-service coupons
- Verified product claim reports or regulatory/quality evidence
- Existing report/template that must be updated in place

## Required workflow

### 1. Lock scope and evidence boundaries

State the analysis date range, channel, shop, product, sample, counting unit, and exclusions. Preserve the user's formal business rules over inconsistent historical customer-service wording.

Create an evidence ledger with four levels:

1. `Verified fact`: directly supported by source data or an official report.
2. `Chain-supported candidate`: supported by linked conversation/order/customer records but not fully closed-loop.
3. `Inference`: plausible interpretation from behavior or context.
4. `Unknown`: evidence absent or contradictory.

Never convert level 2–4 into level 1 through confident wording.

### 2. Acquire product-native visual material

When a product ID/link is provided, use the available authenticated browser session to inspect the official detail page. Never read password stores, cookies, or tokens.

Capture locally:

- dominant, secondary, accent, background, and text colors;
- material/texture, typography mood, icon and shape language;
- hero composition, product photography treatment, and SKU images;
- claims that appear on the page, but do not treat them as verified until evidence is supplied.

If the page is inaccessible, use user-provided screenshots or local product images and record the limitation.

### 3. Reconcile conversations, orders, and refunds

Separate these event layers:

- broad keyword/candidate hit;
- actual product inquiry;
- order-associated product;
- payment;
- quick refund;
- post-shipment after-sale;
- re-order;
- actual return;
- activity rebate/refund;
- logistics intercept;
- product-experience refund.

Do not stop after a primary order ID miss. Where available, supplement with payload order arrays, product fields, customer-chain lookup, customer-service notes, buyer messages, refund notes, logistics status, and re-order linkage.

### 4. Diagnose the whole link

Evaluate five layers:

1. Traffic/content expectation
2. Product value expression
3. Price/activity path
4. Customer-service inquiry handoff
5. Fulfillment/refund/after-sale rules

Customer service is one component, not the default root cause. Phrase conclusions as link-level findings unless evidence isolates one responsible stage.

### 5. Build the fixed report narrative

Use this order unless the user explicitly changes it:

1. Management conclusion
2. Data results and people judgment
3. Empathy map and user-task scenes
4. Inquiry/loss analysis: view-no-buy, quick refund, post-shipment refund
5. Product value proof × people opportunities
6. Actions, owners, and validation metrics

Every section must contain a conclusion, its evidence, and the corresponding action or implication.

### 6. Define people and tasks carefully

Use behavior, stated needs, purchase context, objections, and lifecycle stage before demographic guesses. A visitor profile is not a payment profile. If conversations contain zero explicit age signals, do not infer age from tone or product category.

Write task scenes as:

`WHO + situation/trigger + desired progress + barrier/concern + decision evidence + recommended response/action`

For empathy maps, cover: who, need, see, hear, say, do, think/feel, pains, gains, decision triggers. Include unspoken concerns revealed by actions, not only literal questions.

### 7. Build the artifact

Use `templates/report-config.example.json` as the data contract and `templates/onepage-report.html` as the visual base.

```bash
node scripts/build_report.mjs <config.json> <output.html>
node scripts/render_report.mjs <output.html> <output.png>
node scripts/validate_report.mjs <output.html>
node scripts/privacy_scan.mjs <public-folder>
```

Adapt the CSS tokens to the product detail page. Keep the export at 2160×5760 and the browser preview auto-fitted to screen width with vertical scrolling.

### 8. Quality gate

Do not call the result complete until all are true:

- report dimensions are 2160×5760;
- no text/card overflow, horizontal overflow, footer collision, or failed image;
- conclusion, evidence, and action are easy to distinguish;
- source, scope, counting unit, and evidence levels are visible;
- broad hits and actual events are not mixed;
- activity refunds are excluded from product-experience refunds;
- unknown reasons remain unknown;
- no process residue such as “yesterday”, “new evidence”, TODO, tracked changes, comments, or version-history language;
- no customer data, order IDs, internal URLs, local paths, credentials, or internal product evidence is published.

## Output package

Prefer updating the accepted report rather than creating repeated variants. A complete handoff includes:

- final HTML and 4K PNG;
- source/config used to build them;
- a short data-scope and evidence note;
- validation result;
- exact local paths;
- public URL only after privacy scanning and successful remote verification.

## Non-negotiable rules

- Do not claim “edible”, “swallowable”, “safe for every sensitive user”, “safe for pregnancy preparation”, or “compatible with every toy” without explicit evidence.
- Do not treat blank refund notes as product dissatisfaction.
- Do not treat shipment-stage after-sale as product-use feedback unless receipt/use evidence exists.
- Do not let attractive design compress or hide analytical content.
- Do not publish local customer, order, conversation, BI, or proprietary evidence data.

