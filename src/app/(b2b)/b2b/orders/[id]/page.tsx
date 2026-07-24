import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";

export default async function B2BOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "B2B") {
    redirect("/login");
  }

  const { id } = await params;
  
  const account = await db.b2BAccount.findUnique({
    where: { userId: session.user.id },
  });

  if (!account) notFound();

  const order = await db.orderRequest.findUnique({
    where: { id, b2bAccountId: account.id },
  });

  if (!order) {
    notFound();
  }

  const items = order.items as any[];

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/b2b/orders" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Request #{order.id.slice(-6).toUpperCase()}</h1>
          <p className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={order.status === "SUBMITTED" ? "secondary" : "default"}>
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{Number(item.unitPrice).toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right">₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold">Estimated Total</TableCell>
                    <TableCell className="text-right font-bold text-lg">₹{Number(order.total).toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {order.status === "SUBMITTED" && (
                <p className="text-sm text-muted-foreground">
                  Your order request has been submitted. A Draveta representative will review inventory and confirm final pricing and shipping costs.
                </p>
              )}
              {order.status === "ACKNOWLEDGED" && (
                <p className="text-sm text-muted-foreground">
                  We are processing your request. You will receive an invoice soon.
                </p>
              )}
              {order.status === "INVOICED" && (
                <p className="text-sm text-muted-foreground">
                  An invoice has been sent. Once paid, your order will be fulfilled.
                </p>
              )}
              {order.status === "FULFILLED" && (
                <p className="text-sm text-muted-foreground">
                  Your order has been fulfilled.
                </p>
              )}
            </CardContent>
          </Card>
          
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
