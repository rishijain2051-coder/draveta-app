import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "B2B") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { items, notes } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order items cannot be empty" }, { status: 400 });
    }

    const account = await db.b2BAccount.findUnique({
      where: { userId: session.user.id },
    });

    if (!account) {
      return NextResponse.json({ error: "B2B Account not found" }, { status: 404 });
    }

    let total = 0;
    // Calculate total securely or trust the client? 
    // Ideally we recalculate based on pricing engine, but for this MVP order request we can trust the client's calculated price 
    // since it's just a request that will be reviewed by admin.
    for (const item of items) {
      total += (item.unitPrice * item.quantity);
    }

    const orderRequest = await db.orderRequest.create({
      data: {
        b2bAccountId: account.id,
        items,
        total,
        notes,
        status: "SUBMITTED",
      }
    });

    // Optionally notify admin via email
    if (resend) {
      await resend.emails.send({
        from: "Draveta Orders <onboarding@resend.dev>",
        to: ["admin@dravetafurniture.com"],
        subject: `New B2B Order Request from ${session.user.name}`,
        html: `<p>A new order request has been submitted. Log in to the admin panel to view it.</p>`
      });
    }

    return NextResponse.json({ success: true, orderId: orderRequest.id });
  } catch (error) {
    console.error("Order Request Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
