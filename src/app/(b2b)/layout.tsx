import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, LayoutDashboard, Settings, LogOut } from "lucide-react";

export default async function B2BLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "B2B") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="w-64 border-r bg-card p-4 flex flex-col gap-2">
        <div className="px-3 py-2 mb-2">
          <h2 className="text-lg font-semibold tracking-tight">Draveta Trade</h2>
          <p className="text-xs text-muted-foreground">B2B Portal</p>
        </div>
        <nav className="flex flex-col gap-1 mt-2">
          <Link href="/b2b/dashboard" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          <Link href="/b2b/orders" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
            <Package className="h-4 w-4" /> Order Requests
          </Link>
          <Link href="/b2b/settings" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
            <Settings className="h-4 w-4" /> Account Settings
          </Link>
        </nav>
        <div className="mt-auto px-3 py-2">
          <a href="/api/auth/signout" className="flex items-center gap-3 text-sm font-medium text-destructive hover:underline">
            <LogOut className="h-4 w-4" /> Sign Out
          </a>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
