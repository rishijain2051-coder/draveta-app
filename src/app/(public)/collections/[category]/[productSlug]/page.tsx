import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductCard } from "@/components/products/ProductCard";
import { B2BOrderRequestForm } from "@/components/products/B2BOrderRequestForm";
import { Reveal } from "@/components/motion/reveal";
import Link from "next/link";
import {
  ChevronRight,
  ShoppingBag,
  Leaf,
  Hammer,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  const product = await db.product.findUnique({ where: { slug: productSlug } });
  if (!product) return { title: "Not Found" };
  return {
    title: product.metaTitle || `${product.name} - Draveta Furniture`,
    description: product.metaDescription || product.description?.substring(0, 160),
    openGraph: { images: product.ogImage ? [product.ogImage] : [] },
  };
}

const BADGES = [
  { icon: Leaf, label: "Solid hardwood" },
  { icon: Hammer, label: "Hand-joined" },
  { icon: ShieldCheck, label: "Built to last" },
  { icon: Truck, label: "Trade delivery" },
];

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ category: string; productSlug: string }>;
}) {
  const { category, productSlug } = await params;

  const headersList = await headers();
  const country = headersList.get("x-user-country") || "IN";
  const isIndia = country === "IN";

  const product = await db.product.findUnique({
    where: { slug: productSlug, status: "PUBLISHED" },
    include: { category: true, images: true },
  });

  if (!product || product.category.slug !== category) notFound();

  const session = await auth();
  const isB2B = session?.user?.role === "B2B";
  let b2bAccount = null;
  if (isB2B) {
    b2bAccount = await db.b2BAccount.findUnique({ where: { userId: session.user.id } });
  }

  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "PUBLISHED",
    },
    take: 4,
  });

  const price = Number(product.basePrice);
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  let specsObj: Record<string, string> = {};
  if (product.specs && typeof product.specs === "object") {
    specsObj = product.specs as Record<string, string>;
  }

  const AmazonBtn = product.amazonUrl ? (
    <Button
      render={<a href={product.amazonUrl} target="_blank" rel="noopener noreferrer" />}
      size="lg"
      className="flex-1 h-12"
    >
      <ShoppingBag className="mr-2 h-4 w-4" />
      Buy on Amazon
    </Button>
  ) : null;

  const EtsyBtn = product.etsyUrl ? (
    <Button
      render={<a href={product.etsyUrl} target="_blank" rel="noopener noreferrer" />}
      variant="outline"
      size="lg"
      className="flex-1 h-12"
    >
      Buy on Etsy
    </Button>
  ) : null;

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-[#faf8f4] border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-xs uppercase tracking-wider text-stone-500 overflow-x-auto whitespace-nowrap">
            <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-2 shrink-0" />
            <Link href="/collections" className="hover:text-stone-900 transition-colors">Collections</Link>
            <ChevronRight className="h-3.5 w-3.5 mx-2 shrink-0" />
            <Link href={`/collections/${category}`} className="hover:text-stone-900 transition-colors">
              {product.category.name}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 mx-2 shrink-0" />
            <span className="text-stone-900">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Main */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Gallery */}
          <Reveal y={16}>
            <ProductGallery
              images={product.images}
              primaryImage={product.ogImage}
              productName={product.name}
            />
          </Reveal>

          {/* Info */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal delay={0.05} y={16}>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#9c7a54] mb-4">
                {product.category.name}
              </p>
              <h1 className="font-serif text-3xl md:text-5xl leading-tight tracking-tight text-stone-900 mb-4">
                {product.name}
              </h1>
              <p className="text-2xl font-medium text-stone-900 mb-8">{formattedPrice}</p>
            </Reveal>

            <Reveal delay={0.12} y={16}>
              <div className="prose prose-stone text-stone-600 mb-8 max-w-none">
                <p>
                  {product.description ||
                    `Experience the timeless beauty of handcrafted solid wood with the ${product.name}. Designed for modern living, built for generations.`}
                </p>
              </div>
            </Reveal>

            {/* CTA */}
            <Reveal delay={0.18} y={16}>
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
                <div className="flex flex-col sm:flex-row gap-3 mb-10">
                  {isIndia ? (
                    <>
                      {AmazonBtn}
                      {EtsyBtn}
                    </>
                  ) : (
                    <>
                      {EtsyBtn}
                      {AmazonBtn}
                    </>
                  )}
                  {!product.amazonUrl && !product.etsyUrl && (
                    <div className="p-4 border border-dashed rounded-lg text-center text-muted-foreground w-full">
                      Out of stock online.{" "}
                      <Link href="/contact" className="underline hover:text-foreground">
                        Contact us
                      </Link>{" "}
                      for availability.
                    </div>
                  )}
                </div>
              )}
            </Reveal>

            {/* Feature badges */}
            <Reveal delay={0.24} y={16}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-b border-border py-6 mb-8">
                {BADGES.map((b) => (
                  <div key={b.label} className="flex flex-col items-center text-center gap-2">
                    <b.icon className="h-5 w-5 text-[#9c7a54]" />
                    <span className="text-[11px] uppercase tracking-wider text-stone-500">
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Specs */}
            {Object.keys(specsObj).length > 0 && (
              <Reveal y={16}>
                <div>
                  <h3 className="font-serif text-xl text-stone-900 mb-4">Specifications</h3>
                  <dl className="divide-y divide-border text-sm">
                    {Object.entries(specsObj).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 py-3">
                        <dt className="font-medium text-stone-500">{key}</dt>
                        <dd className="col-span-2 text-stone-800">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-stone-900 mb-10">
                You may also like
              </h2>
            </Reveal>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6">
              {relatedProducts.map((relatedProd, i) => (
                <Reveal key={relatedProd.id} delay={(i % 4) * 0.08}>
                  <ProductCard product={relatedProd} categorySlug={category} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

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
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
    </div>
  );
}
