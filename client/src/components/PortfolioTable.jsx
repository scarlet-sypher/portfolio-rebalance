const ACTION_STYLES = {
  BUY: {
    badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    row: "hover:bg-emerald-500/[0.03]",
  },
  SELL: {
    badge: "bg-red-500/10 text-red-400 border border-red-500/20",
    row: "hover:bg-red-500/[0.03]",
  },
  REVIEW: {
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    row: "hover:bg-amber-500/[0.03]",
  },
  HOLD: {
    badge: "bg-zinc-700/50 text-zinc-400 border border-zinc-700",
    row: "hover:bg-zinc-800/40",
  },
};

function DriftBar({ drift }) {
  if (drift === null) return <span className="text-zinc-600">—</span>;
  const clamped = Math.min(Math.abs(drift), 20);
  const pct = (clamped / 20) * 100;
  const isPositive = drift >= 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${isPositive ? "bg-emerald-500" : "bg-red-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={`text-sm tabular-nums ${isPositive ? "text-emerald-400" : "text-red-400"}`}
      >
        {isPositive ? "+" : ""}
        {drift.toFixed(2)}%
      </span>
    </div>
  );
}

function fmt(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function PortfolioTable({ items }) {
  if (!items?.length) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-10 text-center text-sm text-zinc-500">
        No rebalance data available.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {[
                "Fund",
                "Target %",
                "Current %",
                "Drift",
                "Action",
                "Amount",
              ].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-5 py-3 text-left text-xs font-medium uppercase tracking-widest text-zinc-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {items.map((item) => {
              const styles = ACTION_STYLES[item.action] || ACTION_STYLES.HOLD;
              return (
                <tr
                  key={item.fund_id}
                  className={`transition-colors ${styles.row}`}
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-white">{item.fund_name}</p>
                      <p className="text-xs text-zinc-500">{item.fund_id}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 tabular-nums text-zinc-300">
                    {item.target_pct !== null ? (
                      `${item.target_pct}%`
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 tabular-nums text-zinc-300">
                    {item.current_pct}%
                  </td>
                  <td className="px-5 py-4">
                    <DriftBar drift={item.drift} />
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${styles.badge}`}
                    >
                      {item.action}
                    </span>
                  </td>
                  <td className="px-5 py-4 tabular-nums font-medium text-white">
                    {fmt(item.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
