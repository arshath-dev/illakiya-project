export type Severity = "No_DR" | "Mild" | "Moderate" | "Severe" | "Proliferative";

const severityConfig: Record<Severity, { label: string; bg: string; text: string }> = {
  No_DR: { label: "No DR", bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-300" },
  Mild: { label: "Mild", bg: "bg-yellow-100 dark:bg-yellow-900/40", text: "text-yellow-700 dark:text-yellow-300" },
  Moderate: { label: "Moderate", bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300" },
  Severe: { label: "Severe", bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300" },
  Proliferative: { label: "Proliferative", bg: "bg-red-200 dark:bg-red-900/60", text: "text-red-900 dark:text-red-200" },
};

export function SeverityBadge({ severity, size = "sm" }: { severity: Severity; size?: "sm" | "lg" }) {
  const config = severityConfig[severity];
  const sizeClasses = size === "lg" ? "px-4 py-2 text-base" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex items-center rounded-full ${sizeClasses} ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
