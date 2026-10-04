"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Re-renders the current route's Server Components every `seconds` while the tab is
 * visible. Presence changes on a scale of minutes, so this stays well under the API.
 */
export function AutoRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}

export function RetryButton() {
  const router = useRouter();
  return (
    <Button variant="outline" size="sm" onClick={() => router.refresh()}>
      <RotateCw />
      Try again
    </Button>
  );
}
