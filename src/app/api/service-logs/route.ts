import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import { ensureIndexes } from "@/lib/db-indexes";
import { serviceLogSchema } from "@/lib/validations/service-log";
import { toServiceLogClient, type ServiceLog } from "@/models/service-log";
import type { ApiResponse } from "@/types";

/**
 * GET /api/service-logs — List all service logs for current user.
 * Supports optional `vehicleId` query param.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId } = await requireAuth();
    await ensureIndexes();

    const searchParams = request.nextUrl.searchParams;
    const vehicleId = searchParams.get("vehicleId");

    const query: any = { userId };
    if (vehicleId && ObjectId.isValid(vehicleId)) {
      query.vehicleId = new ObjectId(vehicleId);
    }

    const pipeline: any[] = [
      { $match: query },
      { $sort: { serviceDate: -1 } },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicle"
        }
      },
      {
        $unwind: {
          path: "$vehicle",
          preserveNullAndEmptyArrays: true
        }
      }
    ];

    const db = await getDb();
    const serviceLogs = await db
      .collection("service_logs")
      .aggregate(pipeline)
      .toArray();

    return NextResponse.json({
      success: true,
      data: serviceLogs.map((log) => toServiceLogClient(log as any)),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar riwayat servis." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/service-logs — Create a new service log.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId } = await requireAuth();
    await ensureIndexes();

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

    if (!ObjectId.isValid(data.vehicleId)) {
      return NextResponse.json(
        { success: false, error: "ID Kendaraan tidak valid." },
        { status: 400 }
      );
    }

    // Verify vehicle belongs to user
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

    const now = new Date();
    
    // Auto calculate totalCost from service items
    const totalCost = data.serviceItems.reduce((acc, item) => acc + item.subtotal, 0);

    const serviceLog: Omit<ServiceLog, "_id"> = {
      userId,
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
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("service_logs").insertOne(serviceLog);

    const inserted = {
      _id: result.insertedId,
      ...serviceLog,
    } as ServiceLog;

    return NextResponse.json(
      { success: true, data: toServiceLogClient(inserted) },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan riwayat servis." },
      { status: 500 }
    );
  }
}
