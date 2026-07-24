import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AffiliateApplicationActions } from "@/components/admin/AffiliateApplicationActions";

export default async function AdminAffiliateReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await db.affiliateApplication.findUnique({
    where: { id }
  });

  if (!application) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/admin/affiliates" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Application</h1>
          <p className="text-muted-foreground">{application.name}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={
            application.status === "APPROVED" ? "default" :
            application.status === "PENDING" ? "secondary" :
            application.status === "REJECTED" ? "destructive" : "outline"
          }>
            {application.status}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applicant Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p>{application.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p><a href={`mailto:${application.email}`} className="text-primary hover:underline">{application.email}</a></p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone</p>
              <p>{application.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Audience Size</p>
              <p>{application.audienceSize || "N/A"}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-muted-foreground">Platform / Website</p>
            {application.socialUrl ? (
              <a href={application.socialUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {application.socialUrl}
              </a>
            ) : (
              <p>N/A</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Decision</CardTitle>
        </CardHeader>
        <CardContent>
          {application.status === "PENDING" ? (
            <AffiliateApplicationActions applicationId={application.id} />
          ) : (
            <p className="text-muted-foreground">
              This application has been {application.status.toLowerCase()}.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
