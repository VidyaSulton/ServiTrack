"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { ServiceLogForm } from "@/components/forms/service-log-form";
import { showToast } from "@/components/ui/toast";
import type { ServiceLogClient } from "@/models/service-log";

export default function EditServiceLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [log, setLog] = useState<ServiceLogClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLog() {
      try {
        const res = await fetch(`/api/service-logs/${id}`);
        const json = await res.json();
        if (json.success) {
          setLog(json.data);
        } else {
          showToast("error", "Riwayat servis tidak ditemukan");
          router.push("/service-logs");
        }
      } catch {
        showToast("error", "Gagal memuat data riwayat servis");
        router.push("/service-logs");
      } finally {
        setIsLoading(false);
      }
    }
    fetchLog();
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

  if (!log) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/service-logs/${id}`}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-surface-hover rounded-sm transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <h1 className="text-[1.75rem] font-bold text-slate-100">
            Edit Riwayat Servis
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Perbarui data riwayat servis
          </p>
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-surface-card border border-outline rounded-md p-6 max-w-4xl">
        <ServiceLogForm initialData={log} />
      </div>
    </div>
  );
}
