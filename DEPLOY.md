# Despliegue FixYa — Producción (Vercel full stack)

FixYa es la **unidad digital de [Grupo Emprenor](https://grupo.emprenor.com)**.

| Servicio | URL |
|----------|-----|
| **Web + API** | `https://fixya.emprenor.com` |
| API (mismo dominio) | `https://fixya.emprenor.com/api/v1` |
| Grupo | `https://grupo.emprenor.com` |

**Web (Next.js)** y **API (NestJS)** se despliegan juntos en **un solo proyecto Vercel**. La API corre como función serverless en `/api/*`.

---

## 1. Vercel — un solo proyecto

### Conectar el repositorio

1. [Vercel → New Project](https://vercel.com/new) → `RMSolutions1/fixya`
2. **Root Directory:** vacío (raíz del repo) — usa `vercel.json`
3. Framework: **Next.js** (detectado automáticamente)
4. **Production Branch:** `main`

### Build (automático vía `vercel.json`)

| Campo | Valor |
|-------|-------|
| Install | `npm ci` |
| Build | `npm run vercel-build` (Prisma + API + Web) |
| Output | `apps/web/.next` |
| API serverless | `api/[...path].ts` → `/api/v1/*` |

> **No** configures Output Directory = `public`. **No** uses solo `npm run build` manual en el dashboard si no incluye `vercel-build`.

### Variables de entorno

Copiá `vercel.env.example` → Vercel → Settings → Environment Variables.

**Mínimas para que funcione:**

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SITE_URL` | `https://fixya.emprenor.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `JWT_SECRET` | ≥32 caracteres |
| `DATABASE_URL` | Pooler Supabase `:6543` |
| `DIRECT_URL` | Pooler session `:5432` |
| `APP_PUBLIC_URL` | `https://fixya.emprenor.com` |
| `API_PUBLIC_URL` | `https://fixya.emprenor.com/api/v1` |
| `CORS_ORIGINS` | `https://fixya.emprenor.com` |
| `NODE_ENV` | `production` |
| `ENABLE_SWAGGER` | `false` |
| `MP_ACCESS_TOKEN` | token Mercado Pago |

`NEXT_PUBLIC_API_URL` puede quedar **vacío** — el frontend usa `/api/v1` en el mismo dominio.

### Dominio

1. Vercel → Domains → `fixya.emprenor.com`
2. DNS: **CNAME** `fixya` → `cname.vercel-dns.com`

### Build local

```bash
npm ci
npm run vercel-build
```

### Health check

`GET https://fixya.emprenor.com/api/v1/health`

---

## 2. Supabase

```bash
# apps/web/.env.local con SUPABASE_DB_PASSWORD
npm run sync:grupo-env
npm run db:push
npm run db:seed
npm run db:seed:users
```

Las tablas FixYa están en el schema **`fixya`** (DB compartida con grupo.emprenor.com).

---

## 3. Checklist pre-lanzamiento

- [ ] Variables de `vercel.env.example` en Vercel
- [ ] `/api/v1/health` responde OK
- [ ] Login con `admin@fixya.test` / `FixYa2026!` (o admin real)
- [ ] DNS `fixya.emprenor.com` activo
- [ ] `ENABLE_SWAGGER=false` en producción

## Limitaciones Vercel (API serverless)

- Cold start ~2–5 s en el primer request tras inactividad
- Timeout máx. 30 s por request (configurado en `vercel.json`)
- Sin WebSockets ni procesos en background (FixYa no los usa hoy)

Para tráfico muy alto o jobs largos, migrar la API a Railway/Render más adelante.
