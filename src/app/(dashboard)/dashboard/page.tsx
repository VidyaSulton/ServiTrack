/**
 * Dashboard page — will be fully implemented in Phase 5.
 * Shows stats cards, charts, recent logs, and upcoming service reminders.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-[1.75rem] font-bold text-slate-100">Dashboard</h1>
      <p className="text-slate-400 text-sm">
        Dashboard akan diimplementasikan di Fase 5.
      </p>

      {/* Stats Cards Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: "Total Kendaraan", value: "—" },
          { label: "Servis Bulan Ini", value: "—" },
          { label: "Total Pengeluaran", value: "—" },
          { label: "Servis Mendatang", value: "—" },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-surface-card border border-outline rounded-md p-5"
          >
            <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">
              {card.label}
            </p>
            <p className="text-[2.25rem] font-bold text-slate-100 mt-1">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
