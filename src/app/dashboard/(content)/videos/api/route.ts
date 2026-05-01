// https://application.renew.org/admin/videos?sortBy=createdAt&order=ASC
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: Request) {
  const authToken = request.headers.get("Authorization");
  try {

    const response = await fetch("https://application.renew.org/admin/videos?sortBy=createdAt&order=ASC",{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${authToken}`,
      }
    });
    const data = await response.json()

    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error("GET_ERROR:", error);

    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}