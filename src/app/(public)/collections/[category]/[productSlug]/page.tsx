import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductCard } from "@/components/products/ProductCard";
import { B2BOrderRequestForm } from "@/components/products/B2BOrderRequestForm";
import Link from "next/link";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ productSlug: string }> }) {
  const { productSlug } = await params;
  const product = await db.product.findUnique({
    where: { slug: productSlug },
  });

  if (!product) return { title: "Not Found" };

  return {
    title: product.metaTitle || `${product.name} - Draveta Furniture`,
    description: product.metaDescription || product.description?.substring(0, 160),
    openGraph: {
      images: product.ogImage ? [product.ogImage] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ category: string; productSlug: string }>;
}) {
  const { category, productSlug } = await params;
  
  // Read geo-routing header
  const headersList = await headers();
  const country = headersList.get("x-user-country") || "IN";
  const isIndia = country === "IN";

  const product = await db.product.findUnique({
    where: { slug: productSlug, status: "PUBLISHED" },
    include: {
      category: true,
      images: true,
    },
  });

  if (!product || product.category.slug !== category) {
    notFound();
  }

  // Check if B2B user
  const session = await auth();
  const isB2B = session?.user?.role === "B2B";
  let b2bAccount = null;
  if (isB2B) {
    b2bAccount = await db.b2BAccount.findUnique({
      where: { userId: session.user.id },
    });
  }

  // Fetch related products (same category, excluding current product, take 4)
  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "PUBLISHED",
    },
    take: 4,
  });

  const price = typeof product.basePrice === 'number' 
    ? product.basePrice 
    : Number(product.basePrice);

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  // Parse specs if available
  let specsObj: Record<string, string> = {};
  if (product.specs && typeof product.specs === 'object') {
    specsObj = product.specs as Record<string, string>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-4 w-4 mx-2 shrink-0" />
        <Link href="/collections" className="hover:text-foreground transition-colors">Collections</Link>
        <ChevronRight className="h-4 w-4 mx-2 shrink-0" />
        <Link href={`/collections/${category}`} className="hover:text-foreground transition-colors">{product.category.name}</Link>
        <ChevronRight className="h-4 w-4 mx-2 shrink-0" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        {/* Gallery */}
        <div>
          <ProductGallery 
            images={product.images} 
            primaryImage={product.ogImage} 
            productName={product.name} 
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">{product.name}</h1>
          <p className="text-2xl font-medium mb-6">{formattedPrice}</p>

          <div className="prose prose-sm text-muted-foreground mb-8">
            {product.description ? (
              <p>{product.description}</p>
            ) : (
              <p>Experience the timeless beauty of handcrafted solid wood with the {product.name}. Designed for modern living, built for generations.</p>
            )}
          </div>

          {/* Call to Action */}
          {isB2B && b2bAccount ? (
            <div className="mb-10">
              <B2BOrderRequestForm 
                productId={product.id} 
                basePrice={Number(product.basePrice)} 
                tier={b2bAccount.tier}
                discountPercentage={Number(b2bAccount.discountPercentage)}
              />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              {/* Primary Button based on Geo */}
              {isIndia ? (
                <>
                  {product.amazonUrl && (
                    <Button render={<a href={product.amazonUrl} target="_blank" rel="noopener noreferrer" />} size="lg" className="flex-1">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Buy on Amazon
                    </Button>
                  )}
                  {product.etsyUrl && (
                    <Button render={<a href={product.etsyUrl} target="_blank" rel="noopener noreferrer" />} variant="outline" size="lg" className="flex-1">
                      Buy on Etsy
                    </Button>
                  )}
                </>
              ) : (
                <>
                  {product.etsyUrl && (
                    <Button render={<a href={product.etsyUrl} target="_blank" rel="noopener noreferrer" />} size="lg" className="flex-1">
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Buy on Etsy
                    </Button>
                  )}
                  {product.amazonUrl && (
                    <Button render={<a href={product.amazonUrl} target="_blank" rel="noopener noreferrer" />} variant="outline" size="lg" className="flex-1">
                      Buy on Amazon
                    </Button>
                  )}
                </>
              )}
              
              {/* Fallback if no URLs configured */}
              {!product.amazonUrl && !product.etsyUrl && (
                <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground w-full">
                  Out of stock online. <Link href="/contact" className="underline hover:text-foreground">Contact us</Link> for availability.
                </div>
              )}
            </div>
          )}

          {/* Specs Table */}
          {Object.keys(specsObj).length > 0 && (
            <div className="border-t pt-8">
              <h3 className="text-lg font-medium mb-4">Specifications</h3>
              <dl className="divide-y text-sm">
                {Object.entries(specsObj).map(([key, value]) => (
                  <div key={key} className="grid grid-cols-3 py-3">
                    <dt className="font-medium text-muted-foreground">{key}</dt>
                    <dd className="col-span-2">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t pt-16">
          <h2 className="text-2xl font-bold tracking-tight mb-8">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {relatedProducts.map((relatedProd) => (
              <ProductCard 
                key={relatedProd.id} 
                product={relatedProd} 
                categorySlug={category} 
              />
            ))}
          </div>
        </div>
      )}
      
      {/* JSON-LD for Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description,
            image: product.ogImage,
            offers: {
              "@type": "Offer",
              price: price,
              priceCurrency: "INR",
              availability: "https://schema.org/InStock"
            }
          })
        }}
      />
    </div>
  );
}
