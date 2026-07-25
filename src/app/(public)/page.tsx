import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/ProductCard";
import { ArrowRight } from "lucide-react";

type Pillar = { title: string; description: string };

export default async function HomePage() {
  const [contentBlocks, categories, featured] = await Promise.all([
    db.contentBlock.findMany(),
    db.category.findMany({ orderBy: { displayOrder: "asc" } }),
    db.product.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const content = contentBlocks.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  const headline = content["hero_headline"] || "Solid wood, honestly made.";
  const subline =
    content["hero_subline"] || "Heirloom-quality furniture, crafted to last generations.";
  const ctaText = content["hero_cta_text"] || "Explore the Collection";
  const ctaUrl = content["hero_cta_url"] || "/collections";
  const mediaUrl = content["hero_media_url"] || "";

  let pillars: Pillar[] = [];
  try {
    if (content["why_solid_wood_pillars"]) {
      pillars = JSON.parse(content["why_solid_wood_pillars"]);
    }
  } catch (e) {
    console.error("Failed to parse pillars", e);
  }

  return (
    <div className="flex flex-col w-full">
      {/* ── Hero ── */}
      <section className="relative w-full h-[85vh] min-h-[540px] flex items-center overflow-hidden">
        {mediaUrl ? (
          <div className="absolute inset-0 z-0">
            <Image src={mediaUrl} alt={headline} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-muted" />
        )}

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p
              className={`mb-4 text-sm font-medium uppercase tracking-widest ${
                mediaUrl ? "text-white/80" : "text-muted-foreground"
              }`}
            >
              Solid wood furniture · Handcrafted in India
            </p>
            <h1
              className={`text-4xl md:text-6xl font-bold tracking-tight mb-6 ${
                mediaUrl ? "text-white" : "text-foreground"
              }`}
            >
              {headline}
            </h1>
            <p
              className={`text-lg md:text-xl mb-10 max-w-xl ${
                mediaUrl ? "text-gray-200" : "text-muted-foreground"
              }`}
            >
              {subline}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Button render={<Link href={ctaUrl} />} size="lg" className="h-12 px-8 text-base">
                {ctaText}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                render={<Link href="/b2b/apply" />}
                variant={mediaUrl ? "secondary" : "outline"}
                size="lg"
                className="h-12 px-8 text-base"
              >
                Trade &amp; wholesale
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured collections ── */}
      {categories.length > 0 && (
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Shop by room</h2>
                <p className="text-muted-foreground mt-2">
                  Explore our collections, crafted for every space.
                </p>
              </div>
              <Link
                href="/collections"
                className="hidden sm:inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                All collections <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/collections/${cat.slug}`}
                  className={`group relative overflow-hidden rounded-xl bg-muted ${
                    i === 0 ? "col-span-2 lg:col-span-1 aspect-[16/10] lg:aspect-square" : "aspect-square"
                  }`}
                >
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5">
                    <h3 className="text-lg md:text-xl font-semibold text-white">{cat.name}</h3>
                    <span className="text-sm text-white/80 inline-flex items-center">
                      Shop now <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why solid wood ── */}
      {pillars.length > 0 && (
        <section className="py-20 md:py-24 bg-muted/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Why Solid Wood Matters</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The difference that genuine, high-quality materials make in your home.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {pillars.map((pillar, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-xl font-bold text-primary">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{pillar.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured products ── */}
      {featured.length > 0 && (
        <section className="py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">New arrivals</h2>
                <p className="text-muted-foreground mt-2">
                  Fresh from the workshop.
                </p>
              </div>
              <Link
                href="/collections"
                className="hidden sm:inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {featured.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categorySlug={product.category.slug}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Trade CTA band ── */}
      <section className="bg-foreground text-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
                Furnishing a hotel, cafe, or project?
              </h2>
              <p className="text-background/70">
                Join the Draveta Trade Program for tiered wholesale pricing,
                dedicated support, and self-service order requests.
              </p>
            </div>
            <Button
              render={<Link href="/b2b/apply" />}
              variant="secondary"
              size="lg"
              className="h-12 px-8 text-base shrink-0"
            >
              Apply for trade pricing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
