import bcrypt from 'bcryptjs';
import { connectDB, User, Learning, Finance, Roadmap } from '../_lib/db.js';
import { createToken, json, cors } from '../_lib/auth.js';

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

// Default data for new users
const defaultSkills = [
  { name: "HTML/CSS", level: 0, target: 80 },
  { name: "JavaScript", level: 0, target: 90 },
  { name: "React", level: 0, target: 80 },
  { name: "Node.js", level: 0, target: 75 },
  { name: "MongoDB", level: 0, target: 70 },
  { name: "Express", level: 0, target: 70 },
];

const defaultWeeklyHours = [
  { week: "Sem 1", hours: 0, goal: 15 },
  { week: "Sem 2", hours: 0, goal: 15 },
  { week: "Sem 3", hours: 0, goal: 15 },
  { week: "Sem 4", hours: 0, goal: 15 },
];

const defaultMonthlyData = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"]
  .map(m => ({ month: m, ingresos: 0, gastos: 0 }));

const defaultCategories = [
  { name: "Herramientas/Software", value: 0, color: CHART_COLORS[0] },
  { name: "Internet", value: 0, color: CHART_COLORS[1] },
  { name: "Cursos", value: 0, color: CHART_COLORS[2] },
  { name: "Equipo", value: 0, color: CHART_COLORS[3] },
  { name: "Marketing", value: 0, color: CHART_COLORS[4] },
  { name: "Legal/SAT", value: 0, color: CHART_COLORS[5] },
];

const defaultRoadmap = [
  { phaseId: "phase1", phase: "Fase 1", title: "Fundamentos", timeframe: "Mes 1-3", description: "Dominar las bases del desarrollo web.", tasks: [
    { text: "Completar curso de Colt Steele (HTML, CSS, JS)", done: false },
    { text: "Construir 3 proyectos de practica", done: false },
    { text: "Aprender Git y GitHub", done: false },
    { text: "Crear perfil de LinkedIn profesional", done: false },
    { text: "Practicar ingles tecnico (30 min/dia)", done: false },
  ]},
  { phaseId: "phase2", phase: "Fase 2", title: "Especializacion", timeframe: "Mes 3-6", description: "Profundizar en React y Node.js.", tasks: [
    { text: "Curso avanzado de React", done: false },
    { text: "Aprender TypeScript", done: false },
    { text: "Construir portafolio profesional", done: false },
    { text: "Primer proyecto full-stack completo", done: false },
    { text: "Aprender bases de datos (MongoDB + SQL)", done: false },
  ]},
  { phaseId: "phase3", phase: "Fase 3", title: "Primeros Ingresos", timeframe: "Mes 6-9", description: "Empezar a ganar dinero.", tasks: [
    { text: "Crear perfiles en Upwork y Fiverr", done: false },
    { text: "Completar 3 proyectos freelance", done: false },
    { text: "Ofrecer servicios a negocios locales de Leon", done: false },
    { text: "Establecer precios y proceso de cotizacion", done: false },
    { text: "Primer cliente internacional", done: false },
  ]},
  { phaseId: "phase4", phase: "Fase 4", title: "Formalizacion", timeframe: "Mes 9-12", description: "Constituir legalmente tu empresa.", tasks: [
    { text: "Registrarte en el SAT (RESICO)", done: false },
    { text: "Obtener e.firma y sellos digitales", done: false },
    { text: "Abrir cuenta bancaria empresarial", done: false },
    { text: "Registrar marca FineLine en IMPI", done: false },
    { text: "Crear sitio web de la empresa", done: false },
    { text: "Definir servicios y precios formales", done: false },
  ]},
  { phaseId: "phase5", phase: "Fase 5", title: "Escalamiento", timeframe: "Año 2", description: "Crecer el negocio y construir equipo.", tasks: [
    { text: "Facturar $10,000+ MXN mensuales", done: false },
    { text: "Contratar primer colaborador freelance", done: false },
    { text: "Desarrollar producto propio (SaaS)", done: false },
    { text: "Marketing digital y presencia en redes", done: false },
    { text: "Networking en comunidad tech de Leon/Bajio", done: false },
    { text: "Explorar constitucion como persona moral (S.A.S.)", done: false },
  ]},
];

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'Metodo no permitido' });

  try {
    await connectDB();
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return json(res, 400, { error: 'Nombre, email y password son requeridos' });
    }
    if (password.length < 6) {
      return json(res, 400, { error: 'El password debe tener al menos 6 caracteres' });
    }

    const existing = await User.findOne({ email });
    if (existing) return json(res, 400, { error: 'Ya existe una cuenta con este email' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash, name });

    // Create default data for new user
    await Promise.all([
      Learning.create({ userId: user._id, skills: defaultSkills, weeklyHours: defaultWeeklyHours }),
      Finance.create({ userId: user._id, monthlyData: defaultMonthlyData, categories: defaultCategories, incomeSources: [] }),
      Roadmap.create({ userId: user._id, phases: defaultRoadmap }),
    ]);

    const token = createToken(user._id);
    json(res, 201, { token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    json(res, 500, { error: 'Error del servidor: ' + err.message });
  }
}
