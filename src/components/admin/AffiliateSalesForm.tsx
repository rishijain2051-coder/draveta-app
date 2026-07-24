"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Platform } from "@/lib/enums";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const salesSchema = z.object({
  period: z.string().min(1, "Period is required"),
  platform: z.nativeEnum(Platform),
  redemptionCount: z.number().min(0),
  revenue: z.number().min(0),
});

type SalesFormValues = z.infer<typeof salesSchema>;

export function AffiliateSalesForm({ affiliateId, commissionPercent }: { affiliateId: string, commissionPercent: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<SalesFormValues>({
    resolver: zodResolver(salesSchema),
    defaultValues: {
      period: new Date().toISOString().slice(0, 7), // YYYY-MM
      platform: "AMAZON",
      redemptionCount: 0,
      revenue: 0,
    },
  });

  const onSubmit = async (data: SalesFormValues) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/affiliates/profiles/${affiliateId}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Sales logged successfully");
      form.reset({
        ...data,
        redemptionCount: 0,
        revenue: 0,
      });
      router.refresh();
    } catch (error: any) {
      toast.error("Failed to log sales");
    } finally {
      setLoading(false);
    }
  };

  // Watch revenue to calculate estimated commission
  const revenue = form.watch("revenue") || 0;
  const estimatedCommission = (revenue * (commissionPercent / 100)).toFixed(2);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="period"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reporting Period</FormLabel>
              <FormControl>
                <Input type="month" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="platform"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Platform</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="AMAZON">Amazon</SelectItem>
                  <SelectItem value="ETSY">Etsy</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="redemptionCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Redemptions</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="revenue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Revenue (INR)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="bg-muted/50 p-3 rounded-md text-sm">
          Estimated Commission: <span className="font-bold text-green-600">₹{estimatedCommission}</span>
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging..." : "Log Sales Data"}
        </Button>
      </form>
    </Form>
  );
}
