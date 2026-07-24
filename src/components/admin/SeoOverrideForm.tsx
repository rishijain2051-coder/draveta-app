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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const seoOverrideSchema = z.object({
  pagePath: z.string().min(1, "Page path is required").startsWith("/", "Must start with /"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type SeoOverrideFormValues = z.infer<typeof seoOverrideSchema>;

interface SeoOverrideFormProps {
  initialData?: any;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function SeoOverrideForm({ initialData, onSuccess, trigger }: SeoOverrideFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SeoOverrideFormValues>({
    resolver: zodResolver(seoOverrideSchema),
    defaultValues: initialData || {
      pagePath: "/",
      metaTitle: "",
      metaDescription: "",
      ogImage: "",
    },
  });

  const onSubmit = async (data: SeoOverrideFormValues) => {
    try {
      setLoading(true);
      const url = initialData
        ? `/api/seo/overrides/${initialData.id}`
        : "/api/seo/overrides";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success(`Override ${initialData ? "updated" : "created"}`);
      setOpen(false);
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger || <Button>Add Override</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit SEO Override" : "New SEO Override"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="pagePath"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Path</FormLabel>
                  <FormControl>
                    <Input placeholder="/about" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title Override</FormLabel>
                  <FormControl>
                    <Input placeholder="Custom title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description Override</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Custom description..." {...field} />
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
                  <FormLabel>OG Image URL Override</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Override"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
