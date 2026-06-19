"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { VehicleForm } from "@/components/forms/vehicle-form";
import { showToast } from "@/components/ui/toast";
import type { VehicleClient } from "@/models/vehicle";

/**
 * Edit vehicle page — pre-fills form with existing vehicle data.
 */
export default function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVehicle() {
      try {
        const res = await fetch(`/api/vehicles/${id}`);
        const json = await res.json();
        if (json.success) {
          setVehicle(json.data);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/vehicles/${id}`}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-surface-hover rounded-sm transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-[1.75rem] font-bold text-slate-100">
            Edit Kendaraan
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {vehicle.brand} {vehicle.model} — {vehicle.plateNumber}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-surface-card border border-outline rounded-md p-6 max-w-[640px]">
        <VehicleForm initialData={vehicle} />
      </div>
    </div>
  );
}
