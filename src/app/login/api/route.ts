import { NextRequest, NextResponse } from "next/server";


export async function POST(request: Request) {
    try {

        const body = await request.json()
        console.log(body);

        const response = await fetch("https://application.renew.org/auth/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
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