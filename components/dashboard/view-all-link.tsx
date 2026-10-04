import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ViewAllLink({ href, children = "View all", outline }: { href: string; children?: React.ReactNode; outline?: boolean }) {
  return (
    <Button asChild variant={outline ? "outline" : "link"} size="sm">
      <Link href={href}>{children}</Link>
    </Button>
  );
}
