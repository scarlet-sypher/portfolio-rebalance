import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE;

function fmt(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function SkeletonRow() {
  return (
    <tr className="border-b border-zinc-800/60">
      {[1, 2, 3].map((i) => (
        <td key={i} className="px-5 py-4">
          <div
            className="h-4 rounded-md bg-zinc-800 animate-pulse"
            style={{ width: `${60 + i * 10}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function Holdings() {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/holdings`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setHoldings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const portfolioTotal = holdings.reduce((sum, h) => sum + h.current_value, 0);

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-8 py-6 text-center">
          <p className="text-sm font-medium text-red-400">
            Failed to load holdings
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
        <h1 className="text-xl font-semibold text-white">
          Current Investments
        </h1>
      </div>

      {/* Summary Card */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all duration-200 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-500">
            Total Portfolio Value
          </p>
          {loading ? (
            <div className="h-8 w-32 rounded-md bg-zinc-800 animate-pulse" />
          ) : (
            <p className="text-2xl font-semibold tabular-nums text-white">
              {fmt(portfolioTotal)}
            </p>
          )}
          <span className="mt-2 inline-block rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-400">
            {loading ? "—" : `${holdings.length} funds`}
          </span>
        </div>
      </div>

      {/* Table */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">
            Holdings Breakdown
          </h2>
          {!loading && (
            <span className="text-xs text-zinc-500">
              {holdings.length} positions
            </span>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800">
                  {["Fund Name", "Fund ID", "Current Value"].map((h) => (
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
                ) : holdings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-10 text-center text-sm text-zinc-500"
                    >
                      No holdings found.
                    </td>
                  </tr>
                ) : (
                  holdings.map((h) => {
                    const pct = portfolioTotal
                      ? ((h.current_value / portfolioTotal) * 100).toFixed(1)
                      : "0.0";
                    return (
                      <tr
                        key={h.holding_id}
                        className="transition-colors hover:bg-zinc-800/40"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-white">
                              {h.fund_name}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="h-1 w-24 overflow-hidden rounded-full bg-zinc-800">
                                <div
                                  className="h-full rounded-full bg-sky-500 transition-all"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-xs text-zinc-500">
                                {pct}%
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full border border-zinc-700 bg-zinc-800/60 px-2.5 py-1 text-xs font-mono font-medium text-zinc-400">
                            {h.fund_id}
                          </span>
                        </td>
                        <td className="px-5 py-4 tabular-nums font-semibold text-white">
                          {fmt(h.current_value)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {!loading && holdings.length > 0 && (
            <div className="border-t border-zinc-800 px-5 py-3 flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {holdings.length} total positions
              </span>
              <span className="text-sm font-semibold tabular-nums text-white">
                {fmt(portfolioTotal)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
