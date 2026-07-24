import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const application = await db.b2BApplication.findUnique({ where: { id } });
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.status !== "PENDING") {
      return NextResponse.json({ error: "Application already processed" }, { status: 400 });
    }

    // Execute in transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Update Application status
      const updatedApp = await tx.b2BApplication.update({
        where: { id },
        data: {
          status,
          reviewedById: session.user.id,
          reviewedAt: new Date(),
        },
      });

      if (status === "APPROVED") {
        // Generate a random password (e.g. 10 chars)
        const tempPassword = Math.random().toString(36).slice(-10) + "Aa1!";
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Check if user already exists
        let user = await tx.user.findUnique({ where: { email: application.email } });
        
        if (!user) {
          user = await tx.user.create({
            data: {
              name: application.contactName,
              email: application.email,
              passwordHash: hashedPassword,
              role: "B2B",
            }
          });
        } else {
          // Upgrade user to B2B if they exist
          user = await tx.user.update({
            where: { id: user.id },
            data: { role: "B2B" }
          });
        }

        // Create B2B Account
        await tx.b2BAccount.create({
          data: {
            applicationId: id,
            userId: user.id,
            tier: "RETAILER", // Default tier
          }
        });

        return { updatedApp, tempPassword };
      }

      return { updatedApp };
    });

    // Send email outside transaction
    if (resend && status === "APPROVED" && result.tempPassword) {
      await resend.emails.send({
        from: "Draveta Furniture <onboarding@resend.dev>",
        to: [application.email],
        subject: "Your B2B Trade Account is Approved",
        html: `
          <h2>Welcome to the Draveta Furniture Trade Program!</h2>
          <p>Your application has been approved.</p>
          <p><strong>Login URL:</strong> https://dravetafurniture.com/auth/login</p>
          <p><strong>Email:</strong> ${application.email}</p>
          <p><strong>Temporary Password:</strong> ${result.tempPassword}</p>
          <p>Please log in and change your password immediately.</p>
        `,
      });
    } else if (resend && status === "REJECTED") {
      await resend.emails.send({
        from: "Draveta Furniture <onboarding@resend.dev>",
        to: [application.email],
        subject: "Update on your B2B Trade Application",
        html: `
          <p>Dear ${application.contactName},</p>
          <p>Thank you for your interest in the Draveta Furniture Trade Program. After careful review, we are unable to approve your application at this time.</p>
          <p>If you have any questions, please contact us.</p>
        `,
      });
    }

    return NextResponse.json({ success: true, status: result.updatedApp.status });
  } catch (error) {
    console.error("B2B Status Update Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
