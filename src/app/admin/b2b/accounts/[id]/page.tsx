import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { B2BAccountForm } from "@/components/admin/B2BAccountForm";

export default async function ManageB2BAccountPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const account = await db.b2BAccount.findUnique({
    where: { id },
    include: {
      application: true,
      user: true,
    }
  });

  if (!account) {
    notFound();
  }

  // Serialize decimal to number
  const serializedAccount = {
    ...account,
    discountPercentage: Number(account.discountPercentage),
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/admin/b2b?tab=accounts" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage B2B Account</h1>
          <p className="text-muted-foreground">{account.application.companyName}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <B2BAccountForm initialData={serializedAccount} />
        </CardContent>
      </Card>
    </div>
  );
}
