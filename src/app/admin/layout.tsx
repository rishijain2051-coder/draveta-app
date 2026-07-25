import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Package,
  Users,
  UserCheck,
  FileText,
  Search,
  LayoutDashboard,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { Separator } from "@/components/ui/separator";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Order Requests", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Package },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/b2b", label: "B2B Accounts", icon: Users },
  { href: "/admin/affiliates", label: "Affiliates", icon: UserCheck },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/seo", label: "SEO", icon: Search },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth: proxy.ts already gates /admin, but enforce here too so a
  // proxy misconfig or a route outside the matcher can never expose the CMS.
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/40 p-4 flex flex-col gap-2">
        <div className="px-3 py-2 mb-2">
          <h2 className="text-lg font-semibold tracking-tight">Draveta CMS</h2>
          <p className="text-xs text-muted-foreground">Administration</p>
        </div>
        <Separator />
        <nav className="flex flex-col gap-1 mt-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <AdminBreadcrumbs />
        {children}
      </main>
    </div>
  );
}
