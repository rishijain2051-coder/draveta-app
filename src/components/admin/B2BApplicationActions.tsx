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
import { CheckCircle, XCircle, Copy } from "lucide-react";

export function B2BApplicationActions({
  applicationId,
  email,
  name,
}: {
  applicationId: string;
  email: string;
  name: string;
}) {
  const [loading, setLoading] = useState(false);
  const [creds, setCreds] = useState<{ email: string; password: string } | null>(
    null
  );
  const router = useRouter();

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/b2b/${applicationId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      if (status === "APPROVED" && data.credentials) {
        // Don't refresh yet: these actions only render while the app is PENDING,
        // so refreshing would unmount this component and close the dialog before
        // the admin can copy the password. Refresh when the dialog is dismissed.
        setCreds(data.credentials);
      } else {
        toast.success(`Application ${status.toLowerCase()} successfully.`);
        router.refresh();
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const copyCreds = () => {
    if (!creds) return;
    navigator.clipboard.writeText(
      `Email: ${creds.email}\nPassword: ${creds.password}`
    );
    toast.success("Credentials copied");
  };

  const closeCreds = () => {
    setCreds(null);
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => handleAction("APPROVED")}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve Account
        </Button>
        <Button
          onClick={() => handleAction("REJECTED")}
          disabled={loading}
          variant="destructive"
          className="w-full"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Reject Application
        </Button>
      </div>

      <Dialog
        open={!!creds}
        onOpenChange={(open: boolean) => {
          if (!open) closeCreds();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account approved — share these credentials</DialogTitle>
            <DialogDescription>
              This temporary password is shown only once. Send it to {name} so
              they can sign in at <span className="font-mono">/login</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-md border bg-muted/40 p-4 text-sm space-y-1 font-mono">
            <div>
              <span className="text-muted-foreground">Email: </span>
              {creds?.email}
            </div>
            <div>
              <span className="text-muted-foreground">Password: </span>
              {creds?.password}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={copyCreds}>
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
            <Button onClick={closeCreds}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
