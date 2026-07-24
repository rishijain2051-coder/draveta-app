import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const overrides = await db.seoOverride.findMany({
      orderBy: { pagePath: "asc" },
    });
    return NextResponse.json(overrides);
  } catch (error) {
    console.error("Error fetching SEO overrides:", error);
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
    const { pagePath, metaTitle, metaDescription, ogImage } = body;

    if (!pagePath) {
      return NextResponse.json(
        { error: "Page path is required" },
        { status: 400 }
      );
    }

    const newOverride = await db.seoOverride.create({
      data: {
        pagePath,
        metaTitle,
        metaDescription,
        ogImage,
      },
    });

    return NextResponse.json(newOverride, { status: 201 });
  } catch (error) {
    console.error("Error creating SEO override:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
