import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number | any;
    ogImage: string | null;
  };
  categorySlug: string;
}

export function ProductCard({ product, categorySlug }: ProductCardProps) {
  const price = typeof product.basePrice === 'number' 
    ? product.basePrice 
    : Number(product.basePrice);

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <Link href={`/collections/${categorySlug}/${product.slug}`} className="group flex flex-col">
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted mb-4">
        {product.ogImage ? (
          <Image
            src={product.ogImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No Image
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1">
        <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          From {formattedPrice}
        </p>
      </div>
    </Link>
  );
}
