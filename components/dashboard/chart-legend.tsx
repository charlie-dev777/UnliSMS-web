export function ChartLegend({ items }: { items: { label: string; colorClass: string }[] }) {
  return (
    <div className="flex gap-4 text-xs text-muted-foreground">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span aria-hidden className={`size-2 rounded-[2px] ${i.colorClass}`} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
