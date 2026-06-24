export default function PlaceholderPage({ title }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-800">{title}</h1>
      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-400">
        This section isn't built yet — coming in a later phase.
      </div>
    </div>
  );
}