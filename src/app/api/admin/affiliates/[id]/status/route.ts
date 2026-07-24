import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper to generate a unique promo code
function generatePromoCode(name: string) {
  const prefix = name.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${random}`;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const application = await db.affiliateApplication.findUnique({
      where: { id }
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.status !== "PENDING") {
      return NextResponse.json({ error: "Application is not pending" }, { status: 400 });
    }

    if (action === "reject") {
      await db.affiliateApplication.update({
        where: { id },
        data: { status: "REJECTED" }
      });
      return NextResponse.json({ success: true });
    }

    // Handle approval
    // Check if user already exists
    let user = await db.user.findUnique({
      where: { email: application.email }
    });

    // Generated inside the transaction, surfaced to the admin UI + email.
    const uniqueCode = generatePromoCode(application.name);

    await db.$transaction(async (tx) => {
      // 1. Update application status
      await tx.affiliateApplication.update({
        where: { id },
        data: { status: "APPROVED" }
      });

      // 2. Create the linked user (required by AffiliateProfile). Affiliates are
      // admin-managed and do not sign in, so this account is not used for login.
      if (!user) {
        const hashedPassword = await bcrypt.hash(
          Math.random().toString(36).slice(-12),
          10
        );
        user = await tx.user.create({
          data: {
            name: application.name,
            email: application.email,
            passwordHash: hashedPassword,
            role: "AFFILIATE",
          }
        });
      }

      // 3. Create Affiliate Profile
      await tx.affiliateProfile.create({
        data: {
          applicationId: id,
          userId: user.id,
          uniqueCode,
          discountPercent: 5, // Default 5%
          commissionPercent: 2, // Default 2%
        }
      });
    });

    // Send email notification (the affiliate uses the code; there is no login).
    if (resend) {
      await resend.emails.send({
        from: "Draveta Affiliates <onboarding@resend.dev>",
        to: [application.email],
        subject: "Your Draveta Affiliate Application is Approved!",
        html: `
          <h2>Welcome to the Draveta Affiliate Program!</h2>
          <p>Your application has been approved. Your promo code is:</p>
          <p style="font-size:22px;font-weight:bold;letter-spacing:2px;">${uniqueCode}</p>
          <p>Share it with your audience — they get a discount, and you earn commission on each redemption. Our team tracks redemptions and settles your commission with you each month.</p>
        `
      });
    }

    return NextResponse.json({ success: true, code: uniqueCode });
  } catch (error) {
    console.error("Affiliate Approval Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
