import { NextResponse } from "next/server";
import _db from "../../../../../../../packages/lib/src/db.js"

await _db();

export async function GET() {
  return NextResponse.json({
    message: "Welcome to Glowvita Salon",
    success: true,
  });
}
