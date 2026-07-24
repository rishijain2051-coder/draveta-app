import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";

export const metadata = {
  title: "Dashboard - Draveta Trade",
};

export default async function B2BDashboardPage() {
  const session = await auth();
  
  const account = await db.b2BAccount.findUnique({
    where: { userId: session?.user?.id },
    include: { application: true },
  });

  const recentOrders = await db.orderRequest.findMany({
    where: { b2bAccountId: account?.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {account?.application.companyName}</h1>
        <p className="text-muted-foreground mt-2">
          Your account tier is <strong className="text-foreground">{account?.tier}</strong>.
          {account?.discountPercentage && Number(account.discountPercentage) > 0 ? (
            <span> You have a global discount of <strong className="text-foreground">{Number(account.discountPercentage)}%</strong> on all base prices.</span>
          ) : null}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Order Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentOrders.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Order Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p>No order requests yet.</p>
                <Button variant="link" render={<Link href="/collections" />} className="mt-2">
                  Browse Catalog
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium">Order #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.status}</p>
                      <Button variant="ghost" size="sm" render={<Link href={`/b2b/orders/${order.id}`} />}>
                        View <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-between" render={<Link href="/collections" />}>
              Browse Catalog
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full justify-between" render={<Link href="/b2b/orders" />}>
              View All Orders
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
