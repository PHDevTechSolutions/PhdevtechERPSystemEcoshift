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
        const tsm = searchParams.get("tsm");

        if (!tsm) {
            return NextResponse.json({ success: false, error: "tsm is required." }, { status: 400 });
        }

        // Fetch Inbound & Outbound Calls separately using DATE_TRUNC for timestamp compatibility
        const [outboundResult, inboundResult] = await Promise.all([
            sql`SELECT COUNT(*)::int AS total FROM progress WHERE tsm = ${tsm} AND typeactivity = 'Outbound Call' AND DATE_TRUNC('day', date_created) = CURRENT_DATE`,
            sql`SELECT COUNT(*)::int AS total FROM progress WHERE tsm = ${tsm} AND typeactivity = 'Inbound Call' AND DATE_TRUNC('day', date_created) = CURRENT_DATE`
        ]);

        // Debugging logs (optional)
        console.log("Outbound Result:", outboundResult);
        console.log("Inbound Result:", inboundResult);

        const totalOutbound = outboundResult.length > 0 ? outboundResult[0].total : 0;
        const totalInbound = inboundResult.length > 0 ? inboundResult[0].total : 0;

        return NextResponse.json({ success: true, totalOutbound, totalInbound }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching call data:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Failed to fetch call data." },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic"; // Ensure fresh data fetch
