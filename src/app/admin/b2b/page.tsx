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
  title: "B2B Management - Admin",
};

export default async function AdminB2BPage() {
  const [applications, accounts] = await Promise.all([
    db.b2BApplication.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.b2BAccount.findMany({
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
          <h1 className="text-2xl font-bold tracking-tight">B2B Management</h1>
          <p className="text-muted-foreground">Manage trade program applications and accounts.</p>
        </div>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="accounts">Active Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="applications">
          <div className="bg-card border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No applications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.companyName}</TableCell>
                      <TableCell>
                        <div className="text-sm">{app.contactName}</div>
                        <div className="text-xs text-muted-foreground">{app.email}</div>
                      </TableCell>
                      <TableCell>{app.businessType.replace("_", " ")}</TableCell>
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
                        <Button variant="outline" size="sm" render={<Link href={`/admin/b2b/${app.id}`} />}>
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

        <TabsContent value="accounts">
          <div className="bg-card border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Discount %</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No active B2B accounts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  accounts.map((acc) => (
                    <TableRow key={acc.id}>
                      <TableCell className="font-medium">{acc.application.companyName}</TableCell>
                      <TableCell>{acc.user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{acc.tier}</Badge>
                      </TableCell>
                      <TableCell>{Number(acc.discountPercentage)}%</TableCell>
                      <TableCell>
                        <Badge variant={acc.status === "ACTIVE" ? "default" : "secondary"}>
                          {acc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" render={<Link href={`/admin/b2b/accounts/${acc.id}`} />}>
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
