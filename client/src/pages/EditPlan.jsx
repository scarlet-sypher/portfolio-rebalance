import { useEffect, useState } from "react";
import SummaryCard from "../components/SummaryCard";

const API = import.meta.env.VITE_API_BASE;

export default function EditPlan() {
  const [funds, setFunds] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // "success" | "error"

  useEffect(() => {
    fetch(`${API}/comparison`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const modelFunds = data.items.filter((i) => i.is_model_fund);
        setFunds(modelFunds);
        const init = {};
        for (const f of modelFunds) {
          init[f.fund_id] = f.target_pct !== null ? String(f.target_pct) : "0";
        }
        setAllocations(init);
      })
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const total = funds.reduce((sum, f) => {
    const val = parseFloat(allocations[f.fund_id] ?? "0");
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const isValid = Math.abs(total - 100) < 0.001;

  function handleChange(fundId, raw) {
    setSaveStatus(null);
    setAllocations((prev) => ({ ...prev, [fundId]: raw }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    setSaving(true);
    setSaveStatus(null);
    try {
      const body = funds.map((f) => ({
        fund_id: f.fund_id,
        allocation_pct: parseFloat(allocations[f.fund_id]),
      }));
      const r = await fetch(`${API}/model`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setSaveStatus("success");
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  }

  const totalAccent = total === 100 ? "emerald" : total > 100 ? "red" : "amber";

  const summaryCard = {
    label: "Total Allocation",
    value: `${isNaN(total) ? 0 : total.toFixed(1)}%`,
    sub:
      total === 100
        ? "Ready to save"
        : total > 100
          ? "Over by " + (total - 100).toFixed(1) + "%"
          : (100 - total).toFixed(1) + "% remaining",
    accent: totalAccent,
  };

  if (fetchError) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-8 py-6 text-center">
          <p className="text-sm font-medium text-red-400">
            Failed to load model portfolio
          </p>
          <p className="mt-1 text-xs text-zinc-500">{fetchError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Page Header */}
      <div className="mb-2">
        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500">
          Portfolio Management
        </p>
        <h1 className="text-xl font-semibold text-white">
          Edit Model Portfolio
        </h1>
      </div>
      <p className="mb-8 text-sm text-zinc-500">
        Adjust allocation percentages. Total must equal exactly 100%.
      </p>

      {/* Summary Card */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard {...summaryCard} />
      </div>

      {/* Form */}
      {loading ? (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-zinc-800/60 px-5 py-4 last:border-0"
            >
              <div className="h-4 w-48 rounded-md bg-zinc-800 animate-pulse" />
              <div className="h-9 w-24 rounded-lg bg-zinc-800 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            {/* Column headers */}
            <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
              <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                Fund Name
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                Allocation %
              </span>
            </div>

            {funds.map((f, idx) => {
              const val = allocations[f.fund_id] ?? "";
              const num = parseFloat(val);
              const hasError = !isNaN(num) && (num < 0 || num > 100);
              return (
                <div
                  key={f.fund_id}
                  className={`flex items-center justify-between gap-4 border-b border-zinc-800/60 px-5 py-4 transition-colors last:border-0 hover:bg-zinc-800/30`}
                >
                  <div>
                    <p className="font-medium text-white">{f.fund_name}</p>
                    <p className="text-xs text-zinc-500">{f.fund_id}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={val}
                        onChange={(e) =>
                          handleChange(f.fund_id, e.target.value)
                        }
                        className={`w-24 rounded-lg border bg-zinc-800 px-3 py-2 text-right text-sm font-semibold tabular-nums text-white outline-none transition-all focus:ring-2 ${
                          hasError
                            ? "border-red-500/50 focus:ring-red-500/30"
                            : "border-zinc-700 focus:border-zinc-500 focus:ring-zinc-500/20"
                        } [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                        %
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Total row */}
            <div
              className={`flex items-center justify-between px-5 py-3 border-t ${
                isValid
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-amber-500/20 bg-amber-500/5"
              }`}
            >
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Total
              </span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  isValid
                    ? "text-emerald-400"
                    : total > 100
                      ? "text-red-400"
                      : "text-amber-400"
                }`}
              >
                {total.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Validation message */}
          {!isValid && funds.length > 0 && (
            <p className="mt-3 text-xs font-medium text-amber-400">
              {total > 100
                ? `Total exceeds 100% by ${(total - 100).toFixed(1)}%. Please reduce allocations.`
                : `Total is ${(100 - total).toFixed(1)}% short of 100%. Please increase allocations.`}
            </p>
          )}

          {/* Save status */}
          {saveStatus === "success" && (
            <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <p className="text-sm font-medium text-emerald-400">
                Model portfolio updated successfully.
              </p>
            </div>
          )}
          {saveStatus === "error" && (
            <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3">
              <p className="text-sm font-medium text-red-400">
                Failed to save. Please try again.
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={!isValid || saving}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-all hover:bg-emerald-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-900/40 border-t-zinc-900" />
                  Saving…
                </>
              ) : (
                "Save Model Portfolio"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
