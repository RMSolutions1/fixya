# FixYa — Guía del producto

FixYa es la **plataforma digital de servicios profesionales** del [Grupo Emprenor](https://grupo.emprenor.com).

## Ecosistema — unidades de negocio

| Unidad | URL | Rol |
|--------|-----|-----|
| Grupo Emprenor | [grupo.emprenor.com](https://grupo.emprenor.com) | Holding corporativo |
| EMPRENOR C&S | [emprenor.com](https://www.emprenor.com) | Obra e instalaciones NOA (desde 2018) |
| **FixYa** | fixya.emprenor.com | Marketplace digital nacional |
| Emitia | [emitia.com.ar](https://www.emitia.com.ar) | Facturación fiscal ARCA |
| Gestión Emprenor | [gestion.emprenor.com](https://gestion.emprenor.com) | Operaciones y back-office |
| My Emprenor | [myemprenor.online](https://myemprenor.online) | Portal clientes y equipos |

Fuente de verdad: `apps/web/src/lib/company-info.ts` → `GROUP_BUSINESS_UNITS`

## Repositorio

| App | Path | Puerto |
|-----|------|--------|
| Web (Next.js 15) | `apps/web` | 3000 |
| API (NestJS) | `apps/api` | 4000 |
| DB (PostGIS / Supabase) | `.env` | — |

## Comandos esenciales

```bash
npm run sync:grupo-env   # Supabase Grupo Emprenor → .env
npm run db:generate && npm run db:push
npm run db:seed && npm run db:seed:users
npm run web:dev && npm run api:dev
npm run test:full
```

## Roles del dashboard

SUPER_ADMIN, CLIENTE, PROFESIONAL, EMPRESA, CONTADOR, SUPERVISOR, OPERADOR, AUDITOR, GESTOR_DOCUMENTAL.
