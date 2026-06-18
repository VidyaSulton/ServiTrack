/**
 * Vehicle detail page — will be fully implemented in Phase 3.
 * Shows vehicle info + service log history for this vehicle.
 */
export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-[1.75rem] font-bold text-slate-100">
        Detail Kendaraan
      </h1>
      <div className="bg-surface-card border border-outline rounded-md p-6">
        <p className="text-slate-500 text-sm text-center py-12">
          Detail kendaraan (ID: {id}) akan diimplementasikan di Fase 3.
        </p>
      </div>
    </div>
  );
}
