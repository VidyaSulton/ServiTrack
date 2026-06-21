"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteModal } from "@/components/ui/modal";
import { showToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import type { ServiceLogClient } from "@/models/service-log";
import type { VehicleClient } from "@/models/vehicle";

export default function ServiceLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [log, setLog] = useState<ServiceLogClient | null>(null);
  const [vehicle, setVehicle] = useState<VehicleClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const resLog = await fetch(`/api/service-logs/${id}`);
        const jsonLog = await resLog.json();
        
        if (jsonLog.success) {
          setLog(jsonLog.data);
          // Fetch vehicle data
          const resVeh = await fetch(`/api/vehicles/${jsonLog.data.vehicleId}`);
          const jsonVeh = await resVeh.json();
          if (jsonVeh.success) {
            setVehicle(jsonVeh.data);
          }
        } else {
          showToast("error", "Riwayat servis tidak ditemukan");
          router.push("/service-logs");
        }
      } catch {
        showToast("error", "Gagal memuat data");
        router.push("/service-logs");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id, router]);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/service-logs/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Riwayat servis berhasil dihapus");
        router.push("/service-logs");
      } else {
        showToast("error", json.error || "Gagal menghapus riwayat servis");
      }
    } catch {
      showToast("error", "Gagal menghapus riwayat servis");
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  }

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

  if (!log) return null;

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

  const itemCategoryLabels: Record<string, string> = {
    part: "Spare Part",
    labor: "Jasa",
    fluid: "Cairan/Oli",
    other: "Lainnya",
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/service-logs"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-surface-hover rounded-sm transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-[1.75rem] font-bold text-slate-100">
              Detail Servis
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {formatDate(log.serviceDate)} — {serviceTypeLabels[log.serviceType] ?? log.serviceType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/service-logs/${id}/edit`}>
            <Button variant="secondary" size="sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
              </svg>
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDelete(true)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Hapus
          </Button>
        </div>
      </div>

      {/* Invoice-like Header Grid */}
      <div className="bg-surface-card border border-outline rounded-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Informasi Servis</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Tanggal:</span>
                <span className="text-slate-100">{formatDate(log.serviceDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jenis Servis:</span>
                <span className="text-slate-100">{serviceTypeLabels[log.serviceType] ?? log.serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <Badge variant={statusColors[log.status] ?? "default"}>
                  {statusLabels[log.status] ?? log.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Odometer:</span>
                <span className="text-slate-100">{log.odometer.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bengkel:</span>
                <span className="text-slate-100">{log.workshopName || "—"}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Kendaraan</h3>
            {vehicle ? (
              <div className="p-4 bg-surface-input border border-outline rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-100">{vehicle.plateNumber}</span>
                  <Link href={`/vehicles/${vehicle.id}`} className="text-xs text-primary hover:underline">
                    Lihat Kendaraan
                  </Link>
                </div>
                <p className="text-sm text-slate-400">{vehicle.brand} {vehicle.model} ({vehicle.year})</p>
                <p className="text-sm text-slate-400">{vehicle.color}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Memuat kendaraan...</p>
            )}

            <div className="mt-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Pengingat Servis Berikutnya</h3>
              <div className="text-sm text-slate-100">
                {log.nextServiceDate ? formatDate(log.nextServiceDate) : "—"} 
                {log.nextServiceOdometer ? ` / ${log.nextServiceOdometer.toLocaleString()} km` : ""}
              </div>
            </div>
          </div>
        </div>

        {log.mechanicNotes && (
          <div className="mt-6 pt-6 border-t border-outline">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Catatan Mekanik / Keluhan</h3>
            <p className="text-sm text-slate-300">{log.mechanicNotes}</p>
          </div>
        )}
      </div>

      {/* Service Items Table */}
      <div className="bg-surface-card border border-outline rounded-md overflow-hidden">
        <div className="px-5 py-4 border-b border-outline">
          <h2 className="text-lg font-semibold text-slate-100">
            Rincian Biaya
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-input">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Item</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kategori</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Qty</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Harga Satuan</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline">
              {log.serviceItems.map((item, idx) => (
                <tr key={idx} className="hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-4 text-sm text-slate-100">{item.name}</td>
                  <td className="px-5 py-4 text-sm text-slate-400">{itemCategoryLabels[item.category] ?? item.category}</td>
                  <td className="px-5 py-4 text-sm text-slate-100 text-center">{item.quantity}</td>
                  <td className="px-5 py-4 text-sm text-slate-100 text-right">Rp {item.unitPrice.toLocaleString("id-ID")}</td>
                  <td className="px-5 py-4 text-sm text-slate-100 text-right font-medium">Rp {item.subtotal.toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-surface-input border-t border-outline">
                <td colSpan={4} className="px-5 py-4 text-sm font-bold text-slate-400 text-right uppercase tracking-wide">
                  Total Biaya
                </td>
                <td className="px-5 py-4 text-lg font-bold text-primary text-right">
                  Rp {log.totalCost.toLocaleString("id-ID")}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Hapus Riwayat Servis?"
        description="Riwayat servis ini akan dihapus secara permanen dan tidak dapat dikembalikan."
      />
    </div>
  );
}
