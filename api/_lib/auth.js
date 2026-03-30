import jwt from 'jsonwebtoken';

export function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch {
    return null;
  }
}

// Helper to send JSON response
export function json(res, status, data) {
  res.status(status).json(data);
}

// Helper to require auth
export async function requireAuth(req, res) {
  const userId = verifyToken(req);
  if (!userId) {
    json(res, 401, { error: 'No autorizado. Inicia sesion.' });
    return null;
  }
  return userId;
}

// CORS headers for Vercel
export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
