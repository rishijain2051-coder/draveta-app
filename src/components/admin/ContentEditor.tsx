"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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

const pillarSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  iconUrl: z.string().optional(),
});

const contentSchema = z.object({
  heroHeadline: z.string().min(1, "Headline is required"),
  heroSubline: z.string().optional(),
  heroMediaUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  heroCtaText: z.string().optional(),
  heroCtaUrl: z.string().optional(),
  pillars: z.array(pillarSchema).max(4, "Maximum 4 pillars allowed"),
});

type ContentFormValues = z.infer<typeof contentSchema>;

interface ContentEditorProps {
  initialData: Record<string, string>;
}

export function ContentEditor({ initialData }: ContentEditorProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Parse pillars from JSON if it exists
  let initialPillars = [];
  try {
    if (initialData["why_solid_wood_pillars"]) {
      initialPillars = JSON.parse(initialData["why_solid_wood_pillars"]);
    }
  } catch (e) {
    console.error("Failed to parse pillars JSON", e);
  }

  // Ensure there's 4 items to start if empty
  if (initialPillars.length === 0) {
    initialPillars = Array(4).fill({ title: "", description: "", iconUrl: "" });
  }

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      heroHeadline: initialData["hero_headline"] || "",
      heroSubline: initialData["hero_subline"] || "",
      heroMediaUrl: initialData["hero_media_url"] || "",
      heroCtaText: initialData["hero_cta_text"] || "",
      heroCtaUrl: initialData["hero_cta_url"] || "",
      pillars: initialPillars,
    },
  });

  const { fields } = useFieldArray({
    name: "pillars",
    control: form.control,
  });

  const onSubmit = async (data: ContentFormValues) => {
    try {
      setLoading(true);

      const payload = {
        hero_headline: data.heroHeadline,
        hero_subline: data.heroSubline,
        hero_media_url: data.heroMediaUrl,
        hero_cta_text: data.heroCtaText,
        hero_cta_url: data.heroCtaUrl,
        why_solid_wood_pillars: JSON.stringify(data.pillars),
      };

      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Content updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <Card>
          <CardHeader>
            <CardTitle>Homepage Hero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="heroHeadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Input placeholder="Solid wood, honestly made." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="heroSubline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subline</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Crafting furniture for generations..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="heroMediaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Media URL (Image or Video)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="heroCtaText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTA Text</FormLabel>
                    <FormControl>
                      <Input placeholder="Explore Collections" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroCtaUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTA URL</FormLabel>
                    <FormControl>
                      <Input placeholder="/collections" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why Solid Wood (4 Pillars)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 border p-4 rounded-md">
                <FormField
                  control={form.control}
                  name={`pillars.${index}.title`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel>Pillar {index + 1} Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sustainably Sourced" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`pillars.${index}.description`}
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief explanation..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Saving..." : "Save Content Changes"}
          </Button>
        </div>

      </form>
    </Form>
  );
}
