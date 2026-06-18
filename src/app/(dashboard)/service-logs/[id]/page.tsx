/**
 * Service log detail page — will be fully implemented in Phase 4.
 */
export default async function ServiceLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-[1.75rem] font-bold text-slate-100">
        Detail Log Servis
      </h1>
      <div className="bg-surface-card border border-outline rounded-md p-6">
        <p className="text-slate-500 text-sm text-center py-12">
          Detail log servis (ID: {id}) akan diimplementasikan di Fase 4.
        </p>
      </div>
    </div>
  );
}
