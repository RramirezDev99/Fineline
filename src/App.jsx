import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";
import {
  BookOpen, Code, DollarSign, TrendingUp, FolderOpen, Clock,
  CheckCircle, Circle, Target, Briefcase, Plus, Trash2,
  ChevronRight, Award, Zap, Users, Calendar, Bell, BellRing,
  PenLine, Home, Map, ArrowRight, Star, Rocket, Building2,
  FileText, AlertCircle, X, ChevronDown, ChevronUp, Edit3,
  Save, BarChart3, Lightbulb, GraduationCap, Wallet, Timer,
  HelpCircle, Info, MessageCircle, ArrowDown, LogOut, Mail, Lock
} from "lucide-react";
import { auth, learning, finance, projects, journal, reminders, roadmap, setToken, clearToken, getToken, getUser, setUser } from "./api";

// ═══════════════════════════════════════════════
//  FINELINE — Centro de Control Empresarial
//  Ruben · León, Guanajuato, México
// ═══════════════════════════════════════════════

const C = {
  primary: "#6366f1", primaryLight: "#818cf8", primaryDark: "#4f46e5",
  secondary: "#10b981", secondaryLight: "#34d399",
  accent: "#f59e0b", accentLight: "#fbbf24",
  danger: "#ef4444", dangerLight: "#f87171",
  purple: "#8b5cf6", pink: "#ec4899", cyan: "#06b6d4",
  bg: "#0f172a", bgAlt: "#131c31",
  card: "#1e293b", cardHover: "#263348",
  text: "#f1f5f9", textMuted: "#94a3b8", textDim: "#64748b",
  border: "#334155", borderLight: "#475569",
  tooltip: "#1a1f3d",
};

const CHART_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const fmtDate = (d) => new Date(d).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (d) => new Date(d).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
const fmtDateTime = (d) => `${fmtDate(d)} · ${fmtTime(d)}`;

// Debounce utility for auto-saving
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);
  return (value) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(value), delay);
  };
}

// ═══════════════════════════════════════════════
//  TOOLTIP COMPONENT
// ═══════════════════════════════════════════════

function Tip({ text, children }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  function handleEnter() {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({ x: rect.left + rect.width / 2, y: rect.top });
    }
    setShow(true);
  }

  return (
    <span ref={ref} onMouseEnter={handleEnter} onMouseLeave={() => setShow(false)}
      style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "help" }}>
      {children || <HelpCircle size={14} color={C.textDim} />}
      {show && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
          background: C.tooltip, color: C.text, padding: "10px 14px", borderRadius: 10,
          fontSize: 12, lineHeight: 1.5, width: 240, zIndex: 9999,
          border: `1px solid ${C.borderLight}`, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          pointerEvents: "none", textAlign: "left", fontWeight: 400,
        }}>
          {text}
          <div style={{
            position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
            width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
            borderTop: `6px solid ${C.borderLight}`,
          }} />
        </div>
      )}
    </span>
  );
}

// ═══════════════════════════════════════════════
//  INFO BANNER — Guía contextual
// ═══════════════════════════════════════════════

function InfoBanner({ icon: Icon = Lightbulb, color = C.cyan, title, children, dismissible = true }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div style={{
      padding: "14px 18px", background: `${color}10`, borderRadius: 12,
      border: `1px solid ${color}30`, marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start",
    }}>
      <div style={{
        background: `${color}20`, borderRadius: 8, padding: 6, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        {title && <div style={{ color, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{title}</div>}
        <div style={{ color: C.textMuted, fontSize: 12, lineHeight: 1.6 }}>{children}</div>
      </div>
      {dismissible && (
        <button onClick={() => setVisible(false)} style={{
          background: "transparent", border: "none", color: C.textDim, cursor: "pointer", padding: 2, flexShrink: 0,
        }}><X size={14} /></button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
//  SECTION HEADER — con descripción
// ═══════════════════════════════════════════════

function SectionHeader({ title, subtitle, icon: Icon, color = C.primary }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {Icon && (
          <div style={{ background: `${color}18`, borderRadius: 10, padding: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon size={20} color={color} />
          </div>
        )}
        <h2 style={{ color: C.text, fontSize: 22, fontWeight: 700, margin: 0 }}>{title}</h2>
      </div>
      {subtitle && <p style={{ color: C.textMuted, fontSize: 13, margin: "6px 0 0 0", lineHeight: 1.5 }}>{subtitle}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════
//  REUSABLE COMPONENTS
// ═══════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, sub, color = C.primary, trend, tooltip }) {
  return (
    <div style={{
      background: C.card, borderRadius: 16, padding: "18px 22px",
      display: "flex", alignItems: "center", gap: 14,
      border: `1px solid ${C.border}`, transition: "all 0.2s",
    }}>
      <div style={{
        background: `${color}18`, borderRadius: 12, padding: 11,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 2, display: "flex", alignItems: "center", gap: 4 }}>
          {label}
          {tooltip && <Tip text={tooltip} />}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ color: C.text, fontSize: 22, fontWeight: 700 }}>{value}</span>
          {trend && (
            <span style={{ color: trend > 0 ? C.secondary : C.danger, fontSize: 12, fontWeight: 600 }}>
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
          )}
        </div>
        {sub && <div style={{ color: C.textDim, fontSize: 11, marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{ background: C.card, borderRadius: 16, padding: 24, border: `1px solid ${C.border}`, ...style }}>
      {children}
    </div>
  );
}

function CardTitle({ children, icon: Icon, color = C.text, tooltip }) {
  return (
    <h3 style={{ color, fontSize: 15, fontWeight: 600, margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: 8 }}>
      {Icon && <Icon size={16} />}
      {children}
      {tooltip && <Tip text={tooltip} />}
    </h3>
  );
}

function ProgressBar({ value, max = 100, color = C.primary, height = 8, showLabel = false }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ background: `${color}18`, borderRadius: height, height, width: "100%", overflow: "hidden", flex: 1 }}>
        <div style={{
          background: `linear-gradient(90deg, ${color}, ${color}bb)`,
          height: "100%", width: `${pct}%`, borderRadius: height, transition: "width 0.5s ease",
        }} />
      </div>
      {showLabel && <span style={{ color: C.textMuted, fontSize: 11, minWidth: 35, textAlign: "right" }}>{Math.round(pct)}%</span>}
    </div>
  );
}

function Badge({ text, color = C.primary }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: `${color}18`, color, display: "inline-block",
    }}>{text}</span>
  );
}

function Btn({ children, onClick, color = C.primary, variant = "filled", size = "md", style = {}, disabled = false }) {
  const isFilled = variant === "filled";
  const pad = size === "sm" ? "6px 14px" : "10px 20px";
  const fs = size === "sm" ? 12 : 14;
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: pad, borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontWeight: 600, fontSize: fs,
      border: isFilled ? "none" : `1px solid ${color}44`,
      background: isFilled ? (disabled ? C.textDim : color) : "transparent",
      color: isFilled ? "#fff" : color,
      transition: "all 0.15s", display: "flex", alignItems: "center", gap: 6, opacity: disabled ? 0.5 : 1, ...style,
    }}>{children}</button>
  );
}

function Input({ value, onChange, placeholder, type = "text", label, helpText, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <label style={{ color: C.textMuted, fontSize: 12, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
          {label}
        </label>
      )}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        style={{
          padding: "9px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
          background: C.bg, color: C.text, fontSize: 14, width: "100%",
          outline: "none", transition: "border 0.2s", boxSizing: "border-box", ...style,
        }}
      />
      {helpText && <span style={{ color: C.textDim, fontSize: 11, lineHeight: 1.4 }}>{helpText}</span>}
    </div>
  );
}

function TextArea({ value, onChange, placeholder, rows = 4, label, helpText, style = {} }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && <label style={{ color: C.textMuted, fontSize: 12, fontWeight: 500 }}>{label}</label>}
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        style={{
          padding: "9px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
          background: C.bg, color: C.text, fontSize: 14, width: "100%", resize: "vertical",
          outline: "none", fontFamily: "inherit", boxSizing: "border-box", ...style,
        }}
      />
      {helpText && <span style={{ color: C.textDim, fontSize: 11, lineHeight: 1.4 }}>{helpText}</span>}
    </div>
  );
}

function NumberInput({ value, onChange, min, max, style = {} }) {
  return (
    <input type="number" value={value} min={min} max={max}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      style={{
        width: 65, padding: "4px 8px", borderRadius: 6, textAlign: "center",
        border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 13, ...style,
      }}
    />
  );
}

