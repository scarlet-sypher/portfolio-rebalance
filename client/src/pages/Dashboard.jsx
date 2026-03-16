import { useEffect, useState } from "react";
import SummaryCard from "../components/SummaryCard";
import PortfolioTable from "../components/PortfolioTable";

const API = import.meta.env.VITE_API_BASE;

function fmt(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API}/comparison`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const r = await fetch(`${API}/save`, { method: "POST" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save recommendation.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-emerald-500" />
          <p className="text-sm text-zinc-500">Loading portfolio data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-8 py-6 text-center">
          <p className="text-sm font-medium text-red-400">
            Failed to load data
          </p>
          <p className="mt-1 text-xs text-zinc-500">{error}</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: "Portfolio Value",
      value: fmt(data.portfolioTotal),
      sub: "Total AUM",
      accent: "sky",
    },
    {
      label: "Total Buy",
      value: fmt(data.totalBuy),
      sub: `${data.items.filter((i) => i.action === "BUY").length} funds`,
      accent: "emerald",
    },
    {
      label: "Total Sell",
      value: fmt(data.totalSell),
      sub: `${data.items.filter((i) => i.action === "SELL").length} funds`,
      accent: "red",
    },
    {
      label: "Net Cash Needed",
      value: fmt(data.netCashNeeded),
      sub: data.netCashNeeded > 0 ? "Inflow required" : "Surplus",
      accent: "amber",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
            Portfolio Management
          </p>
          <h1 className="text-xl font-semibold text-white">
            Rebalance Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
              Saved successfully
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-900/40 border-t-zinc-900" />
                Saving…
              </>
            ) : (
              "Save Recommendation"
            )}
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <SummaryCard key={c.label} {...c} />
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">
            Rebalance Breakdown
          </h2>
          <span className="text-xs text-zinc-500">
            {data.items.length} positions
          </span>
        </div>
        <PortfolioTable items={data.items} />
      </div>
    </div>
  );
}
