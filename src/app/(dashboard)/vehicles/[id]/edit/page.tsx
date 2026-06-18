/**
 * Edit vehicle page — will be fully implemented in Phase 3.
 */
export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-[1.75rem] font-bold text-slate-100">
        Edit Kendaraan
      </h1>
      <div className="bg-surface-card border border-outline rounded-md p-6 max-w-[640px] mx-auto">
        <p className="text-slate-500 text-sm text-center py-12">
          Form edit kendaraan (ID: {id}) akan diimplementasikan di Fase 3.
        </p>
      </div>
    </div>
  );
}