function Modal({ open, onClose, title, subtitle, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: C.card, borderRadius: 20, padding: 28, maxWidth: 520, width: "100%",
        border: `1px solid ${C.border}`, maxHeight: "80vh", overflow: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ color: C.textMuted, fontSize: 12, margin: "4px 0 0 0", lineHeight: 1.4 }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.textMuted, cursor: "pointer", padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div style={{
      textAlign: "center", padding: "40px 20px", background: C.bg, borderRadius: 14,
      border: `1px dashed ${C.border}`,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14, background: `${C.primary}15`,
        display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 14,
      }}>
        <Icon size={28} color={C.primary} />
      </div>
      <h4 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: "0 0 6px 0" }}>{title}</h4>
      <p style={{ color: C.textMuted, fontSize: 13, margin: "0 0 16px 0", maxWidth: 340, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>{description}</p>
      {actionLabel && onAction && (
        <Btn onClick={onAction} style={{ margin: "0 auto" }}><Plus size={16} /> {actionLabel}</Btn>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
//  LOGIN / REGISTER SCREEN
// ═══════════════════════════════════════════════

function LoginScreen({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" or "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        const result = await auth.login(email, password);
        if (result && result.token) {
          setToken(result.token);
          setUser(result.user);
          onLogin();
        } else {
          setError("Credenciales invalidas");
        }
      } else {
        const result = await auth.register(name, email, password);
        if (result && result.token) {
          setToken(result.token);
          setUser(result.user);
          onLogin();
        } else {
          setError("Error al registrarse. Intenta de nuevo.");
        }
      }
    } catch (err) {
      setError(err.message || "Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: `linear-gradient(135deg, ${C.primary}, ${C.cyan})`,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      <div style={{
        background: C.card, borderRadius: 20, padding: 40, maxWidth: 440, width: "100%",
        border: `1px solid ${C.border}`, boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.primary}, ${C.cyan})`,
            borderRadius: 14, padding: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
          }}>
            <Zap size={28} color="#fff" />
          </div>
          <h1 style={{ color: C.text, fontSize: 28, fontWeight: 800, margin: 0 }}>FineLine</h1>
          <p style={{ color: C.textMuted, fontSize: 14, margin: "8px 0 0 0" }}>Tu centro de control empresarial</p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["login", "register"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 10, cursor: "pointer",
                background: mode === m ? C.primary : "transparent",
                color: mode === m ? "#fff" : C.textMuted,
                border: mode === m ? "none" : `1px solid ${C.border}`,
                fontSize: 14, fontWeight: 600, transition: "all 0.2s",
              }}>
              {m === "login" ? "Ingresar" : "Registrarse"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {mode === "register" && (
            <Input value={name} onChange={setName} placeholder="Tu nombre completo"
              label="Nombre" />
          )}
          <Input value={email} onChange={setEmail} placeholder="tu@email.com" type="email"
            label="Email" />
          <Input value={password} onChange={setPassword} placeholder="Contraseña segura" type="password"
            label="Contraseña" />

          {error && (
            <div style={{
              padding: "12px 14px", background: `${C.danger}18`, border: `1px solid ${C.danger}44`,
              borderRadius: 10, color: C.danger, fontSize: 13, display: "flex", alignItems: "center", gap: 8,
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <Btn onClick={handleSubmit} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
            {loading ? "Cargando..." : (mode === "login" ? "Ingresar a FineLine" : "Crear Cuenta")}
          </Btn>
        </div>

        <div style={{
          marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.border}`,
          fontSize: 12, color: C.textDim, lineHeight: 1.6,
        }}>
          Demo: Usa cualquier email y contraseña para probar. Los cambios se guardan en la sesion.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  SIDEBAR NAVIGATION
// ═══════════════════════════════════════════════

function Sidebar({ active, onChange, remindersCount, onLogout, user }) {
  const items = [
    { id: "home", icon: Home, label: "Inicio", desc: "Vista general" },
    { id: "learning", icon: GraduationCap, label: "Aprendizaje", desc: "Curso y habilidades" },
    { id: "finance", icon: Wallet, label: "Finanzas", desc: "Ingresos y gastos" },
    { id: "projects", icon: FolderOpen, label: "Proyectos", desc: "Tu portafolio" },
    { id: "journal", icon: PenLine, label: "Diario", desc: "Reflexiones diarias" },
    { id: "reminders", icon: Bell, label: "Recordatorios", desc: "Tareas pendientes", badge: remindersCount },
    { id: "roadmap", icon: Map, label: "Roadmap", desc: "Plan a empresa" },
  ];

  return (
    <div style={{
      width: 230, minHeight: "100vh", background: C.bgAlt, borderRight: `1px solid ${C.border}`,
      padding: "20px 12px", display: "flex", flexDirection: "column", flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 8 }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.cyan})`,
          borderRadius: 10, padding: 8, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Zap size={20} color="#fff" />
        </div>
        <div>
          <div style={{ color: C.text, fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>FineLine</div>
          <div style={{ color: C.textDim, fontSize: 10, fontWeight: 500 }}>Centro de Control</div>
        </div>
      </div>

      {/* Quick help */}
      <div style={{
        padding: "10px 14px", background: `${C.primary}10`, borderRadius: 10,
        border: `1px solid ${C.primary}20`, marginBottom: 16,
      }}>
        <div style={{ color: C.primaryLight, fontSize: 11, fontWeight: 600, marginBottom: 2 }}>
          Tip: Navega por secciones
        </div>
        <div style={{ color: C.textDim, fontSize: 10, lineHeight: 1.4 }}>
          Cada sección tiene su propia ayuda. Busca los iconos de "?" para ver explicaciones.
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => onChange(item.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
              borderRadius: 10, border: "none", cursor: "pointer", transition: "all 0.15s",
              background: isActive ? `${C.primary}22` : "transparent",
              color: isActive ? C.primaryLight : C.textMuted, fontSize: 14, fontWeight: isActive ? 600 : 400,
              position: "relative", textAlign: "left",
            }}>
              {isActive && <div style={{ position: "absolute", left: 0, top: "25%", height: "50%", width: 3, borderRadius: 3, background: C.primary }} />}
              <item.icon size={18} />
              <div style={{ flex: 1 }}>
                <div>{item.label}</div>
                <div style={{ fontSize: 10, color: C.textDim, fontWeight: 400 }}>{item.desc}</div>
              </div>
              {item.badge > 0 && (
                <span style={{
                  background: C.danger, color: "#fff", borderRadius: 10, fontSize: 10,
                  fontWeight: 700, padding: "2px 7px", minWidth: 18, textAlign: "center",
                }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}`, marginTop: 12 }}>
        <div style={{ color: C.textMuted, fontSize: 11, marginBottom: 8, wordBreak: "break-word" }}>{user?.email || "Usuario"}</div>
        <Btn onClick={onLogout} variant="outline" color={C.danger} size="sm" style={{ width: "100%", justifyContent: "center" }}>
          <LogOut size={14} /> Salir
        </Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  HOME / DASHBOARD OVERVIEW
// ═══════════════════════════════════════════════

function HomeSection({ learning, finance, projects, reminders, journal }) {
  const courseProgress = Math.round((learning.completedSections / learning.totalSections) * 100);
  const totalHours = learning.weeklyHours.reduce((s, w) => s + w.hours, 0);
  const balance = finance.totalIngresos - finance.totalGastos;
  const activeProjects = projects.filter(p => p.status === "en progreso").length;
  const completedProjects = projects.filter(p => p.status === "completado").length;
  const pendingReminders = reminders.filter(r => !r.done).length;
  const today = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: C.text, fontSize: 26, fontWeight: 800, margin: 0 }}>Buenos dias, Ruben</h1>
        <p style={{ color: C.textMuted, fontSize: 14, margin: "4px 0 0 0", textTransform: "capitalize" }}>{today}</p>
      </div>

      <InfoBanner icon={Lightbulb} color={C.cyan} title="Bienvenido a FineLine">
        Este es tu centro de control. Aqui ves un resumen de todo: tu progreso de aprendizaje, finanzas, proyectos, recordatorios y diario.
        Usa el menu de la izquierda para ir a cada seccion y editarla.
        Las tarjetas de abajo se actualizan automaticamente cuando cambias datos en las otras secciones.
      </InfoBanner>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon={GraduationCap} label="Curso" value={`${courseProgress}%`} sub={`${learning.completedSections}/${learning.totalSections} secciones`} color={C.primary}
          tooltip="Porcentaje del curso de Colt Steele que has completado. Ve a 'Aprendizaje' para actualizar tus secciones." />
        <StatCard icon={Clock} label="Horas Estudio" value={totalHours} sub="este mes" color={C.cyan}
          tooltip="Total de horas que estudiaste este mes. Editalo en la seccion 'Aprendizaje' → horas por semana." />
        <StatCard icon={Wallet} label="Balance" value={`$${Math.abs(balance).toLocaleString()}`} sub={balance >= 0 ? "ganancia" : "perdida"} color={balance >= 0 ? C.secondary : C.danger}
          tooltip="Ingresos menos gastos. Si es verde, vas ganando. Si es rojo, tus gastos superan tus ingresos. Editalo en 'Finanzas'." />
        <StatCard icon={FolderOpen} label="Proyectos" value={`${activeProjects} activos`} sub={`${completedProjects} completados`} color={C.purple}
          tooltip="Proyectos que estas desarrollando actualmente. Ve a 'Proyectos' para agregar o actualizar." />
        <StatCard icon={Bell} label="Recordatorios" value={pendingReminders} sub="pendientes" color={C.accent}
          tooltip="Tareas que tienes pendientes por hacer. Ve a 'Recordatorios' para verlas y marcarlas como completadas." />
        <StatCard icon={PenLine} label="Diario" value={journal.length} sub="entradas" color={C.pink}
          tooltip="Cuantas entradas de diario has escrito. Ve a 'Diario' para documentar tu camino como desarrollador." />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <CardTitle icon={Zap} tooltip="Resumen de tu nivel actual en cada tecnologia. Se actualiza desde la seccion 'Aprendizaje'.">Habilidades Clave</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {learning.skills.map((s, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: C.text, fontSize: 13 }}>{s.name}</span>
                  <span style={{ color: C.primaryLight, fontSize: 12, fontWeight: 600 }}>{s.level}%</span>
                </div>
                <ProgressBar value={s.level} color={CHART_COLORS[i % CHART_COLORS.length]} height={6} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle icon={TrendingUp} tooltip="Grafica de tus ingresos (verde) y gastos (rojo) por mes. Edita los valores en la seccion 'Finanzas'.">
            Ingresos vs Gastos
          </CardTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={finance.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" stroke={C.textDim} fontSize={11} />
              <YAxis stroke={C.textDim} fontSize={11} />
              <RTooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }} />
              <Area type="monotone" dataKey="ingresos" stroke={C.secondary} fill={`${C.secondary}22`} name="Ingresos" />
              <Area type="monotone" dataKey="gastos" stroke={C.danger} fill={`${C.danger}22`} name="Gastos" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardTitle icon={PenLine} tooltip="Tus entradas de diario mas recientes. Ve a 'Diario' para escribir una nueva.">Diario Reciente</CardTitle>
          {journal.length === 0 ? (
            <EmptyState icon={PenLine} title="Tu diario esta vacio"
              description="El diario te ayuda a documentar tu progreso, reflexionar sobre lo aprendido y mantener la motivacion. Escribe tu primera entrada!" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {journal.slice(0, 3).map((entry) => (
                <div key={entry._id || entry.id} style={{ padding: "10px 14px", background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{entry.title}</span>
                    <span style={{ color: C.textDim, fontSize: 11 }}>{fmtDate(entry.date)}</span>
                  </div>
                  <p style={{ color: C.textMuted, fontSize: 12, margin: 0, lineHeight: 1.4,
                    overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                  }}>{entry.content}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardTitle icon={BellRing} tooltip="Recordatorios mas proximos. Ve a 'Recordatorios' para agregar nuevos o marcarlos como hechos.">Proximos Recordatorios</CardTitle>
          {reminders.filter(r => !r.done).length === 0 ? (
            <EmptyState icon={Bell} title="Sin recordatorios"
              description="Agrega recordatorios para no olvidar estudiar, enviar propuestas a clientes o hacer seguimiento de proyectos." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {reminders.filter(r => !r.done).slice(0, 5).map((r) => (
                <div key={r._id || r.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                    background: r.priority === "alta" ? C.danger : r.priority === "media" ? C.accent : C.secondary,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{r.title}</div>
                    <div style={{ color: C.textDim, fontSize: 11 }}>{fmtDateTime(r.datetime)}</div>
                  </div>
                  <Badge text={r.category} color={C.purple} />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  LEARNING SECTION
// ═══════════════════════════════════════════════

function LearningSection({ data, setData, saving }) {
  const courseProgress = Math.round((data.completedSections / data.totalSections) * 100);
  const totalHours = data.weeklyHours.reduce((s, w) => s + w.hours, 0);
  const avgSkill = Math.round(data.skills.reduce((s, sk) => s + sk.level, 0) / data.skills.length);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <SectionHeader icon={GraduationCap} title="Aprendizaje" color={C.primary}
          subtitle="Aqui llevas el control de tu progreso en el curso de Colt Steele, tus horas de estudio y el nivel de cada habilidad tecnica." />
        {saving && <span style={{ color: C.textMuted, fontSize: 12, fontStyle: "italic" }}>Guardando...</span>}
      </div>

      <InfoBanner icon={Info} color={C.primary} title="Como usar esta seccion">
        <strong>Secciones del curso:</strong> Cambia el numero de secciones completadas en el campo de abajo. La barra de progreso se actualiza sola.
        <br /><strong>Horas semanales:</strong> Escribe cuantas horas estudiaste cada semana. La grafica compara tus horas reales vs tu meta de 15h.
        <br /><strong>Habilidades:</strong> Arrastra los sliders para indicar tu nivel actual en cada tecnologia (0% = nada, 100% = dominio total).
      </InfoBanner>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon={BookOpen} label="Progreso Curso" value={`${courseProgress}%`} sub={`${data.completedSections}/${data.totalSections} secciones`} color={C.primary}
          tooltip="Cuantas secciones del curso llevas completadas del total. Actualizalo abajo." />
        <StatCard icon={Clock} label="Horas Totales" value={totalHours} sub="este mes" color={C.secondary}
          tooltip="Suma de todas las horas que has registrado en las 4 semanas del mes." />
        <StatCard icon={BarChart3} label="Promedio Habilidades" value={`${avgSkill}%`} color={C.accent}
          tooltip="Promedio de nivel de todas tus habilidades tecnicas. Actualizalo con los sliders de abajo." />
        <StatCard icon={Target} label="Meta Semanal" value="15h" sub="de estudio" color={C.purple}
          tooltip="Tu objetivo es estudiar 15 horas por semana. Las barras amarillas en la grafica representan esta meta." />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <Card>
          <CardTitle icon={BookOpen} tooltip="Escribe en el campo de la derecha cuantas secciones llevas. El curso tiene 63 secciones en total.">
            Progreso del Curso
          </CardTitle>
          <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 10 }}>{data.courseName}</div>
          <ProgressBar value={data.completedSections} max={data.totalSections} color={C.primary} height={14} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, alignItems: "center" }}>
            <span style={{ color: C.textMuted, fontSize: 13 }}>{courseProgress}% completado</span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ color: C.textMuted, fontSize: 12 }}>Secciones:</span>
              <NumberInput value={data.completedSections} onChange={(v) => setData({ ...data, completedSections: Math.max(0, Math.min(data.totalSections, v)) })} min={0} max={data.totalSections} />
              <span style={{ color: C.textDim, fontSize: 12 }}>/ {data.totalSections}</span>
              <Tip text="Escribe aqui el numero de secciones que llevas completadas en el curso. Ejemplo: si vas en la seccion 10, escribe 10." />
            </div>
          </div>
          {courseProgress === 100 && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: `${C.secondary}18`, borderRadius: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <Award size={18} color={C.secondary} />
              <span style={{ color: C.secondaryLight, fontSize: 13, fontWeight: 600 }}>Curso completado!</span>
            </div>
          )}
        </Card>

        <Card>
          <CardTitle icon={Timer} tooltip="Registra cuantas horas estudiaste cada semana. Las barras moradas son tus horas reales y las amarillas transparentes son tu meta de 15h.">
            Horas por Semana
          </CardTitle>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.weeklyHours}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="week" stroke={C.textDim} fontSize={11} />
              <YAxis stroke={C.textDim} fontSize={11} />
              <RTooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }} />
              <Bar dataKey="goal" fill={`${C.accent}33`} radius={[6, 6, 0, 0]} name="Meta" />
              <Bar dataKey="hours" fill={C.primary} radius={[6, 6, 0, 0]} name="Horas reales" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ color: C.textDim, fontSize: 11, marginTop: 6, marginBottom: 8 }}>
            Escribe las horas que estudiaste cada semana:
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {data.weeklyHours.map((w, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ color: C.textDim, fontSize: 11 }}>{w.week}:</span>
                <NumberInput value={w.hours} onChange={(v) => {
                  const wh = [...data.weeklyHours]; wh[i] = { ...wh[i], hours: Math.max(0, v) }; setData({ ...data, weeklyHours: wh });
                }} style={{ width: 48 }} />
                <span style={{ color: C.textDim, fontSize: 10 }}>h</span>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ gridColumn: "1 / -1" }}>
          <CardTitle icon={Zap} tooltip="Mueve los sliders para indicar que tan bien dominas cada tecnologia. 0% = no se nada, 50% = se lo basico, 100% = lo domino.">
            Nivel de Habilidades
          </CardTitle>
          <div style={{ color: C.textDim, fontSize: 12, marginTop: -10, marginBottom: 16 }}>
            Arrastra cada slider para reflejar tu nivel actual. La linea "Meta" es el nivel que necesitas para ser freelancer profesional.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {data.skills.map((skill, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{skill.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="range" min="0" max="100" value={skill.level}
                      onChange={(e) => {
                        const skills = [...data.skills]; skills[idx] = { ...skills[idx], level: parseInt(e.target.value) }; setData({ ...data, skills });
                      }}
                      style={{ width: 80, accentColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    <span style={{ color: CHART_COLORS[idx % CHART_COLORS.length], fontSize: 13, fontWeight: 700, minWidth: 35, textAlign: "right" }}>
                      {skill.level}%
                    </span>
                  </div>
                </div>
                <ProgressBar value={skill.level} max={100} color={skill.level >= skill.target ? C.secondary : CHART_COLORS[idx % CHART_COLORS.length]} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ color: C.textDim, fontSize: 10 }}>Meta para freelance: {skill.target}%</span>
                  {skill.level >= skill.target && <span style={{ color: C.secondary, fontSize: 10, fontWeight: 600 }}>Meta alcanzada</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  FINANCE SECTION
// ═══════════════════════════════════════════════

function FinanceSection({ data, setData, saving }) {
  const balance = data.totalIngresos - data.totalGastos;
  const [showAddIncome, setShowAddIncome] = useState(false);

  const [newIncome, setNewIncome] = useState({ source: "", amount: 0, month: "Ene" });

  function updateMonthly(idx, field, val) {
    const md = [...data.monthlyData];
    md[idx] = { ...md[idx], [field]: Math.max(0, val) };
    const totI = md.reduce((s, m) => s + m.ingresos, 0);
    const totG = md.reduce((s, m) => s + m.gastos, 0);
    setData({ ...data, monthlyData: md, totalIngresos: totI, totalGastos: totG });
  }

  function updateCategory(idx, val) {
    const cats = [...data.categories];
    cats[idx] = { ...cats[idx], value: Math.max(0, val) };
    const totG = cats.reduce((s, c) => s + c.value, 0);
    setData({ ...data, categories: cats, totalGastos: totG });
  }

  function addIncomeSource() {
    if (!newIncome.source || newIncome.amount <= 0) return;
    const sources = [...(data.incomeSources || []), { id: uid(), ...newIncome }];
    setData({ ...data, incomeSources: sources });
    setNewIncome({ source: "", amount: 0, month: "Ene" });
    setShowAddIncome(false);
  }

  function removeIncomeSource(id) {
    setData({ ...data, incomeSources: (data.incomeSources || []).filter(s => s.id !== id) });
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <SectionHeader icon={Wallet} title="Finanzas" color={C.secondary}
          subtitle="Lleva el control de cuanto dinero entra y cuanto sale. Asi puedes ver si tu negocio es rentable y donde se va tu dinero." />
        {saving && <span style={{ color: C.textMuted, fontSize: 12, fontStyle: "italic" }}>Guardando...</span>}
      </div>

      <InfoBanner icon={Info} color={C.secondary} title="Como funciona esta seccion">
        <strong>1. Tabla de meses:</strong> Escribe cuanto ganaste (ingresos) y cuanto gastaste cada mes. El "Neto" se calcula solo: ingresos - gastos.
        <br /><strong>2. Categorias de gasto:</strong> Desglosa tus gastos por tipo (internet, cursos, herramientas, etc.). Esto te ayuda a saber donde ahorrar.
        <br /><strong>3. Fuentes de ingreso:</strong> Registra de donde viene tu dinero: clientes, proyectos freelance, etc. Asi sabes quien te paga y cuanto.
        <br /><br /><em>Ejemplo: Si ganaste $5,000 MXN de un proyecto web en Abril, pon 5000 en "Ingresos" del mes Abr, y registra al cliente en "Fuentes de Ingreso".</em>
      </InfoBanner>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon={TrendingUp} label="Ingresos" value={`$${data.totalIngresos.toLocaleString()}`} sub="MXN total" color={C.secondary}
          tooltip="Suma de todo el dinero que has ganado en todos los meses. Aumenta cuando registras ingresos en la tabla." />
        <StatCard icon={DollarSign} label="Gastos" value={`$${data.totalGastos.toLocaleString()}`} sub="MXN total" color={C.danger}
          tooltip="Suma de todo lo que has gastado. Se calcula desde la tabla mensual o las categorias de gasto." />
        <StatCard icon={Briefcase} label="Balance" value={`$${Math.abs(balance).toLocaleString()}`} sub={balance >= 0 ? "ganancia neta" : "perdida neta"} color={balance >= 0 ? C.secondary : C.danger}
          tooltip="Ingresos menos Gastos. Verde = vas ganando dinero. Rojo = estas gastando mas de lo que ganas." />
        <StatCard icon={Target} label="Meta Mensual" value="$10,000" sub="MXN" color={C.accent}
          tooltip="Tu objetivo es llegar a generar $10,000 MXN al mes con proyectos de software. Esto se actualiza conforme crezcas." />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Monthly Table + Chart */}
        <Card>
          <CardTitle icon={TrendingUp} tooltip="Grafica de barras: verde = ingresos, rojo = gastos. Edita los numeros en la tabla de abajo y la grafica se actualiza.">
            Ingresos vs Gastos por Mes
          </CardTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" stroke={C.textDim} fontSize={11} />
              <YAxis stroke={C.textDim} fontSize={11} />
              <RTooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }} />
              <Bar dataKey="ingresos" fill={C.secondary} radius={[6, 6, 0, 0]} name="Ingresos" />
              <Bar dataKey="gastos" fill={C.danger} radius={[6, 6, 0, 0]} name="Gastos" />
            </BarChart>
          </ResponsiveContainer>

          <div style={{ color: C.textDim, fontSize: 11, margin: "12px 0 8px 0", display: "flex", alignItems: "center", gap: 4 }}>
            Edita los valores de cada mes aqui abajo:
            <Tip text="Escribe cuanto dinero ganaste (verde) y cuanto gastaste (rojo) cada mes. La columna 'Neto' muestra si ese mes fue positivo o negativo." />
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ color: C.textDim, fontSize: 11, textAlign: "left", padding: "6px 8px", borderBottom: `1px solid ${C.border}` }}>Mes</th>
                <th style={{ color: C.secondaryLight, fontSize: 11, textAlign: "center", padding: "6px 8px", borderBottom: `1px solid ${C.border}` }}>
                  Ingresos (MXN)
                </th>
                <th style={{ color: C.dangerLight, fontSize: 11, textAlign: "center", padding: "6px 8px", borderBottom: `1px solid ${C.border}` }}>
                  Gastos (MXN)
                </th>
                <th style={{ color: C.textDim, fontSize: 11, textAlign: "center", padding: "6px 8px", borderBottom: `1px solid ${C.border}` }}>Neto</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlyData.map((m, i) => {
                const neto = m.ingresos - m.gastos;
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}11` }}>
                    <td style={{ color: C.text, fontSize: 13, padding: "8px" }}>{m.month}</td>
                    <td style={{ textAlign: "center", padding: "6px 8px" }}>
                      <NumberInput value={m.ingresos} onChange={(v) => updateMonthly(i, "ingresos", v)} style={{ color: C.secondaryLight }} />
                    </td>
                    <td style={{ textAlign: "center", padding: "6px 8px" }}>
                      <NumberInput value={m.gastos} onChange={(v) => updateMonthly(i, "gastos", v)} style={{ color: C.dangerLight }} />
                    </td>
                    <td style={{ textAlign: "center", padding: "6px 8px" }}>
                      <span style={{ color: neto >= 0 ? C.secondary : C.danger, fontSize: 13, fontWeight: 600 }}>
                        {neto >= 0 ? "+" : ""}${neto.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardTitle icon={BarChart3} tooltip="Desglosa tus gastos por categoria. Cambia los numeros para ver como se distribuye tu dinero en la grafica circular.">
            Categorias de Gasto
          </CardTitle>
          <div style={{ color: C.textDim, fontSize: 11, marginTop: -10, marginBottom: 12 }}>
            Escribe cuanto gastas en cada categoria. La grafica circular muestra la proporcion de cada gasto.
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={data.categories.filter(c => c.value > 0)} cx="50%" cy="50%" outerRadius={75} innerRadius={42} dataKey="value" paddingAngle={3}>
                {data.categories.filter(c => c.value > 0).map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <RTooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {data.categories.map((cat, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
                <span style={{ color: C.text, fontSize: 13, flex: 1 }}>{cat.name}</span>
                <span style={{ color: C.textDim, fontSize: 12 }}>$</span>
                <NumberInput value={cat.value} onChange={(v) => updateCategory(idx, v)} />
                <span style={{ color: C.textDim, fontSize: 10 }}>MXN</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Income Sources */}
        <Card style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <CardTitle icon={DollarSign} color={C.secondary} tooltip="Registra de donde viene cada ingreso: clientes, proyectos freelance, soporte tecnico, etc. Asi puedes ver cuales clientes te generan mas dinero.">
              Fuentes de Ingreso
            </CardTitle>
            <Btn onClick={() => setShowAddIncome(true)} size="sm"><Plus size={14} /> Agregar Ingreso</Btn>
          </div>

          <div style={{ color: C.textDim, fontSize: 12, marginTop: -10, marginBottom: 16, lineHeight: 1.5 }}>
            Cada vez que recibas un pago de un cliente o proyecto, registralo aqui con el nombre del cliente, cuanto te pago y en que mes.
            Esto te ayuda a saber de donde viene tu dinero y cuales son tus mejores clientes.
          </div>

          {(data.incomeSources || []).length === 0 ? (
            <EmptyState icon={DollarSign} title="Sin ingresos registrados"
              description="Cuando consigas tu primer cliente o proyecto freelance, registra el pago aqui. Ejemplo: 'Pagina web para Taqueria El Gordo — $5,000 MXN — Abril'."
              actionLabel="Registrar primer ingreso" onAction={() => setShowAddIncome(true)} />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              {(data.incomeSources || []).map((src) => (
                <div key={src.id} style={{
                  padding: "14px 16px", background: C.bg, borderRadius: 12, border: `1px solid ${C.border}`,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{src.source}</div>
                    <div style={{ color: C.textDim, fontSize: 11 }}>{src.month}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: C.secondary, fontSize: 16, fontWeight: 700 }}>${src.amount.toLocaleString()}</span>
                    <button onClick={() => removeIncomeSource(src.id)} style={{ background: "transparent", border: "none", color: C.textDim, cursor: "pointer", padding: 2 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Modal open={showAddIncome} onClose={() => setShowAddIncome(false)} title="Agregar Fuente de Ingreso"
            subtitle="Registra un pago que recibiste de un cliente, proyecto freelance o cualquier otra fuente de dinero.">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Input value={newIncome.source} onChange={(v) => setNewIncome({ ...newIncome, source: v })}
                label="Cliente o fuente"
                placeholder="Ej: Pagina web para restaurante"
                helpText="Escribe el nombre del cliente o describe el proyecto que te pago." />
              <Input type="number" value={newIncome.amount} onChange={(v) => setNewIncome({ ...newIncome, amount: parseInt(v) || 0 })}
                label="Monto (MXN)"
                placeholder="Ej: 5000"
                helpText="Cuanto te pagaron en pesos mexicanos." />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ color: C.textMuted, fontSize: 12, fontWeight: 500 }}>Mes del pago</label>
                <select value={newIncome.month} onChange={(e) => setNewIncome({ ...newIncome, month: e.target.value })}
                  style={{ padding: "9px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 14 }}>
                  {["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <span style={{ color: C.textDim, fontSize: 11 }}>En que mes recibiste este pago.</span>
              </div>
              <Btn onClick={addIncomeSource}><DollarSign size={16} /> Registrar Ingreso</Btn>
            </div>
          </Modal>
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  PROJECTS SECTION
// ═══════════════════════════════════════════════

function ProjectsSection({ projects, setProjects, saving }) {
  const [showForm, setShowForm] = useState(false);
  const [np, setNp] = useState({ name: "", tech: "", description: "", client: "" });
  const statusColors = { "pendiente": C.textMuted, "en progreso": C.accent, "completado": C.secondary };
  const statusIcons = { "pendiente": Circle, "en progreso": Clock, "completado": CheckCircle };

  function addProject() {
    if (!np.name) return;
    setProjects([...projects, {
      id: uid(), name: np.name, status: "pendiente",
      tech: np.tech.split(",").map(t => t.trim()).filter(Boolean),
      description: np.description, client: np.client, progress: 0,
      createdAt: new Date().toISOString(),
    }]);
    setNp({ name: "", tech: "", description: "", client: "" });
    setShowForm(false);
  }

  function updateProgress(id, val) {
    setProjects(projects.map(p => {
      if (p.id !== id && p._id !== id) return p;
      const progress = Math.max(0, Math.min(100, val));
      const status = progress === 100 ? "completado" : progress > 0 ? "en progreso" : "pendiente";
      return { ...p, progress, status };
    }));
  }

  const completed = projects.filter(p => p.status === "completado").length;
  const inProgress = projects.filter(p => p.status === "en progreso").length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <SectionHeader icon={FolderOpen} title="Proyectos" color={C.purple}
          subtitle="Tu portafolio de proyectos. Aqui registras cada proyecto que estas haciendo o que ya terminaste, con las tecnologias que usaste." />
        {saving && <span style={{ color: C.textMuted, fontSize: 12, fontStyle: "italic" }}>Guardando...</span>}
      </div>

      <InfoBanner icon={Info} color={C.purple} title="Como usar esta seccion">
        <strong>Agregar proyecto:</strong> Haz clic en "Nuevo Proyecto" y llena los datos.
        <br /><strong>Actualizar progreso:</strong> Cambia el numero de porcentaje en cada tarjeta. Si pones 100%, se marca como completado automaticamente.
        <br /><strong>Cliente:</strong> Si el proyecto es para un cliente, escribe su nombre. Esto te ayuda a llevar un registro profesional.
        <br /><br /><em>Tip: Cada proyecto que completes es pieza de portafolio que puedes mostrar a futuros clientes.</em>
      </InfoBanner>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Btn onClick={() => setShowForm(true)}><Plus size={16} /> Nuevo Proyecto</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon={FolderOpen} label="Total" value={projects.length} color={C.primary}
          tooltip="Numero total de proyectos registrados (pendientes + en progreso + completados)." />
        <StatCard icon={Clock} label="En Progreso" value={inProgress} color={C.accent}
          tooltip="Proyectos que ya empezaste pero no has terminado (progreso entre 1% y 99%)." />
        <StatCard icon={CheckCircle} label="Completados" value={completed} color={C.secondary}
          tooltip="Proyectos terminados (100% de progreso). Estos son los que muestras en tu portafolio." />
        <StatCard icon={Users} label="Con Cliente" value={projects.filter(p => p.client).length} color={C.purple}
          tooltip="Proyectos que hiciste para un cliente que te pago. Sirve para medir tu experiencia profesional." />
      </div>

      {projects.length === 0 ? (
        <EmptyState icon={FolderOpen} title="Sin proyectos aun"
          description="Agrega tu primer proyecto. Puede ser algo que estes practicando del curso o un proyecto personal. Todo cuenta para tu portafolio!"
          actionLabel="Crear primer proyecto" onAction={() => setShowForm(true)} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
          {projects.map((project) => {
            const SIcon = statusIcons[project.status];
            return (
              <Card key={project._id || project.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <h4 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>{project.name}</h4>
                    <p style={{ color: C.textMuted, fontSize: 12, margin: "4px 0 0 0" }}>{project.description}</p>
                  </div>
                  <button onClick={() => setProjects(projects.filter(p => (p._id || p.id) !== (project._id || project.id)))}
                    style={{ background: "transparent", border: "none", color: C.textDim, cursor: "pointer", padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <SIcon size={14} color={statusColors[project.status]} />
                  <span style={{ color: statusColors[project.status], fontSize: 12, fontWeight: 500, textTransform: "capitalize" }}>{project.status}</span>
                  {project.client && <Badge text={project.client} color={C.cyan} />}
                </div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {project.tech.map((t, i) => <Badge key={i} text={t} color={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1 }}><ProgressBar value={project.progress} color={statusColors[project.status]} /></div>
                  <NumberInput value={project.progress} onChange={(v) => updateProgress(project._id || project.id, v)} min={0} max={100} style={{ width: 50 }} />
                  <span style={{ color: C.textDim, fontSize: 11 }}>%</span>
                  <Tip text="Escribe el porcentaje de avance. 0 = sin empezar, 50 = a la mitad, 100 = terminado." />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nuevo Proyecto"
        subtitle="Registra un proyecto nuevo. Puede ser de practica, personal o para un cliente.">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input value={np.name} onChange={(v) => setNp({ ...np, name: v })}
            label="Nombre del proyecto" placeholder="Ej: Pagina web para restaurante"
            helpText="Un nombre corto y descriptivo para identificar el proyecto." />
          <Input value={np.tech} onChange={(v) => setNp({ ...np, tech: v })}
            label="Tecnologias" placeholder="Ej: React, Node.js, MongoDB"
            helpText="Separadas por coma. Estas son las herramientas que usas/usaras en este proyecto." />
          <Input value={np.client} onChange={(v) => setNp({ ...np, client: v })}
            label="Cliente (opcional)" placeholder="Ej: Taqueria El Gordo"
            helpText="Si es para un cliente, escribe su nombre. Dejalo vacio si es un proyecto personal." />
          <TextArea value={np.description} onChange={(v) => setNp({ ...np, description: v })}
            label="Descripcion" placeholder="Que hace este proyecto? Para que sirve?"
            helpText="Breve descripcion de que se trata el proyecto." rows={3} />
          <Btn onClick={addProject}><Plus size={16} /> Crear Proyecto</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  JOURNAL / DIARIO
// ═══════════════════════════════════════════════

function JournalSection({ entries, setEntries, saving }) {
  const [showNew, setShowNew] = useState(false);
  const [ne, setNe] = useState({ title: "", content: "", mood: "neutral", tags: "" });

  const moods = [
    { label: "Productivo", emoji: "🔥", value: "productivo", color: C.secondary },
    { label: "Bien", emoji: "😊", value: "bien", color: C.primary },
    { label: "Neutral", emoji: "😐", value: "neutral", color: C.textMuted },
    { label: "Frustrado", emoji: "😤", value: "frustrado", color: C.accent },
    { label: "Cansado", emoji: "😴", value: "cansado", color: C.purple },
  ];

  function addEntry() {
    if (!ne.title || !ne.content) return;
    setEntries([{
      id: uid(), title: ne.title, content: ne.content, mood: ne.mood,
      tags: ne.tags.split(",").map(t => t.trim()).filter(Boolean),
      date: new Date().toISOString(),
    }, ...entries]);
    setNe({ title: "", content: "", mood: "neutral", tags: "" });
    setShowNew(false);
  }

  const moodCounts = moods.map(m => ({ name: `${m.emoji} ${m.label}`, count: entries.filter(e => e.mood === m.value).length, color: m.color }));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <SectionHeader icon={PenLine} title="Diario" color={C.pink}
          subtitle="Documenta tu camino como desarrollador. Escribe sobre lo que aprendes, los retos que enfrentas y como te sientes. Es tu bitacora personal." />
        {saving && <span style={{ color: C.textMuted, fontSize: 12, fontStyle: "italic" }}>Guardando...</span>}
      </div>

      <InfoBanner icon={Info} color={C.pink} title="Para que sirve el diario?">
        <strong>Reflexion:</strong> Escribir te ayuda a procesar lo que aprendes y a recordarlo mejor.
        <br /><strong>Motivacion:</strong> Cuando sientas que no avanzas, puedes leer entradas anteriores y ver cuanto has crecido.
        <br /><strong>Portafolio:</strong> Muchos desarrolladores exitosos documentan su aprendizaje publicamente (se llama "learning in public").
        <br /><br /><em>Tip: Intenta escribir al menos una entrada por semana sobre lo que aprendiste.</em>
      </InfoBanner>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Btn onClick={() => setShowNew(true)}><PenLine size={16} /> Nueva Entrada</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon={PenLine} label="Total Entradas" value={entries.length} color={C.pink}
          tooltip="Cuantas entradas de diario has escrito en total." />
        <StatCard icon={Star} label="Animo Frecuente" value={entries.length > 0 ? (moodCounts.sort((a,b) => b.count - a.count)[0]?.name || "—") : "—"} color={C.accent}
          tooltip="El estado de animo que mas has registrado. Te ayuda a ver tendencias en como te sientes." />
        <StatCard icon={Calendar} label="Racha" value={`${Math.min(entries.length, 7)} dias`} sub="sigue escribiendo" color={C.secondary}
          tooltip="Cuantos dias consecutivos has escrito. Intenta mantener una racha de al menos 7 dias!" />
      </div>

      {entries.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <CardTitle icon={BarChart3} tooltip="Grafica que muestra cuantas veces has sentido cada estado de animo. Te ayuda a identificar patrones.">
            Estado de Animo
          </CardTitle>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={moodCounts.filter(m => m.count > 0)} layout="vertical">
              <XAxis type="number" stroke={C.textDim} fontSize={11} />
              <YAxis dataKey="name" type="category" stroke={C.textDim} fontSize={11} width={100} />
              <RTooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Veces">
                {moodCounts.filter(m => m.count > 0).map((m, i) => <Cell key={i} fill={m.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {entries.length === 0 ? (
          <EmptyState icon={PenLine} title="Tu diario esta vacio"
            description="Empieza a documentar tu camino. Escribe sobre lo que aprendiste hoy, un problema que resolviste, o como te sientes con tu progreso."
            actionLabel="Escribir primera entrada" onAction={() => setShowNew(true)} />
        ) : entries.map((entry) => (
          <Card key={entry._id || entry.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <h4 style={{ color: C.text, fontSize: 16, fontWeight: 600, margin: 0 }}>{entry.title}</h4>
                  <Badge text={`${moods.find(m => m.value === entry.mood)?.emoji || ""} ${moods.find(m => m.value === entry.mood)?.label || entry.mood}`} color={moods.find(m => m.value === entry.mood)?.color || C.textMuted} />
                </div>
                <span style={{ color: C.textDim, fontSize: 12 }}>{fmtDateTime(entry.date)}</span>
                <p style={{ color: C.textMuted, fontSize: 14, lineHeight: 1.6, margin: "10px 0 0 0", whiteSpace: "pre-wrap" }}>{entry.content}</p>
                {entry.tags?.length > 0 && (
                  <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    {entry.tags.map((t, i) => <Badge key={i} text={`#${t}`} color={C.textDim} />)}
                  </div>
                )}
              </div>
              <button onClick={() => setEntries(entries.filter(e => (e._id || e.id) !== (entry._id || entry.id)))} style={{ background: "transparent", border: "none", color: C.textDim, cursor: "pointer", padding: 4 }}>
                <Trash2 size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nueva Entrada de Diario"
        subtitle="Escribe sobre lo que aprendiste, hiciste o sentiste hoy. No tiene que ser largo ni perfecto.">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input value={ne.title} onChange={(v) => setNe({ ...ne, title: v })}
            label="Titulo" placeholder="Ej: Aprendi a usar useEffect en React"
            helpText="Un titulo corto que describa de que se trata esta entrada." />
          <TextArea value={ne.content} onChange={(v) => setNe({ ...ne, content: v })}
            label="Que quieres escribir?" placeholder="Hoy aprendi que React usa hooks para manejar estado. Al principio fue confuso pero despues de practicar..."
            helpText="Escribe libremente. Puede ser sobre lo que aprendiste, un problema que resolviste, o simplemente como te fue el dia." rows={5} />
          <div>
            <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 8, fontWeight: 500 }}>Como te sientes hoy?</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {moods.map(m => (
                <button key={m.value} onClick={() => setNe({ ...ne, mood: m.value })} style={{
                  padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 13,
                  border: ne.mood === m.value ? `2px solid ${m.color}` : `1px solid ${C.border}`,
                  background: ne.mood === m.value ? `${m.color}22` : "transparent",
                  color: ne.mood === m.value ? m.color : C.textMuted,
                }}>{m.emoji} {m.label}</button>
              ))}
            </div>
            <div style={{ color: C.textDim, fontSize: 11, marginTop: 6 }}>Selecciona el que mejor describa como te sientes. Esto te ayuda a ver tendencias.</div>
          </div>
          <Input value={ne.tags} onChange={(v) => setNe({ ...ne, tags: v })}
            label="Tags (opcional)" placeholder="Ej: react, javascript, primer-proyecto"
            helpText="Palabras clave separadas por coma para categorizar la entrada." />
          <Btn onClick={addEntry}><PenLine size={16} /> Guardar Entrada</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  REMINDERS / RECORDATORIOS
