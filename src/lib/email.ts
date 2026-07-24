import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Draveta Furniture <noreply@draveta.com>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email] Would send to ${to}: ${subject}`);
    return;
  }

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
}

export async function sendB2BApplicationReceived(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: "We received your trade application — Draveta Furniture",
    html: `
      <h2>Thank you, ${name}</h2>
      <p>We've received your trade account application and will review it shortly.</p>
      <p>You'll hear from us within 2-3 business days.</p>
      <p>— The Draveta Team</p>
    `,
  });
}

export async function sendB2BApproved(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: "Your trade account has been approved — Draveta Furniture",
    html: `
      <h2>Welcome to Draveta Trade, ${name}</h2>
      <p>Your trade account has been approved. You can now log in to access wholesale pricing and place order requests.</p>
      <p>Log in at: <a href="${process.env.AUTH_URL}/login">draveta.com/login</a></p>
      <p>— The Draveta Team</p>
    `,
  });
}

export async function sendB2BRejected(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: "Update on your trade application — Draveta Furniture",
    html: `
      <h2>Hello ${name},</h2>
      <p>After reviewing your application, we're unable to approve a trade account at this time.</p>
      <p>If you have questions, please reach out to us at trade@draveta.com.</p>
      <p>— The Draveta Team</p>
    `,
  });
}

export async function sendAffiliateApproved(
  email: string,
  name: string,
  code: string
) {
  return sendEmail({
    to: email,
    subject: "You're in! Your Draveta affiliate code — Draveta Furniture",
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your affiliate application has been approved.</p>
      <p>Your unique discount code: <strong>${code}</strong></p>
      <p>Share this code with your audience — they get a discount, you earn commission on every sale.</p>
      <p>— The Draveta Team</p>
    `,
  });
}

export async function sendOrderRequestReceived(
  email: string,
  name: string,
  orderId: string
) {
  return sendEmail({
    to: email,
    subject: `Order request ${orderId} received — Draveta Furniture`,
    html: `
      <h2>Order request received, ${name}</h2>
      <p>We've received your order request (${orderId}) and will follow up with an invoice shortly.</p>
      <p>You can track your order status in your dashboard.</p>
      <p>— The Draveta Team</p>
    `,
  });
}

export async function notifyAdminNewApplication(
  type: "b2b" | "affiliate",
  applicantName: string
) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  return sendEmail({
    to: adminEmail,
    subject: `New ${type} application from ${applicantName}`,
    html: `
      <p>A new ${type} application has been submitted by <strong>${applicantName}</strong>.</p>
      <p>Review it in the <a href="${process.env.AUTH_URL}/admin/${type === "b2b" ? "b2b" : "affiliates"}">admin panel</a>.</p>
    `,
  });
}
