import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    // number | string | Prisma Decimal (all coerce via Number()).
    basePrice: number | string | { toString(): string };
    ogImage: string | null;
  };
  categorySlug: string;
}

export function ProductCard({ product, categorySlug }: ProductCardProps) {
  const price = Number(product.basePrice);

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <Link
      href={`/collections/${categorySlug}/${product.slug}`}
      className="group block transition-transform duration-300 ease-out hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-stone-100 mb-4">
        {product.ogImage ? (
          <Image
            src={product.ogImage}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-sm">
            No image
          </div>
        )}
      </div>

      <h3 className="font-serif text-lg leading-snug text-stone-900 transition-colors group-hover:text-stone-500">
        {product.name}
      </h3>
      <p className="mt-1 text-sm text-stone-500">From {formattedPrice}</p>
    </Link>
  );
}
