import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/MongoDB";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

export default async function updateProfile(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const {
    id,
    Firstname,
    Lastname,
    Email,
    Role,
    Department,
    Status,
    ContactNumber,
    Password, // ✅ Make sure to destructure Password
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const db = await connectToDatabase();
    const userCollection = db.collection("users");

    const updatedUser: any = {
      Firstname,
      Lastname,
      Email,
      Role,
      Department,
      Status,
      ContactNumber,
      updatedAt: new Date(),
    };

    if (Password && Password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(Password, 10);
      updatedUser.Password = hashedPassword;
    }

    await userCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedUser }
    );

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
}
