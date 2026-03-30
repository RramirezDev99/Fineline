import { connectDB, Journal } from './_lib/db.js';
import { requireAuth, json, cors } from './_lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = await requireAuth(req, res);
  if (!userId) return;

  await connectDB();

  if (req.method === 'GET') {
    const entries = await Journal.find({ userId }).sort({ date: -1 });
    return json(res, 200, entries);
  }

  if (req.method === 'POST') {
    const entry = await Journal.create({ ...req.body, userId });
    return json(res, 201, entry);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return json(res, 400, { error: 'ID requerido' });
    await Journal.findOneAndDelete({ _id: id, userId });
    return json(res, 200, { ok: true });
  }

  json(res, 405, { error: 'Metodo no permitido' });
}
