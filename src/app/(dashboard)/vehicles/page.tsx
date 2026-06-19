"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmDeleteModal } from "@/components/ui/modal";
import { showToast } from "@/components/ui/toast";
import {
  formatVehicleType,
  formatFuelType,
} from "@/lib/utils";
import type { VehicleClient } from "@/models/vehicle";

/**
 * Vehicles list page — displays all user vehicles in a responsive data table.
 * Supports delete with confirmation modal and cascade delete.
 * DESIGN.md Section 6.3 CRUD list page layout.
 */
export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<VehicleClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<VehicleClient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/vehicles");
      const json = await res.json();
      if (json.success) {
        setVehicles(json.data);
      }
    } catch {
      showToast("error", "Gagal memuat data kendaraan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/vehicles/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", "Kendaraan berhasil dihapus");
        setVehicles((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      } else {
        showToast("error", json.error || "Gagal menghapus kendaraan");
      }
    } catch {
      showToast("error", "Gagal menghapus kendaraan");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  }

  const vehicleTypeColors: Record<string, "info" | "success" | "warning" | "danger"> = {
    car: "info",
    motorcycle: "success",
    truck: "warning",
    van: "danger",
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.75rem] font-bold text-slate-100">
            Kendaraan
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Kelola semua kendaraan Anda
          </p>
        </div>
        <Link href="/vehicles/new">
          <Button>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Tambah Kendaraan
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="bg-surface-card border border-outline rounded-md">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0H18.75M5.25 14.25h13.5m-13.5 0l-.905-5.43A1.125 1.125 0 015.457 7.5h13.086a1.125 1.125 0 011.112 1.32l-.905 5.43" />
              </svg>
            }
            title="Belum ada kendaraan"
            description="Tambahkan kendaraan pertama Anda untuk mulai memantau servis."
            actionLabel="Tambah Kendaraan"
            actionHref="/vehicles/new"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-input">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Plat Nomor
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Kendaraan
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                    Tipe
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                    Bahan Bakar
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">
                    Tahun
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="border-t border-outline hover:bg-surface-hover transition-colors cursor-pointer"
                    onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-slate-100">
                        {vehicle.plateNumber}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm text-slate-100">
                          {vehicle.brand} {vehicle.model}
                        </p>
                        <p className="text-xs text-slate-500">{vehicle.color}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <Badge variant={vehicleTypeColors[vehicle.type] ?? "default"}>
                        {formatVehicleType(vehicle.type)}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-400">
                        {formatFuelType(vehicle.fuelType)}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-400">
                        {vehicle.year}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div
                        className="flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/vehicles/${vehicle.id}/edit`}>
                          <button className="p-2 text-slate-400 hover:text-primary hover:bg-surface-hover rounded-sm transition-all cursor-pointer">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(vehicle)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Hapus Kendaraan?"
        description={`Kendaraan ${deleteTarget?.plateNumber ?? ""} (${deleteTarget?.brand ?? ""} ${deleteTarget?.model ?? ""}) dan semua log servis terkait akan dihapus secara permanen.`}
      />
    </div>
  );
}
