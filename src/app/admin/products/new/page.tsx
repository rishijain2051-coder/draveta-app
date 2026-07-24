import { ProductForm } from "@/components/admin/ProductForm";
import { db } from "@/lib/db";

export const metadata = {
  title: "New Product - Admin",
};

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create Product</h1>
        <p className="text-muted-foreground">Add a new product to the catalog.</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
