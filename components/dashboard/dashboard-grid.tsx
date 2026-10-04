/** Headline metric cards: 4 columns, 2 below 1180px, 1 below 520px. */
export function MetricGrid({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section aria-label={label} className="grid grid-cols-1 gap-4 min-[521px]:grid-cols-2 min-[1181px]:grid-cols-4">
      {children}
    </section>
  );
}

/** Two-column row (2fr / 1fr) that stacks below 1180px. */
export function SplitRow({ children }: { children: React.ReactNode }) {
  return <section className="grid grid-cols-1 gap-4 min-[1181px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">{children}</section>;
}
