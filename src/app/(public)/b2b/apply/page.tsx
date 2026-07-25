"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { BusinessType } from "@/lib/enums";
import { cn } from "@/lib/utils";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const CATEGORY_OPTIONS = [
  "Living",
  "Dining",
  "Bedroom",
  "Outdoor",
  "Hospitality / Contract",
];
const VOLUME_OPTIONS = [
  "Under ₹1 Lakh / quarter",
  "₹1–5 Lakh / quarter",
  "₹5–10 Lakh / quarter",
  "₹10–25 Lakh / quarter",
  "₹25 Lakh+ / quarter",
];
const FREQUENCY_OPTIONS = [
  "One-time",
  "Monthly",
  "Quarterly",
  "Half-yearly",
  "Annually",
];
const HEARD_OPTIONS = [
  "Search / Google",
  "Instagram",
  "Referral",
  "Trade show / event",
  "Existing customer",
  "Other",
];

const applySchema = z.object({
  companyName: z.string().min(2, "Business name is required"),
  businessType: z.nativeEnum(BusinessType),
  yearEstablished: z.string().optional(),
  gstNumber: z.string().optional(),
  websiteUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  contactName: z.string().min(2, "Contact name is required"),
  contactDesignation: z.string().optional(),
  email: z.string().email("Valid email required"),
  phone: z.string().min(10, "Valid phone number required"),
  categoriesInterested: z.array(z.string()).optional(),
  estimatedVolume: z.string().optional(),
  orderFrequency: z.string().optional(),
  currentSuppliers: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryState: z.string().optional(),
  gstCertificateUrl: z
    .string()
    .url("Enter a valid link")
    .optional()
    .or(z.literal("")),
  heardAbout: z.string().optional(),
  // Honeypot — must stay empty. Hidden from real users.
  hp_field: z.string().optional(),
});

type ApplyFormValues = z.infer<typeof applySchema>;

export default function B2BApplyPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applySchema),
    defaultValues: {
      companyName: "",
      businessType: "RETAILER",
      yearEstablished: "",
      gstNumber: "",
      websiteUrl: "",
      contactName: "",
      contactDesignation: "",
      email: "",
      phone: "",
      categoriesInterested: [],
      estimatedVolume: "",
      orderFrequency: "",
      currentSuppliers: "",
      deliveryCity: "",
      deliveryState: "",
      gstCertificateUrl: "",
      heardAbout: "",
      hp_field: "",
    },
  });

  const onSubmit = async (data: ApplyFormValues) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        yearEstablished: data.yearEstablished
          ? Number(data.yearEstablished)
          : undefined,
      };
      const res = await fetch("/api/b2b/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 429) {
        throw new Error("Too many submissions. Please try again shortly.");
      }
      if (!res.ok) throw new Error("Submission failed. Please check your details.");

      toast.success(
        "Application submitted! Our team will review it and be in touch shortly."
      );
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Trade Program Application
      </h1>
      <p className="text-muted-foreground mb-8">
        Tell us about your business and sourcing needs. Approved accounts unlock
        tiered wholesale pricing and self-service Order Requests.
      </p>

      <div className="bg-card p-6 rounded-xl border shadow-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Honeypot: hidden from users, catches bots */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="hidden"
              {...form.register("hp_field")}
            />

            {/* ── Business ── */}
            <section className="space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Business details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(BusinessType).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace(/_/g, " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="yearEstablished"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Established</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          inputMode="numeric"
                          placeholder="e.g. 2015"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gstNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Number</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {/* ── Contact ── */}
            <section className="space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Primary contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactDesignation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation / Role</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Procurement Lead" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            {/* ── Sourcing needs ── */}
            <section className="space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Sourcing needs
              </h2>

              <FormField
                control={form.control}
                name="categoriesInterested"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories of interest</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_OPTIONS.map((cat) => {
                        const selected = (field.value ?? []).includes(cat);
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => {
                              const cur = field.value ?? [];
                              field.onChange(
                                selected
                                  ? cur.filter((c) => c !== cat)
                                  : [...cur, cat]
                              );
                            }}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-sm transition-colors",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "hover:bg-muted"
                            )}
                          >
                            {cat}
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="estimatedVolume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Order Volume</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {VOLUME_OPTIONS.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="orderFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Frequency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="How often?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FREQUENCY_OPTIONS.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Delivery State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="currentSuppliers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Suppliers</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Who do you currently source from? (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="gstCertificateUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Certificate (link)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Link to your GST certificate"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="heardAbout"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How did you hear about us?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select one" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {HEARD_OPTIONS.map((o) => (
                            <SelectItem key={o} value={o}>
                              {o}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
