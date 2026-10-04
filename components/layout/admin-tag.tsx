import { Badge } from "@/components/ui/badge";

export function AdminTag({ className }: { className?: string }) {
  return (
    <Badge variant="neutral" shape="tag" className={className}>
      Admin
    </Badge>
  );
}
