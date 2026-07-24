import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://dravetafurniture.com";

  // Get all categories
  const categories = await db.category.findMany();
  
  // Get all published products
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true }
  });

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/collections/${cat.slug}`,
    lastModified: cat.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productUrls = products.map((prod) => ({
    url: `${baseUrl}/collections/${prod.category.slug}/${prod.slug}`,
    lastModified: prod.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
