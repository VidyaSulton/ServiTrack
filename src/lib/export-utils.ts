import * as XLSX from "xlsx";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { formatDate } from "./utils";
import type { ServiceLogClient } from "@/models/service-log";

// Set VFS fonts client-side only
if (typeof window !== "undefined") {
  try {
    const vfs = (pdfFonts as any)?.pdfMake?.vfs || (pdfFonts as any)?.vfs;
    if (vfs) {
      (pdfMake as any).vfs = vfs;
    } else {
      console.warn("Could not find vfs in pdfFonts");
    }
  } catch (error) {
    console.error("Failed to initialize pdfMake fonts:", error);
  }
}

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

interface ReportSummary {
  totalCost: number;
  totalServices: number;
}

/**
 * Export report data to Excel (.xlsx) format.
 */
export function exportToExcel(
  logs: ServiceLogClient[],
  summary: ReportSummary,
  userName: string,
  filename: string
) {
  // Map data to a flat structure for the spreadsheet
  const rows = logs.map((log, index) => ({
    "No": index + 1,
    "Tanggal Servis": formatDate(log.serviceDate),
    "Plat Nomor": log.vehicle?.plateNumber || "—",
    "Kendaraan": log.vehicle ? `${log.vehicle.brand} ${log.vehicle.model}` : "—",
    "Jenis Servis": serviceTypeLabels[log.serviceType] ?? log.serviceType,
    "Odometer (km)": log.odometer,
    "Bengkel": log.workshopName || "—",
    "Total Biaya (Rp)": log.totalCost,
    "Status": log.status === "completed" ? "Selesai" : log.status === "scheduled" ? "Dijadwalkan" : "Diproses",
    "Catatan": log.mechanicNotes || ""
  }));

  // Add summary row at the end
  rows.push({
    "No": "" as any,
    "Tanggal Servis": "TOTAL" as any,
    "Plat Nomor": "" as any,
    "Kendaraan": "" as any,
    "Jenis Servis": "" as any,
    "Odometer (km)": "" as any,
    "Bengkel": "" as any,
    "Total Biaya (Rp)": summary.totalCost as any,
    "Status": "" as any,
    "Catatan": "" as any
  });

  const worksheet = XLSX.utils.json_to_sheet([]);
  
  // Add metadata headers
  XLSX.utils.sheet_add_aoa(worksheet, [
    ["LAPORAN MONITORING SERVIS KENDARAAN"],
    [`Nama Pengguna: ${userName}`],
    [`Tanggal Unduh: ${formatDate(new Date().toISOString())}`],
    []
  ], { origin: "A1" });

  // Add the JSON data starting at row 5 (A5)
  XLSX.utils.sheet_add_json(worksheet, rows, { origin: "A5" });

  // Set column widths
  const columnWidths = [
    { wch: 5 },   // No
    { wch: 15 },  // Tanggal Servis
    { wch: 15 },  // Plat Nomor
    { wch: 20 },  // Kendaraan
    { wch: 18 },  // Jenis Servis
    { wch: 15 },  // Odometer
    { wch: 20 },  // Bengkel
    { wch: 18 },  // Total Biaya
    { wch: 12 },  // Status
    { wch: 30 }   // Catatan
  ];
  worksheet["!cols"] = columnWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Servis");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export report data to PDF format.
 */
export function exportToPDF(
  logs: ServiceLogClient[],
  summary: ReportSummary,
  periodName: string,
  userName: string,
  filename: string
) {
  const docDefinition: any = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [30, 40, 30, 40],
    content: [
      { text: "ServiTrack", style: "brand" },
      { text: "LAPORAN MONITORING SERVIS KENDARAAN", style: "header" },
      { text: `Periode / Filter: ${periodName}`, style: "subheader" },
      { text: `Nama Pengguna: ${userName}`, style: "meta" },
      { text: `Total Aktivitas Servis: ${summary.totalServices}`, style: "meta" },
      { text: `Total Biaya Pengeluaran: Rp ${summary.totalCost.toLocaleString("id-ID")}`, style: "meta", margin: [0, 0, 0, 15] },

      {
        style: "tableExample",
        table: {
          headerRows: 1,
          widths: [25, 60, 65, 100, 80, 55, 90, 75, 50, "*"],
          body: [
            [
              { text: "No", style: "tableHeader" },
              { text: "Tanggal", style: "tableHeader" },
              { text: "Plat Nomor", style: "tableHeader" },
              { text: "Kendaraan", style: "tableHeader" },
              { text: "Jenis Servis", style: "tableHeader" },
              { text: "Odometer", style: "tableHeader" },
              { text: "Bengkel", style: "tableHeader" },
              { text: "Biaya", style: "tableHeader" },
              { text: "Status", style: "tableHeader" },
              { text: "Catatan", style: "tableHeader" }
            ],
            ...logs.map((log, index) => [
              { text: (index + 1).toString(), style: "tableCell" },
              { text: formatDate(log.serviceDate), style: "tableCell" },
              { text: log.vehicle?.plateNumber || "—", style: "tableCell" },
              { text: log.vehicle ? `${log.vehicle.brand} ${log.vehicle.model}` : "—", style: "tableCell" },
              { text: serviceTypeLabels[log.serviceType] ?? log.serviceType, style: "tableCell" },
              { text: `${log.odometer.toLocaleString()} km`, style: "tableCell" },
              { text: log.workshopName || "—", style: "tableCell" },
              { text: `Rp ${log.totalCost.toLocaleString("id-ID")}`, style: "tableCell" },
              { 
                text: log.status === "completed" ? "Selesai" : log.status === "scheduled" ? "Dijadwalkan" : "Diproses", 
                style: "tableCell" 
              },
              { text: log.mechanicNotes || "—", style: "tableCell" }
            ]),
            // Total Footer Row
            [
              { text: "", style: "tableFooter" },
              { text: "TOTAL", style: "tableFooter", bold: true },
              { text: "", style: "tableFooter" },
              { text: "", style: "tableFooter" },
              { text: "", style: "tableFooter" },
              { text: "", style: "tableFooter" },
              { text: "", style: "tableFooter" },
              { text: `Rp ${summary.totalCost.toLocaleString("id-ID")}`, style: "tableFooter", bold: true },
              { text: "", style: "tableFooter" },
              { text: "", style: "tableFooter" }
            ]
          ]
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length || i === node.table.body.length - 1) ? 1 : 0.5,
          vLineWidth: () => 0,
          hLineColor: (i: number, node: any) => (i === 0 || i === node.table.body.length || i === node.table.body.length - 1) ? "#0F172A" : "#E2E8F0",
          paddingLeft: () => 6,
          paddingRight: () => 6,
          paddingTop: () => 6,
          paddingBottom: () => 6,
        }
      }
    ],
    styles: {
      brand: { fontSize: 10, bold: true, color: "#00E5FF", margin: [0, 0, 0, 2] },
      header: { fontSize: 14, bold: true, color: "#0F172A", margin: [0, 0, 0, 4] },
      subheader: { fontSize: 10, color: "#475569", margin: [0, 0, 0, 10] },
      meta: { fontSize: 10, bold: true, color: "#1E293B" },
      tableHeader: { fontSize: 8, bold: true, color: "#1E293B", fillClassName: "bg-slate-100", alignment: "left" },
      tableCell: { fontSize: 8, color: "#334155" },
      tableFooter: { fontSize: 8, color: "#0F172A", fillClassName: "bg-slate-50" }
    }
  };

  pdfMake.createPdf(docDefinition).download(`${filename}.pdf`);
}
