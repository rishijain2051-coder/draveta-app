import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export const metadata = {
  title: "Collections - Draveta Furniture",
  description: "Browse our handcrafted solid wood furniture collections.",
};

export default async function CollectionsPage() {
  const categories = await db.category.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      _count: { select: { products: true } },
      products: {
        where: { status: "PUBLISHED" },
        take: 1,
        select: { ogImage: true },
      },
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="bg-[#faf8f4] border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <Reveal>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-[#9c7a54]">
              The catalogue
            </p>
            <h1 className="font-serif text-4xl md:text-6xl tracking-tight text-stone-900 mb-5">
              Our Collections
            </h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Expertly crafted solid wood furniture, designed to bring timeless
              beauty to every room — and every space you host.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {categories.map((category, i) => {
            const imageUrl =
              category.imageUrl ||
              category.products[0]?.ogImage ||
              "https://placehold.co/800x1000/e7e2da/9c7a54?text=Draveta";

            return (
              <Reveal key={category.id} delay={(i % 3) * 0.08}>
                <Link
                  href={`/collections/${category.slug}`}
                  className="group block transition-transform duration-300 ease-out hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-stone-100">
                    <Image
                      src={imageUrl}
                      alt={category.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="flex items-start justify-between mt-4">
                    <div>
                      <h2 className="font-serif text-2xl text-stone-900 transition-colors group-hover:text-stone-500">
                        {category.name}
                      </h2>
                      <p className="text-sm text-stone-500 mt-1">
                        {category._count.products}{" "}
                        {category._count.products === 1 ? "piece" : "pieces"}
                      </p>
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-stone-400 mt-1 transition-all group-hover:text-stone-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
