// Delete

import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from "@/lib/ModuleCSR/mongodb"; // Import connectToDatabase
import { ObjectId } from 'mongodb';

export default async function deleteAccount(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    const { id } = req.body;

    try {
        const db = await connectToDatabase();
        const accountCollection = db.collection('accounts');

        await accountCollection.deleteOne({ _id: new ObjectId(id) });
        res.status(200).json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Failed to delete post' });
    }
}
