/**
 * Utility functions for the Vehicle Service Monitoring System.
 * All formatting uses the 'id-ID' locale for Indonesian standards.
 */

/**
 * Formats a number as Indonesian Rupiah currency.
 * Example: 1500000 → "Rp 1.500.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date to Indonesian DD/MM/YYYY format.
 * Example: new Date("2024-03-15") → "15/03/2024"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/**
 * Formats a date to a more readable Indonesian format.
 * Example: new Date("2024-03-15") → "15 Maret 2024"
 */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Translates service type enum values to Bahasa Indonesia labels.
 */
const serviceTypeLabels: Record<string, string> = {
  oil_change: "Ganti Oli",
  tire_rotation: "Rotasi Ban",
  brake_service: "Servis Rem",
  engine_tune: "Tune-Up Mesin",
  transmission: "Transmisi",
  cooling_system: "Sistem Pendingin",
  electrical: "Kelistrikan",
  body_repair: "Perbaikan Bodi",
  general_checkup: "Pemeriksaan Umum",
  other: "Lainnya",
};

export function formatServiceType(type: string): string {
  return serviceTypeLabels[type] ?? type;
}

/**
 * Translates vehicle type enum values to Bahasa Indonesia labels.
 */
const vehicleTypeLabels: Record<string, string> = {
  car: "Mobil",
  motorcycle: "Motor",
  truck: "Truk",
  van: "Van",
};

export function formatVehicleType(type: string): string {
  return vehicleTypeLabels[type] ?? type;
}

/**
 * Translates fuel type enum values to Bahasa Indonesia labels.
 */
const fuelTypeLabels: Record<string, string> = {
  gasoline: "Bensin",
  diesel: "Solar",
  electric: "Listrik",
  hybrid: "Hybrid",
};

export function formatFuelType(type: string): string {
  return fuelTypeLabels[type] ?? type;
}

/**
 * Translates service log status enum values to Bahasa Indonesia labels.
 */
const statusLabels: Record<string, string> = {
  completed: "Selesai",
  scheduled: "Terjadwal",
  in_progress: "Dalam Proses",
};

export function formatStatus(status: string): string {
  return statusLabels[status] ?? status;
}

/**
 * Formats odometer reading with unit.
 * Example: 50000 → "50.000 km"
 */
export function formatOdometer(km: number): string {
  return `${new Intl.NumberFormat("id-ID").format(km)} km`;
}

/**
 * Generates a consistent CSS class string by filtering out falsy values.
 * Lightweight alternative to clsx/classnames.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
