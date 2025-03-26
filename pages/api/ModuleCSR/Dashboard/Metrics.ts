import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/ModuleCSR/mongodb"; // Import connectToDatabase

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // ✅ Extract query parameters
    const { ReferenceID, Role } = req.query;

    // ✅ Connect to the database
    const db = await connectToDatabase();
    const monitoringCollection = db.collection("monitoring");

    // ✅ Create filter object for ReferenceID only
    const matchFilter: any = {};

    // ✅ Apply ReferenceID filter if Role is "Staff"
    if (Role === "Staff" && ReferenceID) {
      matchFilter.ReferenceID = ReferenceID;
    }

    // ✅ Fetch monitoring data without month/year filter
    const data = await monitoringCollection.find(matchFilter).toArray();

    // ✅ Return the dataset
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching monitoring data:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
