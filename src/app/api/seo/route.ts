import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const seoDefault = await db.seoDefault.findFirst();
    return NextResponse.json(seoDefault || {});
  } catch (error) {
    console.error("Error fetching SEO defaults:", error);
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
    const { titleTemplate, metaDescription, ogImage } = body;

    const existing = await db.seoDefault.findFirst();

    let seoDefault;
    if (existing) {
      seoDefault = await db.seoDefault.update({
        where: { id: existing.id },
        data: { titleTemplate, metaDescription, ogImage },
      });
    } else {
      seoDefault = await db.seoDefault.create({
        data: { titleTemplate, metaDescription, ogImage },
      });
    }

    return NextResponse.json(seoDefault);
  } catch (error) {
    console.error("Error updating SEO defaults:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
