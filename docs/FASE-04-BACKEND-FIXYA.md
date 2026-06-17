# FIXYA — Backend NestJS (Fase 4)

**Versión:** 1.0.0  
**Fecha:** 13 de junio de 2026  
**Depende de:** FASE-03-MODELO-DE-DATOS-FIXYA.md v1.0.0  

---

## 1. Resumen

Backend NestJS 11 implementado como **modular monolith** con arquitectura hexagonal, CQRS, multi-tenant RLS y API REST v1 documentada con Swagger.

### Estructura monorepo

```
fixya/
├── apps/
│   └── api/                    # NestJS API principal
│       └── src/
│           ├── main.ts
│           ├── app.module.ts
│           ├── config/
│           ├── database/
│           ├── common/
│           └── modules/
│               ├── auth/
│               ├── health/
│               ├── marketplace/
│               ├── engagement/
│               ├── wallet/
│               └── webhooks/
├── packages/
│   └── database/               # Re-export Prisma client
└── prisma/
    └── schema.prisma
```

---

## 2. Módulos implementados

| Módulo | Estado | Descripción |
|--------|--------|-------------|
| **Database** | ✅ | PrismaService + RLS context |
| **Auth** | ✅ | Register, login, refresh, JWT, bcrypt |
| **Health** | ✅ | Health check + DB status |
| **Marketplace** | ✅ | CQRS: categorías, búsqueda, solicitudes, cotizaciones |
| **Engagement** | ✅ | Aceptar presupuesto, expediente digital |
| **Wallet** | ✅ | Balance, ledger (read) |
| **Webhooks** | ✅ | MP webhook idempotente (stub worker) |
| Projects | 🔜 Fase 4b | |
| Documents | 🔜 Fase 8 | |
| Payments | 🔜 Fase 10 | |
| CRM | 🔜 Fase 7 | |
| Chat/WS | 🔜 Fase 4b | |
| Compliance | 🔜 Fase 4b | |
| Notifications | 🔜 Fase 4b | |

---

## 3. Arquitectura por capas

```
Controller → CommandBus/QueryBus → Handler → PrismaService (+ RLS)
                     ↓
              OutboxEvent (domain events)
```

### Cross-cutting

| Componente | Ubicación |
|------------|-----------|
| JWT Auth Guard | Global (excepto @Public) |
| Roles Guard | Global + @Roles() |
| Tenant Middleware | AsyncLocalStorage + X-Tenant-ID |
| Rate Limiting | Throttler 100 req/min |
| Validation | class-validator global pipe |
| Exception Filter | Global JSON errors |
| Swagger | /api/docs |

---

## 4. API Endpoints v1

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/v1/health` | Public | Health check |
| POST | `/api/v1/auth/register` | Public | Registro |
| POST | `/api/v1/auth/login` | Public | Login |
| POST | `/api/v1/auth/refresh` | Public | Refresh token |
| GET | `/api/v1/auth/me` | JWT | Perfil |
| GET | `/api/v1/marketplace/categories` | Public | Categorías |
| GET | `/api/v1/marketplace/services` | Public | Buscar servicios |
| POST | `/api/v1/marketplace/requests` | CLIENTE | Crear solicitud |
| POST | `/api/v1/marketplace/requests/:id/publish` | CLIENTE | Publicar |
| GET | `/api/v1/marketplace/requests/:id` | JWT | Ver solicitud |
| POST | `/api/v1/marketplace/quotations` | PROFESIONAL | Enviar presupuesto |
| POST | `/api/v1/engagements/accept-quotation/:id` | CLIENTE | Aceptar presupuesto |
| GET | `/api/v1/engagements/:id/expediente` | JWT | Expediente digital |
| GET | `/api/v1/wallet/balance` | CONTADOR+ | Resumen tenant |
| GET | `/api/v1/wallet/balance/:engagementId` | JWT | Balance engagement |
| GET | `/api/v1/wallet/ledger` | CONTADOR | Libro diario |
| POST | `/api/v1/webhooks/mercadopago` | Public | Webhook MP |

---

## 5. Autenticación

### Headers requeridos (rutas protegidas)

```
Authorization: Bearer {access_token}
X-Tenant-ID: {tenant_uuid}   (opcional si coincide con JWT)
```

### Flujo tokens

- Access token: 15 min (JWT)
- Refresh token: 30 días (SHA-256 hash en DB, rotation)

---

## 6. Multi-tenant RLS

`PrismaService.withRlsContext()` ejecuta:

```sql
SET app.current_tenant_id = '{uuid}';
SET app.current_user_id = '{uuid}';
SET app.is_super_admin = 'true|false';
```

`TenantContext` via AsyncLocalStorage propaga contexto por request.

---

## 7. CQRS Commands & Queries

### Commands

| Command | Handler | Evento outbox |
|---------|---------|---------------|
| CreateServiceRequestCommand | ✅ | — |
| PublishServiceRequestCommand | ✅ | — |
| SubmitQuotationCommand | ✅ | QuotationSubmitted |
| AcceptQuotationCommand | ✅ | QuotationAccepted |

### Queries

| Query | Handler |
|-------|---------|
| SearchServicesQuery | ✅ |
| GetServiceRequestQuery | ✅ |
| ListCategoriesQuery | ✅ |
| GetEngagementExpedienteQuery | ✅ |
| GetWalletBalanceQuery | ✅ |
| GetLedgerQuery | ✅ |

---

## 8. Ejecutar localmente

```powershell
cd "c:\Users\Windows\Downloads\fix ya"

# Base de datos (requiere PostgreSQL)
npx prisma db push
npm run db:seed

# Desarrollo
npm run api:dev

# Swagger: http://localhost:4000/api/docs
```

### Credenciales seed

- Email: `admin@fixya.com.ar`
- Password: `FixYa2026!`

---

## 9. Variables de entorno

Ver `.env.example`:

| Variable | Default |
|----------|---------|
| DATABASE_URL | postgresql://... |
| JWT_SECRET | (cambiar en prod) |
| PORT | 4000 |
| CORS_ORIGINS | http://localhost:3000 |

---

## 10. Próximos pasos (Fase 4 continuación)

1. `apps/worker` — BullMQ outbox processor
2. `apps/ws` — Socket.IO chat gateway
3. Módulos: Projects, Documents, Payments, CRM, Compliance
4. Tests unitarios + integración (95% cobertura)
5. Docker Compose dev stack

---

**Fin Backend Fase 4 — Core**

*Próximo paso: Fase 5 — Frontend Next.js 15*
