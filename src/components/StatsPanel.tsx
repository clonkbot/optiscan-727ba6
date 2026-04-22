interface Stats {
  totalScanned: number;
  oversoldCount: number;
  avgProfitMargin: number;
  avgRSI: number;
  symbolsScanned: number;
  lastScanTime: number | null;
}

interface StatsPanelProps {
  stats: Stats | undefined;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return "—";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const statItems = [
    {
      label: "Scanned",
      value: stats?.totalScanned ?? "—",
      subtext: "contracts"
    },
    {
      label: "Oversold",
      value: stats?.oversoldCount ?? "—",
      subtext: "RSI < 30",
      highlight: true
    },
    {
      label: "Avg Margin",
      value: stats?.avgProfitMargin !== undefined ? `${stats.avgProfitMargin > 0 ? "+" : ""}${stats.avgProfitMargin}%` : "—",
      subtext: "potential"
    },
    {
      label: "Avg RSI",
      value: stats?.avgRSI ?? "—",
      subtext: "oversold avg"
    },
    {
      label: "Symbols",
      value: stats?.symbolsScanned ?? "—",
      subtext: "tracked"
    },
    {
      label: "Last Scan",
      value: formatTime(stats?.lastScanTime ?? null),
      subtext: "today"
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="p-4 rounded-lg border border-neutral-100 bg-neutral-50/50"
        >
          <p className="text-xs text-neutral-500 uppercase tracking-wide mb-1">{item.label}</p>
          <p className={`text-xl font-medium tabular-nums ${item.highlight ? "text-emerald-600" : "text-neutral-800"}`}>
            {item.value}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">{item.subtext}</p>
        </div>
      ))}
    </div>
  );
}
