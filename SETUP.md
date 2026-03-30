# FineLine — Guia de Instalacion y Deploy

## Que necesitas instalar primero

1. **Node.js** — Descarga la version LTS desde https://nodejs.org
2. **Git** — Descarga desde https://git-scm.com
3. **Una cuenta de GitHub** — Registrate en https://github.com
4. **Una cuenta de Vercel** — Registrate con GitHub en https://vercel.com
5. **Una cuenta de MongoDB Atlas** — Registrate gratis en https://mongodb.com/atlas

---

## Paso 1: Configurar MongoDB Atlas (tu base de datos)

1. Ve a https://mongodb.com/atlas y crea una cuenta gratis
2. Haz clic en "Build a Database"
3. Selecciona **"M0 FREE"** (es gratis para siempre, 512MB)
4. Elige la region mas cercana a Mexico (US East o US Central)
5. Ponle nombre al cluster: `fineline`
6. Haz clic en "Create"

### Crear usuario de base de datos:
1. Ve a "Database Access" en el menu izquierdo
2. Haz clic en "Add New Database User"
3. Pon un usuario (ej: `fineline-admin`) y un password seguro
4. **IMPORTANTE: Copia el password, lo necesitaras**
5. En "Database User Privileges" selecciona "Read and write to any database"
6. Haz clic en "Add User"

### Permitir conexiones:
1. Ve a "Network Access" en el menu izquierdo
2. Haz clic en "Add IP Address"
3. Haz clic en "Allow Access from Anywhere" (necesario para Vercel)
4. Haz clic en "Confirm"

### Obtener tu connection string:
1. Ve a "Database" > "Connect"
2. Selecciona "Connect your application"
3. Copia el string que se ve asi:
   ```
   mongodb+srv://fineline-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Reemplaza `<password>` con tu password real
5. Agrega el nombre de la base de datos antes del `?`:
   ```
   mongodb+srv://fineline-admin:TuPassword@cluster0.xxxxx.mongodb.net/fineline?retryWrites=true&w=majority
   ```
6. **Guarda este string, es tu MONGODB_URI**

---

## Paso 2: Subir el codigo a GitHub

Abre tu terminal y ejecuta estos comandos uno por uno:

```bash
# Entra a la carpeta del proyecto
cd fineline

# Instala las dependencias
npm install

# Inicializa Git
git init

# Agrega todos los archivos
git add .

# Crea el primer commit
git commit -m "FineLine v1.0 - dashboard completo con backend"

# Crea el repositorio en GitHub (necesitas tener gh CLI o hacerlo en github.com)
# Opcion A: Desde github.com
# 1. Ve a github.com > New Repository
# 2. Nombre: fineline
# 3. NO marques "Add README"
# 4. Haz clic en "Create Repository"
# 5. Copia los comandos que te da GitHub y ejecutalos

# Opcion B: Con GitHub CLI
gh repo create fineline --public --source=. --push
```

---

## Paso 3: Deploy en Vercel

1. Ve a https://vercel.com/new
2. Importa tu repositorio `fineline` de GitHub
3. **IMPORTANTE — Configurar variables de entorno:**
   - Haz clic en "Environment Variables"
   - Agrega estas dos variables:

   | Nombre | Valor |
   |--------|-------|
   | `MONGODB_URI` | Tu connection string de MongoDB Atlas |
   | `JWT_SECRET` | Un texto largo y aleatorio (ej: `fineline-secret-key-2026-leon-gto-xyz123`) |

4. Haz clic en **"Deploy"**
5. Espera 1-2 minutos
6. Tu app estara en algo como: **https://fineline-xxxx.vercel.app**

---

## Paso 4: Probar tu app

1. Abre la URL que te dio Vercel
2. Haz clic en "Crear cuenta"
3. Escribe tu nombre, email y un password
4. Listo! Ya puedes usar FineLine

---

## Para desarrollo local

Si quieres hacer cambios y probarlos en tu computadora:

```bash
# Crea un archivo .env en la raiz del proyecto con:
MONGODB_URI=tu-connection-string-de-mongodb
JWT_SECRET=tu-secreto-jwt

# Inicia el servidor de desarrollo
npm run dev
```

La app estara en http://localhost:5173

---

## Estructura del proyecto

```
fineline/
├── api/                    ← Backend (Vercel Serverless Functions)
│   ├── _lib/
│   │   ├── db.js          ← Conexion a MongoDB + Modelos
│   │   └── auth.js        ← Autenticacion JWT
│   ├── auth/
│   │   ├── register.js    ← POST /api/auth/register
│   │   └── login.js       ← POST /api/auth/login
│   ├── learning.js        ← GET/PUT /api/learning
│   ├── finance.js         ← GET/PUT /api/finance
│   ├── projects.js        ← GET/POST/PUT/DELETE /api/projects
│   ├── journal.js         ← GET/POST/DELETE /api/journal
│   ├── reminders.js       ← GET/POST/PUT/DELETE /api/reminders
│   └── roadmap.js         ← GET/PUT /api/roadmap
├── src/                    ← Frontend (React)
│   ├── App.jsx            ← Toda la interfaz
│   ├── api.js             ← Cliente API
│   └── main.jsx           ← Punto de entrada
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── .env.example
```

---

## Tecnologias usadas

- **Frontend:** React, Recharts, Lucide Icons
- **Backend:** Node.js, Vercel Serverless Functions
- **Base de datos:** MongoDB Atlas
- **Autenticacion:** JWT (JSON Web Tokens)
- **Deploy:** Vercel
- **Build tool:** Vite
