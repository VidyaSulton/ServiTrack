"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDeleteModal } from "@/components/ui/modal";
import { showToast } from "@/components/ui/toast";
import {
  formatVehicleType,
  formatFuelType,
  formatDate,
} from "@/lib/utils";
import type { VehicleClient } from "@/models/vehicle";
import type { ServiceLogClient } from "@/models/service-log";

/**
 * Vehicle detail page — shows vehicle info and service log history.
 * DESIGN.md Section 6.3 detail page — info grid (2 columns) + service history table.
 */
export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleClient | null>(null);
  const [serviceLogs, setServiceLogs] = useState<ServiceLogClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  useEffect(() => {
    async function fetchVehicle() {
      try {
        const res = await fetch(`/api/vehicles/${id}`);
        const json = await res.json();
        if (json.success) {
          setVehicle(json.data);
          // Fetch associated service logs
          const resLogs = await fetch(`/api/service-logs?vehicleId=${id}`);
          const jsonLogs = await resLogs.json();
          if (jsonLogs.success) {
            setServiceLogs(jsonLogs.data);
          }
        } else {
          showToast("error", "Kendaraan tidak ditemukan");
          router.push("/vehicles");
        }
      } catch {
        showToast("error", "Gagal memuat data kendaraan");
        router.push("/vehicles");
      } finally {
        setIsLoading(false);
      }
    }
    fetchVehicle();
  }, [id, router]);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Kendaraan berhasil dihapus");
        router.push("/vehicles");
      } else {
        showToast("error", json.error || "Gagal menghapus kendaraan");
      }
    } catch {
      showToast("error", "Gagal menghapus kendaraan");
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

  if (!vehicle) return null;

  const transmissionLabels: Record<string, string> = {
    manual: "Manual",
    automatic: "Otomatis",
  };

  const infoItems = [
    { label: "Nomor Plat", value: vehicle.plateNumber },
    { label: "Merek", value: vehicle.brand },
    { label: "Model", value: vehicle.model },
    { label: "Tahun", value: vehicle.year.toString() },
    { label: "Warna", value: vehicle.color },
    { label: "Tipe", value: formatVehicleType(vehicle.type) },
    { label: "Bahan Bakar", value: formatFuelType(vehicle.fuelType) },
    {
      label: "Transmisi",
      value: vehicle.transmission
        ? transmissionLabels[vehicle.transmission] ?? vehicle.transmission
        : "—",
    },
    {
      label: "Kapasitas Mesin",
      value: vehicle.engineCapacity || "—",
    },
    {
      label: "Terdaftar Sejak",
      value: formatDate(vehicle.createdAt),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/vehicles"
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-surface-hover rounded-sm transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>
          <div>
            <h1 className="text-[1.75rem] font-bold text-slate-100">
              {vehicle.brand} {vehicle.model}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {vehicle.plateNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/vehicles/${id}/edit`}>
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

      {/* Vehicle Info Card */}
      <div className="bg-surface-card border border-outline rounded-md">
        <div className="px-5 py-4 border-b border-outline">
          <h2 className="text-[1.375rem] font-semibold text-slate-100">
            Informasi Kendaraan
          </h2>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {infoItems.map((item) => (
            <div key={item.label}>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {item.label}
              </p>
              <p className="text-sm text-slate-100 mt-1">{item.value}</p>
            </div>
          ))}
        </div>
        {vehicle.notes && (
          <div className="px-5 pb-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Catatan
            </p>
            <p className="text-sm text-slate-400 mt-1">{vehicle.notes}</p>
          </div>
        )}
      </div>

      {/* Service Log History */}
      <div className="bg-surface-card border border-outline rounded-md">
        <div className="px-5 py-4 border-b border-outline flex items-center justify-between">
          <h2 className="text-[1.375rem] font-semibold text-slate-100">
            Riwayat Servis
          </h2>
          <Link href={`/service-logs/new?vehicleId=${id}`}>
            <Button size="sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah Servis
            </Button>
          </Link>
        </div>
        {serviceLogs.length === 0 ? (
          <div className="p-5">
            <p className="text-sm text-slate-500 text-center py-8">
              Belum ada riwayat servis untuk kendaraan ini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-input">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tanggal</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Jenis Servis</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Odometer</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {serviceLogs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="hover:bg-surface-hover transition-colors cursor-pointer"
                    onClick={() => router.push(`/service-logs/${log.id}`)}
                  >
                    <td className="px-5 py-4 text-sm text-slate-100">{formatDate(log.serviceDate)}</td>
                    <td className="px-5 py-4 text-sm text-slate-100">{serviceTypeLabels[log.serviceType] ?? log.serviceType}</td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <Badge variant={statusColors[log.status] ?? "default"}>
                        {statusLabels[log.status] ?? log.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400 hidden sm:table-cell">{log.odometer.toLocaleString()} km</td>
                    <td className="px-5 py-4 text-sm font-medium text-slate-100 text-right">Rp {log.totalCost.toLocaleString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Hapus Kendaraan?"
        description={`Kendaraan ${vehicle.plateNumber} (${vehicle.brand} ${vehicle.model}) dan semua log servis terkait akan dihapus secara permanen.`}
      />
    </div>
  );
}
