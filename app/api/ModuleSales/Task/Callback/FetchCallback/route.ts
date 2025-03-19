import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set in the environment variables.");
}

const sql = neon(databaseUrl);

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const referenceId = searchParams.get("referenceId");

        if (!referenceId) {
            return NextResponse.json({ success: false, error: "ReferenceID is required" }, { status: 400 });
        }

        // ✅ Updated Query: Check both referenceId and tsm
        const progressData = await sql`
        SELECT callback, message, type, date_created, tsm, referenceid
        FROM notification 
        WHERE referenceid = ${referenceId} OR tsm = ${referenceId};
        `;

        return NextResponse.json({ success: true, data: progressData }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching notifications:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch notifications." },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic";
