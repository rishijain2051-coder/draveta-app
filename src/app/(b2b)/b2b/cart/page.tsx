"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type CartItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

type HydratedItem = CartItem & {
  name: string;
  ogImage: string | null;
};

export default function B2BCartPage() {
  const [items, setItems] = useState<HydratedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartStr = localStorage.getItem("b2b_cart");
        if (!cartStr) {
          setLoading(false);
          return;
        }

        const cart: CartItem[] = JSON.parse(cartStr);
        if (cart.length === 0) {
          setLoading(false);
          return;
        }

        const res = await fetch("/api/products/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: cart.map(i => i.productId) })
        });
        
        const data: {
          products: Array<{ id: string; name: string; ogImage: string | null }>;
        } = await res.json();
        const productsMap = new Map(data.products.map((p) => [p.id, p] as const));

        const hydrated = cart.map(item => ({
          ...item,
          name: productsMap.get(item.productId)?.name || "Unknown Product",
          ogImage: productsMap.get(item.productId)?.ogImage || null,
        }));

        setItems(hydrated);
      } catch (error) {
        console.error("Failed to load cart", error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const removeItem = (productId: string) => {
    const newItems = items.filter(i => i.productId !== productId);
    setItems(newItems);
    localStorage.setItem("b2b_cart", JSON.stringify(newItems.map(i => ({
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: i.unitPrice
    }))));
    window.dispatchEvent(new Event("b2b_cart_updated"));
  };

  const submitOrderRequest = async () => {
    try {
      setSubmitting(true);
      const res = await fetch("/api/b2b/order-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice
          })),
          notes
        })
      });

      if (!res.ok) throw new Error("Submission failed");

      const data = await res.json();
      localStorage.removeItem("b2b_cart");
      window.dispatchEvent(new Event("b2b_cart_updated"));
      toast.success("Order Request submitted successfully!");
      router.push(`/b2b/orders/${data.orderId}`);
    } catch (error) {
      toast.error("Failed to submit order request");
    } finally {
      setSubmitting(false);
    }
  };

  const total = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">Order Request</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-lg border border-dashed">
          <p className="text-muted-foreground mb-4">Your order request is empty.</p>
          <Button render={<Link href="/collections" />}>Browse Catalog</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.ogImage && (
                            <div className="w-12 h-12 relative rounded overflow-hidden bg-muted">
                              <Image src={item.ogImage} alt={item.name} fill className="object-cover" />
                            </div>
                          )}
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{item.unitPrice.toLocaleString("en-IN")}</TableCell>
                      <TableCell className="text-right font-medium">₹{(item.unitPrice * item.quantity).toLocaleString("en-IN")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-semibold mb-2">Order Notes</h3>
              <Textarea 
                placeholder="Any special instructions for manufacturing or delivery?"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div>
            <div className="bg-card rounded-lg border p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Summary</h2>
              
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Items</span>
                <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              
              <div className="flex justify-between items-center text-lg font-bold border-t pt-4 mb-6">
                <span>Estimated Total</span>
                <span>₹{total.toLocaleString("en-IN")}</span>
              </div>
              
              <Button 
                className="w-full" 
                size="lg" 
                onClick={submitOrderRequest}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Request"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                This is a request. A Draveta representative will verify inventory and confirm final shipping costs before invoicing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
