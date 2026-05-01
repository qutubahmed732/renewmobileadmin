import { NextResponse } from "next/server";


export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  try {

    const response = await fetch("https://application.renew.org/admin/users",{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `${authHeader}`,
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