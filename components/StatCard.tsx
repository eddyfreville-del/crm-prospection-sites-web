export function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <p className="text-xs text-inkDim">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">
        {value}
        {suffix ? <span className="ml-1 text-sm font-normal text-inkDim">{suffix}</span> : null}
      </p>
    </div>
  );
}
