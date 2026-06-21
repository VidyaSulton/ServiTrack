import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import { ensureIndexes } from "@/lib/db-indexes";
import { serviceLogSchema } from "@/lib/validations/service-log";
import { toServiceLogClient, type ServiceLog } from "@/models/service-log";
import type { ApiResponse } from "@/types";

/**
 * GET /api/service-logs/[id] — Get service log by ID.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID servis tidak valid." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const serviceLog = await db
      .collection<ServiceLog>("service_logs")
      .findOne({ _id: new ObjectId(id), userId });

    if (!serviceLog) {
      return NextResponse.json(
        { success: false, error: "Riwayat servis tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: toServiceLogClient(serviceLog),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Gagal memuat data servis." },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/service-logs/[id] — Update service log by ID.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID servis tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const parsed = serviceLogSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Data tidak valid.";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const db = await getDb();
    const data = parsed.data;
    const objectId = new ObjectId(id);

    // Verify vehicle
    if (!ObjectId.isValid(data.vehicleId)) {
      return NextResponse.json(
        { success: false, error: "ID Kendaraan tidak valid." },
        { status: 400 }
      );
    }
    const vehicle = await db.collection("vehicles").findOne({
      _id: new ObjectId(data.vehicleId),
      userId,
    });
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: "Kendaraan tidak ditemukan." },
        { status: 404 }
      );
    }

    const totalCost = data.serviceItems.reduce((acc, item) => acc + item.subtotal, 0);

    const result = await db.collection<ServiceLog>("service_logs").findOneAndUpdate(
      { _id: objectId, userId },
      {
        $set: {
          vehicleId: new ObjectId(data.vehicleId),
          serviceDate: new Date(data.serviceDate),
          serviceType: data.serviceType,
          odometer: data.odometer,
          workshopName: data.workshopName || undefined,
          mechanicNotes: data.mechanicNotes || undefined,
          serviceItems: data.serviceItems,
          totalCost,
          nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate) : undefined,
          nextServiceOdometer: data.nextServiceOdometer || undefined,
          status: data.status,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Riwayat servis tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: toServiceLogClient(result),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Gagal mengupdate riwayat servis." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/service-logs/[id] — Delete service log.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId } = await requireAuth();
    const { id } = await params;
    await ensureIndexes();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID servis tidak valid." },
        { status: 400 }
      );
    }

    const objectId = new ObjectId(id);
    const db = await getDb();

    const result = await db.collection("service_logs").deleteOne({
      _id: objectId,
      userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Riwayat servis tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { message: "Riwayat servis berhasil dihapus." },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Gagal menghapus riwayat servis." },
      { status: 500 }
    );
  }
}
