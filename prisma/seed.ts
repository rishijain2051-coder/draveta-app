import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Verified Unsplash furniture photo IDs (all return 200).
const IMG = [
  "1533090161767-e6ffed986c88", // 0 chair
  "1567016376408-0226e4d0c1ea", // 1 table
  "1540574163026-643ea20ade25", // 2 dining
  "1503602642458-232111445657", // 3 chair
  "1505693416388-ac5ce068fe85", // 4 bed
  "1538688525198-9b88f6f53126", // 5 bedroom
  "1449247709967-d4461a6a6103", // 6 room
  "1493663284031-b7e3aefcae8e", // 7 dining/outdoor
  "1524758631624-e2822e304c36", // 8 desk
  "1555041469-a586c61ea9bc", // 9 sofa
  "1567538096630-e0c55bd6374c", // 10 living
  "1586023492125-27b2c045efd7", // 11 living room (hero)
];
const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
const amazon = (name: string) =>
  `https://www.amazon.in/s?k=${encodeURIComponent(name + " solid wood")}`;
const etsy = (name: string) =>
  `https://www.etsy.com/search?q=${encodeURIComponent(name)}`;

async function main() {
  console.log("Seeding database...");

  // ─── Admin ────────────────────────────────────────────────
  // Password comes from ADMIN_PASSWORD so a real database is never seeded with a
  // known default. Falls back to admin123 for local/demo use (with a warning).
  const adminPlain = process.env.ADMIN_PASSWORD || "admin123";
  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      "⚠  ADMIN_PASSWORD not set — seeding admin with default 'admin123'. Set ADMIN_PASSWORD before seeding a production database."
    );
  }
  const adminPassword = await bcrypt.hash(adminPlain, 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@draveta.com" },
    update: { passwordHash: adminPassword },
    create: {
      email: "admin@draveta.com",
      name: "Draveta Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // ─── Categories ───────────────────────────────────────────
  const categoryDefs = [
    { name: "Living", slug: "living", displayOrder: 1, image: IMG[10] },
    { name: "Dining", slug: "dining", displayOrder: 2, image: IMG[2] },
    { name: "Bedroom", slug: "bedroom", displayOrder: 3, image: IMG[5] },
    { name: "Outdoor", slug: "outdoor", displayOrder: 4, image: IMG[6] },
    {
      name: "Hospitality / Contract",
      slug: "hospitality-contract",
      displayOrder: 5,
      image: IMG[8],
    },
  ];
  const categories = await Promise.all(
    categoryDefs.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: { imageUrl: img(c.image) },
        create: {
          name: c.name,
          slug: c.slug,
          displayOrder: c.displayOrder,
          imageUrl: img(c.image),
        },
      })
    )
  );
  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
  console.log(`Categories: ${categories.length}`);

  // ─── Products ─────────────────────────────────────────────
  const products = [
    {
      name: "Ashwood Lounge Chair",
      slug: "ashwood-lounge-chair",
      categorySlug: "living",
      basePrice: 24500,
      img: IMG[0],
      description:
        "A handcrafted lounge chair in solid sheesham wood with a natural oil finish. Mortise-and-tenon joinery throughout.",
      specs: {
        Material: "Sheesham (Indian Rosewood)",
        Finish: "Natural Oil",
        Dimensions: "75W x 80D x 85H cm",
        Weight: "18 kg",
      },
    },
    {
      name: "Indus Coffee Table",
      slug: "indus-coffee-table",
      categorySlug: "living",
      basePrice: 18900,
      img: IMG[1],
      description:
        "Minimalist coffee table in solid mango wood. Clean lines, dovetail drawer, hand-rubbed wax finish.",
      specs: {
        Material: "Mango Wood",
        Finish: "Hand-rubbed Wax",
        Dimensions: "110W x 60D x 42H cm",
        Weight: "22 kg",
      },
    },
    {
      name: "Teak Dining Table — 6 Seater",
      slug: "teak-dining-table-6-seater",
      categorySlug: "dining",
      basePrice: 45000,
      img: IMG[2],
      description:
        "Solid teak dining table with breadboard ends and a hand-planed surface. Seats 6 comfortably.",
      specs: {
        Material: "Teak",
        Finish: "Semi-gloss Lacquer",
        Dimensions: "180W x 90D x 76H cm",
        Weight: "48 kg",
        Seating: "6",
      },
    },
    {
      name: "Ladderback Dining Chair",
      slug: "ladderback-dining-chair",
      categorySlug: "dining",
      basePrice: 8500,
      img: IMG[3],
      description:
        "Classic ladderback chair in solid acacia with a woven jute seat. Stackable and contract-grade.",
      specs: {
        Material: "Acacia",
        Finish: "Natural Matte",
        Dimensions: "45W x 50D x 92H cm",
        Weight: "5.5 kg",
      },
    },
    {
      name: "Knotwood Queen Bed Frame",
      slug: "knotwood-queen-bed-frame",
      categorySlug: "bedroom",
      basePrice: 52000,
      img: IMG[4],
      description:
        "Solid sheesham queen bed frame with slatted headboard and under-bed storage. No MDF, no plywood.",
      specs: {
        Material: "Sheesham (Indian Rosewood)",
        Finish: "Dark Walnut Stain",
        Dimensions: "160W x 200D x 110H cm",
        Weight: "65 kg",
        "Mattress Size": "Queen (150x200 cm)",
      },
    },
    {
      name: "Bedside Table — Dovetail",
      slug: "bedside-table-dovetail",
      categorySlug: "bedroom",
      basePrice: 9800,
      img: IMG[5],
      description:
        "Compact bedside table with exposed dovetail joints and a single drawer. Solid mango wood.",
      specs: {
        Material: "Mango Wood",
        Finish: "Natural Oil",
        Dimensions: "45W x 40D x 55H cm",
        Weight: "8 kg",
      },
    },
    {
      name: "Garden Bench — 3 Seater",
      slug: "garden-bench-3-seater",
      categorySlug: "outdoor",
      basePrice: 28000,
      img: IMG[6],
      description:
        "Weather-treated solid teak garden bench. Mortise-and-tenon construction, no hardware.",
      specs: {
        Material: "Teak (plantation grown)",
        Finish: "Weatherproof Oil",
        Dimensions: "150W x 60D x 90H cm",
        Weight: "28 kg",
      },
    },
    {
      name: "Outdoor Folding Chair",
      slug: "outdoor-folding-chair",
      categorySlug: "outdoor",
      basePrice: 7200,
      img: IMG[7],
      description:
        "Foldable garden chair in solid acacia with brass hardware. Compact storage.",
      specs: {
        Material: "Acacia",
        Finish: "Teak Oil",
        Dimensions: "55W x 60D x 88H cm (open)",
        Weight: "4.5 kg",
      },
    },
    {
      name: "Hotel Desk — Compact",
      slug: "hotel-desk-compact",
      categorySlug: "hospitality-contract",
      basePrice: 19500,
      img: IMG[8],
      description:
        "A compact writing desk designed for hotel rooms. Solid sheesham, cable management, drawer with soft close.",
      specs: {
        Material: "Sheesham (Indian Rosewood)",
        Finish: "Semi-gloss Lacquer",
        Dimensions: "100W x 55D x 76H cm",
        Weight: "24 kg",
      },
    },
    {
      name: "Cafe Stool — Industrial",
      slug: "cafe-stool-industrial",
      categorySlug: "hospitality-contract",
      basePrice: 6800,
      img: IMG[9],
      description:
        "Bar-height cafe stool with solid mango wood seat and powder-coated steel frame. MOQ: 10.",
      specs: {
        Material: "Mango Wood + Steel",
        Finish: "Matte Black / Natural",
        Dimensions: "40W x 40D x 75H cm",
        Weight: "6 kg",
      },
    },
  ];

  const productBySlug: Record<string, { id: string }> = {};
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const data = {
      name: p.name,
      slug: p.slug,
      description: p.description,
      specs: p.specs,
      categoryId: catBySlug[p.categorySlug].id,
      basePrice: p.basePrice,
      ogImage: img(p.img),
      amazonUrl: amazon(p.name),
      etsyUrl: etsy(p.name),
      status: "PUBLISHED" as const,
    };
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        ogImage: data.ogImage,
        amazonUrl: data.amazonUrl,
        etsyUrl: data.etsyUrl,
        basePrice: data.basePrice,
        description: data.description,
        specs: data.specs,
        status: data.status,
      },
      create: data,
    });
    productBySlug[p.slug] = created;

    // Two extra gallery shots per product for a richer PDP (idempotent ids).
    const gallery = [IMG[(i + 4) % IMG.length], IMG[(i + 8) % IMG.length]];
    for (let g = 0; g < gallery.length; g++) {
      await prisma.productImage.upsert({
        where: { id: `${p.slug}-g${g}` },
        update: { url: img(gallery[g]) },
        create: {
          id: `${p.slug}-g${g}`,
          productId: created.id,
          url: img(gallery[g]),
          altText: `${p.name} — view ${g + 2}`,
          displayOrder: g + 1,
        },
      });
    }
  }
  console.log(`Products: ${products.length} (with images + marketplace links)`);

  // ─── B2B tier pricing (volume breakpoints) ────────────────
  const tierPricing = [
    { slug: "cafe-stool-industrial", tier: "RETAILER", minQty: 10, maxQty: 49, unitPrice: 6000 },
    { slug: "cafe-stool-industrial", tier: "RETAILER", minQty: 50, maxQty: null, unitPrice: 5400 },
    { slug: "cafe-stool-industrial", tier: "HOTEL_CAFE", minQty: 10, maxQty: 49, unitPrice: 5600 },
    { slug: "cafe-stool-industrial", tier: "HOTEL_CAFE", minQty: 50, maxQty: null, unitPrice: 5000 },
    { slug: "ladderback-dining-chair", tier: "RETAILER", minQty: 6, maxQty: 23, unitPrice: 7800 },
    { slug: "ladderback-dining-chair", tier: "RETAILER", minQty: 24, maxQty: null, unitPrice: 7200 },
    { slug: "ladderback-dining-chair", tier: "HOTEL_CAFE", minQty: 6, maxQty: 23, unitPrice: 7400 },
    { slug: "ladderback-dining-chair", tier: "HOTEL_CAFE", minQty: 24, maxQty: null, unitPrice: 6800 },
    { slug: "hotel-desk-compact", tier: "HOTEL_CAFE", minQty: 5, maxQty: 19, unitPrice: 18000 },
    { slug: "hotel-desk-compact", tier: "HOTEL_CAFE", minQty: 20, maxQty: null, unitPrice: 16500 },
  ] as const;
  for (const t of tierPricing) {
    const prod = productBySlug[t.slug];
    await prisma.b2BTierPricing.upsert({
      where: {
        productId_tier_minQty: { productId: prod.id, tier: t.tier, minQty: t.minQty },
      },
      update: { maxQty: t.maxQty, unitPrice: t.unitPrice },
      create: {
        productId: prod.id,
        tier: t.tier,
        minQty: t.minQty,
        maxQty: t.maxQty,
        unitPrice: t.unitPrice,
      },
    });
  }
  console.log(`B2B tier pricing rows: ${tierPricing.length}`);

  // ─── Demo B2B account (approved, ready to log in) ─────────
  const b2bUser = await prisma.user.upsert({
    where: { email: "b2b@draveta.com" },
    update: {},
    create: {
      email: "b2b@draveta.com",
      name: "Priya Sharma",
      passwordHash: await bcrypt.hash("b2bdemo123", 12),
      role: "B2B",
      status: "ACTIVE",
    },
  });
  const approvedApp = await prisma.b2BApplication.upsert({
    where: { id: "demo-app-approved" },
    update: {},
    create: {
      id: "demo-app-approved",
      companyName: "Grand Meridian Hotels",
      businessType: "HOTEL",
      gstNumber: "27AABCU9603R1ZM",
      contactName: "Priya Sharma",
      contactDesignation: "Head of Procurement",
      email: "b2b@draveta.com",
      phone: "+91 98200 12345",
      deliveryCity: "Mumbai",
      deliveryState: "Maharashtra",
      estimatedVolume: "Rs 10-25 Lakh / quarter",
      orderFrequency: "Quarterly",
      status: "APPROVED",
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });
  const b2bAccount = await prisma.b2BAccount.upsert({
    where: { userId: b2bUser.id },
    update: {},
    create: {
      applicationId: approvedApp.id,
      userId: b2bUser.id,
      tier: "HOTEL_CAFE",
      discountPercentage: 15,
      status: "ACTIVE",
    },
  });
  console.log(`Demo B2B account: ${b2bUser.email} (tier HOTEL_CAFE)`);

  // ─── Pending B2B applications (populate admin review queue) ─
  const pendingApps = [
    {
      id: "demo-app-pending-1",
      companyName: "Urban Nest Interiors",
      businessType: "INTERIOR_DESIGNER",
      contactName: "Rahul Mehta",
      email: "rahul@urbannest.in",
      phone: "+91 99000 11223",
      deliveryCity: "Bengaluru",
      deliveryState: "Karnataka",
      estimatedVolume: "Rs 5-10 Lakh / quarter",
    },
    {
      id: "demo-app-pending-2",
      companyName: "Coastal Cafe Group",
      businessType: "CAFE",
      contactName: "Anita Desai",
      email: "anita@coastalcafe.in",
      phone: "+91 90000 44556",
      deliveryCity: "Panaji",
      deliveryState: "Goa",
      estimatedVolume: "Rs 2-5 Lakh / quarter",
    },
  ] as const;
  // Make the demo re-runnable: if these were approved during a previous demo,
  // remove the account/user that approval created and reset them to PENDING.
  const pendingIds = pendingApps.map((a) => a.id);
  const pendingEmails = pendingApps.map((a) => a.email);
  await prisma.b2BAccount.deleteMany({
    where: { applicationId: { in: pendingIds } },
  });
  await prisma.user.deleteMany({ where: { email: { in: pendingEmails } } });
  for (const a of pendingApps) {
    await prisma.b2BApplication.upsert({
      where: { id: a.id },
      update: { status: "PENDING", reviewedById: null, reviewedAt: null },
      create: { ...a, status: "PENDING" },
    });
  }
  console.log(`Pending B2B applications: ${pendingApps.length}`);

  // ─── Demo affiliate ───────────────────────────────────────
  const affUser = await prisma.user.upsert({
    where: { email: "affiliate@draveta.com" },
    update: {},
    create: {
      email: "affiliate@draveta.com",
      name: "Maria Fernandes",
      passwordHash: await bcrypt.hash("affdemo123", 12),
      role: "AFFILIATE",
      status: "ACTIVE",
    },
  });
  const affApp = await prisma.affiliateApplication.upsert({
    where: { id: "demo-aff-app" },
    update: {},
    create: {
      id: "demo-aff-app",
      name: "Maria Fernandes",
      email: "affiliate@draveta.com",
      phone: "+91 98111 22334",
      socialUrl: "https://instagram.com/interiorsbymaria",
      audienceSize: "85k Instagram",
      status: "APPROVED",
    },
  });
  const affProfile = await prisma.affiliateProfile.upsert({
    where: { userId: affUser.id },
    update: {},
    create: {
      applicationId: affApp.id,
      userId: affUser.id,
      uniqueCode: "MARIA10",
      discountPercent: 10,
      commissionPercent: 5,
      status: "ACTIVE",
    },
  });
  await prisma.affiliateSalesLog.upsert({
    where: { id: "demo-aff-sale-1" },
    update: {},
    create: {
      id: "demo-aff-sale-1",
      affiliateId: affProfile.id,
      period: "2026-06",
      platform: "AMAZON",
      redemptionCount: 12,
      revenue: 184000,
      commissionOwed: 9200,
      paymentStatus: "PENDING",
    },
  });
  console.log(`Demo affiliate: ${affUser.email} (code MARIA10)`);

  // ─── Sample order request ─────────────────────────────────
  const orderItems = [
    {
      productId: productBySlug["cafe-stool-industrial"].id,
      name: "Cafe Stool — Industrial",
      quantity: 40,
      unitPrice: 5400,
    },
    {
      productId: productBySlug["hotel-desk-compact"].id,
      name: "Hotel Desk — Compact",
      quantity: 20,
      unitPrice: 16500,
    },
  ];
  const orderTotal = orderItems.reduce(
    (s, i) => s + i.quantity * i.unitPrice,
    0
  );
  await prisma.orderRequest.upsert({
    where: { id: "demo-order-1" },
    update: {},
    create: {
      id: "demo-order-1",
      b2bAccountId: b2bAccount.id,
      status: "SUBMITTED",
      items: orderItems,
      total: orderTotal,
      notes: "Requesting delivery to our Mumbai property by end of quarter.",
    },
  });
  console.log("Sample order request created");

  // ─── Homepage content (keys the storefront actually reads) ─
  const pillars = [
    {
      title: "Built to Last",
      description:
        "Solid hardwood ages beautifully and can be refinished for generations — engineered boards simply can't.",
    },
    {
      title: "Honest Materials",
      description:
        "No veneer over particleboard, no hidden substrates. Just genuine, traceable timber, end to end.",
    },
    {
      title: "Responsibly Sourced",
      description:
        "Kiln-dried hardwoods from responsibly managed forests, selected for durability and grain.",
    },
    {
      title: "Crafted by Hand",
      description:
        "Traditional mortise-and-tenon joinery, hand-finished by artisans in our workshop.",
    },
  ];
  const content: Record<string, string> = {
    hero_headline: "Solid wood, honestly made.",
    hero_subline:
      "Heirloom-quality solid wood furniture. Crafted for modern homes and luxury hospitality.",
    hero_media_url: img(IMG[11]),
    hero_cta_text: "Explore the Collection",
    hero_cta_url: "/collections",
    why_solid_wood_pillars: JSON.stringify(pillars),
  };
  for (const [key, value] of Object.entries(content)) {
    await prisma.contentBlock.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log("Homepage content set");

  // ─── SEO defaults ─────────────────────────────────────────
  await prisma.seoDefault.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      titleTemplate: "%s | Draveta Furniture — Solid Wood, Honestly Made",
      metaDescription:
        "Premium solid wood furniture for homes, hotels, and commercial spaces. Handcrafted in India. Shop on Amazon or Etsy, or apply for wholesale pricing.",
      ogImage: img(IMG[11]),
    },
  });
  console.log("SEO defaults set");

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
