export default function SummaryCard({ label, value, sub, accent = "emerald" }) {
  const accents = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    red: "text-red-400 bg-red-500/10 border-red-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  };

  return (
    <div className="group relative rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all duration-200 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20">
      <p className="mb-3 text-xs font-medium uppercase tracking-widest text-zinc-500">
        {label}
      </p>
      <p className="text-2xl font-semibold tabular-nums text-white">{value}</p>
      {sub && (
        <span
          className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${accents[accent]}`}
        >
          {sub}
        </span>
      )}
    </div>
  );
}
