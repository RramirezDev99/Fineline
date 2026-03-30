import { connectDB, Finance } from './_lib/db.js';
import { requireAuth, json, cors } from './_lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = await requireAuth(req, res);
  if (!userId) return;

  await connectDB();

  if (req.method === 'GET') {
    const data = await Finance.findOne({ userId });
    return json(res, 200, data || {});
  }

  if (req.method === 'PUT') {
    const data = await Finance.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { new: true, upsert: true }
    );
    return json(res, 200, data);
  }

  json(res, 405, { error: 'Metodo no permitido' });
}
