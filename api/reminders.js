import { connectDB, Reminder } from './_lib/db.js';
import { requireAuth, json, cors } from './_lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = await requireAuth(req, res);
  if (!userId) return;

  await connectDB();

  if (req.method === 'GET') {
    const reminders = await Reminder.find({ userId }).sort({ datetime: 1 });
    return json(res, 200, reminders);
  }

  if (req.method === 'POST') {
    const reminder = await Reminder.create({ ...req.body, userId });
    return json(res, 201, reminder);
  }

  if (req.method === 'PUT') {
    const { id, ...updates } = req.body;
    if (!id) return json(res, 400, { error: 'ID requerido' });
    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    );
    return json(res, 200, reminder);
  }

  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return json(res, 400, { error: 'ID requerido' });
    await Reminder.findOneAndDelete({ _id: id, userId });
    return json(res, 200, { ok: true });
  }

  json(res, 405, { error: 'Metodo no permitido' });
}
