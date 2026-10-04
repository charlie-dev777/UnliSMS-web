import { AppShell } from "@/components/layout/app-shell";
import { adminUser } from "@/lib/mock-data";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell admin user={adminUser} homeHref="/admin/dashboard" searchPlaceholder="Search users, gateway IDs, message IDs…">
      {children}
    </AppShell>
  );
}
