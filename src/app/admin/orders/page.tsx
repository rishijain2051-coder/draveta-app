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
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Clock } from "lucide-react";

export const metadata = {
  title: "Order Requests - Admin",
};

export default async function AdminOrdersPage() {
  const orders = await db.orderRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      b2bAccount: {
        include: {
          application: true,
          user: true,
        }
      }
    },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Requests</h1>
          <p className="text-muted-foreground">Manage B2B order requests.</p>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Total (INR)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No order requests found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id.slice(-6).toUpperCase()}</TableCell>
                  <TableCell>{order.b2bAccount.application.companyName}</TableCell>
                  <TableCell>
                    <div className="text-sm">{order.b2bAccount.application.contactName}</div>
                    <div className="text-xs text-muted-foreground">{order.b2bAccount.user.email}</div>
                  </TableCell>
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
                    <Button variant="outline" size="sm" render={<Link href={`/admin/orders/${order.id}`} />}>
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
