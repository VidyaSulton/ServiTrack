"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toast";
import {
  serviceLogSchema,
  type ServiceLogFormData,
} from "@/lib/validations/service-log";
import type { ServiceLogClient } from "@/models/service-log";
import type { VehicleClient } from "@/models/vehicle";

interface ServiceLogFormProps {
  initialData?: ServiceLogClient;
  preselectedVehicleId?: string;
}

const serviceTypeOptions = [
  { value: "oil_change", label: "Ganti Oli" },
  { value: "tire_rotation", label: "Rotasi Ban" },
  { value: "brake_service", label: "Servis Rem" },
  { value: "engine_tune", label: "Tune Up Mesin" },
  { value: "transmission", label: "Transmisi" },
  { value: "cooling_system", label: "Sistem Pendingin" },
  { value: "electrical", label: "Kelistrikan" },
  { value: "body_repair", label: "Perbaikan Bodi" },
  { value: "general_checkup", label: "Pemeriksaan Umum" },
  { value: "other", label: "Lainnya" },
];

const statusOptions = [
  { value: "completed", label: "Selesai" },
  { value: "in_progress", label: "Sedang Dikerjakan" },
  { value: "scheduled", label: "Dijadwalkan" },
];

const itemCategoryOptions = [
  { value: "part", label: "Spare Part" },
  { value: "labor", label: "Jasa" },
  { value: "fluid", label: "Cairan/Oli" },
  { value: "other", label: "Lainnya" },
];

