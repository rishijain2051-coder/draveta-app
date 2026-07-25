import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { B2BApplicationActions } from "@/components/admin/B2BApplicationActions";

export default async function B2BApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const application = await db.b2BApplication.findUnique({
    where: { id },
  });

  if (!application) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/admin/b2b" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review Application</h1>
          <p className="text-muted-foreground">{application.companyName}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Business Name</p>
                <p className="text-base">{application.companyName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Business Type</p>
                <p className="text-base">{application.businessType.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">GST Number</p>
                <p className="text-base">{application.gstNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Website</p>
                {application.websiteUrl ? (
                  <a href={application.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {application.websiteUrl}
                  </a>
                ) : (
                  <p className="text-base text-muted-foreground">N/A</p>
                )}
              </div>
            </div>

            <Separator />
            
            <div>
              <CardTitle className="text-lg mb-4">Contact Information</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contact Name</p>
                  <p className="text-base">{application.contactName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <a href={`mailto:${application.email}`} className="text-primary hover:underline">{application.email}</a>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-base">{application.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Designation</p>
                  <p className="text-base">{application.contactDesignation || "N/A"}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <CardTitle className="text-lg mb-4">Sourcing &amp; Additional Details</CardTitle>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Year Established</p>
                  <p className="text-base">{application.yearEstablished || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Delivery Location</p>
                  <p className="text-base">
                    {[application.deliveryCity, application.deliveryState]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estimated Volume</p>
                  <p className="text-base">{application.estimatedVolume || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order Frequency</p>
                  <p className="text-base">{application.orderFrequency || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Heard About Us</p>
                  <p className="text-base">{application.heardAbout || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Categories of Interest</p>
                  <p className="text-base">
                    {Array.isArray(application.categoriesInterested) &&
                    application.categoriesInterested.length
                      ? application.categoriesInterested.join(", ")
                      : "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Current Suppliers</p>
                  <p className="text-base">{application.currentSuppliers || "N/A"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              {application.status === "PENDING" ? (
                <B2BApplicationActions applicationId={application.id} email={application.email} name={application.contactName} />
              ) : (
                <p className="text-sm text-muted-foreground">This application has been {application.status.toLowerCase()}.</p>
              )}
            </CardContent>
          </Card>

          {application.gstCertificateUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" render={<a href={application.gstCertificateUrl} target="_blank" rel="noopener noreferrer" />}>
                  View Certificate
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
