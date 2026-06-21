"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDeleteModal } from "@/components/ui/modal";
import { showToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { ServiceLogClient } from "@/models/service-log";

export default function ServiceLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<ServiceLogClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ServiceLogClient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/service-logs");
      const json = await res.json();
      if (json.success) {
        setLogs(json.data);
      }
    } catch {
      showToast("error", "Gagal memuat daftar riwayat servis");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/service-logs/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Riwayat servis berhasil dihapus");
        setLogs((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      } else {
        showToast("error", json.error || "Gagal menghapus riwayat servis");
      }
    } catch {
      showToast("error", "Gagal menghapus riwayat servis");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

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

  const serviceTypeLabels: Record<string, string> = {
    oil_change: "Ganti Oli",
    tire_rotation: "Rotasi Ban",
    brake_service: "Servis Rem",
    engine_tune: "Tune Up Mesin",
    transmission: "Transmisi",
    cooling_system: "Sistem Pendingin",
    electrical: "Kelistrikan",
    body_repair: "Perbaikan Bodi",
    general_checkup: "Pemeriksaan Umum",
    other: "Lainnya",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-slate-100">
            Riwayat Servis
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Kelola semua riwayat servis kendaraan Anda
          </p>
        </div>
        <Link href="/service-logs/new">
          <Button>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah Servis
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="bg-surface-card border border-outline rounded-md">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
              </svg>
            }
            title="Belum ada riwayat servis"
            description="Catat riwayat servis pertama Anda untuk memantau pengeluaran."
            actionLabel="Tambah Servis"
            actionHref="/service-logs/new"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-input">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Tanggal
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Kendaraan
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Jenis Servis
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                    Total Biaya
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-outline hover:bg-surface-hover transition-colors cursor-pointer"
                    onClick={() => router.push(`/service-logs/${log.id}`)}
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-slate-100">
                        {formatDate(log.serviceDate)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {log.vehicle ? (
                        <div>
                          <p className="text-sm font-medium text-slate-100">{log.vehicle.plateNumber}</p>
                          <p className="text-xs text-slate-400">{log.vehicle.brand} {log.vehicle.model}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-100">
                        {serviceTypeLabels[log.serviceType] ?? log.serviceType}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <Badge variant={statusColors[log.status] ?? "default"}>
                        {statusLabels[log.status] ?? log.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-100 font-medium">
                        Rp {log.totalCost.toLocaleString("id-ID")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/service-logs/${log.id}/edit`}>
                          <button className="p-2 text-slate-400 hover:text-primary hover:bg-surface-hover rounded-sm transition-all cursor-pointer">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(log)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-surface-hover rounded-sm transition-all cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Hapus Riwayat Servis?"
        description="Riwayat servis ini akan dihapus secara permanen dan tidak dapat dikembalikan."
      />
    </div>
  );
}
