import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const applySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  socialUrl: z.string().url().optional().or(z.literal("")),
  audienceSize: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = applySchema.parse(body);

    const application = await db.affiliateApplication.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        socialUrl: validatedData.socialUrl || null,
        audienceSize: validatedData.audienceSize,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, applicationId: application.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
