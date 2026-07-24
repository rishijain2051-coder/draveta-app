"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Trash2, Plus } from "lucide-react";

type Tier = {
  tier: string;
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
};

export function B2BTierPricingManager({ productId }: { productId: string }) {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/products/${productId}/b2b-tiers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTiers(data.map(d => ({ ...d, unitPrice: Number(d.unitPrice) })));
        }
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const addTier = () => {
    setTiers([...tiers, { tier: "RETAILER", minQty: 1, maxQty: null, unitPrice: 0 }]);
  };

  const removeTier = (index: number) => {
    const newTiers = [...tiers];
    newTiers.splice(index, 1);
    setTiers(newTiers);
  };

  const updateTier = (index: number, field: keyof Tier, value: any) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTiers(newTiers);
  };

  const saveTiers = async () => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/products/${productId}/b2b-tiers`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tiers.map(t => ({
          ...t,
          maxQty: t.maxQty || null // ensure empty strings become null
        }))),
      });

      if (!res.ok) throw new Error("Failed to save tiers");
      toast.success("B2B Tier pricing saved successfully!");
    } catch (error) {
      toast.error("Error saving tiers.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading tiers...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>B2B Tier Pricing</CardTitle>
        <CardDescription>Configure volume breakpoints for different account tiers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Tier</TableHead>
              <TableHead>Min Qty</TableHead>
              <TableHead>Max Qty (Optional)</TableHead>
              <TableHead>Unit Price (INR)</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No tier pricing configured.
                </TableCell>
              </TableRow>
            ) : (
              tiers.map((t, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Select value={t.tier} onValueChange={(val) => updateTier(idx, "tier", val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RETAILER">Retailer</SelectItem>
                        <SelectItem value="DISTRIBUTOR">Distributor</SelectItem>
                        <SelectItem value="HOTEL_CAFE">Hotel/Cafe</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="1" 
                      value={t.minQty} 
                      onChange={(e) => updateTier(idx, "minQty", parseInt(e.target.value) || 1)} 
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="1" 
                      value={t.maxQty || ""} 
                      placeholder="Unlimited"
                      onChange={(e) => updateTier(idx, "maxQty", e.target.value ? parseInt(e.target.value) : null)} 
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      min="0" 
                      value={t.unitPrice} 
                      onChange={(e) => updateTier(idx, "unitPrice", parseFloat(e.target.value) || 0)} 
                    />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeTier(idx)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={addTier}>
            <Plus className="mr-2 h-4 w-4" />
            Add Breakpoint
          </Button>
          <Button onClick={saveTiers} disabled={saving}>
            {saving ? "Saving..." : "Save Tiers"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