// ═══════════════════════════════════════════════

function RemindersSection({ reminders, setReminders, saving }) {
  const [showNew, setShowNew] = useState(false);
  const [nr, setNr] = useState({ title: "", description: "", datetime: "", priority: "media", category: "estudio", repeat: "none" });
  const [notifPermission, setNotifPermission] = useState("default");

  useEffect(() => {
    if (typeof Notification !== "undefined") setNotifPermission(Notification.permission);
  }, []);

  function requestNotifPermission() {
    if (typeof Notification !== "undefined") Notification.requestPermission().then(p => setNotifPermission(p));
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      reminders.forEach(r => {
        if (r.done || r.notified) return;
        const rDate = new Date(r.datetime);
        if (rDate <= now && typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("FineLine — Recordatorio", { body: r.title });
          setReminders(prev => prev.map(rem => (rem._id || rem.id) === (r._id || r.id) ? { ...rem, notified: true } : rem));
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [reminders]);

  function addReminder() {
    if (!nr.title || !nr.datetime) return;
    setReminders([...reminders, { id: uid(), ...nr, done: false, notified: false, createdAt: new Date().toISOString() }]);
    setNr({ title: "", description: "", datetime: "", priority: "media", category: "estudio", repeat: "none" });
    setShowNew(false);
  }

  const pending = reminders.filter(r => !r.done);
  const done = reminders.filter(r => r.done);
  const priorityColors = { alta: C.danger, media: C.accent, baja: C.secondary };
  const categories = ["estudio", "negocio", "proyecto", "personal", "finanzas"];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <SectionHeader icon={Bell} title="Recordatorios" color={C.accent}
          subtitle="Tus tareas pendientes y recordatorios. Nunca olvides estudiar, enviar una cotizacion o dar seguimiento a un cliente." />
        {saving && <span style={{ color: C.textMuted, fontSize: 12, fontStyle: "italic" }}>Guardando...</span>}
      </div>

      <InfoBanner icon={Info} color={C.accent} title="Como funcionan los recordatorios">
        <strong>Crear:</strong> Haz clic en "Nuevo", escribe que necesitas recordar, pon la fecha/hora y la prioridad.
        <br /><strong>Completar:</strong> Haz clic en el cuadrito a la izquierda de cada recordatorio para marcarlo como hecho.
        <br /><strong>Notificaciones:</strong> Si activas las notificaciones del navegador, recibiras una alerta cuando llegue la hora del recordatorio.
        <br /><strong>Prioridades:</strong> Rojo = urgente, Amarillo = importante, Verde = puede esperar.
      </InfoBanner>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 16 }}>
        {notifPermission !== "granted" && (
          <Btn onClick={requestNotifPermission} variant="outline" color={C.accent} size="sm">
            <BellRing size={14} /> Activar Notificaciones
          </Btn>
        )}
        <Btn onClick={() => setShowNew(true)}><Plus size={16} /> Nuevo Recordatorio</Btn>
      </div>

      {notifPermission === "granted" && (
        <div style={{ padding: "10px 16px", background: `${C.secondary}12`, borderRadius: 10, border: `1px solid ${C.secondary}33`, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle size={16} color={C.secondary} />
          <span style={{ color: C.secondaryLight, fontSize: 13 }}>Notificaciones activadas. Recibiras alertas cuando se cumpla la hora de tus recordatorios.</span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard icon={Bell} label="Pendientes" value={pending.length} color={C.accent}
          tooltip="Recordatorios que aun no has completado." />
        <StatCard icon={CheckCircle} label="Completados" value={done.length} color={C.secondary}
          tooltip="Recordatorios que ya marcaste como hechos." />
        <StatCard icon={AlertCircle} label="Prioridad Alta" value={pending.filter(r => r.priority === "alta").length} color={C.danger}
          tooltip="Recordatorios urgentes que deberias atender primero." />
      </div>

      <Card style={{ marginBottom: 16 }}>
        <CardTitle icon={Clock} tooltip="Lista de recordatorios que aun no has completado, ordenados por fecha (los mas proximos primero).">
          Pendientes ({pending.length})
        </CardTitle>
        {pending.length === 0 ? (
          <EmptyState icon={CheckCircle} title="Todo al dia!"
            description="No tienes recordatorios pendientes. Agrega uno nuevo cuando necesites recordar algo importante." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pending.sort((a, b) => new Date(a.datetime) - new Date(b.datetime)).map(r => (
              <div key={r._id || r.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                background: C.bg, borderRadius: 12, border: `1px solid ${C.border}`,
                borderLeft: `4px solid ${priorityColors[r.priority]}`,
              }}>
                <button onClick={() => setReminders(reminders.map(rem => (rem._id || rem.id) === (r._id || r.id) ? { ...rem, done: true } : rem))} style={{
                  width: 22, height: 22, borderRadius: 6, cursor: "pointer", flexShrink: 0,
                  border: `2px solid ${C.border}`, background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
                }}><Tip text="Haz clic aqui para marcar como completado" /></button>
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{r.title}</div>
                  {r.description && <div style={{ color: C.textMuted, fontSize: 12, marginTop: 2 }}>{r.description}</div>}
                  <div style={{ display: "flex", gap: 8, marginTop: 6, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ color: C.textDim, fontSize: 11 }}>{fmtDateTime(r.datetime)}</span>
                    <Badge text={r.category} color={C.purple} />
                    <Badge text={r.priority} color={priorityColors[r.priority]} />
                    {r.repeat !== "none" && <Badge text={`Repite: ${r.repeat}`} color={C.cyan} />}
                  </div>
                </div>
                <button onClick={() => setReminders(reminders.filter(rem => (rem._id || rem.id) !== (r._id || r.id)))} style={{ background: "transparent", border: "none", color: C.textDim, cursor: "pointer" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {done.length > 0 && (
        <Card>
          <CardTitle icon={CheckCircle} color={C.secondary}>Completados ({done.length})</CardTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {done.map(r => (
              <div key={r._id || r.id} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                background: C.bg, borderRadius: 10, opacity: 0.6,
              }}>
                <CheckCircle size={16} color={C.secondary} />
                <span style={{ color: C.textMuted, fontSize: 13, textDecoration: "line-through", flex: 1 }}>{r.title}</span>
                <button onClick={() => setReminders(reminders.filter(rem => (rem._id || rem.id) !== (r._id || r.id)))} style={{ background: "transparent", border: "none", color: C.textDim, cursor: "pointer" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Nuevo Recordatorio"
        subtitle="Crea un recordatorio para no olvidar tareas importantes como estudiar, enviar propuestas o dar seguimiento a clientes.">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input value={nr.title} onChange={(v) => setNr({ ...nr, title: v })}
            label="Que necesitas recordar?" placeholder="Ej: Estudiar 2 horas de React"
            helpText="Describe brevemente la tarea o recordatorio." />
          <Input value={nr.description} onChange={(v) => setNr({ ...nr, description: v })}
            label="Detalles (opcional)" placeholder="Ej: Completar la seccion de hooks"
            helpText="Informacion adicional que te ayude a recordar que hacer exactamente." />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ color: C.textMuted, fontSize: 12, fontWeight: 500 }}>Fecha y hora</label>
            <Input type="datetime-local" value={nr.datetime} onChange={(v) => setNr({ ...nr, datetime: v })} />
            <span style={{ color: C.textDim, fontSize: 11 }}>Cuando quieres que te recuerde. Si activaste notificaciones, recibiras una alerta a esta hora.</span>
          </div>
          <div>
            <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 6, fontWeight: 500 }}>Prioridad</div>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { v: "baja", desc: "Puede esperar" },
                { v: "media", desc: "Importante" },
                { v: "alta", desc: "Urgente" }
              ].map(p => (
                <button key={p.v} onClick={() => setNr({ ...nr, priority: p.v })} style={{
                  padding: "6px 16px", borderRadius: 20, cursor: "pointer", fontSize: 13, textTransform: "capitalize",
                  border: nr.priority === p.v ? `2px solid ${priorityColors[p.v]}` : `1px solid ${C.border}`,
                  background: nr.priority === p.v ? `${priorityColors[p.v]}22` : "transparent",
                  color: nr.priority === p.v ? priorityColors[p.v] : C.textMuted,
                }}>{p.v}</button>
              ))}
            </div>
            <div style={{ color: C.textDim, fontSize: 11, marginTop: 4 }}>Rojo = hazlo ya. Amarillo = esta semana. Verde = cuando puedas.</div>
          </div>
          <div>
            <div style={{ color: C.textMuted, fontSize: 12, marginBottom: 6, fontWeight: 500 }}>Categoria</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setNr({ ...nr, category: cat })} style={{
                  padding: "6px 14px", borderRadius: 20, cursor: "pointer", fontSize: 12, textTransform: "capitalize",
                  border: nr.category === cat ? `2px solid ${C.purple}` : `1px solid ${C.border}`,
                  background: nr.category === cat ? `${C.purple}22` : "transparent",
                  color: nr.category === cat ? C.purple : C.textMuted,
                }}>{cat}</button>
              ))}
            </div>
            <div style={{ color: C.textDim, fontSize: 11, marginTop: 4 }}>Clasifica el recordatorio para que sea mas facil encontrarlo despues.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ color: C.textMuted, fontSize: 12, fontWeight: 500 }}>Repetir</label>
            <select value={nr.repeat} onChange={(e) => setNr({ ...nr, repeat: e.target.value })}
              style={{ padding: "9px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, color: C.text, fontSize: 14, width: "100%" }}>
              <option value="none">No repetir (solo una vez)</option>
              <option value="diario">Diario (todos los dias)</option>
              <option value="semanal">Semanal (cada 7 dias)</option>
              <option value="mensual">Mensual (cada 30 dias)</option>
            </select>
            <span style={{ color: C.textDim, fontSize: 11 }}>Si es algo recurrente como "estudiar diario", selecciona la frecuencia.</span>
          </div>
          <Btn onClick={addReminder}><Bell size={16} /> Crear Recordatorio</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  ROADMAP
// ═══════════════════════════════════════════════

const ROADMAP_DATA = [
  {
    id: "phase1", phase: "Fase 1", title: "Fundamentos", timeframe: "Mes 1-3",
    color: C.primary, icon: BookOpen,
    description: "Dominar las bases del desarrollo web. Es la etapa de aprender, practicar y construir tus primeros proyectos.",
    tasks: [
      { text: "Completar curso de Colt Steele (HTML, CSS, JS)", done: false },
      { text: "Construir 3 proyectos de practica", done: false },
      { text: "Aprender Git y GitHub", done: false },
      { text: "Crear perfil de LinkedIn profesional", done: false },
      { text: "Practicar ingles tecnico (30 min/dia)", done: false },
    ],
  },
  {
    id: "phase2", phase: "Fase 2", title: "Especializacion", timeframe: "Mes 3-6",
    color: C.secondary, icon: Code,
    description: "Profundizar en React y Node.js para poder construir aplicaciones completas de principio a fin.",
    tasks: [
      { text: "Curso avanzado de React (hooks, context, routing)", done: false },
      { text: "Aprender TypeScript", done: false },
      { text: "Construir portafolio profesional", done: false },
      { text: "Primer proyecto full-stack completo", done: false },
      { text: "Aprender bases de datos (MongoDB + SQL basico)", done: false },
    ],
  },
  {
    id: "phase3", phase: "Fase 3", title: "Primeros Ingresos", timeframe: "Mes 6-9",
    color: C.accent, icon: DollarSign,
    description: "Empezar a ganar dinero con tus habilidades. Conseguir clientes locales y en plataformas internacionales.",
    tasks: [
      { text: "Crear perfiles en Upwork y Fiverr", done: false },
      { text: "Completar 3 proyectos freelance", done: false },
      { text: "Ofrecer servicios a negocios locales de Leon", done: false },
      { text: "Establecer precios y proceso de cotizacion", done: false },
      { text: "Primer cliente internacional", done: false },
    ],
  },
  {
    id: "phase4", phase: "Fase 4", title: "Formalizacion", timeframe: "Mes 9-12",
    color: C.purple, icon: Building2,
    description: "Constituir legalmente tu empresa. Registrarte en el SAT, abrir cuenta bancaria y crear identidad de marca.",
    tasks: [
      { text: "Registrarte en el SAT (RESICO)", done: false },
      { text: "Obtener e.firma y sellos digitales", done: false },
      { text: "Abrir cuenta bancaria empresarial", done: false },
      { text: "Registrar marca FineLine en IMPI", done: false },
      { text: "Crear sitio web de la empresa", done: false },
      { text: "Definir servicios y precios formales", done: false },
    ],
  },
  {
    id: "phase5", phase: "Fase 5", title: "Escalamiento", timeframe: "Año 2",
    color: C.pink, icon: Rocket,
    description: "Crecer el negocio: facturar consistentemente, contratar ayuda y explorar productos propios.",
    tasks: [
      { text: "Facturar $10,000+ MXN mensuales consistentes", done: false },
      { text: "Contratar primer colaborador freelance", done: false },
      { text: "Desarrollar producto propio (SaaS)", done: false },
      { text: "Marketing digital y presencia en redes", done: false },
      { text: "Networking en comunidad tech de Leon/Bajio", done: false },
      { text: "Explorar constitucion como persona moral (S.A.S.)", done: false },
    ],
  },
];

function RoadmapSection({ roadmap, setRoadmap, saving }) {
  function toggleTask(phaseIdx, taskIdx) {
    const nr = [...roadmap];
    nr[phaseIdx] = { ...nr[phaseIdx], tasks: nr[phaseIdx].tasks.map((t, i) => i === taskIdx ? { ...t, done: !t.done } : t) };
    setRoadmap(nr);
  }

  const totalTasks = roadmap.reduce((s, p) => s + p.tasks.length, 0);
  const doneTasks = roadmap.reduce((s, p) => s + p.tasks.filter(t => t.done).length, 0);
  const overallProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <SectionHeader icon={Map} title="Roadmap: De Cero a Empresa" color={C.cyan}
          subtitle="Tu plan completo paso a paso para ir de aprender a programar hasta tener tu propia empresa de software en Leon, Guanajuato." />
        {saving && <span style={{ color: C.textMuted, fontSize: 12, fontStyle: "italic" }}>Guardando...</span>}
      </div>

      <InfoBanner icon={Info} color={C.cyan} title="Como usar el roadmap">
        <strong>Fases:</strong> El camino esta dividido en 5 fases. Cada una tiene tareas especificas que puedes marcar como completadas.
        <br /><strong>Marcar tareas:</strong> Haz clic en cualquier tarea para marcarla como hecha. La barra de progreso se actualiza automaticamente.
        <br /><strong>No te saltes fases:</strong> Cada fase construye sobre la anterior. Completa las tareas en orden para tener una base solida.
        <br /><br /><em>Este roadmap es tu guia, pero no es rigido. Puedes ajustar los tiempos segun tu ritmo.</em>
      </InfoBanner>

      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 70, height: 70, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: `conic-gradient(${C.primary} ${overallProgress * 3.6}deg, ${C.border} 0deg)`, flexShrink: 0,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: C.card,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: C.text, fontSize: 16, fontWeight: 800,
            }}>{overallProgress}%</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.text, fontSize: 16, fontWeight: 600 }}>Progreso General</div>
            <div style={{ color: C.textMuted, fontSize: 13 }}>{doneTasks} de {totalTasks} tareas completadas</div>
            <div style={{ marginTop: 8 }}><ProgressBar value={doneTasks} max={totalTasks} color={C.primary} height={10} /></div>
          </div>
          <Tip text="Este circulo muestra tu progreso total en todas las fases. Cada tarea que completas lo incrementa." />
        </div>
      </Card>

      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 28, top: 0, bottom: 0, width: 3, background: `linear-gradient(to bottom, ${C.primary}, ${C.pink})`, borderRadius: 3 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {roadmap.map((phase, phaseIdx) => {
            const phaseDone = phase.tasks.filter(t => t.done).length;
            const phaseTotal = phase.tasks.length;
            const phasePct = phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;
            const PhaseIcon = phase.icon;
            return (
              <div key={phase.id} style={{ display: "flex", gap: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, flexShrink: 0, zIndex: 1,
                  background: phasePct === 100 ? C.secondary : `${phase.color}22`,
                  border: `3px solid ${phasePct === 100 ? C.secondary : phase.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {phasePct === 100 ? <CheckCircle size={24} color="#fff" /> : <PhaseIcon size={24} color={phase.color} />}
                </div>
                <Card style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <Badge text={phase.phase} color={phase.color} />
                        <Badge text={phase.timeframe} color={C.textDim} />
                      </div>
                      <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{phase.title}</h3>
                      <p style={{ color: C.textMuted, fontSize: 13, margin: "4px 0 0 0", lineHeight: 1.5 }}>{phase.description}</p>
                    </div>
                    <span style={{ color: phase.color, fontSize: 20, fontWeight: 800 }}>{phasePct}%</span>
                  </div>
                  <ProgressBar value={phaseDone} max={phaseTotal} color={phasePct === 100 ? C.secondary : phase.color} height={6} />
                  <div style={{ color: C.textDim, fontSize: 11, margin: "10px 0 6px 0" }}>Haz clic en cada tarea para marcarla como completada:</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {phase.tasks.map((task, taskIdx) => (
                      <div key={taskIdx} style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                        borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                        background: task.done ? `${C.secondary}10` : "transparent",
                      }} onClick={() => toggleTask(phaseIdx, taskIdx)}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                          border: task.done ? "none" : `2px solid ${C.border}`,
                          background: task.done ? C.secondary : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {task.done && <CheckCircle size={14} color="#fff" />}
                        </div>
                        <span style={{
                          color: task.done ? C.textDim : C.text, fontSize: 13,
                          textDecoration: task.done ? "line-through" : "none",
                        }}>{task.text}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════

export default function App() {
  const [authenticated, setAuthenticated] = useState(!!getToken());
  const [user, setUserState] = useState(getUser());
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  const [learning, setLearning] = useState({
    courseName: "The Web Developer Bootcamp 2026 — Colt Steele",
    totalSections: 63, completedSections: 0,
    skills: [
      { name: "HTML/CSS", level: 20, target: 80 },
      { name: "JavaScript", level: 10, target: 90 },
      { name: "React", level: 0, target: 80 },
      { name: "Node.js", level: 0, target: 75 },
      { name: "MongoDB", level: 0, target: 70 },
      { name: "Express", level: 0, target: 70 },
    ],
    weeklyHours: [
      { week: "Sem 1", hours: 0, goal: 15 },
      { week: "Sem 2", hours: 0, goal: 15 },
      { week: "Sem 3", hours: 0, goal: 15 },
      { week: "Sem 4", hours: 0, goal: 15 },
    ],
  });

  const [finance, setFinance] = useState({
    monthlyData: [
      { month: "Ene", ingresos: 0, gastos: 0 }, { month: "Feb", ingresos: 0, gastos: 0 },
      { month: "Mar", ingresos: 0, gastos: 0 }, { month: "Abr", ingresos: 0, gastos: 0 },
      { month: "May", ingresos: 0, gastos: 0 }, { month: "Jun", ingresos: 0, gastos: 0 },
    ],
    categories: [
      { name: "Herramientas/Software", value: 200, color: CHART_COLORS[0] },
      { name: "Internet", value: 500, color: CHART_COLORS[1] },
      { name: "Cursos", value: 300, color: CHART_COLORS[2] },
      { name: "Equipo", value: 0, color: CHART_COLORS[3] },
      { name: "Marketing", value: 0, color: CHART_COLORS[4] },
      { name: "Legal/SAT", value: 0, color: CHART_COLORS[5] },
    ],
    totalIngresos: 0, totalGastos: 1000, incomeSources: [],
  });

  const [projects, setProjects] = useState([
    { id: "p1", name: "FineLine Dashboard", status: "en progreso", tech: ["React", "Recharts"], description: "Este dashboard — tu primer proyecto React real", client: "", progress: 30, createdAt: new Date().toISOString() },
    { id: "p2", name: "Portafolio Personal", status: "pendiente", tech: ["HTML", "CSS", "JavaScript"], description: "Sitio web para mostrar tus proyectos y habilidades", client: "", progress: 0, createdAt: new Date().toISOString() },
    { id: "p3", name: "Directorio de Negocios Leon", status: "pendiente", tech: ["React", "Node.js", "MongoDB"], description: "App tipo Yelp para negocios locales de Leon", client: "", progress: 0, createdAt: new Date().toISOString() },
  ]);

  const [journal, setJournal] = useState([]);
  const [reminders, setReminders] = useState([
    { id: "r1", title: "Estudiar 2 horas del curso de Colt Steele", description: "Completar la seccion de JavaScript", datetime: new Date(Date.now() + 3600000).toISOString(), priority: "alta", category: "estudio", repeat: "diario", done: false, notified: false, createdAt: new Date().toISOString() },
    { id: "r2", title: "Practicar ingles tecnico", description: "30 min de lectura de documentacion en ingles", datetime: new Date(Date.now() + 7200000).toISOString(), priority: "media", category: "estudio", repeat: "diario", done: false, notified: false, createdAt: new Date().toISOString() },
    { id: "r3", title: "Crear perfil de LinkedIn", description: "Foto profesional, descripcion y experiencia", datetime: new Date(Date.now() + 86400000).toISOString(), priority: "alta", category: "negocio", repeat: "none", done: false, notified: false, createdAt: new Date().toISOString() },
  ]);
  const [roadmap, setRoadmap] = useState(ROADMAP_DATA);

  // Load data from API on mount
  useEffect(() => {
    if (!authenticated) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const [l, f, p, j, r] = await Promise.all([
          learning.get(),
          finance.get(),
          projects.list(),
          journal.list(),
          reminders.list(),
        ]);
        if (l) setLearning(l);
        if (f) setFinance(f);
        if (p) setProjects(p);
        if (j) setJournal(j);
        if (r) setReminders(r);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
      setLoading(false);
    }

    loadData();
  }, [authenticated]);

  // Auto-save learning data
  const debouncedSaveLearning = useDebounce((data) => {
    setSaving(prev => ({ ...prev, learning: true }));
    learning.update(data).finally(() => setSaving(prev => ({ ...prev, learning: false })));
  }, 1000);

  useEffect(() => {
    if (authenticated) debouncedSaveLearning(learning);
  }, [learning]);

  // Auto-save finance data
  const debouncedSaveFinance = useDebounce((data) => {
    setSaving(prev => ({ ...prev, finance: true }));
    finance.update(data).finally(() => setSaving(prev => ({ ...prev, finance: false })));
  }, 1000);

  useEffect(() => {
    if (authenticated) debouncedSaveFinance(finance);
  }, [finance]);

  // Auto-save roadmap data
  const debouncedSaveRoadmap = useDebounce((data) => {
    setSaving(prev => ({ ...prev, roadmap: true }));
    roadmap.update(data).finally(() => setSaving(prev => ({ ...prev, roadmap: false })));
  }, 1000);

  useEffect(() => {
    if (authenticated) debouncedSaveRoadmap(roadmap);
  }, [roadmap]);

  const pendingReminders = reminders.filter(r => !r.done).length;

  if (!authenticated) {
    return <LoginScreen onLogin={() => { setAuthenticated(true); setUserState(getUser()); }} />;
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 50, height: 50, borderRadius: "50%", border: `3px solid ${C.border}`,
            borderTop: `3px solid ${C.primary}`, animation: "spin 1s linear infinite", margin: "0 auto 20px",
          }} />
          <p style={{ color: C.textMuted }}>Cargando FineLine...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Sidebar active={activeTab} onChange={setActiveTab} remindersCount={pendingReminders} onLogout={() => { clearToken(); setAuthenticated(false); }} user={user} />
      <div style={{ flex: 1, padding: "28px 36px", overflowY: "auto", maxHeight: "100vh" }}>
        {activeTab === "home" && <HomeSection learning={learning} finance={finance} projects={projects} reminders={reminders} journal={journal} />}
        {activeTab === "learning" && <LearningSection data={learning} setData={setLearning} saving={saving.learning} />}
        {activeTab === "finance" && <FinanceSection data={finance} setData={setFinance} saving={saving.finance} />}
        {activeTab === "projects" && <ProjectsSection projects={projects} setProjects={setProjects} saving={saving.projects} />}
        {activeTab === "journal" && <JournalSection entries={journal} setEntries={setJournal} saving={saving.journal} />}
        {activeTab === "reminders" && <RemindersSection reminders={reminders} setReminders={setReminders} saving={saving.reminders} />}
        {activeTab === "roadmap" && <RoadmapSection roadmap={roadmap} setRoadmap={setRoadmap} saving={saving.roadmap} />}
      </div>
    </div>
  );
}
