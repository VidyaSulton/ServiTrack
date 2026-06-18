/**
 * Edit service log page — will be fully implemented in Phase 4.
 */
export default async function EditServiceLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-[1.75rem] font-bold text-slate-100">
        Edit Log Servis
      </h1>
      <div className="bg-surface-card border border-outline rounded-md p-6 max-w-[640px] mx-auto">
        <p className="text-slate-500 text-sm text-center py-12">
          Form edit log servis (ID: {id}) akan diimplementasikan di Fase 4.
        </p>
      </div>
    </div>
  );
}
