# Despliegue FixYa — Producción

FixYa es la **unidad digital de [Grupo Emprenor](https://grupo.emprenor.com)**.

| Servicio | Dominio sugerido |
|----------|------------------|
| Web | `https://fixya.com.ar` |
| API | `https://api.fixya.com.ar` |
| Grupo | `https://grupo.emprenor.com` |
| Obra NOA | `https://www.emprenor.com` |

## Requisitos

- Node.js 20+
- PostgreSQL 16 + PostGIS
- Cuenta Mercado Pago (token de producción)
- Dominios: web (`APP_PUBLIC_URL`) y API (`API_PUBLIC_URL`)

## 1. Variables de entorno

Copiá `.env.example` a `.env` y configurá:

| Variable | Producción |
|----------|------------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | ≥32 caracteres, único |
| `MP_ACCESS_TOKEN` | Token producción MP |
| `MP_SANDBOX` | `false` |
| `ENABLE_SANDBOX_PAYMENTS` | `false` |
| `ENABLE_SWAGGER` | `false` |
| `SEED_DEMO_DATA` | `false` |
| `CORS_ORIGINS` | URL de tu frontend |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin inicial (solo primer seed) |

Frontend (`apps/web/.env.local`):

```
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api/v1
NEXT_PUBLIC_ENABLE_SANDBOX_PAYMENTS=false
```

## 2. Base de datos

```bash
docker compose up -d
npm run db:generate
npm run db:migrate:deploy
npm run db:seed          # Solo categorías + comisión + admin
npm run db:clean-demo    # Si existieron datos @fixya.demo
```

## 3. Build

```bash
npm ci
npm run build
```

## 4. Arranque

```bash
npm run api:start        # Puerto 4000
npm run start -w @fixya/web   # Next.js producción (puerto 3000)
```

## 5. Verificación

Con API y web corriendo:

```bash
npm run test:smoke
```

Health check: `GET /api/v1/health` → `{ status: "ok", services: { database: "up" } }`

## 6. Checklist pre-lanzamiento

- [ ] `SEED_DEMO_DATA=false` y sin usuarios `@fixya.demo`
- [ ] Teléfono y dirección reales (`apps/web/src/lib/company-info.ts`)
- [ ] Mercado Pago en modo producción
- [ ] HTTPS en web y API
- [ ] Admin creado con contraseña segura
- [ ] CI verde en GitHub Actions

## Datos corporativos

Fuente: `apps/web/src/lib/company-info.ts` — Grupo Emprenor / EMPRENOR C&S / RM International Group SAS, Salta, Argentina.
