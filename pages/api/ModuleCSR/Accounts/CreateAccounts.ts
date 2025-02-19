import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/app/ModuleCSR/lib/MongoDB"; // Import connectToDatabase

// Function to add an account directly in this file
async function addAccount({ CompanyName, CustomerName, Gender, ContactNumber, Email, CityAddress, CustomerSegment, CustomerType }: {
  CompanyName: string;
  CustomerName: string;
  Gender: string;
  ContactNumber: string;
  Email: string;
  CityAddress: string;
  CustomerSegment: string;
  CustomerType: string;
}) {
  const db = await connectToDatabase();
  const accountsCollection = db.collection("accounts");
  const newAccount = { CompanyName, CustomerName, Gender, ContactNumber, Email, CityAddress, CustomerSegment, CustomerType, createdAt: new Date(), };
  await accountsCollection.insertOne(newAccount);

  // Broadcast logic if needed
  if (typeof io !== "undefined" && io) {
    io.emit("newAccount", newAccount);
  }

  return { success: true };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { CompanyName, CustomerName, Gender, ContactNumber, Email, CityAddress, CustomerSegment, CustomerType } = req.body;

    // Validate required fields
    if (!CompanyName || !CustomerName) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    try {
      const result = await addAccount({ CompanyName, CustomerName, Gender, ContactNumber, Email, CityAddress, CustomerSegment, CustomerType });
      res.status(200).json(result);
    } catch (error) {
      console.error("Error adding account:", error);
      res
        .status(500)
        .json({ success: false, message: "Error adding account", error });
    }
  } else {
    res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }
}
