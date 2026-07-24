"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils"; // Wait, I don't have formatCurrency. I will format inline.

export function B2BOrderRequestForm({ 
  productId, 
  basePrice,
  tier,
  discountPercentage 
}: { 
  productId: string,
  basePrice: number,
  tier: string,
  discountPercentage: number
}) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tiers, setTiers] = useState<any[]>([]);
  const [unitPrice, setUnitPrice] = useState(basePrice);

  useEffect(() => {
    fetch(`/api/b2b/pricing?productId=${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data.tiers) {
          setTiers(data.tiers);
        }
      });
  }, [productId]);

  useEffect(() => {
    // Calculate price based on current quantity
    let currentPrice = basePrice;
    
    // Check breakpoints
    if (tiers.length > 0) {
      const match = [...tiers].reverse().find(t => quantity >= t.minQty);
      if (match) {
        currentPrice = match.unitPrice;
      }
    } else if (discountPercentage > 0) {
      currentPrice = basePrice * (1 - discountPercentage / 100);
    }
    
    setUnitPrice(currentPrice);
  }, [quantity, tiers, basePrice, discountPercentage]);

  const handleAddToOrder = async () => {
    try {
      setLoading(true);
      
      const cartStr = localStorage.getItem("b2b_cart");
      const cart = cartStr ? JSON.parse(cartStr) : [];
      
      const existingItem = cart.find((i: any) => i.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.unitPrice = unitPrice; // update price just in case
      } else {
        cart.push({
          productId,
          quantity,
          unitPrice,
        });
      }
      
      localStorage.setItem("b2b_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("b2b_cart_updated"));
      
      toast.success("Added to order request!");
    } catch (error) {
      toast.error("Error adding to order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted/30 rounded-lg border">
        <h3 className="font-semibold mb-2">Trade Pricing</h3>
        {tiers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((t, idx) => (
                <TableRow key={idx} className={quantity >= t.minQty && (!t.maxQty || quantity <= t.maxQty) ? "bg-accent/50" : ""}>
                  <TableCell>{t.minQty}{t.maxQty ? ` - ${t.maxQty}` : "+"}</TableCell>
                  <TableCell className="text-right">₹{Number(t.unitPrice).toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground">
            {discountPercentage > 0 ? `Global ${discountPercentage}% discount applied to base price.` : 'Standard pricing applies.'}
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center border rounded-md w-full sm:w-32">
          <Button variant="ghost" className="px-3" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
          <Input 
            type="number" 
            value={quantity} 
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="border-0 text-center focus-visible:ring-0 rounded-none h-full"
          />
          <Button variant="ghost" className="px-3" onClick={() => setQuantity(quantity + 1)}>+</Button>
        </div>
        <Button 
          size="lg" 
          className="flex-1" 
          onClick={handleAddToOrder}
          disabled={loading}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Order Request • ₹{(unitPrice * quantity).toLocaleString("en-IN")}
        </Button>
      </div>
    </div>
  );
}
