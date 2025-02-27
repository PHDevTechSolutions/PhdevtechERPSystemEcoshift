import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/ModuleCSR/mongodb"; // Import connectToDatabase

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    // Extract query parameters
    const { startDate, endDate, ReferenceID, Role } = req.query;

    // Define date range with fallback to current month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const finalStartDate = startDate ? new Date(startDate as string) : startOfMonth;
    const finalEndDate = endDate ? new Date(endDate as string) : endOfMonth;

    console.log("Filtering by Date Range:", finalStartDate, finalEndDate);

    const db = await connectToDatabase();
    const monitoringCollection = db.collection("monitoring");

    // Define match filter
    const matchFilter: any = {
      CustomerType: { $in: ["B2B", "B2C", "B2G", "Gentrade", "Modern Trade"] },
      createdAt: { $gte: finalStartDate, $lte: finalEndDate },
    };

    // Apply ReferenceID filter only if Role is "Staff"
    if (Role === "Staff" && ReferenceID) {
      matchFilter.ReferenceID = ReferenceID;
    }

    // Aggregate customer data
    const result = await monitoringCollection.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$CustomerType",
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    console.log("Aggregated CustomerType Data:", result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching monitoring data:", error);
    res.status(500).json({ success: false, message: "Error fetching monitoring data", error });
  }
}