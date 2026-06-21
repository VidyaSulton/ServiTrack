import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAuth } from "@/lib/session";
import { ensureIndexes } from "@/lib/db-indexes";
import { toServiceLogClient, type ServiceLog } from "@/models/service-log";
import type { ApiResponse } from "@/types";

export async function GET(_request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { userId } = await requireAuth();
    await ensureIndexes();
    const db = await getDb();

    // Run all aggregations and queries in parallel for efficiency
    const [
      totalVehicles,
      totalServiceLogs,
      costAggregation,
      monthlyCostTrendData,
      serviceDistributionData,
      recentLogsData,
      upcomingRemindersData
    ] = await Promise.all([
      // 1. Total Vehicles
      db.collection("vehicles").countDocuments({ userId }),

      // 2. Total Service Logs
      db.collection("service_logs").countDocuments({ userId }),

      // 3. Total Cost (All Time)
      db.collection("service_logs").aggregate([
        { $match: { userId } },
        { $group: { _id: null, total: { $sum: "$totalCost" } } }
      ]).toArray(),

      // 4. Monthly Cost Trend (Last 6 months)
      db.collection("service_logs").aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              year: { $year: "$serviceDate" },
              month: { $month: "$serviceDate" }
            },
            cost: { $sum: "$totalCost" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 } // Limit to last 12 months with data
      ]).toArray(),

      // 5. Service Type Distribution
      db.collection("service_logs").aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$serviceType",
            value: { $sum: 1 }
          }
        }
      ]).toArray(),

      // 6. Recent Service Logs (Limit 5)
      db.collection("service_logs").aggregate([
        { $match: { userId } },
        { $sort: { serviceDate: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "vehicles",
            localField: "vehicleId",
            foreignField: "_id",
            as: "vehicle"
          }
        },
        { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } }
      ]).toArray(),

      // 7. Upcoming Reminders (nextServiceDate is soon or overdue)
      db.collection("service_logs").aggregate([
        { 
          $match: { 
            userId,
            nextServiceDate: { $exists: true, $ne: null }
          } 
        },
        // Sort by nextServiceDate so overdue and upcoming are first
        { $sort: { nextServiceDate: 1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "vehicles",
            localField: "vehicleId",
            foreignField: "_id",
            as: "vehicle"
          }
        },
        { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } }
      ]).toArray()
    ]);

    // Format Monthly Cost Trend
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const formattedMonthlyTrend = monthlyCostTrendData.map(item => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      cost: item.cost
    }));

    // Format Service Distribution
    const serviceTypeLabels: Record<string, string> = {
      oil_change: "Ganti Oli",
      tire_rotation: "Rotasi Ban",
      brake_service: "Servis Rem",
      engine_tune: "Tune Up Mesin",
      transmission: "Transmisi",
      cooling_system: "Sistem Pendingin",
      electrical: "Kelistrikan",
      body_repair: "Perbaikan Bodi",
      general_checkup: "Pemeriksaan Umum",
      other: "Lainnya",
    };
    
    const formattedDistribution = serviceDistributionData.map(item => ({
      name: serviceTypeLabels[item._id] ?? item._id,
      value: item.value
    }));

    // For upcoming reminders, we just take the nearest 5 (which is already sorted ascending by nextServiceDate)
    const relevantReminders = upcomingRemindersData;

    const totalCostValue = costAggregation.length > 0 ? costAggregation[0].total : 0;

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalVehicles,
          totalServiceLogs,
          totalCost: totalCostValue
        },
        monthlyCostTrend: formattedMonthlyTrend,
        serviceDistribution: formattedDistribution,
        recentLogs: recentLogsData.map((log) => toServiceLogClient(log as any)),
        upcomingReminders: relevantReminders.map((log) => toServiceLogClient(log as any))
      }
    });

  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data dashboard." },
      { status: 500 }
    );
  }
}
