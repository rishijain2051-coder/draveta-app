"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AffiliateApplicationActions({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: "approve" | "reject") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/affiliates/${applicationId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success(`Application ${action}d successfully`);
      router.refresh();
      router.push("/admin/affiliates");
    } catch (error: any) {
      toast.error(`Failed to ${action} application`);
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
