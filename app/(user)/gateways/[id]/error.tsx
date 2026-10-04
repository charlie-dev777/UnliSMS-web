"use client";

import { RouteError } from "@/components/feedback";

export default function GatewayError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <RouteError error={error} retry={retry} title="Couldn’t load this gateway" />;
}
