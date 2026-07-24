import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const status = searchParams.get("status") as any;

    const where: any = {};
    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;

    const products = await db.product.findMany({
      where,
      include: { category: true, images: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      description,
      specs,
      categoryId,
      basePrice,
      amazonUrl,
      etsyUrl,
      metaTitle,
      metaDescription,
      ogImage,
      status,
    } = body;

    const newProduct = await db.product.create({
      data: {
        name,
        slug,
        description,
        specs: specs || {},
        categoryId,
        basePrice,
        amazonUrl,
        etsyUrl,
        metaTitle,
        metaDescription,
        ogImage,
        status: status || "DRAFT",
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
