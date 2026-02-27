# Google Ads Campaign Setup — Codec8

Step-by-step guide to set up Google Ads campaigns targeting developers searching for documentation tools.

## Prerequisites

1. Google Ads account: https://ads.google.com
2. Billing set up with a payment method
3. Google Analytics connected to codec8.com
4. UTM parameters working on landing page

## Recommended Budget

- **Starting:** $20-50/day ($600-1,500/month)
- **Scale after 2 weeks** if CPA < $30 (target: $15-25 CPA for $99 LTD)
- **Kill campaigns** if CPA > $50 after 500 clicks

---

## Campaign 1: High-Intent Search (60% budget)

**Goal:** Capture developers actively searching for documentation tools.

### Setup

- **Campaign type:** Search
- **Bidding:** Maximize conversions (switch to Target CPA after 30 conversions)
- **Target CPA:** $20
- **Networks:** Google Search only (disable Display and Search Partners)
- **Locations:** United States, United Kingdom, Canada, Australia, Germany, Netherlands
- **Language:** English

### Ad Group 1: Documentation Generators

**Keywords (Phrase Match):**
```
"readme generator"
"api documentation generator"
"auto generate documentation"
"ai documentation generator"
"code documentation tool"
"generate readme from code"
"documentation generator tool"
"automatic documentation"
```

**Keywords (Exact Match):**
```
[readme generator]
[api documentation generator]
[github documentation tool]
[ai documentation generator]
[code documentation generator]
```

**Negative Keywords:**
```
free
open source
template
download
pdf
word
latex
java
python (add if not relevant to your targeting)
```

### Ad Group 2: Diagram/Setup Generators

**Keywords (Phrase Match):**
```
"mermaid diagram generator"
"architecture diagram tool"
"setup guide generator"
"api docs generator"
"code architecture diagram"
```

### Responsive Search Ad

**Headlines (15 max, use all):**
1. Generate Docs From GitHub Repos
2. README + API Docs in 60 Seconds
3. $99 Lifetime — No Subscription
4. AI Documentation Generator
5. Auto-Generate README Files
6. Architecture Diagrams Included
7. Setup Guides From Your Code
8. 4 Doc Types, One Click
9. Stop Writing Docs Manually
10. Try Free — No Credit Card
11. Professional Docs in Seconds
12. Connect GitHub, Get Docs
13. Mermaid Diagrams Included
14. Export Markdown or Create PR
15. Codec8 — AI Doc Generator

**Descriptions (4 max):**
1. Connect your GitHub repo. Get professional README, API docs, architecture diagrams & setup guides auto-generated. Try free.
2. AI reads your actual code — not generic templates. README, API reference, Mermaid diagrams, and setup guides in 30 seconds.
3. Free for 1 repo. $99 lifetime deal for unlimited repos. No monthly fees. No subscriptions. Generate docs now.
4. Trusted by developers. Auto-generate 4 types of documentation from any GitHub repository. Edit, export, or create a PR.

**Final URL:** `https://codec8.com/try?utm_source=google&utm_medium=cpc&utm_campaign=high_intent`

**Sitelink Extensions:**
- "Try Free Demo" → /try
- "See Pricing" → /#pricing
- "How It Works" → /#how-it-works
- "View Sample Docs" → /demo

**Callout Extensions:**
- Free Tier Available
- No Credit Card Required
- 30-Second Generation
- Markdown Export
- GitHub PR Integration

---

## Campaign 2: Competitor Keywords (30% budget)

**Goal:** Capture developers evaluating alternatives.

### Setup

- **Campaign type:** Search
- **Bidding:** Maximize conversions
- **Target CPA:** $25
- **Networks:** Google Search only

### Ad Group 1: Direct Competitors

**Keywords (Phrase Match):**
```
"mintlify alternative"
"docusaurus alternative"
"readme alternative"
"gitbook alternative"
"swagger alternative"
"readthedocs alternative"
"notion docs alternative"
```

**Keywords (Exact Match):**
```
[mintlify alternative]
[gitbook alternative]
[docusaurus alternative]
[readme.com alternative]
[swagger alternative]
```

### Ad Group 2: Competitor Brand + Intent

**Keywords (Phrase Match):**
```
"mintlify pricing"
"gitbook pricing"
"readme pricing"
"docusaurus setup"
"swagger documentation"
```

### Responsive Search Ad

**Headlines:**
1. Mintlify Alternative — $99 Once
2. Auto-Generate All 4 Doc Types
3. No Monthly Fees, Ever
4. Switch From GitBook Today
5. Better Than Docusaurus Setup
6. $99 Lifetime, Not $99/Month
7. README + API + Architecture
8. AI-Powered, Not Manual
9. Setup in 30 Seconds
10. No Configuration Required
11. Codec8 — The Simple Choice
12. Import From Any GitHub Repo

