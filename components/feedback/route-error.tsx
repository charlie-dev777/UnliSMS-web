"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "./empty-state";

/** Body for a route's error.tsx: the design's error state with "Try again". */
export function RouteError({ error, retry, title }: { error: Error & { digest?: string }; retry: () => void; title: string }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card>
      <ErrorState
        icon={AlertTriangle}
        title={title}
        description="The request timed out. Check your connection and try again."
        action={
          <Button variant="outline" size="sm" onClick={() => retry()}>
            Try again
          </Button>
        }
      />
    </Card>
  );
}
