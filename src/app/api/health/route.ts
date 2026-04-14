import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connection";


export async function GET() {
  try {
    await connectDB();
    return NextResponse.json(
      { status: "ok", service: "reflow", ts: Date.now() },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { status: "error", service: "reflow" },
      { status: 503 }
    );
  }
}
