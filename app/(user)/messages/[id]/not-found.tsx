import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/feedback";

// Unknown IDs and other organizations' messages look the same: the API returns 404 for both.
export default function MessageNotFound() {
  return (
    <Card>
      <EmptyState
        icon={SearchX}
        title="Message not found"
        description="This message doesn’t exist or belongs to another organization."
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/messages">Back to messages</Link>
          </Button>
        }
      />
    </Card>
  );
}
