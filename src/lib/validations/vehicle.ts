import { z } from "zod";

/**
 * Vehicle form validation schema (Zod v4 API).
 * Used for both creating and updating vehicles.
 * All error messages in Bahasa Indonesia.
 */
export const vehicleSchema = z.object({
  plateNumber: z
    .string()
    .min(1, "Nomor plat wajib diisi")
    .max(15, "Nomor plat maksimal 15 karakter"),
  brand: z
    .string()
    .min(1, "Merek kendaraan wajib diisi")
    .max(50, "Merek maksimal 50 karakter"),
  model: z
    .string()
    .min(1, "Model kendaraan wajib diisi")
    .max(50, "Model maksimal 50 karakter"),
  year: z
    .number({ message: "Tahun harus berupa angka" })
    .int("Tahun harus berupa angka bulat")
    .min(1900, "Tahun minimal 1900")
    .max(new Date().getFullYear() + 1, "Tahun tidak valid"),
  color: z
    .string()
    .min(1, "Warna kendaraan wajib diisi")
    .max(30, "Warna maksimal 30 karakter"),
  type: z.enum(["car", "motorcycle", "truck", "van"], {
    message: "Tipe kendaraan wajib dipilih",
  }),
  fuelType: z.enum(["gasoline", "diesel", "electric", "hybrid"], {
    message: "Jenis bahan bakar wajib dipilih",
  }),
  engineCapacity: z
    .string()
    .max(10, "Kapasitas mesin maksimal 10 karakter")
    .optional()
    .or(z.literal("")),
  transmission: z
    .enum(["manual", "automatic"])
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(500, "Catatan maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;
