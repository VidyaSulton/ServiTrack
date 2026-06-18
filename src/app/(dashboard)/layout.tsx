/**
 * Dashboard layout — wraps all protected pages with Sidebar + Header.
 * Will be fully implemented in Phase 2 with auth guard and navigation.
 */
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Sidebar — will be implemented in Phase 2 */}
      <aside className="hidden lg:flex w-64 flex-col bg-surface-card border-r border-outline">
        <div className="p-5 border-b border-outline">
          <h2 className="text-lg font-bold text-primary">Precision Fleet</h2>
          <p className="text-xs text-slate-500 mt-0.5">Monitoring Servis</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Kendaraan", href: "/vehicles" },
            { label: "Log Servis", href: "/service-logs" },
            { label: "Laporan", href: "/reports" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-slate-400 hover:text-slate-100 hover:bg-surface-hover transition-default"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header — will be expanded in Phase 2 */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-outline bg-surface-card">
          <h1 className="text-sm font-semibold text-slate-100">
            Sistem Monitoring Servis Kendaraan
          </h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
