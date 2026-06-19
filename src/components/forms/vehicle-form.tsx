"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import {
  vehicleSchema,
  type VehicleFormData,
} from "@/lib/validations/vehicle";
import type { VehicleClient } from "@/models/vehicle";
import { useState } from "react";

interface VehicleFormProps {
  /** If provided, the form will be in edit mode. */
  initialData?: VehicleClient;
}

const vehicleTypeOptions = [
  { value: "car", label: "Mobil" },
  { value: "motorcycle", label: "Motor" },
  { value: "truck", label: "Truk" },
  { value: "van", label: "Van" },
];

const fuelTypeOptions = [
  { value: "gasoline", label: "Bensin" },
  { value: "diesel", label: "Solar" },
  { value: "electric", label: "Listrik" },
  { value: "hybrid", label: "Hybrid" },
];

const transmissionOptions = [
  { value: "manual", label: "Manual" },
  { value: "automatic", label: "Otomatis" },
];

/**
 * Shared vehicle form component for both Add and Edit pages.
 * Uses React Hook Form + Zod. DESIGN.md Section 6.3 form page layout.
 */
export function VehicleForm({ initialData }: VehicleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<VehicleFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: {
      plateNumber: initialData?.plateNumber ?? "",
      brand: initialData?.brand ?? "",
      model: initialData?.model ?? "",
      year: initialData?.year ?? new Date().getFullYear(),
      color: initialData?.color ?? "",
      type: initialData?.type ?? undefined,
      fuelType: initialData?.fuelType ?? undefined,
      engineCapacity: initialData?.engineCapacity ?? "",
      transmission: initialData?.transmission ?? undefined,
      notes: initialData?.notes ?? "",
    },
  });

  async function onSubmit(data: VehicleFormData) {
    setIsSubmitting(true);
    try {
      const url = isEdit
        ? `/api/vehicles/${initialData.id}`
        : "/api/vehicles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          // Clean up empty optional fields
          engineCapacity: data.engineCapacity || undefined,
          transmission: data.transmission || undefined,
          notes: data.notes || undefined,
        }),
      });

      const json = await res.json();

      if (json.success) {
        showToast(
          "success",
          isEdit
            ? "Kendaraan berhasil diupdate"
            : "Kendaraan berhasil ditambahkan"
        );
        router.push(isEdit ? `/vehicles/${initialData.id}` : "/vehicles");
        router.refresh();
      } else {
        showToast("error", json.error || "Gagal menyimpan kendaraan");
      }
    } catch {
      showToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Row 1: Plate + Brand */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="plateNumber"
          label="Nomor Plat"
          placeholder="Contoh: B 1234 XYZ"
          error={errors.plateNumber?.message}
          {...register("plateNumber")}
        />
        <Input
          id="brand"
          label="Merek"
          placeholder="Contoh: Toyota"
          error={errors.brand?.message}
          {...register("brand")}
        />
      </div>

      {/* Row 2: Model + Year */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="model"
          label="Model"
          placeholder="Contoh: Avanza"
          error={errors.model?.message}
          {...register("model")}
        />
        <Input
          id="year"
          type="number"
          label="Tahun"
          placeholder="Contoh: 2021"
          error={errors.year?.message}
          {...register("year", { valueAsNumber: true })}
        />
      </div>

      {/* Row 3: Color + Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="color"
          label="Warna"
          placeholder="Contoh: Putih"
          error={errors.color?.message}
          {...register("color")}
        />
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              id="type"
              label="Tipe Kendaraan"
              placeholder="Pilih tipe..."
              options={vehicleTypeOptions}
              error={errors.type?.message}
              {...field}
              value={field.value ?? ""}
            />
          )}
        />
      </div>

      {/* Row 4: Fuel Type + Transmission */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="fuelType"
          control={control}
          render={({ field }) => (
            <Select
              id="fuelType"
              label="Bahan Bakar"
              placeholder="Pilih bahan bakar..."
              options={fuelTypeOptions}
              error={errors.fuelType?.message}
              {...field}
              value={field.value ?? ""}
            />
          )}
        />
        <Controller
          name="transmission"
          control={control}
          render={({ field }) => (
            <Select
              id="transmission"
              label="Transmisi (Opsional)"
              placeholder="Pilih transmisi..."
              options={transmissionOptions}
              error={errors.transmission?.message}
              {...field}
              value={field.value ?? ""}
            />
          )}
        />
      </div>

      {/* Row 5: Engine Capacity */}
      <Input
        id="engineCapacity"
        label="Kapasitas Mesin (Opsional)"
        placeholder="Contoh: 1500cc"
        error={errors.engineCapacity?.message}
        {...register("engineCapacity")}
      />

      {/* Row 6: Notes */}
      <div className="w-full">
        <label
          htmlFor="notes"
          className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5"
        >
          Catatan (Opsional)
        </label>
        <textarea
          id="notes"
          rows={3}
          placeholder="Tambahkan catatan tentang kendaraan ini..."
          className="w-full px-3.5 py-2.5 rounded-sm text-sm text-slate-100 bg-surface-input border border-outline placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-150 resize-y min-h-[100px]"
          {...register("notes")}
        />
        {errors.notes?.message && (
          <p className="mt-1 text-xs text-rose-500">{errors.notes.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Batal
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEdit ? "Simpan Perubahan" : "Tambah Kendaraan"}
        </Button>
      </div>
    </form>
  );
}
