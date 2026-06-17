# Despliegue FixYa — Producción

FixYa es la **unidad digital de [Grupo Emprenor](https://grupo.emprenor.com)**.

| Servicio | Dominio |
|----------|---------|
| **Web (Vercel)** | `https://fixya.emprenor.com` |
| API (NestJS) | `https://api.fixya.emprenor.com` *(hosting aparte)* |
| Grupo | `https://grupo.emprenor.com` |
| Obra NOA | `https://www.emprenor.com` |

## Requisitos

- Node.js 20+
- PostgreSQL 16 + PostGIS (Supabase Grupo Emprenor)
- Cuenta Mercado Pago (token de producción)
- Cuenta [Vercel](https://vercel.com) + acceso DNS `emprenor.com`

---

## 1. Web en Vercel (`fixya.emprenor.com`)

### Conectar el repositorio

1. [Vercel → New Project](https://vercel.com/new) → importar `RMSolutions1/fixya`
2. **Root Directory:** `apps/web`
3. Activar **Include source files outside of the Root Directory** (monorepo npm workspaces)
4. Framework: **Next.js** (auto-detectado vía `apps/web/vercel.json`)

### Variables de entorno (Vercel → Settings → Environment Variables)

| Variable | Valor producción |
|----------|------------------|
| `NEXT_PUBLIC_SITE_URL` | `https://fixya.emprenor.com` |
| `NEXT_PUBLIC_API_URL` | `https://api.fixya.emprenor.com/api/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qsowfnlmpwjfrqjemsnt.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(anon key del dashboard Supabase)* |
| `NEXT_PUBLIC_ENABLE_SANDBOX_PAYMENTS` | `false` |

> La web en Vercel **no incluye la API NestJS**. El frontend llama a `NEXT_PUBLIC_API_URL`; la API debe desplegarse por separado (Railway, Render, Fly.io, VPS).

### Dominio personalizado

1. Vercel → Project → **Settings → Domains** → agregar `fixya.emprenor.com`
2. En el DNS de `emprenor.com` (Cloudflare, etc.):

   | Tipo | Nombre | Valor |
   |------|--------|-------|
   | CNAME | `fixya` | `cname.vercel-dns.com` |

3. Esperar propagación (~5–30 min). Vercel emite HTTPS automáticamente.

### Build local (smoke antes de deploy)

```bash
npm ci
npm run web:build
```

---

## 2. API NestJS (`api.fixya.emprenor.com`)

La API **no va en Vercel** (NestJS + Prisma + WebSockets). Opciones: Railway, Render, Fly.io o VPS.

Copiá `.env.example` a `.env` en el servidor de la API:

| Variable | Producción |
|----------|------------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | ≥32 caracteres, único |
| `DATABASE_URL` | Pooler Supabase (6543) |
| `DIRECT_URL` | Session pooler Supabase (5432) |
| `MP_ACCESS_TOKEN` | Token producción MP |
| `MP_SANDBOX` | `false` |
| `ENABLE_SANDBOX_PAYMENTS` | `false` |
| `ENABLE_SWAGGER` | `false` |
| `SEED_DEMO_DATA` | `false` |
| `APP_PUBLIC_URL` | `https://fixya.emprenor.com` |
| `API_PUBLIC_URL` | `https://api.fixya.emprenor.com` |
| `CORS_ORIGINS` | `https://fixya.emprenor.com` |

```bash
npm run sync:grupo-env   # local: apps/web/.env.local → .env
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
npm run api:build
npm run api:start
```

Health check: `GET /api/v1/health` → `{ status: "ok", services: { database: "up" } }`

---

## 3. Supabase (base de datos)

1. Pegar `SUPABASE_DB_PASSWORD` en `apps/web/.env.local`
2. Región detectada: `us-east-2`, pooler `aws-1-us-east-2`
3. Ejecutar localmente:

```bash
npm run sync:grupo-env
npm run db:push
npm run db:seed
npm run db:seed:users
```

4. En Supabase SQL Editor, habilitar extensiones si `db:push` lo pide: `postgis`, `pg_trgm`, `uuid-ossp`, `pgcrypto`.

---

## 4. Checklist pre-lanzamiento

- [ ] Supabase conectado y schema aplicado
- [ ] API desplegada y `CORS_ORIGINS` incluye `https://fixya.emprenor.com`
- [ ] `NEXT_PUBLIC_API_URL` apunta a la API en producción
- [ ] `SEED_DEMO_DATA=false` y sin usuarios `@fixya.demo`
- [ ] Mercado Pago en modo producción
- [ ] DNS `fixya.emprenor.com` → Vercel (HTTPS verde)
- [ ] Admin creado con contraseña segura
- [ ] CI verde en GitHub Actions

## Datos corporativos

Fuente: `apps/web/src/lib/company-info.ts` — dominio web vía `NEXT_PUBLIC_SITE_URL` (default `fixya.emprenor.com`).
