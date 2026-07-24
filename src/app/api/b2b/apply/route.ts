import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { BusinessType } from "@/lib/enums";

const b2bApplicationSchema = z.object({
  companyName: z.string().min(2),
  businessType: z.nativeEnum(BusinessType),
  gstNumber: z.string().optional(),
  contactName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  gstCertificateUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = b2bApplicationSchema.parse(body);

    const application = await db.b2BApplication.create({
      data: {
        ...validatedData,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("B2B Application Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
