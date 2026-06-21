"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ServiceLogForm } from "@/components/forms/service-log-form";
import { Suspense } from "react";

function NewServiceLogContent() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicleId");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href={vehicleId ? `/vehicles/${vehicleId}` : "/service-logs"}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-surface-hover rounded-sm transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-[1.75rem] font-bold text-slate-100">
            Tambah Servis
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Catat riwayat servis baru
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-surface-card border border-outline rounded-md p-6 max-w-4xl">
        <ServiceLogForm preselectedVehicleId={vehicleId || undefined} />
      </div>
    </div>
  );
}

export default function NewServiceLogPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    }>
      <NewServiceLogContent />
    </Suspense>
  );
}
