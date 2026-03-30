import bcrypt from 'bcryptjs';
import { connectDB, User } from '../_lib/db.js';
import { createToken, json, cors } from '../_lib/auth.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'Metodo no permitido' });

  try {
    await connectDB();
    const { email, password } = req.body;

    if (!email || !password) {
      return json(res, 400, { error: 'Email y password son requeridos' });
    }

    const user = await User.findOne({ email });
    if (!user) return json(res, 401, { error: 'Email o password incorrectos' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return json(res, 401, { error: 'Email o password incorrectos' });

    const token = createToken(user._id);
    json(res, 200, { token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    json(res, 500, { error: 'Error del servidor: ' + err.message });
  }
}
