import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/products/ProductCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const categoryData = await db.category.findUnique({
    where: { slug: category },
  });

  if (!categoryData) return { title: "Not Found" };

  return {
    title: `${categoryData.name} - Draveta Furniture`,
    description: categoryData.description || `Browse our ${categoryData.name} collection.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await params;
  const { sort } = await searchParams;

  const categoryData = await db.category.findUnique({
    where: { slug: category },
  });

  if (!categoryData) {
    notFound();
  }

  // Determine sorting logic
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { basePrice: "asc" };
  if (sort === "price-desc") orderBy = { basePrice: "desc" };

  const products = await db.product.findMany({
    where: {
      categoryId: categoryData.id,
      status: "PUBLISHED",
    },
    orderBy,
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/collections" className="hover:text-foreground transition-colors">Collections</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-foreground">{categoryData.name}</span>
      </nav>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{categoryData.name}</h1>
          {categoryData.description && (
            <p className="text-muted-foreground max-w-2xl">{categoryData.description}</p>
          )}
        </div>

        {/* Basic Sort Dropdown (Server Component logic via links for simplicity, in a real app this might be a Client Component using router.push) */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort by:</span>
          <div className="flex border rounded-md overflow-hidden">
            <Link 
              href={`/collections/${category}?sort=newest`}
              className={`px-3 py-1.5 hover:bg-muted ${(!sort || sort === 'newest') ? 'bg-muted font-medium' : ''}`}
            >
              Newest
            </Link>
            <Link 
              href={`/collections/${category}?sort=price-asc`}
              className={`px-3 py-1.5 hover:bg-muted border-l ${sort === 'price-asc' ? 'bg-muted font-medium' : ''}`}
            >
              Price: Low to High
            </Link>
            <Link 
              href={`/collections/${category}?sort=price-desc`}
              className={`px-3 py-1.5 hover:bg-muted border-l ${sort === 'price-desc' ? 'bg-muted font-medium' : ''}`}
            >
              Price: High to Low
            </Link>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 bg-muted/30 rounded-lg border border-dashed">
          <h3 className="text-lg font-medium mb-2">No products found</h3>
          <p className="text-muted-foreground">We couldn't find any published products in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              categorySlug={categoryData.slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
