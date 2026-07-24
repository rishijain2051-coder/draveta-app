import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AffiliateProfileForm } from "@/components/admin/AffiliateProfileForm";
import { AffiliateSalesForm } from "@/components/admin/AffiliateSalesForm";
import { formatCurrency } from "@/lib/utils"; // Fallback to inline formatting if it doesn't exist

export default async function ManageAffiliateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await db.affiliateProfile.findUnique({
    where: { id },
    include: {
      application: true,
      user: true,
      salesLogs: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!profile) {
    notFound();
  }

  // Serialize decimals to numbers
  const serializedProfile = {
    ...profile,
    discountPercent: Number(profile.discountPercent),
    commissionPercent: Number(profile.commissionPercent),
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/admin/affiliates?tab=profiles" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Affiliate</h1>
          <p className="text-muted-foreground">{profile.application.name} ({profile.uniqueCode})</p>
        </div>
        <div className="ml-auto">
          <Badge variant={profile.status === "ACTIVE" ? "default" : "secondary"}>
            {profile.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <AffiliateProfileForm initialData={serializedProfile} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Log Manual Sale</CardTitle>
            </CardHeader>
            <CardContent>
              <AffiliateSalesForm affiliateId={profile.id} commissionPercent={serializedProfile.commissionPercent} />
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Sales & Commission Ledger</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Redemptions</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Comm. Owed</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profile.salesLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No sales logged yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    profile.salesLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{new Date(log.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{log.platform}</TableCell>
                        <TableCell>{log.period}</TableCell>
                        <TableCell>{log.redemptionCount}</TableCell>
                        <TableCell>₹{Number(log.revenue).toLocaleString("en-IN")}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          ₹{Number(log.commissionOwed).toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={log.paymentStatus === "PAID" ? "default" : "outline"}>
                            {log.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
