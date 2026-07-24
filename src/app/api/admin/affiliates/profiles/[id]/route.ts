import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { UserStatus } from "@prisma/client";

const profileSchema = z.object({
  uniqueCode: z.string().min(3),
  discountPercent: z.number().min(0).max(100),
  commissionPercent: z.number().min(0).max(100),
  status: z.nativeEnum(UserStatus),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validatedData = profileSchema.parse(body);

    const updatedProfile = await db.affiliateProfile.update({
      where: { id },
      data: {
        uniqueCode: validatedData.uniqueCode,
        discountPercent: validatedData.discountPercent,
        commissionPercent: validatedData.commissionPercent,
        status: validatedData.status,
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
