import { db } from "@/lib/db";
import { SeoDefaultsForm } from "@/components/admin/SeoDefaultsForm";
import { SeoOverrideForm } from "@/components/admin/SeoOverrideForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

export const metadata = {
  title: "SEO - Admin",
};

export default async function SeoPage() {
  const [seoDefault, seoOverrides] = await Promise.all([
    db.seoDefault.findFirst(),
    db.seoOverride.findMany({ orderBy: { pagePath: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">SEO Management</h1>
        <p className="text-muted-foreground">Manage sitewide SEO defaults and per-page overrides.</p>
      </div>

      <SeoDefaultsForm initialData={seoDefault} />

      <div>
        <div className="flex justify-between items-center mb-4 mt-8">
          <h2 className="text-xl font-semibold tracking-tight">Per-Page Overrides</h2>
          <SeoOverrideForm />
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page Path</TableHead>
                <TableHead>Meta Title</TableHead>
                <TableHead>Meta Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seoOverrides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No overrides configured.
                  </TableCell>
                </TableRow>
              ) : (
                seoOverrides.map((override) => (
                  <TableRow key={override.id}>
                    <TableCell className="font-medium">{override.pagePath}</TableCell>
                    <TableCell>{override.metaTitle || <span className="text-muted-foreground italic">Default</span>}</TableCell>
                    <TableCell className="max-w-xs truncate">{override.metaDescription || <span className="text-muted-foreground italic">Default</span>}</TableCell>
                    <TableCell className="text-right">
                      <SeoOverrideForm
                        initialData={override}
                        trigger={
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
