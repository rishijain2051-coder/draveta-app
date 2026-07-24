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

async function main() {
  console.log("Seeding database...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@draveta.com" },
    update: {},
    create: {
      email: "admin@draveta.com",
      name: "Draveta Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // Categories
  const categories = await Promise.all(
    [
      { name: "Living", slug: "living", displayOrder: 1 },
      { name: "Dining", slug: "dining", displayOrder: 2 },
      { name: "Bedroom", slug: "bedroom", displayOrder: 3 },
      { name: "Outdoor", slug: "outdoor", displayOrder: 4 },
      {
        name: "Hospitality / Contract",
        slug: "hospitality-contract",
        displayOrder: 5,
      },
    ].map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: cat,
      })
    )
  );
  console.log(`Categories: ${categories.length}`);

  // Sample products
  const products = [
    {
      name: "Ashwood Lounge Chair",
      slug: "ashwood-lounge-chair",
      description:
        "A handcrafted lounge chair in solid sheesham wood with a natural oil finish. Mortise-and-tenon joinery throughout.",
      categoryId: categories[0].id,
      basePrice: 24500,
      specs: {
        material: "Sheesham (Indian Rosewood)",
        finish: "Natural Oil",
        dimensions: "75W x 80D x 85H cm",
        weight: "18 kg",
      },
    },
    {
      name: "Indus Coffee Table",
      slug: "indus-coffee-table",
      description:
        "Minimalist coffee table in solid mango wood. Clean lines, dovetail drawer, hand-rubbed wax finish.",
      categoryId: categories[0].id,
      basePrice: 18900,
      specs: {
        material: "Mango Wood",
        finish: "Hand-rubbed Wax",
        dimensions: "110W x 60D x 42H cm",
        weight: "22 kg",
      },
    },
    {
      name: "Teak Dining Table — 6 Seater",
      slug: "teak-dining-table-6-seater",
      description:
        "Solid teak dining table with breadboard ends and a hand-planed surface. Seats 6 comfortably.",
      categoryId: categories[1].id,
      basePrice: 45000,
      specs: {
        material: "Teak",
        finish: "Semi-gloss Lacquer",
        dimensions: "180W x 90D x 76H cm",
        weight: "48 kg",
        seating: "6",
      },
    },
    {
      name: "Ladderback Dining Chair",
      slug: "ladderback-dining-chair",
      description:
        "Classic ladderback chair in solid acacia with a woven jute seat. Stackable.",
      categoryId: categories[1].id,
      basePrice: 8500,
      specs: {
        material: "Acacia",
        finish: "Natural Matte",
        dimensions: "45W x 50D x 92H cm",
        weight: "5.5 kg",
      },
    },
    {
      name: "Knotwood Queen Bed Frame",
      slug: "knotwood-queen-bed-frame",
      description:
        "Solid sheesham queen bed frame with slatted headboard and under-bed storage. No MDF, no plywood.",
      categoryId: categories[2].id,
      basePrice: 52000,
      specs: {
        material: "Sheesham (Indian Rosewood)",
        finish: "Dark Walnut Stain",
        dimensions: "160W x 200D x 110H cm",
        weight: "65 kg",
        mattressSize: "Queen (150x200 cm)",
      },
    },
    {
      name: "Bedside Table — Dovetail",
      slug: "bedside-table-dovetail",
      description:
        "Compact bedside table with exposed dovetail joints and a single drawer. Solid mango wood.",
      categoryId: categories[2].id,
      basePrice: 9800,
      specs: {
        material: "Mango Wood",
        finish: "Natural Oil",
        dimensions: "45W x 40D x 55H cm",
        weight: "8 kg",
      },
    },
    {
      name: "Garden Bench — 3 Seater",
      slug: "garden-bench-3-seater",
      description:
        "Weather-treated solid teak garden bench. Mortise-and-tenon construction, no hardware.",
      categoryId: categories[3].id,
      basePrice: 28000,
      specs: {
        material: "Teak (plantation grown)",
        finish: "Weatherproof Oil",
        dimensions: "150W x 60D x 90H cm",
        weight: "28 kg",
      },
    },
    {
      name: "Outdoor Folding Chair",
      slug: "outdoor-folding-chair",
      description:
        "Foldable garden chair in solid acacia with brass hardware. Compact storage.",
      categoryId: categories[3].id,
      basePrice: 7200,
      specs: {
        material: "Acacia",
        finish: "Teak Oil",
        dimensions: "55W x 60D x 88H cm (open)",
        weight: "4.5 kg",
      },
    },
    {
      name: "Hotel Desk — Compact",
      slug: "hotel-desk-compact",
      description:
        "A compact writing desk designed for hotel rooms. Solid sheesham, cable management, drawer with soft close.",
      categoryId: categories[4].id,
      basePrice: 19500,
      specs: {
        material: "Sheesham (Indian Rosewood)",
        finish: "Semi-gloss Lacquer",
        dimensions: "100W x 55D x 76H cm",
        weight: "24 kg",
      },
    },
    {
      name: "Cafe Stool — Industrial",
      slug: "cafe-stool-industrial",
      description:
        "Bar-height cafe stool with solid mango wood seat and powder-coated steel frame. MOQ: 10.",
      categoryId: categories[4].id,
      basePrice: 6800,
      specs: {
        material: "Mango Wood + Steel",
        finish: "Matte Black / Natural",
        dimensions: "40W x 40D x 75H cm",
        weight: "6 kg",
      },
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        status: "PUBLISHED",
      },
    });
  }
  console.log(`Products: ${products.length}`);

  // Homepage content blocks
  const contentBlocks = [
    {
      key: "hero_headline",
      value: "Draveta — Solid wood, honestly made.",
      type: "TEXT" as const,
    },
    {
      key: "hero_subline",
      value:
        "Furniture built to outlast trends, for homes, hotels, and everyone in between.",
      type: "TEXT" as const,
    },
    { key: "hero_image", value: "/hero.png", type: "IMAGE" as const },
    { key: "cta_text", value: "Explore the Collection", type: "TEXT" as const },
    { key: "cta_url", value: "/collections", type: "URL" as const },
    {
      key: "why_wood_1_title",
      value: "Built to Last",
      type: "TEXT" as const,
    },
    {
      key: "why_wood_1_desc",
      value:
        "Solid wood ages and can be repaired. Engineered boards can't.",
      type: "TEXT" as const,
    },
    {
      key: "why_wood_2_title",
      value: "Honest Material",
      type: "TEXT" as const,
    },
    {
      key: "why_wood_2_desc",
      value: "No veneer over composite, no hidden substrates.",
      type: "TEXT" as const,
    },
    {
      key: "why_wood_3_title",
      value: "Responsibly Sourced",
      type: "TEXT" as const,
    },
    {
      key: "why_wood_3_desc",
      value: "Species, region, and forestry practice — your sourcing story goes here.",
      type: "TEXT" as const,
    },
    {
      key: "why_wood_4_title",
      value: "Crafted with Care",
      type: "TEXT" as const,
    },
    {
      key: "why_wood_4_desc",
      value: "Joinery method, workshop details — your craft story goes here.",
      type: "TEXT" as const,
    },
  ];

  for (const block of contentBlocks) {
    await prisma.contentBlock.upsert({
      where: { key: block.key },
      update: {},
      create: block,
    });
  }
  console.log(`Content blocks: ${contentBlocks.length}`);

  // SEO defaults
  await prisma.seoDefault.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      titleTemplate: "%s | Draveta Furniture — Solid Wood, Honestly Made",
      metaDescription:
        "Premium solid wood furniture for homes, hotels, and commercial spaces. Handcrafted in India. Shop on Amazon or Etsy, or apply for wholesale pricing.",
      ogImage: null,
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
