"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MonthlyCostChart, ServiceDistributionChart } from "@/components/dashboard/dashboard-charts";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { ServiceLogClient } from "@/models/service-log";
import { showToast } from "@/components/ui/toast";

interface DashboardData {
  stats: {
    totalVehicles: number;
    totalServiceLogs: number;
    totalCost: number;
  };
  monthlyCostTrend: { month: string; cost: number }[];
  serviceDistribution: { name: string; value: number }[];
  recentLogs: ServiceLogClient[];
  upcomingReminders: ServiceLogClient[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        showToast("error", json.error || "Gagal memuat data dashboard");
      }
    } catch {
      showToast("error", "Gagal memuat data dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!data) return null;

  const statusColors: Record<string, "success" | "warning" | "info"> = {
    completed: "success",
    scheduled: "warning",
    in_progress: "info",
  };

  const statusLabels: Record<string, string> = {
    completed: "Selesai",
    scheduled: "Dijadwalkan",
    in_progress: "Diproses",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Ringkasan analitik dan aktivitas kendaraan Anda
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-card border border-outline rounded-md p-5 flex flex-col justify-center transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,229,255,0.1)]">
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Total Kendaraan</p>
          <p className="text-[2.25rem] font-bold text-slate-100 mt-1">{data.stats.totalVehicles}</p>
        </div>
        <div className="bg-surface-card border border-outline rounded-md p-5 flex flex-col justify-center transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,229,255,0.1)]">
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Total Servis Dilakukan</p>
          <p className="text-[2.25rem] font-bold text-slate-100 mt-1">{data.stats.totalServiceLogs}</p>
        </div>
        <div className="bg-surface-card border border-outline rounded-md p-5 flex flex-col justify-center transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,229,255,0.1)]">
          <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">Total Pengeluaran</p>
          <p className="text-[2.25rem] font-bold text-primary mt-1">Rp {data.stats.totalCost.toLocaleString("id-ID")}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trend Chart */}
        <div className="bg-surface-card border border-outline rounded-md p-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Tren Pengeluaran</h2>
          <MonthlyCostChart data={data.monthlyCostTrend} />
        </div>

        {/* Distribution Chart */}
        <div className="bg-surface-card border border-outline rounded-md p-5">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">Distribusi Jenis Servis</h2>
          <ServiceDistributionChart data={data.serviceDistribution} />
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Service Logs */}
        <div className="bg-surface-card border border-outline rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-outline flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Servis Terbaru</h2>
            <Link href="/service-logs" className="text-sm text-primary hover:underline">Lihat Semua</Link>
          </div>
          {data.recentLogs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Belum ada riwayat servis.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y divide-outline">
                  {data.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-100">{log.vehicle?.plateNumber || "—"}</p>
                        <p className="text-xs text-slate-400">{formatDate(log.serviceDate)}</p>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <p className="text-sm font-medium text-slate-100">Rp {log.totalCost.toLocaleString("id-ID")}</p>
                        <Badge variant={statusColors[log.status] ?? "default"} className="mt-1">
                          {statusLabels[log.status] ?? log.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Reminders */}
        <div className="bg-surface-card border border-outline rounded-md overflow-hidden">
          <div className="px-5 py-4 border-b border-outline flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Pengingat Servis</h2>
          </div>
          {data.upcomingReminders.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Tidak ada pengingat servis dalam waktu dekat.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="divide-y divide-outline">
                  {data.upcomingReminders.map((log) => {
                    const nextDate = new Date(log.nextServiceDate!);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const isOverdue = nextDate < today;

                    return (
                      <tr key={`reminder-${log.id}`} className="hover:bg-surface-hover transition-colors">
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-100">{log.vehicle?.plateNumber || "—"}</p>
                          <p className="text-xs text-slate-400">{log.vehicle?.brand} {log.vehicle?.model}</p>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <p className={`text-sm font-bold ${isOverdue ? "text-rose-500" : "text-amber-500"}`}>
                            {formatDate(log.nextServiceDate!)}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {isOverdue ? "Terlewat!" : "Segera"}
                          </p>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
