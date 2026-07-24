import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { CheckCircle, XCircle, Clock } from "lucide-react";

export const metadata = {
  title: "Affiliate Management - Admin",
};

export default async function AdminAffiliatesPage() {
  const [applications, profiles] = await Promise.all([
    db.affiliateApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.affiliateProfile.findMany({
      include: {
        application: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Affiliate Management</h1>
          <p className="text-muted-foreground">Manage affiliate applications and profiles.</p>
        </div>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="profiles">Active Affiliates</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <div className="bg-card border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.name}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>
                        {app.socialUrl ? (
                          <a href={app.socialUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            Link
                          </a>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{app.audienceSize || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={
                          app.status === "APPROVED" ? "default" :
                          app.status === "PENDING" ? "secondary" :
                          app.status === "REJECTED" ? "destructive" : "outline"
                        }>
                          {app.status === "PENDING" && <Clock className="mr-1 h-3 w-3 inline" />}
                          {app.status === "APPROVED" && <CheckCircle className="mr-1 h-3 w-3 inline" />}
                          {app.status === "REJECTED" && <XCircle className="mr-1 h-3 w-3 inline" />}
                          {app.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDistanceToNow(app.createdAt, { addSuffix: true })}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" render={<Link href={`/admin/affiliates/${app.id}`} />}>
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="profiles">
          <div className="bg-card border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Promo Code</TableHead>
                  <TableHead>Comm %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No active affiliates found.
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.application.name}</TableCell>
                      <TableCell>{profile.user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{profile.uniqueCode}</Badge>
                      </TableCell>
                      <TableCell>{Number(profile.commissionPercent)}%</TableCell>
                      <TableCell>
                        <Badge variant={profile.status === "ACTIVE" ? "default" : "secondary"}>
                          {profile.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" render={<Link href={`/admin/affiliates/profiles/${profile.id}`} />}>
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
