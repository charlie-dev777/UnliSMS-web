import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationsButton({ unread }: { unread?: boolean }) {
  return (
    <Button variant="ghost" size="icon" className="relative" aria-label={unread ? "Notifications (unread)" : "Notifications"}>
      <Bell />
      {unread && <span aria-hidden className="absolute top-2 right-[9px] box-content size-[7px] rounded-full border-2 border-white bg-brand" />}
    </Button>
  );
}
