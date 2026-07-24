# Draveta Furniture — Implementation Plan (Solo Developer)

## Context

Draveta Furniture is a solid-wood furniture brand (consumer/trade brand of Vardhman Impex) positioned alongside Sklum, RH, and Pottery Barn but built for the Indian market. The website **never takes a payment** — it routes B2C buyers to Amazon.in/Etsy and gives approved B2B buyers a self-service tiered-pricing account with Order Requests fulfilled offline via invoice/bank transfer.

**Constraints:** 1 solo developer, ~5-month build window, budget-conscious (free/low-cost tiers), no ERP connection, standalone system.

**Key decisions confirmed:**
- B2B uses Order Requests (self-service, not "contact us" only)
- Backend is Next.js API Routes only (no separate NestJS service)
- Strict website spec scope — no blog, material library, or aspirational features

---

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | **Next.js 14+ (App Router)** | SSR for SEO, single codebase for frontend + API |
| Backend | **Next.js API Routes** | All backend logic here — one deployment, one codebase |
| Database | **PostgreSQL on Neon** | Free tier, serverless, branching for dev/staging |
| ORM | **Prisma** | Type-safe queries, migrations, seeding |
| Auth | **NextAuth.js** | 3 roles: public visitor, approved B2B, admin |
| Image Storage | **Cloudflare R2** | Zero egress fees, S3-compatible |
| Hosting | **Vercel** | Free/hobby tier at launch |
| Email | **Resend** (free tier) | Transactional emails (B2B approval, affiliate notifications) |
| Styling | **Tailwind CSS** | Utility-first, fast iteration for a solo dev |
| UI Components | **shadcn/ui** | Copy-paste components, no dependency bloat, speeds up solo work significantly |

---

## 2. Project Structure

