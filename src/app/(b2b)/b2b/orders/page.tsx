import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
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
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Clock } from "lucide-react";

export const metadata = {
  title: "Order Requests - Draveta Trade",
};

export default async function B2BOrdersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "B2B") {
    redirect("/login");
  }

  const account = await db.b2BAccount.findUnique({
    where: { userId: session.user.id },
  });

  if (!account) return <div>Account not found</div>;

  const orders = await db.orderRequest.findMany({
    where: { b2bAccountId: account.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Requests</h1>
          <p className="text-muted-foreground">View and track your B2B orders.</p>
        </div>
        <Button render={<Link href="/collections" />}>Browse Catalog</Button>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Total (INR)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  You haven't placed any order requests yet.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell>₹{Number(order.total).toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Badge variant={
                      order.status === "SUBMITTED" ? "secondary" :
                      order.status === "ACKNOWLEDGED" ? "default" :
                      order.status === "INVOICED" ? "outline" :
                      order.status === "FULFILLED" ? "default" : "destructive"
                    }>
                      {order.status === "SUBMITTED" && <Clock className="mr-1 h-3 w-3 inline" />}
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDistanceToNow(order.createdAt, { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" render={<Link href={`/b2b/orders/${order.id}`} />}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
