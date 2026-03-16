import { useEffect, useState } from "react";
import SummaryCard from "../components/SummaryCard";

const API = import.meta.env.VITE_API_BASE;

function fmt(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(str) {
  const d = new Date(str);
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

const STATUS_STYLES = {
  PENDING: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  APPLIED: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
  DISMISSED: "bg-zinc-700/50 text-zinc-400 border border-zinc-700",
};

function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-800/60">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-5 py-4">
          <div
            className="h-4 rounded-md bg-zinc-800 animate-pulse"
            style={{ width: `${50 + ((i * 7) % 40)}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/history`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setSessions)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const latest = sessions[0] ?? null;

  const totalCashNeeded = sessions.reduce(
    (sum, s) => sum + (s.net_cash_needed ?? 0),
    0,
  );

  const cards = [
    {
      label: "Total Sessions",
      value: loading ? "—" : String(sessions.length),
      sub: "All time",
      accent: "sky",
    },
    {
      label: "Latest Portfolio Value",
      value: loading || !latest ? "—" : fmt(latest.portfolio_value),
      sub: latest ? fmtDate(latest.created_at) : "No data",
      accent: "emerald",
    },
    {
      label: "Cash Needed (Latest)",
      value: loading || !latest ? "—" : fmt(latest.net_cash_needed),
      sub:
        latest?.net_cash_needed > 0
          ? "Inflow required"
          : latest
            ? "Surplus"
            : "No data",
      accent: latest?.net_cash_needed > 0 ? "amber" : "emerald",
    },
  ];

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-8 py-6 text-center">
          <p className="text-sm font-medium text-red-400">
            Failed to load history
          </p>
          <p className="mt-1 text-xs text-zinc-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
          Portfolio Management
        </p>
        <h1 className="text-xl font-semibold text-white">Rebalance History</h1>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <SummaryCard key={c.label} {...c} />
        ))}
      </div>

      {/* History Table */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">Session Log</h2>
          {!loading && (
            <span className="text-xs text-zinc-500">
              {sessions.length} sessions
            </span>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {[
                    "Date",
                    "Portfolio Value",
                    "Total Buy",
                    "Total Sell",
                    "Cash Needed",
                    "Status",
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
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : sessions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-sm text-zinc-500"
                    >
                      No rebalance sessions found.
                    </td>
                  </tr>
                ) : (
                  sessions.map((s) => (
                    <tr
                      key={s.session_id}
                      className="transition-colors hover:bg-zinc-800/40"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {fmtDate(s.created_at)}
                          </p>
                          <p className="text-xs text-zinc-500">
                            #{s.session_id}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-4 tabular-nums text-zinc-300">
                        {fmt(s.portfolio_value)}
                      </td>
                      <td className="px-5 py-4 tabular-nums text-emerald-400">
                        {fmt(s.total_to_buy)}
                      </td>
                      <td className="px-5 py-4 tabular-nums text-red-400">
                        {fmt(s.total_to_sell)}
                      </td>
                      <td className="px-5 py-4 tabular-nums font-medium text-white">
                        {fmt(s.net_cash_needed)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide ${
                            STATUS_STYLES[s.status] ?? STATUS_STYLES.DISMISSED
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && sessions.length > 0 && (
            <div className="border-t border-zinc-800 px-5 py-3 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {sessions.length} total sessions
              </span>
              <span className="text-xs text-zinc-500">
                Cumulative cash needed:{" "}
                <span className="font-semibold text-white tabular-nums">
                  {fmt(totalCashNeeded)}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
