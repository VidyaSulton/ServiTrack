import Link from "next/link";
import { VehicleForm } from "@/components/forms/vehicle-form";

/**
 * Add new vehicle page.
 * DESIGN.md Section 6.3 form page — centered card, max-width 640px.
 */
export default function NewVehiclePage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
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
            Tambah Kendaraan
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Isi data kendaraan baru Anda
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-surface-card border border-outline rounded-md p-6 max-w-[640px]">
        <VehicleForm />
      </div>
    </div>
  );
}
