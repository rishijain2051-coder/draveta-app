import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/products/ProductCard";
import { Reveal } from "@/components/motion/reveal";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categoryData = await db.category.findUnique({ where: { slug: category } });
  if (!categoryData) return { title: "Not Found" };
  return {
    title: `${categoryData.name} - Draveta Furniture`,
    description: `Browse our ${categoryData.name} collection.`,
  };
}

const SORTS = [
  { key: "newest", label: "Newest" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await params;
  const { sort } = await searchParams;

  const categoryData = await db.category.findUnique({ where: { slug: category } });
  if (!categoryData) notFound();

  const orderBy =
    sort === "price-asc"
      ? { basePrice: "asc" as const }
      : sort === "price-desc"
        ? { basePrice: "desc" as const }
        : { createdAt: "desc" as const };

  const products = await db.product.findMany({
    where: { categoryId: categoryData.id, status: "PUBLISHED" },
    orderBy,
  });

  const activeSort = typeof sort === "string" ? sort : "newest";

  return (
    <div>
      {/* Header */}
      <div className="bg-[#faf8f4] border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <Reveal>
            <nav className="flex items-center text-xs uppercase tracking-wider text-stone-500 mb-6">
              <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5 mx-2" />
              <Link href="/collections" className="hover:text-stone-900 transition-colors">Collections</Link>
              <ChevronRight className="h-3.5 w-3.5 mx-2" />
              <span className="text-stone-900">{categoryData.name}</span>
            </nav>
            <h1 className="font-serif text-4xl md:text-6xl tracking-tight text-stone-900">
              {categoryData.name}
            </h1>
            <p className="text-stone-500 mt-3">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
          </Reveal>
        </div>
      </div>

      {/* Sort + grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {products.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 justify-end mb-10 text-sm">
            <span className="text-stone-400 mr-auto uppercase tracking-wider text-xs">Sort</span>
            {SORTS.map((s) => {
              const isActive = activeSort === s.key;
              return (
                <Link
                  key={s.key}
                  href={`/collections/${category}?sort=${s.key}`}
                  className={`pb-0.5 border-b transition-colors ${
                    isActive
                      ? "border-stone-900 text-stone-900 font-medium"
                      : "border-transparent text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        )}

        {products.length === 0 ? (
          <div className="text-center py-28">
            <h3 className="font-serif text-2xl text-stone-900 mb-3">Nothing here yet</h3>
            <p className="text-stone-500 mb-8">
              We&apos;re still crafting pieces for this collection. Check back soon.
            </p>
            <Link
              href="/collections"
              className="inline-flex items-center border border-stone-900 px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-900 hover:bg-stone-900 hover:text-white transition-colors active:scale-[0.97]"
            >
              Browse other collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12 md:gap-x-6">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={(i % 4) * 0.07}>
                <ProductCard product={product} categorySlug={categoryData.slug} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
