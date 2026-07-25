import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { BusinessType } from "@/lib/enums";
import { rateLimit, clientIp, isBot } from "@/lib/security";

const b2bApplicationSchema = z.object({
  companyName: z.string().min(2),
  businessType: z.nativeEnum(BusinessType),
  yearEstablished: z.number().int().optional(),
  gstNumber: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  contactName: z.string().min(2),
  contactDesignation: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(10),
  categoriesInterested: z.array(z.string()).optional(),
  estimatedVolume: z.string().optional(),
  orderFrequency: z.string().optional(),
  currentSuppliers: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryState: z.string().optional(),
  gstCertificateUrl: z.string().url().optional().or(z.literal("")),
  heardAbout: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: max 5 applications per IP per minute.
    if (!rateLimit(`b2b-apply:${clientIp(req)}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Honeypot: silently accept spam so bots don't learn, but store nothing.
    if (isBot(body?.hp_field)) {
      return NextResponse.json({ success: true });
    }

    const { categoriesInterested, ...rest } = b2bApplicationSchema.parse(body);

    const application = await db.b2BApplication.create({
      data: {
        ...rest,
        categoriesInterested:
          categoriesInterested && categoriesInterested.length > 0
            ? categoriesInterested
            : undefined,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("B2B Application Error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
