"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AccountTier, UserStatus } from "@/lib/enums";
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

const accountSchema = z.object({
  tier: z.nativeEnum(AccountTier),
  discountPercentage: z.number().min(0).max(100),
  status: z.nativeEnum(UserStatus),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export function B2BAccountForm({ initialData }: { initialData: any }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      tier: initialData.tier,
      discountPercentage: initialData.discountPercentage,
      status: initialData.status,
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/b2b/accounts/${initialData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success("Account updated successfully");
      router.refresh();
      router.push("/admin/b2b?tab=accounts");
    } catch (error: any) {
      toast.error("Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="tier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Tier</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(AccountTier).map((tier) => (
                    <SelectItem key={tier} value={tier}>
                      {tier}
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
          name="discountPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Global Discount Percentage (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
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
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  );
}
