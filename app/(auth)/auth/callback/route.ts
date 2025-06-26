import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    console.log("Callback hit. Code:", code);

    return NextResponse.json({ message: "Callback working", code });
  } catch (e) {
    console.error("Error in callback route:", e);
    return NextResponse.json({ error: "Route error" }, { status: 500 });
  }
}
