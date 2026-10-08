import type { Metadata } from "next";
import { Info } from "lucide-react";
import { getSession, requireUser } from "@/lib/auth/session";
import { formatPlanCode } from "@/lib/format";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Field, FieldList, Mono } from "@/components/gateways";

export const metadata: Metadata = { title: "Settings" };

/**
 * Read-only: the OnSim API has no endpoint to update a user or an organization, and no
 * endpoint to re-read them, so this shows what the login response returned.
 */
export default async function SettingsPage() {
  await requireUser();
  const session = await getSession();
  if (!session) return null; // requireUser() already redirected
  const { user, organization } = session;

  return (
    <>
      <PageHeader title="Settings" description="Your account and organization." />

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Account</CardTitle>
            <CardDescription className="mb-0">The details you sign in with.</CardDescription>
          </div>
        </CardHeader>
        <div className="border-t border-border px-5 py-4">
          <FieldList>
            <Field label="Display name">{user.name}</Field>
            <Field label="Username">{user.username}</Field>
            <Field label="Email" wide>
              {user.email}
            </Field>
          </FieldList>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Organization</CardTitle>
            <CardDescription className="mb-0">The organization your gateways, messages and keys belong to.</CardDescription>
          </div>
        </CardHeader>
        <div className="border-t border-border px-5 py-4">
          <FieldList>
            <Field label="Name">{organization.name}</Field>
            <Field label="Plan">
              {formatPlanCode(organization.planCode)} <span className="text-muted-foreground">(<Mono>{organization.planCode}</Mono>)</span>
            </Field>
          </FieldList>
        </div>
      </Card>

      <p className="m-0 flex gap-2 text-xs text-muted-foreground">
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        <span>
          Changing your name, username, email or organization isn’t available in the web portal yet. These details are as of your last sign-in.
        </span>
      </p>
    </>
  );
}
