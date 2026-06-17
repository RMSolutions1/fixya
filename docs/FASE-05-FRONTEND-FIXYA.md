# FIXYA — Frontend Next.js 15 (Fase 5)

**Versión:** 1.0.0  
**Fecha:** 13 de junio de 2026  
**Depende de:** FASE-04-BACKEND-FIXYA.md v1.0.0  

---

## 1. Resumen

Frontend **Next.js 15** con App Router, integrado al backend NestJS via REST API v1.

### Stack implementado

| Tecnología | Uso |
|------------|-----|
| Next.js 15 | App Router, RSC donde aplica |
| React 19 | UI components |
| TypeScript | Tipado estricto |
| TailwindCSS 3 | Estilos utility-first |
| Shadcn UI | Componentes Radix (Button, Card, Input, Select, etc.) |
| TanStack Query v5 | Server state, cache, mutations |
| Zustand v5 | Auth store persistido (localStorage) |
| React Hook Form | Formularios |
| Zod | Validación schemas |
| Lucide React | Iconos |

---

## 2. Estructura

```
apps/web/src/
├── app/
│   ├── layout.tsx              # Root + QueryProvider
│   ├── page.tsx                # Landing pública
│   ├── login/                  # Auth
│   ├── register/
│   ├── marketplace/            # Browse público
│   └── (dashboard)/            # Rutas autenticadas
│       ├── layout.tsx          # Sidebar + AuthGuard
│       ├── dashboard/
│       ├── marketplace/requests/
│       ├── engagements/[id]/
│       └── wallet/
├── components/
│   ├── ui/                     # Shadcn components
│   ├── layout/app-sidebar.tsx
│   └── auth/auth-guard.tsx
├── hooks/
│   ├── use-auth.ts
│   └── use-marketplace.ts
├── lib/
│   ├── api.ts                  # HTTP client
│   ├── utils.ts
│   └── validators/auth.ts      # Zod schemas
├── providers/query-provider.tsx
└── stores/auth.store.ts        # Zustand persist
```

---

## 3. Páginas implementadas

| Ruta | Auth | Descripción |
|------|------|-------------|
| `/` | No | Landing marketing |
| `/login` | No | Inicio de sesión |
| `/register` | No | Registro CLIENTE/PROFESIONAL/EMPRESA |
| `/marketplace` | No | Catálogo público de servicios |
| `/dashboard` | Sí | Panel principal por rol |
| `/marketplace/requests/new` | Sí | Crear y publicar solicitud |
| `/marketplace/requests/[id]` | Sí | Ver solicitud, presupuestos, aceptar |
| `/engagements/[id]` | Sí | Expediente digital único |
| `/wallet` | Sí | Resumen wallet contable |

---

## 4. Flujos de usuario

### Cliente
1. Registro → Dashboard
2. Nueva solicitud → Publicar
3. Recibir presupuestos → Aceptar
4. Ver expediente de contratación

### Profesional
1. Registro → Dashboard
2. Ver solicitud → Enviar presupuesto
3. (Futuro) Ejecutar proyecto, cobrar

---

## 5. Integración API

```typescript
// lib/api.ts
Authorization: Bearer {accessToken}
X-Tenant-ID: {tenantId}
Base URL: NEXT_PUBLIC_API_URL (default http://localhost:4000/api/v1)
```

### React Query keys

| Key | Endpoint |
|-----|----------|
| `categories` | GET /marketplace/categories |
| `services` | GET /marketplace/services |
| `service-request` | GET /marketplace/requests/:id |
| `engagement` | GET /engagements/:id/expediente |
| `wallet-balance` | GET /wallet/balance |

---

## 6. Auth (Zustand)

Store persistido `fixya-auth`:
- `accessToken`, `refreshToken`, `tenantId`, `user`
- Hydration-aware `AuthGuard` para rutas dashboard
- Redirect a `/login` si no autenticado

---

## 7. Componentes UI (Shadcn)

- Button, Input, Label, Textarea
- Card, Badge
- Select (Radix)

Design tokens CSS variables en `globals.css` (primary blue, neutral palette).

---

## 8. Ejecutar

```powershell
# Terminal 1 — API
npm run api:dev

# Terminal 2 — Web
npm run web:dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/api/v1
- Swagger: http://localhost:4000/api/docs

### Variables

`apps/web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

---

## 9. Build

```powershell
npm run web:build   # ✓ Verificado
npm run build       # API + Web
```

---

## 10. Pendiente (fases siguientes)

| Feature | Fase |
|---------|------|
| Dark mode toggle | 5b |
| Chat Socket.IO UI | 5b / 6 |
| CRM dashboard | 7 |
| Gestión documental UI | 8 |
| Checkout Mercado Pago | 10 |
| PWA / mobile responsive polish | 5b |
| i18n es-AR formal | LATAM prep |
| Tests E2E Playwright | 13 |

---

**Fin Frontend Fase 5 — Core**

*Próximo paso: Fase 6 — Marketplace (funcionalidades avanzadas)*
