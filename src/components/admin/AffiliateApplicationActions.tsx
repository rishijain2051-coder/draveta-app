"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";

export function AffiliateApplicationActions({
  applicationId,
}: {
  applicationId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (action: "approve" | "reject") => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/affiliates/${applicationId}/status`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      if (action === "approve" && data.code) {
        // Show the code dialog; navigation/refresh happens when it's dismissed
        // (this component only renders while the app is PENDING).
        setCode(data.code);
      } else {
        toast.success(`Application ${action}d successfully`);
        router.refresh();
        router.push("/admin/affiliates");
      }
    } catch {
      toast.error(`Failed to ${action} application`);
    } finally {
      setLoading(false);
    }
  };

  const done = () => {
    setCode(null);
    router.push("/admin/affiliates");
  };

  return (
    <>
      <div className="flex gap-4">
        <Button
          onClick={() => handleAction("approve")}
          disabled={loading}
          className="flex-1"
        >
          Approve (Create Account & Code)
        </Button>
        <Button
          variant="destructive"
          onClick={() => handleAction("reject")}
          disabled={loading}
          className="flex-1"
        >
          Reject
        </Button>
      </div>

      <Dialog
        open={!!code}
        onOpenChange={(open: boolean) => {
          if (!open) done();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Affiliate approved</DialogTitle>
            <DialogDescription>
              Share this promo code with the affiliate. They don&apos;t sign in —
              you track redemptions and commission from the admin.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/40 p-6 text-center">
            <div className="text-3xl font-bold font-mono tracking-widest">
              {code}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (code) {
                  navigator.clipboard.writeText(code);
                  toast.success("Code copied");
                }
              }}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy code
            </Button>
            <Button onClick={done}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
