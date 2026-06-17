# FixYa — Guía del producto

FixYa es la **plataforma digital de servicios profesionales** del [Grupo Emprenor](https://grupo.emprenor.com).

## Ecosistema

```
Grupo Emprenor (grupo.emprenor.com)
├── EMPRENOR C&S (emprenor.com)     → Obra, instalaciones, NOA desde 2018
└── FixYa (fixya.com.ar)            → Marketplace, pagos, expediente digital
         └── Operado por RM International Group SAS
```

## Repositorio

| App | Path | Puerto |
|-----|------|--------|
| Web (Next.js 15) | `apps/web` | 3000 |
| API (NestJS) | `apps/api` | 4000 |
| DB (PostGIS) | `docker-compose.yml` | 5433 |

## Comandos esenciales

```bash
docker compose up -d
npm run db:seed && npm run db:seed:users
npm run web:dev    # terminal 1
npm run api:dev    # terminal 2
npm run test:full  # auditoría E2E
```

## Datos corporativos

Centralizados en `apps/web/src/lib/company-info.ts`. No duplicar emails, dirección o marcas en otros archivos.

## Roles del dashboard

SUPER_ADMIN, CLIENTE, PROFESIONAL, EMPRESA, CONTADOR, SUPERVISOR, OPERADOR, AUDITOR, GESTOR_DOCUMENTAL.