```
draveta-furnitures/
├── src/
│   ├── app/
│   │   ├── (public)/                    # Public-facing routes
│   │   │   ├── page.tsx                 # Homepage
│   │   │   ├── collections/
│   │   │   │   └── [category]/page.tsx  # Listing page
│   │   │   ├── products/
│   │   │   │   └── [slug]/page.tsx      # PDP
│   │   │   ├── about/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── shipping-returns/page.tsx
│   │   │   └── privacy/page.tsx
│   │   ├── (b2b)/
│   │   │   ├── apply/page.tsx           # B2B application form
│   │   │   ├── login/page.tsx
│   │   │   └── dashboard/
│   │   │       ├── page.tsx             # B2B dashboard
│   │   │       └── orders/page.tsx      # Order requests
│   │   ├── (affiliate)/
│   │   │   └── apply/page.tsx           # Affiliate application
│   │   ├── admin/
│   │   │   ├── layout.tsx               # Admin shell + sidebar
│   │   │   ├── page.tsx                 # Dashboard
│   │   │   ├── products/               # Product CRUD
│   │   │   ├── b2b/                    # B2B account management
│   │   │   ├── affiliates/             # Affiliate management
│   │   │   ├── content/                # Content management
│   │   │   └── seo/                    # SEO/meta management
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       ├── products/
│   │       ├── b2b/
│   │       ├── affiliates/
│   │       ├── content/
│   │       └── upload/
│   ├── components/
│   │   ├── ui/           # shadcn/ui base components
│   │   ├── layout/       # Header, footer, nav
│   │   ├── products/     # Product card, gallery, specs
│   │   ├── b2b/          # B2B-specific components
│   │   └── admin/        # CMS components
│   ├── lib/
│   │   ├── db.ts         # Prisma client singleton
│   │   ├── auth.ts       # NextAuth config
│   │   ├── geo.ts        # Geo-routing (Amazon vs Etsy)
│   │   ├── pricing.ts    # B2B tier pricing engine
│   │   ├── storage.ts    # R2 upload helpers
│   │   └── email.ts      # Transactional email via Resend
│   └── types/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── .env.local
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 3. Database Schema (Core Entities)

### Products & Collections
- **Product** — id, name, slug, description, specs (JSON), category_id, base_price, amazon_url, etsy_url, meta_title, meta_description, og_image, status (draft/published/archived), created_at, updated_at
- **Category** — id, name, slug, image_url, display_order
- **ProductImage** — id, product_id, url, alt_text, display_order, is_primary
- **ProductVariant** — id, product_id, name, sku, price_modifier, specs (JSON)

### B2B
- **B2BApplication** — id, company_name, business_type (enum), gst_number, year_established, website_url, contact_name, contact_designation, email, phone, categories_interested (JSON), estimated_volume, current_suppliers, heard_about, delivery_city, delivery_state, order_frequency, gst_certificate_url, status (pending/approved/rejected/suspended), internal_notes, reviewed_by, reviewed_at, created_at
- **B2BAccount** — id, application_id, user_id, tier (enum), discount_percentage, status (active/suspended), created_at
- **B2BTierPricing** — id, product_id, tier, min_qty, max_qty, unit_price
- **OrderRequest** — id, b2b_account_id, status (submitted/acknowledged/invoiced/fulfilled/cancelled), items (JSON), total, notes, created_at
- **B2BNote** — id, application_id, author_id, content, created_at

### Affiliates
- **AffiliateApplication** — id, name, email, phone, social_url, audience_size, status, created_at
- **AffiliateProfile** — id, application_id, user_id, unique_code, discount_percent (default 5), commission_percent (default 2), status
- **AffiliateSalesLog** — id, affiliate_id, period, platform, redemption_count, revenue, commission_owed, payment_status, paid_at, notes

### Users & Auth
- **User** — id, email, password_hash, name, role (admin/b2b/affiliate), status, created_at

### Content & SEO
- **ContentBlock** — id, key, value, type (text/image/url), updated_by, updated_at
- **SeoDefault** — id, title_template, meta_description, og_image, updated_at
- **SeoOverride** — id, page_path, meta_title, meta_description, og_image

---

## 4. Solo Developer Strategy

As a solo developer, the key principle is: **build vertically, not horizontally.** Complete one full feature slice (API + UI + admin) before moving to the next. This means:

- Each feature is usable and testable the moment it's done
- No half-built features waiting for "the other developer" to finish their part
- You can demo progress every 2 weeks
- If timeline slips, you still have a working (partial) product

Use **shadcn/ui** heavily to avoid building UI primitives from scratch — tables, forms, modals, dropdowns, toasts are all handled. This saves ~3 weeks compared to building a component library.

---

## 5. Month-by-Month Sprint Plan

### Month 1 — Scaffold + Admin Product CMS (Weeks 1–4)

**Week 1: Project setup**
- Initialize Next.js + TypeScript + Tailwind + shadcn/ui
- Git repo, Vercel deployment, environment config
- Neon PostgreSQL database + Cloudflare R2 bucket
- Prisma schema (all entities from Section 3), initial migration
- Seed script: 5 categories, 10 sample products with placeholder images
- NextAuth setup: credentials provider, JWT with role claim, admin middleware

**Weeks 2–3: Admin CMS — Product management**
- Admin layout shell: sidebar nav, breadcrumbs, auth guard (admin-only)
- Product list: data table with search, filter by category/status, pagination
- Product create/edit form: name, slug (auto-generated), description (rich text), specs, category, base price, Amazon URL, Etsy URL, status
- Image upload to R2: drag-and-drop, reorder, set primary, delete
- Per-product SEO fields: meta title, description, OG image, URL slug
- Category CRUD: name, slug, image, display order (drag-to-reorder)

**Week 4: Admin CMS — Content + SEO modules**
- Content management: homepage hero editor (image/video URL, headline, subline), "Why Solid Wood" editor (4 pillars), CTA text/URL
- SEO defaults: sitewide title template, meta description, OG image
- SEO overrides: per-page meta fields
- Admin dashboard: placeholder stats (product count, pending B2B apps, etc.)

**Month 1 Deliverable:** Working admin panel where you can manage products, categories, homepage content, and SEO — all persisted to the database. Deployed on Vercel.

---

### Month 2 — Public Website (Weeks 5–8)

**Week 5: Layout + Homepage**
- Header: logo, navigation (Collections, About, Contact, B2B Apply), sticky on scroll, mobile hamburger menu
- Footer: contact info, social links, policy links (About, Privacy, Shipping)
- Homepage: hero section (full-bleed image, headline, subline from CMS), "Why Solid Wood Matters" (4 pillars from CMS), single CTA button → /collections
- Mobile-first responsive design throughout

**Week 6: Collections + Product Listing**
- Collections page: category tiles (image + name) from database, linking to /collections/[category]
- Product Listing Page: responsive card grid, filter sidebar (category pre-selected), sorting (newest, price low/high)
- Product cards: primary image, name, base price ("from ₹X"), hover effect
- Pagination or infinite scroll
- API: GET /api/products with query params (category, sort, page, limit)

**Week 7: Product Detail Page**
- Image gallery: multiple images, thumbnail strip, lightbox zoom
- Product info: name, description, specs table, category breadcrumb
- B2C buttons: "Buy on Amazon" / "Buy on Etsy" — visibility based on geo-detection
- Geo-routing: use Vercel `request.geo` or IP lookup → India shows Amazon primary, international shows Etsy primary, both always visible
- Related products: 4 products from the same category

**Week 8: Utility pages + SEO**
- About page, Contact page (form + WhatsApp link), Shipping & Returns, Privacy Policy
- Contact form API → send email via Resend
- Dynamic meta tags on all pages (from CMS/database)
- JSON-LD structured data (Product schema on PDPs)
- XML sitemap generation (/sitemap.xml)
- robots.txt
- Open Graph tags for social sharing

**Month 2 Deliverable:** Complete public website. Visitors can browse collections, filter products, view PDPs, click through to Amazon/Etsy, and contact you. SEO-ready.

---

### Month 3 — B2B Portal (Weeks 9–12)

**Week 9: B2B Application + Admin approval**
- Public B2B application form (all fields from spec Section 7.1)
- Form validation (GST format, required fields, file upload for certificate → R2)
- API: POST /api/b2b/apply
- Email notification to admin on new application (via Resend)
- Admin CMS: B2B application queue (filter by status)
- Admin: application detail view, approve/reject buttons, tier assignment dropdown, internal notes log
- On approval: auto-create User account (b2b role) + B2BAccount, send approval email with login credentials

**Week 10: B2B Pricing engine + CMS config**
- Pricing engine (`lib/pricing.ts`): given (product_id, account_tier, quantity) → unit_price
  - Check B2BTierPricing for volume breakpoints first
  - Fall back to B2BAccount.discount_percentage off base_price
- Admin CMS: per-product tier pricing configuration UI (add/edit/delete volume breakpoints per tier)
- Admin CMS: B2B account management (view accounts, change tier, suspend/reactivate)

**Week 11: B2B Dashboard + tiered pricing display**
- B2B login page (NextAuth credentials)
- B2B dashboard: welcome message, account tier, quick links
- PDP modification for logged-in B2B users: hide Amazon/Etsy buttons, show tiered pricing table instead
- "Add to Order Request" button on PDP (adds product + quantity to session/local cart)

**Week 12: Order Requests**
- Order Request builder: review items, adjust quantities, add notes, submit
- API: POST /api/b2b/orders (create), GET /api/b2b/orders (list)
- Order Request confirmation page
- Order Request history: list with status badges (submitted → acknowledged → invoiced → fulfilled)
- Email notification on new order request (to admin)
- Admin CMS: Order Request management (view, update status, add notes)

**Month 3 Deliverable:** Full B2B loop working end-to-end: apply → get approved → log in → see tiered pricing → build and submit order request → admin manages everything in CMS.

---

### Month 4 — Affiliate Module + Polish (Weeks 13–16)

**Week 13: Affiliate application + Admin module**
- Public affiliate application form (name, email, phone, social links, audience size)
- API: POST /api/affiliates/apply
- Admin CMS: affiliate application queue, approve/reject
- On approval: auto-generate unique code, create AffiliateProfile, send email with code and terms
- Admin: affiliate profile management (code, discount%, commission%, status)

**Week 14: Affiliate commission ledger**
- Admin CMS: manual sales log entry per affiliate (period, platform, redemption count, revenue)
- Auto-calculate commission owed (commission% × revenue)
- Commission ledger view: running totals per affiliate, payment status (pending/paid)
- Mark as paid action with date
- Export to CSV (for accounting)

**Week 15: Performance + Accessibility**
- Lighthouse audit and fixes: target 90+ on all four scores
- Core Web Vitals optimization: LCP < 2.5s, CLS < 0.1, INP < 200ms
- Image lazy loading, code splitting, bundle analysis
- Accessibility pass: keyboard navigation, focus states, alt text, color contrast, ARIA labels
- 404 page and error boundaries
- Loading skeletons on data-fetching pages

**Week 16: Responsive polish + edge cases**
- Cross-device testing: mobile, tablet, desktop breakpoints
- Touch targets on mobile (min 44px)
- Form validation UX: inline errors, loading states, success confirmations
- Empty states: no products in category, no order requests yet, etc.
- Rate limiting on public forms (B2B apply, affiliate apply, contact)
- Input sanitization review (XSS prevention)

**Month 4 Deliverable:** Affiliate program operational. All features polished, accessible, performant. Ready for integration testing.

---

### Month 5 — Testing + Content + Launch (Weeks 17–20)

**Weeks 17–18: Testing**
- End-to-end journey testing:
  - B2C India: browse → PDP → click Amazon link
  - B2C International: browse → PDP → click Etsy link
  - B2B: apply → admin approves → login → browse with pricing → order request → admin manages
  - Affiliate: apply → admin approves → admin logs sales → commission calculated
  - Admin: full CMS walkthrough (products, B2B, affiliates, content, SEO)
- Cross-browser: Chrome, Safari, Firefox, Edge
- Mobile: iOS Safari, Android Chrome
- Security testing: auth bypass attempts, role escalation, SQL injection, XSS
- SEO validation: meta tags, structured data, sitemap, social preview tools

**Weeks 19–20: Content population + Production launch**
- Populate real product data (all categories: Living, Dining, Bedroom, Outdoor, Hospitality/Contract)
- Upload real photography
- Set real homepage content (hero image, copy, CTA)
- Set real "Why Solid Wood" content
- Set utility page copy (About, Shipping/Returns, Privacy Policy)
- Domain DNS configuration
- Production environment variables (Neon prod branch, R2 prod bucket, Resend prod key)
- Vercel production deployment
- Google Search Console setup + sitemap submission
- GA4 setup + marketplace click event tracking
- Monitoring: Vercel Analytics for performance, error tracking
- Soft launch

**Month 5 Deliverable:** Production-ready platform, live on production domain, with real content.

---

## 6. Key Technical Decisions

### Geo-routing (B2C)
Use Vercel's built-in `request.geo.country` (free on all plans). India → Amazon button prominent + Etsy secondary. International → Etsy prominent + Amazon secondary. Both always visible. Amazon/Etsy URLs are simple per-product database fields.

### B2B Pricing Engine
Support both models from spec Section 7.3:
- **Volume breakpoints**: `B2BTierPricing` table → (product_id, tier, min_qty, max_qty, unit_price)
- **Customer classification**: `B2BAccount.discount_percentage` applied to base_price
Resolution: if volume breakpoints exist for the product, use those; otherwise fall back to account discount.

### Auth Strategy
NextAuth Credentials provider, JWT tokens with role claim. Three roles via middleware:
- **Public**: product browsing, marketplace links
- **B2B**: + tiered pricing + order requests (requires approved B2BAccount)
- **Admin**: CMS access

### Image Pipeline
Upload originals → Cloudflare R2 → serve via R2 public URL. Next.js `<Image>` handles responsive sizing and WebP conversion automatically. No separate image processing service needed.

---

## 7. Open Items

| Item | When needed | Default if unresolved |
|---|---|---|
| **Budget currency** (₹20K / ₹20L / $20K) | Before starting | Assume ₹20L, use free tiers everywhere |
| **Domain name** | Before Month 5 | Develop on Vercel preview URLs |
| **Logo + brand guidelines** | Before Month 2 | Placeholder logo, Tailwind theme tokens for easy swap |
| **B2B tier numbers** | Before Month 3 | Build flexible engine, seed with example tiers |
| **Wood story specifics** | Before Month 2 | Placeholder text, CMS-editable at any time |
| **CMS access roles** | Month 4 | Single admin role; add granular roles later |
| **GST/TDS on affiliate payouts** | Before first payout | No code impact; flag for CA |

---

## 8. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Solo dev burnout / context-switching fatigue | High | Schedule slip | Vertical slicing means each month produces a working deliverable; take breaks between phases |
| Brand assets (logo, photography) delayed | High | Blocks visual polish | Build with placeholders, theme tokens make swap trivial |
| Scope creep from aspirational 15-volume spec | High | Timeline blow-out | Strict Phase 1 scope gate — if it's not in the website spec Section 12 Phase 1, it's deferred |
| Solo dev = single point of failure | High | No backup if sick/unavailable | Document as you go; keep code simple and conventional (Next.js patterns, Prisma, shadcn/ui) |
| B2B pricing requirements change mid-build | Medium | Rework pricing engine | Engine supports both models from day 1 |
| Free tier limits hit | Low | Service disruption | Neon free: 0.5 GB, sufficient for MVP. R2 free: 10 GB, sufficient. Monitor monthly |

---

## 9. Verification Plan

- **Every 2 weeks**: Self-demo of completed features (record Loom or screenshots)
- **Month-end**: Stakeholder demo of that month's deliverables
- **B2C journey**: Browse → Collections → PDP → click Amazon/Etsy (verify geo-routing)
- **B2B journey**: Apply → admin approves → login → tiered pricing → Order Request → admin manages
- **Affiliate journey**: Apply → admin approves → code assigned → admin logs sales → commission calculated
- **SEO**: Lighthouse 90+ on all scores, validate structured data, test sitemap in Search Console
- **Performance**: Core Web Vitals pass on mobile and desktop
- **Security**: Auth bypass, role escalation, input injection tests
- **Cross-browser**: Chrome, Safari, Firefox, Edge; iOS Safari, Android Chrome

---

## 10. Out of Scope (Phase 2+)

Per the spec, only built if Phase 1 earns it:
- Own checkout / payment gateway for D2C
- Amazon SP-API / Etsy API integration for automated affiliate tracking
- Affiliate self-service dashboard
- ERP connection
- AI search, recommendations, room visualizer
- Mobile apps
- Blog / journal / content marketing platform
- Multi-language / multi-currency
- Advanced BI dashboards
- CRM integration, hospitality project management
- CAD drawings, 360° media, sample requests
