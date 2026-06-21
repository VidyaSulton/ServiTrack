import { z } from "zod";

/**
 * Service item schema for sub-documents in the array.
 */
export const serviceItemSchema = z.object({
  name: z.string().min(1, "Nama item wajib diisi").max(100, "Nama maksimal 100 karakter"),
  category: z.enum(["part", "labor", "fluid", "other"], {
    message: "Kategori wajib dipilih",
  }),
  quantity: z.number({ message: "Kuantitas harus berupa angka" }).min(1, "Minimal kuantitas adalah 1"),
  unitPrice: z.number({ message: "Harga satuan harus berupa angka" }).min(0, "Harga tidak boleh negatif"),
  subtotal: z.number({ message: "Subtotal harus berupa angka" }).min(0, "Subtotal tidak boleh negatif"),
});

/**
 * Service log form validation schema (Zod v4 API).
 */
export const serviceLogSchema = z.object({
  vehicleId: z.string().min(1, "Kendaraan wajib dipilih"),
  serviceDate: z.string().min(1, "Tanggal servis wajib diisi"),
  serviceType: z.enum([
    "oil_change",
    "tire_rotation",
    "brake_service",
    "engine_tune",
    "transmission",
    "cooling_system",
    "electrical",
    "body_repair",
    "general_checkup",
    "other",
  ], {
    message: "Jenis servis wajib dipilih",
  }),
  odometer: z.number({ message: "Odometer harus berupa angka" }).min(0, "Odometer tidak boleh negatif"),
  workshopName: z.string().max(100, "Nama bengkel maksimal 100 karakter").optional().or(z.literal("")),
  mechanicNotes: z.string().max(500, "Catatan mekanik maksimal 500 karakter").optional().or(z.literal("")),
  serviceItems: z.array(serviceItemSchema).min(1, "Minimal satu item servis harus ditambahkan"),
  nextServiceDate: z.string().optional().or(z.literal("")),
  nextServiceOdometer: z.number({ message: "Odometer selanjutnya harus berupa angka" }).min(0, "Odometer tidak boleh negatif").optional().or(z.literal("").transform(() => undefined)),
  status: z.enum(["completed", "scheduled", "in_progress"], {
    message: "Status wajib dipilih",
  }),
});

export type ServiceLogFormData = z.infer<typeof serviceLogSchema>;
export type ServiceItemFormData = z.infer<typeof serviceItemSchema>;