export function ServiceLogForm({ initialData, preselectedVehicleId }: ServiceLogFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<VehicleClient[]>([]);
  const isEdit = !!initialData;

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const res = await fetch("/api/vehicles");
        const json = await res.json();
        if (json.success) {
          setVehicles(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
      }
    }
    fetchVehicles();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceLogFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(serviceLogSchema) as any,
    defaultValues: {
      vehicleId: initialData?.vehicleId ?? preselectedVehicleId ?? "",
      serviceDate: initialData?.serviceDate ? new Date(initialData.serviceDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      serviceType: initialData?.serviceType ?? undefined,
      odometer: initialData?.odometer ?? 0,
      workshopName: initialData?.workshopName ?? "",
      mechanicNotes: initialData?.mechanicNotes ?? "",
      status: initialData?.status ?? "completed",
      nextServiceDate: initialData?.nextServiceDate ? new Date(initialData.nextServiceDate).toISOString().split("T")[0] : "",
      nextServiceOdometer: initialData?.nextServiceOdometer ?? undefined,
      serviceItems: initialData?.serviceItems?.length ? initialData.serviceItems : [
        { name: "", category: "part", quantity: 1, unitPrice: 0, subtotal: 0 }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "serviceItems",
  });

  const serviceItems = watch("serviceItems");

  // Calculate subtotal for each item when quantity or unitPrice changes
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name?.startsWith("serviceItems.") && (name.endsWith(".quantity") || name.endsWith(".unitPrice"))) {
        const indexMatch = name.match(/serviceItems\.(\d+)/);
        if (indexMatch) {
          const index = parseInt(indexMatch[1], 10);
          const item = value.serviceItems?.[index];
          if (item) {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            setValue(`serviceItems.${index}.subtotal`, qty * price);
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

  const totalCost = serviceItems.reduce((acc, item) => acc + (Number(item.subtotal) || 0), 0);

  async function onSubmit(data: ServiceLogFormData) {
    setIsSubmitting(true);
    try {
      const url = isEdit ? `/api/service-logs/${initialData.id}` : "/api/service-logs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          serviceDate: new Date(data.serviceDate).toISOString(),
          nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate).toISOString() : undefined,
          workshopName: data.workshopName || undefined,
          mechanicNotes: data.mechanicNotes || undefined,
          nextServiceOdometer: data.nextServiceOdometer || undefined,
        }),
      });

      const json = await res.json();

      if (json.success) {
        showToast("success", isEdit ? "Riwayat servis berhasil diupdate" : "Riwayat servis berhasil ditambahkan");
        router.push(isEdit ? `/service-logs/${initialData.id}` : "/service-logs");
        router.refresh();
      } else {
        showToast("error", json.error || "Gagal menyimpan riwayat servis");
      }
    } catch {
      showToast("error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const vehicleOptions = vehicles.map(v => ({
    value: v.id,
    label: `${v.plateNumber} - ${v.brand} ${v.model}`
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* General Info */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-slate-100 border-b border-outline pb-2">Informasi Umum</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="vehicleId"
            control={control}
            render={({ field }) => (
              <Select
                id="vehicleId"
                label="Kendaraan"
                placeholder="Pilih kendaraan..."
                options={vehicleOptions}
                error={errors.vehicleId?.message}
                {...field}
                value={field.value ?? ""}
                disabled={!!preselectedVehicleId && !isEdit}
              />
            )}
          />
          <Input
            id="serviceDate"
            type="date"
            label="Tanggal Servis"
            error={errors.serviceDate?.message}
            {...register("serviceDate")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="serviceType"
            control={control}
            render={({ field }) => (
              <Select
                id="serviceType"
                label="Jenis Servis"
                placeholder="Pilih jenis servis..."
                options={serviceTypeOptions}
                error={errors.serviceType?.message}
                {...field}
                value={field.value ?? ""}
              />
            )}
          />
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                id="status"
                label="Status Servis"
                placeholder="Pilih status..."
                options={statusOptions}
                error={errors.status?.message}
                {...field}
                value={field.value ?? ""}
              />
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="odometer"
            type="number"
            label="Odometer (km)"
            placeholder="Contoh: 50000"
            error={errors.odometer?.message}
            {...register("odometer", { valueAsNumber: true })}
          />
          <Input
            id="workshopName"
            label="Nama Bengkel (Opsional)"
            placeholder="Contoh: Auto2000"
            error={errors.workshopName?.message}
            {...register("workshopName")}
          />
        </div>
      </div>

      {/* Service Items */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-outline pb-2">
          <h3 className="text-lg font-semibold text-slate-100">Item Servis</h3>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => append({ name: "", category: "part", quantity: 1, unitPrice: 0, subtotal: 0 })}
          >
            + Tambah Item
          </Button>
        </div>
        
        {typeof errors.serviceItems?.message === "string" && (
          <p className="text-sm text-rose-500">{errors.serviceItems.message}</p>
        )}

        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 bg-surface-input border border-outline rounded-md relative group">
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute -top-3 -right-3 w-6 h-6 bg-surface-card border border-outline rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-500/50 transition-colors z-10"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4">
                  <Input
                    label="Nama Item"
                    placeholder="Misal: Kampas Rem"
                    error={errors.serviceItems?.[index]?.name?.message}
                    {...register(`serviceItems.${index}.name`)}
                  />
                </div>
                <div className="md:col-span-3">
                  <Controller
                    name={`serviceItems.${index}.category`}
                    control={control}
                    render={({ field: catField }) => (
                      <Select
                        label="Kategori"
                        options={itemCategoryOptions}
                        error={errors.serviceItems?.[index]?.category?.message}
                        {...catField}
                      />
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <Input
                    type="number"
                    label="Qty"
                    min={1}
                    error={errors.serviceItems?.[index]?.quantity?.message}
                    {...register(`serviceItems.${index}.quantity`, { valueAsNumber: true })}
                  />
                </div>
                <div className="md:col-span-3">
                  <Input
                    type="number"
                    label="Harga Satuan"
                    min={0}
                    error={errors.serviceItems?.[index]?.unitPrice?.message}
                    {...register(`serviceItems.${index}.unitPrice`, { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="text-sm text-slate-400">Subtotal: </span>
                <span className="text-sm font-bold text-slate-100 ml-2">
                  Rp {(serviceItems[index]?.subtotal || 0).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end p-4 bg-surface-hover border border-outline rounded-md">
          <div className="text-right">
            <span className="text-sm text-slate-400 uppercase tracking-wide font-semibold">Total Biaya</span>
            <p className="text-2xl font-bold text-primary mt-1">
              Rp {totalCost.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      {/* Reminders & Notes */}
      <div className="space-y-5">
        <h3 className="text-lg font-semibold text-slate-100 border-b border-outline pb-2">Catatan & Pengingat</h3>
        <Textarea
          id="mechanicNotes"
          label="Catatan Mekanik / Keluhan (Opsional)"
          rows={3}
          placeholder="Tambahkan keluhan atau catatan penting..."
          error={errors.mechanicNotes?.message}
          {...register("mechanicNotes")}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="nextServiceDate"
            type="date"
            label="Tanggal Servis Berikutnya (Opsional)"
            error={errors.nextServiceDate?.message}
            {...register("nextServiceDate")}
          />
          <Input
            id="nextServiceOdometer"
            type="number"
            label="Odometer Berikutnya (Opsional)"
            placeholder="Contoh: 55000"
            error={errors.nextServiceOdometer?.message}
            {...register("nextServiceOdometer", { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Batal
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEdit ? "Simpan Perubahan" : "Simpan Riwayat Servis"}
        </Button>
      </div>
    </form>
  );
}
