import { connectDB, Project } from './_lib/db.js';
import { requireAuth, json, cors } from './_lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const userId = await requireAuth(req, res);
  if (!userId) return;

  await connectDB();

  // GET all projects
  if (req.method === 'GET') {
    const projects = await Project.find({ userId }).sort({ createdAt: -1 });
    return json(res, 200, projects);
  }

  // POST new project
  if (req.method === 'POST') {
    const project = await Project.create({ ...req.body, userId });
    return json(res, 201, project);
  }

  // PUT update project
  if (req.method === 'PUT') {
    const { id, ...updates } = req.body;
    if (!id) return json(res, 400, { error: 'ID del proyecto requerido' });
    const project = await Project.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true }
    );
    if (!project) return json(res, 404, { error: 'Proyecto no encontrado' });
    return json(res, 200, project);
  }

  // DELETE project
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return json(res, 400, { error: 'ID del proyecto requerido' });
    await Project.findOneAndDelete({ _id: id, userId });
    return json(res, 200, { ok: true });
  }

  json(res, 405, { error: 'Metodo no permitido' });
}
