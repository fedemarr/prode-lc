# ProdeClub — Setup Guide

## Stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS v3 + shadcn/ui (custom)
- Prisma ORM v6 + PostgreSQL (Supabase)
- NextAuth.js v4 (JWT + credentials)
- Resend para emails
- ExcelJS para exportación

## 1. Variables de entorno

Copiá `.env.example` a `.env.local` y completá:

```bash
# Database — Supabase
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."  # sin pooling para migrations

# NextAuth
NEXTAUTH_SECRET="generá con: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Email (opcional en dev)
RESEND_API_KEY="re_..."
```

## 2. Base de datos (Supabase)

1. Creá un proyecto en https://supabase.com
2. Copiá la connection string del proyecto (Settings > Database)
3. Usá la URL con **pgbouncer** para DATABASE_URL y sin pgbouncer para DIRECT_URL

## 3. Instalación

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

## 4. Correr localmente

```bash
npm run dev
```

Accedé a http://localhost:3000

## 5. Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | admin@loscedros.com | admin123 |
| Usuario (aprobado) | juan@example.com | password123 |
| Usuario (pendiente) | ana@example.com | password123 |
| Usuario (rechazado) | sofia@example.com | password123 |

## 6. Rutas principales

### Usuarios
- `/login` — Login
- `/register` — Registro (queda en PENDING hasta aprobación)
- `/pending` — Pantalla de espera
- `/rejected` — Solicitud rechazada
- `/dashboard` — Home del usuario
- `/matches` — Lista de partidos (fase de grupos)
- `/matches/:id` — Detalle + pronóstico
- `/special` — Pronósticos especiales (antes del 11/06/2026)
- `/ranking` — Ranking general
- `/results` — Mis resultados
- `/history` — Historial de pronósticos
- `/stats` — Estadísticas personales
- `/profile` — Perfil + logout

### Admin
- `/admin/dashboard` — KPIs y últimos registros
- `/admin/participants` — Aprobar/rechazar participantes
- `/admin/matches` — Gestión de partidos
- `/admin/results` — Cargar resultados y calcular puntos
- `/admin/ranking` — Ranking completo
- `/admin/special` — Gestión de pronósticos especiales
- `/admin/export` — Exportar Excel

## 7. Reglas de puntuación

- **5 puntos** → marcador exacto (ej: 2-1 y termina 2-1)
- **2 puntos** → resultado correcto (ganador/empate) pero no el marcador exacto
- **0 puntos** → resultado incorrecto

## 8. Seed

El seed incluye:
- Admin: admin@loscedros.com / admin123
- 48 selecciones con banderas
- 72 partidos de fase de grupos (fixture completo del Mundial 2026)
- 31 partidos de eliminación directa (placeholders)
- 10 preguntas especiales
- 6 usuarios de ejemplo (3 aprobados, 2 pendientes, 1 rechazado)

## 9. Deploy (Vercel)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Variables de entorno en Vercel Dashboard
# DATABASE_URL, DIRECT_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, RESEND_API_KEY
```
