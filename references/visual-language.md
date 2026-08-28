# Product-native visual language

## Principle

The visual system must come from the product detail page, not from a fixed house palette and not from a generic dashboard template. Content hierarchy remains fixed; visual tokens adapt.

## Extraction card

Record the following before designing:

| Token | What to extract | Output |
|---|---|---|
| Primary color | dominant brand/product field | HEX/RGB |
| Secondary color | support block or packaging color | HEX/RGB |
| Accent color | CTA, highlight, efficacy marker | HEX/RGB |
| Background | flat, gradient, paper, glass, botanical, metallic | CSS/color/image note |
| Text | main and muted text | HEX/RGB |
| Typography mood | soft, scientific, premium, playful, clinical | font/weight/spacing rules |
| Shapes | round bottle, capsule, ribbon, droplet, geometric | radius and motif rules |
| Photography | cutout, lifestyle, macro texture, reflection | crop/treatment rules |
| SKU assets | hero and variant images | local filenames and source note |

Claims visible on a detail page are content evidence only after verification. Visual extraction does not validate product claims.

## Required canvas

- Export: exactly 2160×5760 pixels.
- Browser preview: fit to viewport width, vertical scrolling, no horizontal scroll.
- Chinese body font: `PingFang SC`, `Microsoft YaHei`, `Noto Sans CJK SC`, then system sans-serif.
- Use local assets or embedded data URLs; avoid public CDN dependency.

## Fixed content hierarchy

The visual rhythm should reveal, in order:

1. Product identity and link-level diagnosis
2. Scope, evidence strength, and core data
3. People judgment and empathy map
4. User-task scenes
5. Three loss paths
6. Product proof and opportunity matrix
7. Action roadmap and validation metrics

Each section needs one strong conclusion line, evidence, and an action implication. Do not shrink type to fit more cards; remove repetition or increase internal section efficiency.

## Charts

Use charts only where relationships benefit:

- bars for ranked concerns or loss reasons;
- flow for inquiry → coupon → payment → refund/re-order;
- matrix for people × task × product proof;
- timeline for actions;
- evidence badges for verified/candidate/inferred/unknown.

Every chart must show unit, denominator, and source scope. Avoid decorative gauges and unlabelled percentages.

## Product imagery

- Preserve the product's correct aspect ratio.
- Keep SKU images grouped near identity or product-proof sections.
- Use masks, shadows, and backgrounds consistent with the detail page.
- If no usable SKU image exists, render a labeled placeholder rather than inventing product packaging.

## QA breakpoints

Check at viewport widths 900, 1366, 1440, and 2160 pixels:

- no horizontal overflow;
- no clipped text;
- no card overlap;
- no footer collision;
- image load count equals image success count;
- stage remains exactly 2160×5760 for export.

