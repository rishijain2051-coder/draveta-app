import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/products/ProductCard";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Marquee } from "@/components/motion/marquee";
import { Magnetic } from "@/components/motion/magnetic";
import { Hero } from "@/components/home/hero";

type Pillar = { title: string; description: string };

const WOODS = ["Sheesham", "Teak", "Mango", "Acacia", "Solid Oak", "Rosewood"];

// Editorial bento spans for the "Shop by room" grid (5 categories).
const BENTO = [
  "col-span-2 lg:col-span-2 lg:row-span-2", // featured (large)
  "col-span-2 lg:col-span-2", // wide
  "col-span-1", // square
  "col-span-1", // square
  "col-span-2 lg:col-span-4", // full-width banner
];

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
    "Heirloom-quality solid wood furniture. Crafted for modern homes and luxury hospitality.";
  const ctaText = content["hero_cta_text"] || "Explore the Collection";
  const ctaUrl = content["hero_cta_url"] || "/collections";
  const mediaUrl = content["hero_media_url"] || "";

  let pillars: Pillar[] = [];
  try {
    if (content["why_solid_wood_pillars"]) pillars = JSON.parse(content["why_solid_wood_pillars"]);
  } catch {}

  const bySlug = (slug: string) => categories.find((c) => c.slug === slug)?.imageUrl;
  const philosophyImage = bySlug("bedroom") || featured[0]?.ogImage || mediaUrl;
  const craftImage = bySlug("dining") || categories[1]?.imageUrl || mediaUrl;

  return (
    <div className="flex flex-col w-full">
      {/* ─────────── Hero ─────────── */}
      <Hero
        headline={headline}
        subline={subline}
        ctaText={ctaText}
        ctaUrl={ctaUrl}
        mediaUrl={mediaUrl}
      />

      {/* ─────────── Our philosophy (visual storytelling) ─────────── */}
      <section className="bg-[#faf8f4] overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
          <div className="relative min-h-[340px] lg:min-h-[580px] overflow-hidden order-1 lg:order-none">
            {philosophyImage && (
              <Image
                src={philosophyImage}
                alt="Solid wood craftsmanship"
                fill
                className="object-cover animate-[kenburns_22s_ease-in-out_infinite_alternate]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#faf8f4]/10" />
          </div>
          <div className="flex items-center px-6 sm:px-12 lg:px-20 py-16 lg:py-28">
            <Reveal>
              <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-[#9c7a54]">
                Our philosophy
              </p>
              <p className="font-serif text-2xl md:text-4xl leading-snug text-stone-800">
                We build furniture from a single, honest material — solid
                hardwood. No veneers, no shortcuts. Pieces meant to be repaired,
                passed down, and lived with for a lifetime.
              </p>
              <div className="mt-10 flex items-center gap-4 text-sm text-stone-500">
                <span className="h-px w-10 bg-stone-400" />
                Mortise-and-tenon joinery, hand-finished in our workshop
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─────────── Shop by room (bento) ─────────── */}
      {categories.length > 0 && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
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
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-stone-700 border-b border-stone-300 pb-1 hover:border-stone-900 hover:text-stone-900 transition-colors self-start"
              >
                All collections
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 lg:auto-rows-[14rem]">
              {categories.map((cat, i) => (
                <Reveal
                  key={cat.id}
                  delay={(i % 4) * 0.06}
                  className={`${BENTO[i] ?? "col-span-1"} h-full`}
                >
                  <Link
                    href={`/collections/${cat.slug}`}
                    className="group block h-full"
                  >
                    <div className="relative h-full min-h-[13rem] lg:min-h-0 overflow-hidden rounded-sm bg-stone-100">
                      {cat.imageUrl && (
                        <Image
                          src={cat.imageUrl}
                          alt={cat.name}
                          fill
                          sizes="(max-width: 1024px) 50vw, 40vw"
                          className="object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
                        />
                      )}
                      {/* gradient overlay fades in from bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="absolute bottom-0 left-0 p-5 md:p-6">
                        <h3 className="font-serif text-xl md:text-2xl text-white transition-transform duration-500 ease-out group-hover:-translate-y-1">
                          {cat.name}
                        </h3>
                        <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white/95 opacity-0 translate-y-2 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:translate-y-0">
                          Explore Category
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── Craftsmanship split ─────────── */}
      {pillars.length > 0 && (
        <section className="bg-stone-900 text-stone-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[380px] lg:min-h-[640px] overflow-hidden">
              {craftImage && (
                <Image
                  src={craftImage}
                  alt="Draveta craftsmanship"
                  fill
                  className="object-cover transition-transform duration-[1.2s] hover:scale-105"
                />
              )}
            </div>
            <div className="flex items-center px-6 sm:px-12 lg:px-16 py-16 lg:py-24">
              <div className="max-w-lg">
                <Reveal>
                  <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#e6cba8]">
                    Why solid wood
                  </p>
                  <h2 className="font-serif text-3xl md:text-5xl tracking-tight mb-10">
                    Made to outlive trends.
                  </h2>
                </Reveal>
                <div className="divide-y divide-white/10">
                  {pillars.map((pillar, index) => (
                    <Reveal key={index} delay={index * 0.1} y={16}>
                      <div className="flex gap-5 py-5">
                        <span className="font-serif text-2xl text-[#e6cba8] leading-none w-8 shrink-0">
                          0{index + 1}
                        </span>
                        <div>
                          <h3 className="text-base font-semibold mb-1">{pillar.title}</h3>
                          <p className="text-sm text-stone-400 leading-relaxed">
                            {pillar.description}
                          </p>
                        </div>
                      </div>
                    </Reveal>
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
            <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
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
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-stone-700 border-b border-stone-300 pb-1 hover:border-stone-900 hover:text-stone-900 transition-colors self-start"
              >
                View all
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
              {featured.map((product, i) => (
                <Reveal key={product.id} delay={(i % 4) * 0.08}>
                  <ProductCard product={product} categorySlug={product.category.slug} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─────────── Materials marquee ─────────── */}
      <section className="border-y border-border bg-[#faf8f4] py-8">
        <Marquee duration={30}>
          {WOODS.map((wood) => (
            <span key={wood} className="flex items-center">
              <span className="font-serif text-2xl md:text-3xl text-stone-700 px-8">{wood}</span>
              <span className="text-[#9c7a54]">✦</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* ─────────── Trade band ─────────── */}
      <section className="bg-stone-900 text-stone-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <Reveal className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
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
            <Magnetic>
              <Link
                href="/b2b/apply"
                className="inline-flex items-center gap-2 shrink-0 bg-[#e6cba8] text-stone-900 px-8 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:bg-white active:scale-[0.97]"
              >
                Apply for trade pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
