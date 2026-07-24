import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";

export const metadata = {
  title: "Collections - Draveta Furniture",
  description: "Browse our handcrafted solid wood furniture collections.",
};

export default async function CollectionsPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    include: {
      products: {
        where: { status: "PUBLISHED", ogImage: { not: "" } },
        take: 1, // Get one product to use its image for the category tile
      }
    }
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Our Collections</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our expertly crafted solid wood furniture, designed to bring timeless beauty to every room in your home.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => {
          // Use the first product's image as the category tile background, or a placeholder
          const imageUrl = category.products.length > 0 && category.products[0].ogImage
            ? category.products[0].ogImage
            : "https://placehold.co/800x600/e2e8f0/64748b?text=Collection";

          return (
            <Link 
              key={category.id} 
              href={`/collections/${category.slug}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted transition-all hover:ring-2 hover:ring-primary hover:ring-offset-2 block"
            >
              <Image
                src={imageUrl}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 transition-opacity group-hover:bg-black/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-wide">{category.name}</h2>
                <span className="inline-block border border-white text-white px-4 py-2 text-sm uppercase tracking-wider opacity-0 transition-opacity group-hover:opacity-100">
                  Shop Collection
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
