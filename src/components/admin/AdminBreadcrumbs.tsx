"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter((p) => p !== "");

  if (paths.length <= 1) return null; // Don't show breadcrumbs on /admin dashboard

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/admin">Dashboard</Link>} />
        </BreadcrumbItem>
        {paths.slice(1).map((segment, index) => {
          const isLast = index === paths.length - 2;
          const href = `/admin/${paths.slice(1, index + 2).join("/")}`;
          // Format IDs (cuid usually 25 chars) vs text
          const isId = segment.length > 20; 
          const title = isId ? "Edit" : segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={href}>{title}</Link>} />
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
