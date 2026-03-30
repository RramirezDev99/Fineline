import mongoose from 'mongoose';

let cached = global._mongooseCache;
if (!cached) cached = global._mongooseCache = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ─── Schemas ───

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const learningSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  courseName: { type: String, default: 'The Web Developer Bootcamp 2026 — Colt Steele' },
  totalSections: { type: Number, default: 63 },
  completedSections: { type: Number, default: 0 },
  skills: [{
    name: String,
    level: { type: Number, default: 0 },
    target: { type: Number, default: 80 },
  }],
  weeklyHours: [{
    week: String,
    hours: { type: Number, default: 0 },
    goal: { type: Number, default: 15 },
  }],
});

const financeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  monthlyData: [{
    month: String,
    ingresos: { type: Number, default: 0 },
    gastos: { type: Number, default: 0 },
  }],
  categories: [{
    name: String,
    value: { type: Number, default: 0 },
    color: String,
  }],
  totalIngresos: { type: Number, default: 0 },
  totalGastos: { type: Number, default: 0 },
  incomeSources: [{
    source: String,
    amount: Number,
    month: String,
  }],
});

const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  status: { type: String, default: 'pendiente' },
  tech: [String],
  description: String,
  client: String,
  progress: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const journalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  mood: { type: String, default: 'neutral' },
  tags: [String],
  date: { type: Date, default: Date.now },
});

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  datetime: { type: Date, required: true },
  priority: { type: String, default: 'media' },
  category: { type: String, default: 'estudio' },
  repeat: { type: String, default: 'none' },
  done: { type: Boolean, default: false },
  notified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const roadmapSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phases: [{
    phaseId: String,
    phase: String,
    title: String,
    timeframe: String,
    description: String,
    tasks: [{
      text: String,
      done: { type: Boolean, default: false },
    }],
  }],
});

// Avoid re-compiling models in serverless environment
export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Learning = mongoose.models.Learning || mongoose.model('Learning', learningSchema);
export const Finance = mongoose.models.Finance || mongoose.model('Finance', financeSchema);
export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export const Journal = mongoose.models.Journal || mongoose.model('Journal', journalSchema);
export const Reminder = mongoose.models.Reminder || mongoose.model('Reminder', reminderSchema);
export const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', roadmapSchema);
