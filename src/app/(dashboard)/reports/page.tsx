"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import { exportToExcel, exportToPDF } from "@/lib/export-utils";
import type { ServiceLogClient } from "@/models/service-log";

interface VehicleOption {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
}

interface ReportData {
  logs: ServiceLogClient[];
  userName: string;
  summary: {
    totalCost: number;
    totalServices: number;
  };
}

export default function ReportsPage() {
  const currentYear = new Date().getFullYear();
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Generate year options: 3 years back, 3 years forward from current year
  const yearOptions = Array.from({ length: 7 }, (_, i) => (currentYear - 3 + i).toString());

  const monthOptions = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  // Fetch vehicles for filter dropdown
  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await fetch("/api/vehicles");
        const json = await res.json();
        if (json.success) {
          setVehicles(
            json.data.map((v: any) => ({
              id: v.id,
              plateNumber: v.plateNumber,
              brand: v.brand,
              model: v.model,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch vehicles for reports:", err);
      }
    }
    fetchVehicles();
  }, []);

  // Fetch reports data based on filters
  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedYear) params.append("year", selectedYear);
      if (selectedMonth) params.append("month", selectedMonth);
      if (selectedVehicle) params.append("vehicleId", selectedVehicle);

      const res = await fetch(`/api/reports?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setReportData(json.data);
      } else {
        showToast("error", json.error || "Gagal memuat laporan");
      }
    } catch {
      showToast("error", "Gagal memuat laporan");
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth, selectedVehicle]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

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

  const getPeriodName = () => {
    let period = selectedYear;
    if (selectedMonth) {
      const monthObj = monthOptions.find((m) => m.value === selectedMonth);
      period = `${monthObj?.label} ${selectedYear}`;
    }
    if (selectedVehicle) {
      const vehicleObj = vehicles.find((v) => v.id === selectedVehicle);
      if (vehicleObj) {
        period += ` - ${vehicleObj.plateNumber} (${vehicleObj.brand})`;
      }
    }
    return period;
  };

  const handleExportExcel = () => {
    if (!reportData || reportData.logs.length === 0) return;
    setIsExporting(true);
    try {
      const sanitizedUserName = reportData.userName.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `Laporan_Servis_${sanitizedUserName}_${getPeriodName().replace(/[^a-zA-Z0-9]/g, "_")}`;
      exportToExcel(reportData.logs, reportData.summary, reportData.userName, filename);
      showToast("success", "Berhasil mengekspor Laporan Excel!");
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal mengekspor laporan ke Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportData || reportData.logs.length === 0) return;
    setIsExporting(true);
    try {
      const sanitizedUserName = reportData.userName.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `Laporan_Servis_${sanitizedUserName}_${getPeriodName().replace(/[^a-zA-Z0-9]/g, "_")}`;
      exportToPDF(reportData.logs, reportData.summary, getPeriodName(), reportData.userName, filename);
      showToast("success", "Berhasil mengekspor Laporan PDF!");
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal mengekspor laporan ke PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[1.75rem] font-bold text-slate-100">Laporan & Ekspor</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Filter riwayat servis kendaraan Anda dan ekspor ke Excel atau PDF
        </p>
      </div>

      {/* Filter Card */}
      <div className="bg-surface-card border border-outline rounded-md p-5">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Filter Laporan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Year */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-surface-input border border-outline rounded-md py-2 px-3 text-sm text-slate-200 outline-none focus:border-primary transition-colors cursor-pointer"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year} className="bg-surface-card">
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-surface-input border border-outline rounded-md py-2 px-3 text-sm text-slate-200 outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="" className="bg-surface-card">Semua Bulan</option>
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value} className="bg-surface-card">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Kendaraan</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full bg-surface-input border border-outline rounded-md py-2 px-3 text-sm text-slate-200 outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="" className="bg-surface-card">Semua Kendaraan</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} className="bg-surface-card">
                  {v.plateNumber} — {v.brand} {v.model}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Report Summary & Actions */}
      {reportData && reportData.logs.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-5 items-stretch sm:items-center justify-between">
          <div className="flex gap-6">
            <div className="bg-surface-card border border-outline rounded-md px-5 py-3 min-w-[150px]">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Servis</p>
              <p className="text-xl font-bold text-slate-200 mt-0.5">{reportData.summary.totalServices}</p>
            </div>
            <div className="bg-surface-card border border-outline rounded-md px-5 py-3 min-w-[200px]">
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Pengeluaran</p>
              <p className="text-xl font-bold text-primary mt-0.5">Rp {reportData.summary.totalCost.toLocaleString("id-ID")}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              disabled={isExporting}
              onClick={handleExportExcel}
              className="w-full sm:w-auto"
            >
              <svg className="w-4 h-4 mr-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ekspor Excel
            </Button>
            <Button
              disabled={isExporting}
              onClick={handleExportPDF}
              className="w-full sm:w-auto"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Ekspor PDF
            </Button>
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="bg-surface-card border border-outline rounded-md">
        <div className="px-5 py-4 border-b border-outline">
          <h2 className="text-sm font-semibold text-slate-300">Preview Data Laporan</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : !reportData || reportData.logs.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">Tidak ada data untuk filter yang dipilih</p>
            <p className="text-xs text-slate-600 mt-1">Coba sesuaikan filter tahun, bulan, atau kendaraan Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-input text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-left border-b border-outline">
                  <th className="px-5 py-3">Tanggal</th>
                  <th className="px-5 py-3">Kendaraan</th>
                  <th className="px-5 py-3">Jenis Servis</th>
                  <th className="px-5 py-3">Odometer</th>
                  <th className="px-5 py-3">Bengkel</th>
                  <th className="px-5 py-3 text-right">Biaya</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline text-sm text-slate-300">
                {reportData.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-4">{formatDate(log.serviceDate)}</td>
                    <td className="px-5 py-4">
                      {log.vehicle ? (
                        <div>
                          <p className="font-semibold text-slate-200">{log.vehicle.plateNumber}</p>
                          <p className="text-xs text-slate-400">{log.vehicle.brand} {log.vehicle.model}</p>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-4">{serviceTypeLabels[log.serviceType] ?? log.serviceType}</td>
                    <td className="px-5 py-4">{log.odometer.toLocaleString()} km</td>
                    <td className="px-5 py-4">{log.workshopName || "—"}</td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-200">
                      Rp {log.totalCost.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
