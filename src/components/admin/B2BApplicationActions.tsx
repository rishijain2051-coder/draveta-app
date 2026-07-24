"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";

export function B2BApplicationActions({ applicationId, email, name }: { applicationId: string, email: string, name: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/b2b/${applicationId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      if (!res.ok) throw new Error(await res.text());

      toast.success(`Application ${action.toLowerCase()}d successfully.`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Button 
        onClick={() => handleAction("APPROVE")} 
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 text-white"
      >
        <CheckCircle className="mr-2 h-4 w-4" />
        Approve Account
      </Button>
      <Button 
        onClick={() => handleAction("REJECT")} 
        disabled={loading}
        variant="destructive"
        className="w-full"
      >
        <XCircle className="mr-2 h-4 w-4" />
        Reject Application
      </Button>
    </div>
  );
}
