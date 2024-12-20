import { NextResponse } from "next/server";
import swaggerDocs from "../../../../swagger";

export async function GET() {
  return NextResponse.json(swaggerDocs, { status: 200 });
}
