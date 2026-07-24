import { ProductForm } from "@/components/admin/ProductForm";
import { B2BTierPricingManager } from "@/components/admin/B2BTierPricingManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Product - Admin",
};

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  // Convert Decimal to string/number for form
  const serializedProduct = {
    ...product,
    basePrice: Number(product.basePrice),
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">Modify product details.</p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="b2b">B2B Tier Pricing</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <ProductForm initialData={serializedProduct} categories={categories} />
        </TabsContent>
        <TabsContent value="b2b">
          <B2BTierPricingManager productId={product.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
