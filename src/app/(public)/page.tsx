import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/products/ProductCard";
import { ArrowRight, ArrowUpRight } from "lucide-react";

type Pillar = { title: string; description: string };

const WOODS = ["Sheesham", "Teak", "Mango", "Acacia", "Solid Oak"];

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
    content["hero_subline"] ||
    "Heirloom-quality furniture for homes, hotels, and everyone in between.";
  const ctaText = content["hero_cta_text"] || "Explore the Collection";
  const ctaUrl = content["hero_cta_url"] || "/collections";
  const mediaUrl = content["hero_media_url"] || "";

  let pillars: Pillar[] = [];
  try {
    if (content["why_solid_wood_pillars"]) pillars = JSON.parse(content["why_solid_wood_pillars"]);
  } catch {}

  const craftImage =
    categories.find((c) => c.slug === "dining")?.imageUrl ||
    categories[1]?.imageUrl ||
    mediaUrl;

  return (
    <div className="flex flex-col w-full">
      {/* ─────────── Hero ─────────── */}
      <section className="relative w-full h-[calc(100vh-104px)] min-h-[560px] flex items-end overflow-hidden">
        {mediaUrl ? (
          <Image src={mediaUrl} alt={headline} fill priority className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-stone-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />

        <div className="relative z-10 w-full container mx-auto px-4 sm:px-6 lg:px-8 pb-16 md:pb-24">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.3em] text-[#e6cba8]">
              The solid wood collection
            </p>
            <h1 className="font-serif text-white text-5xl md:text-7xl lg:text-8xl leading-[1.02] tracking-tight mb-6">
              {headline}
            </h1>
            <p className="text-lg md:text-xl text-white/85 max-w-xl mb-10 leading-relaxed">
              {subline}
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link
                href={ctaUrl}
                className="inline-flex items-center gap-2 bg-white text-stone-900 px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-stone-100"
              >
                {ctaText}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/b2b/apply"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/90 border-b border-white/40 pb-1 transition-colors hover:text-white hover:border-white"
              >
                Trade &amp; wholesale enquiries
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── Brand statement ─────────── */}
      <section className="bg-[#faf8f4] py-20 md:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-[#9c7a54]">
              Our philosophy
            </p>
            <p className="font-serif text-2xl md:text-4xl leading-snug text-stone-800">
              We build furniture from a single, honest material — solid hardwood.
              No veneers, no shortcuts. Pieces meant to be repaired, passed down,
              and lived with for a lifetime.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────── Collections ─────────── */}
      {categories.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#9c7a54]">
                  Browse
                </p>
                <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-stone-900">
                  Shop by room
                </h2>
              </div>
              <Link
                href="/collections"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-700 border-b border-stone-300 pb-1 hover:border-stone-900 hover:text-stone-900 transition-colors self-start"
              >
                All collections <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
              {categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/collections/${cat.slug}`}
                  className={`group block ${i === 0 ? "col-span-2 lg:col-span-1" : ""}`}
                >
                  <div
                    className={`relative overflow-hidden rounded-sm bg-stone-100 ${
                      i === 0 ? "aspect-[16/10] lg:aspect-[4/5]" : "aspect-[4/5]"
                    }`}
                  >
                    {cat.imageUrl && (
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <h3 className="font-serif text-xl md:text-2xl text-stone-900">{cat.name}</h3>
                    <ArrowUpRight className="h-5 w-5 text-stone-400 transition-all group-hover:text-stone-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── Craftsmanship split ─────────── */}
      {pillars.length > 0 && (
        <section className="bg-stone-900 text-stone-100">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[380px] lg:min-h-[640px]">
              {craftImage && <Image src={craftImage} alt="Draveta craftsmanship" fill className="object-cover" />}
            </div>
            <div className="flex items-center px-6 sm:px-12 lg:px-16 py-16 lg:py-24">
              <div className="max-w-lg">
                <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#e6cba8]">
                  Why solid wood
                </p>
                <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-10">
                  Made to outlive trends.
                </h2>
                <div className="divide-y divide-white/10">
                  {pillars.map((pillar, index) => (
                    <div key={index} className="flex gap-5 py-5">
                      <span className="font-serif text-2xl text-[#e6cba8] leading-none w-8 shrink-0">
                        0{index + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-semibold mb-1">{pillar.title}</h3>
                        <p className="text-sm text-stone-400 leading-relaxed">{pillar.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─────────── Featured products ─────────── */}
      {featured.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#9c7a54]">
                  Just added
                </p>
                <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-stone-900">
                  New arrivals
                </h2>
              </div>
              <Link
                href="/collections"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-700 border-b border-stone-300 pb-1 hover:border-stone-900 hover:text-stone-900 transition-colors self-start"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} categorySlug={product.category.slug} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── Materials strip ─────────── */}
      <section className="border-y border-border bg-[#faf8f4] py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-stone-500">
            <span className="text-xs uppercase tracking-[0.3em] text-[#9c7a54]">Crafted from</span>
            {WOODS.map((wood) => (
              <span key={wood} className="font-serif text-xl md:text-2xl text-stone-700">
                {wood}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── Trade band ─────────── */}
      <section className="bg-stone-900 text-stone-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#e6cba8]">
                For business
              </p>
              <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-4">
                Furnishing a hotel, cafe, or project?
              </h2>
              <p className="text-stone-400 text-lg">
                Unlock tiered wholesale pricing, dedicated support, and
                self-service order requests with a Draveta trade account.
              </p>
            </div>
            <Link
              href="/b2b/apply"
              className="inline-flex items-center gap-2 shrink-0 bg-[#e6cba8] text-stone-900 px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-white"
            >
              Apply for trade pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
