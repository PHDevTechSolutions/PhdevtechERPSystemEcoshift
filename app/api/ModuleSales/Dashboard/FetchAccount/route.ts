import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set in the environment variables.");
}

const sql = neon(databaseUrl);

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const referenceID = searchParams.get("referenceID");

        if (!referenceID) {
            return Response.json({ success: false, error: "ReferenceID is required." }, { status: 400 });
        }

        // Get total accounts count for the given referenceID
        const result = await sql`SELECT COUNT(*)::int AS total FROM accounts WHERE referenceid = ${referenceID}`;

        return Response.json({ success: true, totalAccounts: result[0]?.total || 0 }, { status: 200 });
    } catch (error: any) {
        console.error("Error fetching account count:", error);
        return Response.json(
            { success: false, error: error.message || "Failed to fetch account count." },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic"; // Ensure fresh data fetch
