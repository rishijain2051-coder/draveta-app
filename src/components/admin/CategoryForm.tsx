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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  displayOrder: z.number().int(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: any;
  onSuccess?: () => void;
  trigger?: React.ReactElement;
}

export function CategoryForm({ initialData, onSuccess, trigger }: CategoryFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      imageUrl: "",
      displayOrder: 0,
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      setLoading(true);
      const url = initialData
        ? `/api/categories/${initialData.id}`
        : "/api/categories";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      toast.success(`Category ${initialData ? "updated" : "created"}`);
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
      <DialogTrigger render={trigger || <Button>Create Category</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Category" : "New Category"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Living Room"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (!initialData) {
                          form.setValue("slug", generateSlug(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="living-room" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Category"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