**Descriptions:**
1. Looking for a documentation tool? Codec8 auto-generates README, API docs, diagrams & setup guides from your GitHub repo. $99 lifetime.
2. No config files. No build steps. No monthly fees. Connect GitHub, click generate, get professional docs. Try free.
3. Mintlify charges monthly. GitBook charges monthly. Codec8 is $99 once, forever. Unlimited repos, all 4 doc types included.
4. Why configure documentation tools when AI can generate docs from your code? Try Codec8 free — 30-second setup.

**Final URL:** `https://codec8.com?utm_source=google&utm_medium=cpc&utm_campaign=competitor`

---

## Campaign 3: Problem-Aware (10% budget)

**Goal:** Capture developers who need docs but aren't searching for tools yet.

### Setup

- **Campaign type:** Search
- **Bidding:** Maximize clicks (switch to conversions after data)
- **Max CPC:** $2.00
- **Networks:** Google Search only

### Ad Group 1: How-To Searches

**Keywords (Phrase Match):**
```
"how to write readme"
"how to write api documentation"
"how to document code"
"how to create readme github"
"readme best practices"
"documentation best practices"
```

### Ad Group 2: Templates & Examples

**Keywords (Phrase Match):**
```
"github readme template"
"api documentation example"
"readme example"
"project documentation template"
"software documentation template"
```

### Responsive Search Ad

**Headlines:**
1. Stop Writing READMEs Manually
2. AI Writes Your Docs For You
3. README Done in 30 Seconds
4. Skip the Documentation Grind
5. Your Code → Professional Docs
6. Try Free — Instant Results
7. No Templates Needed
8. Generated From Your Code
9. Codec8 — Auto Documentation

**Descriptions:**
1. Why spend hours on documentation? Connect your GitHub repo and get professional README, API docs, and more in 30 seconds. Try free.
2. Templates are generic. Codec8 reads YOUR code and generates docs specific to your project. README, API, architecture, setup — all included.
3. Stop searching for README templates. Codec8 auto-generates documentation from your actual codebase. Free for 1 repo.

**Final URL:** `https://codec8.com/try?utm_source=google&utm_medium=cpc&utm_campaign=problem_aware`

---

## Conversion Tracking Setup

### Step 1: Create Conversion Action

1. Go to Google Ads → Tools → Conversions
2. Click "+ New conversion action"
3. Select "Website"
4. Set up these conversion actions:

| Action | Category | Value | Count |
|--------|----------|-------|-------|
| Sign Up (GitHub OAuth) | Sign-up | $5 | One |
| Free Doc Generated | Lead | $10 | One |
| LTD Purchase ($99) | Purchase | $99 | One |
| Pro Purchase ($497) | Purchase | $497 | One |

### Step 2: Install Google Tag

Add to `src/app.html` inside `<head>`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXXXXX');
</script>
```

### Step 3: Fire Conversion Events

After GitHub OAuth callback:
```javascript
gtag('event', 'conversion', { send_to: 'AW-XXXXXXXXXX/signup' });
```

After doc generation:
```javascript
gtag('event', 'conversion', { send_to: 'AW-XXXXXXXXXX/lead' });
```

After Stripe payment success:
```javascript
gtag('event', 'conversion', {
  send_to: 'AW-XXXXXXXXXX/purchase',
  value: 99.00,
  currency: 'USD',
  transaction_id: stripeSessionId
});
```

---

## Landing Page Requirements

For ads to convert, ensure these elements exist on the landing page:

1. **Hero headline** matches ad copy (message match)
2. **Demo/try-free CTA** above the fold
3. **Social proof** — user count, testimonials, or sample output
4. **Pricing visible** without scrolling far
5. **Fast load time** — under 3 seconds (check with PageSpeed Insights)
6. **Mobile responsive** — 40%+ of dev searches are mobile

## UTM Parameter Tracking

All campaign URLs use UTM parameters:
- `utm_source=google`
- `utm_medium=cpc`
- `utm_campaign=high_intent|competitor|problem_aware`
- `utm_content=` (optional, for A/B testing ad variants)

Ensure your analytics (Supabase or external) captures these on sign-up.

---

## Optimization Checklist (Week 1-2)

- [ ] Check Search Terms report daily — add irrelevant terms as negatives
- [ ] Pause keywords with CTR < 1% after 200 impressions
- [ ] Pause keywords with CPA > $50 after 20 clicks
- [ ] A/B test headlines — pin top performer to Position 1
- [ ] Check device performance — adjust mobile bid if CPA differs
- [ ] Check location performance — exclude countries with no conversions
- [ ] Review ad schedule — pause hours with zero conversions
- [ ] Increase budget on ad groups with CPA < $15

## Scaling Checklist (Week 3-4)

- [ ] Switch high-intent campaign to Target CPA bidding
- [ ] Add Performance Max campaign for remarketing
- [ ] Create YouTube ad (30-sec demo video) for brand awareness
- [ ] Expand to more competitor keywords based on search terms data
- [ ] Test broad match keywords with smart bidding
- [ ] Create dedicated landing pages per campaign for better Quality Score
