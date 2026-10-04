import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback";

// Unknown IDs and other organizations' gateways look the same: the API returns 404 for both.
export default function GatewayNotFound() {
  return (
    <Card>
      <EmptyState
        icon={SearchX}
        title="Gateway not found"
        description="This gateway doesn’t exist, was removed, or belongs to another organization."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/gateways">Back to gateways</Link>
          </Button>
        }
      />
    </Card>
  );
}
