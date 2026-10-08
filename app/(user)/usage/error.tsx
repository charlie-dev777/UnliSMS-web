"use client";

import { RouteError } from "@/components/feedback";

export default function UsageError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <RouteError error={error} retry={retry} title="Couldn’t load usage" />;
}
