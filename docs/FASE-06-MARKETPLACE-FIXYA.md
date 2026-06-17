# FIXYA — Marketplace Fase 6

**Versión:** 1.0.0 | **Fecha:** 13 de junio de 2026

## Backend (nuevos endpoints)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/marketplace/services` | Búsqueda avanzada: precio, rating, geo, sort |
| GET | `/marketplace/services/ranking` | Top 10 por ranking score |
| GET | `/marketplace/requests/:id/compare` | Comparador presupuestos |
| GET | `/marketplace/favorites` | Listar favoritos |
| POST | `/marketplace/favorites/:serviceId` | Toggle favorito |

## Frontend

- Marketplace con filtros, geo "Cerca mío", ranking sidebar
- Página `/favorites` (autenticada)
- Comparador en detalle de solicitud
- Banner si API no disponible

## Arrancar stack completo

```powershell
docker compose up -d          # PostgreSQL + Redis
npx prisma db push && npm run db:seed
npm run api:dev               # :4000
npm run web:dev               # :3000
```
