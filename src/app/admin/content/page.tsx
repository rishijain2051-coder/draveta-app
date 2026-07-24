import { ContentEditor } from "@/components/admin/ContentEditor";
import { db } from "@/lib/db";

export const metadata = {
  title: "Content - Admin",
};

export default async function ContentPage() {
  const contentBlocks = await db.contentBlock.findMany();
  
  // Convert array of {key, value} into an object for the form
  const contentMap = contentBlocks.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
        <p className="text-muted-foreground">Manage your homepage and other dynamic content blocks.</p>
      </div>

      <ContentEditor initialData={contentMap} />
    </div>
  );
}
