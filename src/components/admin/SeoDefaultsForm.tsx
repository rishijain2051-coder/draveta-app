"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const seoDefaultSchema = z.object({
  titleTemplate: z.string().min(1, "Title template is required"),
  metaDescription: z.string().min(1, "Meta description is required"),
  ogImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type SeoDefaultFormValues = z.infer<typeof seoDefaultSchema>;

interface SeoDefaultsFormProps {
  initialData?: any;
}

export function SeoDefaultsForm({ initialData }: SeoDefaultsFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SeoDefaultFormValues>({
    resolver: zodResolver(seoDefaultSchema),
    defaultValues: {
      titleTemplate: initialData?.titleTemplate || "%s - Draveta Furniture",
      metaDescription: initialData?.metaDescription || "",
      ogImage: initialData?.ogImage || "",
    },
  });

  const onSubmit = async (data: SeoDefaultFormValues) => {
    try {
      setLoading(true);

      const res = await fetch("/api/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("SEO Defaults updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sitewide SEO Defaults</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="titleTemplate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title Template</FormLabel>
                  <FormControl>
                    <Input placeholder="%s - Draveta Furniture" {...field} />
                  </FormControl>
                  <p className="text-[0.8rem] text-muted-foreground">%s will be replaced with the page title.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Meta Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Used when a page lacks a specific description..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ogImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default OG Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save SEO Defaults"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
