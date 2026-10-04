import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import type { GatewayCapabilities } from "@/lib/types";
import { requireUser } from "@/lib/auth/session";
import { getGateway } from "@/lib/data/gateways";
import { formatDateTime, formatMegabytes, formatNumber } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { GatewayHealthBadge, GatewayStatusBadge } from "@/components/status";
import {
  AutoRefresh,
  Field,
  FieldList,
  gatewayLabel,
  GatewaysForbidden,
  gatewaySubtitle,
  GatewaysUnavailable,
  Mono,
  SimList,
  Timestamp,
  yesNo,
} from "@/components/gateways";

export const metadata: Metadata = { title: "Gateway" };

export default async function GatewayPage({ params }: PageProps<"/gateways/[id]">) {
  await requireUser();
  const { id } = await params;
  const result = await getGateway(id);
  if (!result.ok && result.reason === "not_found") notFound();

  const back = (
    <Link href="/gateways" className="inline-flex w-fit items-center gap-1 text-[13px] font-medium text-muted-foreground hover:text-foreground">
      <ChevronLeft className="size-4" aria-hidden />
      Gateways
    </Link>
  );

  if (!result.ok) {
    return (
      <>
        {back}
        <PageHeader title="Gateway" description="Device, connectivity and SIM details." />
        <Card>{result.reason === "forbidden" ? <GatewaysForbidden /> : <GatewaysUnavailable />}</Card>
      </>
    );
  }

  const g = result.data;
  const now = new Date();

  return (
    <>
      {back}
      <PageHeader
        title={gatewayLabel(g)}
        description={gatewaySubtitle(g)}
        actions={<GatewayStatusBadge status={g.presence} />}
      />
      <AutoRefresh />

      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Connectivity</CardTitle>
              <CardDescription>From the phone’s most recent contact with UnliSMS.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <FieldList>
              <Field label="Status">
                <GatewayStatusBadge status={g.presence} />
              </Field>
              <Field label="Last seen">
                <Timestamp iso={g.lastSeenAt} now={now} />
              </Field>
              <Field label="Registered">{formatDateTime(g.registeredAt)}</Field>
            </FieldList>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device</CardTitle>
          </CardHeader>
          <CardContent>
            <FieldList>
              <Field label="Name">{g.name}</Field>
              <Field label="Device model">{g.deviceModel}</Field>
              <Field label="Android version">{g.androidVersion}</Field>
              <Field label="App version">{g.appVersion}</Field>
              <Field label="Gateway ID" wide>
                <Mono>{g.publicGatewayId}</Mono>
              </Field>
            </FieldList>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Health</CardTitle>
              <CardDescription>Last reported by the phone; may be out of date.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <FieldList>
              <Field label="Health status">
                <GatewayHealthBadge status={g.healthStatus} />
              </Field>
              <Field label="Battery">{g.batteryPercent === null ? null : `${g.batteryPercent}%`}</Field>
              <Field label="Network type">{g.networkType}</Field>
              <Field label="SMS permission">{yesNo(g.smsPermission)}</Field>
              <Field label="Phone permission">{yesNo(g.phonePermission)}</Field>
              <Field label="Queued messages">{g.queueDepth === null ? null : formatNumber(g.queueDepth)}</Field>
              <Field label="Storage available">{g.storageAvailableMb === null ? null : formatMegabytes(g.storageAvailableMb)}</Field>
            </FieldList>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Active SIMs</CardTitle>
              <CardDescription>Last reported by the phone; may be out of date.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <SimList sims={g.sims} />
          </CardContent>
        </Card>

        <Card className="min-[900px]:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Capabilities</CardTitle>
              <CardDescription>Reported by the app installed on this phone.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Capabilities capabilities={g.capabilities} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Capabilities({ capabilities: c }: { capabilities: GatewayCapabilities | null }) {
  if (!c) {
    return <p className="m-0 text-[13px] text-muted-foreground">Unknown — not reported. The phone has no active app installation.</p>;
  }
  return (
    <FieldList className="min-[900px]:grid-cols-3">
      <Field label="Send SMS">{yesNo(c.canSendSms)}</Field>
      <Field label="Receive SMS">{yesNo(c.canReceiveSms)}</Field>
      <Field label="Report calls">{yesNo(c.canReportCalls)}</Field>
      <Field label="Reported SIM count">{c.reportedSimCount === null ? null : formatNumber(c.reportedSimCount)}</Field>
      <Field label="Encrypted message delivery">{yesNo(c.supportsEncryptedFcmSmsV1)}</Field>
    </FieldList>
  );
}
