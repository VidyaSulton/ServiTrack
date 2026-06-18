import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

/**
 * GET /api/reports — Get report data (query: year, month?).
 * Will be fully implemented in Phase 6.
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({
    success: false,
    error: "Not implemented yet. Coming in Phase 6.",
  }, { status: 501 });
}
