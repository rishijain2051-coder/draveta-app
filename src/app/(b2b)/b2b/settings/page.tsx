import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Account Settings - Draveta Trade",
};

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b py-3 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{value || "—"}</dd>
    </div>
  );
}

export default async function B2BSettingsPage() {
  const session = await auth();

  const account = await db.b2BAccount.findUnique({
    where: { userId: session?.user?.id },
    include: { application: true },
  });

  const app = account?.application;

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-2">
          Your trade account details. To update company information or your
          pricing tier, contact your Draveta account manager.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade account</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="text-sm">
            <Row label="Account tier" value={account?.tier} />
            <Row
              label="Global discount"
              value={
                account
                  ? `${Number(account.discountPercentage)}%`
                  : undefined
              }
            />
            <Row label="Status" value={account?.status} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company &amp; contact</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="text-sm">
            <Row label="Company" value={app?.companyName} />
            <Row label="Business type" value={app?.businessType} />
            <Row label="GST number" value={app?.gstNumber} />
            <Row label="Contact name" value={app?.contactName} />
            <Row label="Email" value={app?.email} />
            <Row label="Phone" value={app?.phone} />
            <Row
              label="Delivery"
              value={
                [app?.deliveryCity, app?.deliveryState]
                  .filter(Boolean)
                  .join(", ") || undefined
              }
            />
          </dl>
        </CardContent>
      </Card>

      <div>
        <Button
          variant="outline"
          render={<a href="/api/auth/signout" />}
          className="text-destructive"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
