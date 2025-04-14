import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.TASKFLOW_DB_URL;
if (!databaseUrl) {
    throw new Error("TASKFLOW_DB_URL is not set in the environment variables.");
}

const sql = neon(databaseUrl);

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const referenceid = url.searchParams.get("referenceid");

        console.log("Received referenceid:", referenceid); // Log the referenceid

        if (!referenceid) {
            return NextResponse.json(
                { success: false, error: "Missing reference ID." },
                { status: 400 }
            );
        }

        const accounts = await sql`SELECT * FROM accounts WHERE referenceid = ${referenceid};`;

        if (accounts.length === 0) {
            return NextResponse.json(
                { success: false, error: "No accounts found with the provided reference ID." },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: accounts }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching accounts:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch accounts." },
            { status: 500 }
        );
    }
}


export const dynamic = "force-dynamic"; // Ensure fresh data fetch
