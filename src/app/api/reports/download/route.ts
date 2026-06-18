import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

/**
 * POST /api/reports/download — Generate and return file (body: format, year, month?).
 * Will be fully implemented in Phase 6.
 */
export async function POST(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({
    success: false,
    error: "Not implemented yet. Coming in Phase 6.",
  }, { status: 501 });
}
