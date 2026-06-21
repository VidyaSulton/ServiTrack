import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import { ensureIndexes } from "@/lib/db-indexes";
import { toServiceLogClient } from "@/models/service-log";
import type { ApiResponse } from "@/types";

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId, session } = await requireAuth();
    await ensureIndexes();

    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get("year");
    const month = searchParams.get("month");
    const vehicleId = searchParams.get("vehicleId");

    const query: any = { userId };

    if (vehicleId && ObjectId.isValid(vehicleId)) {
      query.vehicleId = new ObjectId(vehicleId);
    }

    if (year) {
      const y = parseInt(year, 10);
      if (!isNaN(y)) {
        let startDate: Date;
        let endDate: Date;
        
        if (month) {
          const m = parseInt(month, 10);
          if (!isNaN(m) && m >= 1 && m <= 12) {
            startDate = new Date(y, m - 1, 1);
            endDate = new Date(y, m, 1);
          } else {
            startDate = new Date(y, 0, 1);
            endDate = new Date(y + 1, 0, 1);
          }
        } else {
          startDate = new Date(y, 0, 1);
          endDate = new Date(y + 1, 0, 1);
        }

        query.serviceDate = {
          $gte: startDate,
          $lt: endDate
        };
      }
    }

    const pipeline = [
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

    // Calculate aggregated summary
    const totalCost = serviceLogs.reduce((acc, log) => acc + (log.totalCost || 0), 0);
    const totalServices = serviceLogs.length;

    return NextResponse.json({
      success: true,
      data: {
        logs: serviceLogs.map((log) => toServiceLogClient(log as any)),
        userName: session.user.name || "User",
        summary: {
          totalCost,
          totalServices
        }
      }
    });

  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Reports API Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data laporan." },
      { status: 500 }
    );
  }
}
