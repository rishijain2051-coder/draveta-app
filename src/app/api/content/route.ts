import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const contentBlocks = await db.contentBlock.findMany();
    // Convert array of {key, value, type} into an object for easier frontend consumption
    const contentMap = contentBlocks.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(contentMap);
  } catch (error) {
    console.error("Error fetching content blocks:", error);
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
    const updates = Object.entries(body).map(([key, value]) => ({
      key,
      value: String(value),
      updatedById: session.user.id,
    }));

    // Perform upserts in a transaction
    await db.$transaction(
      updates.map((update) =>
        db.contentBlock.upsert({
          where: { key: update.key },
          update: { value: update.value, updatedById: update.updatedById },
          create: { key: update.key, value: update.value, updatedById: update.updatedById },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating content blocks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
