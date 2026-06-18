# Guía de Despliegue — FixYa

Plataforma: **Vercel** (monorepo Next.js 15 + NestJS como serverless function)  
Región: `gru1` (São Paulo, más cercana a Argentina)

---

## 1. Requisitos previos

- [ ] Cuenta en [Vercel](https://vercel.com) con el proyecto `fixya` importado desde GitHub
- [ ] Base de datos PostgreSQL activa (Neon.tech recomendado)
- [ ] Cuenta en [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
- [ ] Cuenta en [Resend](https://resend.com) con dominio `fixya.emprenor.com` verificado

---

## 2. Obtener credenciales de Mercado Pago

### 2.1 Access Token

1. Ir a [mercadopago.com.ar/developers/panel/app](https://www.mercadopago.com.ar/developers/panel/app)
2. Seleccionar tu aplicación (o crear una nueva para FixYa)
3. En **Credenciales de producción** copiar el **Access token** (empieza con `APP_USR-`)
4. **NUNCA usar el Access Token de prueba (`TEST-`) en producción**

### 2.2 Webhook Secret

1. En el panel de la aplicación ir a **Notificaciones → Webhooks**
2. Crear un nuevo endpoint:
   - **URL**: `https://fixya.emprenor.com/api/v1/webhooks/mercadopago`
   - **Eventos**: `payment` (seleccionar todos los sub-eventos)
3. Al guardar, Mercado Pago genera un **Secret** — copiarlo como `MP_WEBHOOK_SECRET`

---

## 3. Configurar variables de entorno en Vercel

En el dashboard de Vercel, ir a **Settings → Environment Variables** y agregar:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexión con pooling | `postgres://user:pass@host/db?sslmode=require` |
| `DIRECT_URL` | URL directa (sin pooling, para migraciones) | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret JWT (mín. 64 chars) | `openssl rand -hex 64` |
| `MP_ACCESS_TOKEN` | Access Token de Mercado Pago | `APP_USR-XXXXXXXX` |
| `MP_WEBHOOK_SECRET` | Secret del webhook de MP | desde panel MP |
| `APP_PUBLIC_URL` | URL pública del sitio | `https://fixya.emprenor.com` |
| `API_PUBLIC_URL` | URL pública de la API (igual que la anterior) | `https://fixya.emprenor.com` |
| `RESEND_API_KEY` | API Key de Resend | `re_XXXXXXXX` |
| `CORS_ORIGINS` | Orígenes permitidos en CORS | `https://fixya.emprenor.com` |
| `NODE_ENV` | Entorno de ejecución | `production` |
| `ENABLE_SWAGGER` | Deshabilitar Swagger en prod | `false` |
| `ENABLE_SANDBOX_PAYMENTS` | Deshabilitar sandbox | `false` |
| `MP_SANDBOX` | Modo sandbox MP | `false` |

> **Tip Vercel**: configurar cada variable en los entornos **Production** y **Preview** por separado. En Preview podés usar credenciales de test de MP.

---

## 4. Generar un JWT_SECRET seguro

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 5. Sincronizar el esquema de base de datos

Antes del primer deploy, ejecutar localmente:

```bash
# Desde la raíz del monorepo
npm run db:generate
npm run db:push
npm run db:seed
```

O si usás migraciones:

```bash
npm run db:migrate:deploy
```

---

## 6. Desplegar

```bash
# Opción A: push a main (CI/CD automático)
git push origin main

# Opción B: deploy manual
npx vercel --prod
```

El build script es:
```
npm run db:generate
npm run build -w @fixya/database
npm run api:build
node scripts/copy-api-dist.mjs
npm run web:build
```

---

## 7. Verificar el despliegue

### 7.1 Smoke test básico

```bash
# Health check
curl https://fixya.emprenor.com/api/v1/health

# Debería responder: {"status":"ok","timestamp":"..."}
```

### 7.2 Verificar webhook de MP

1. Ir al panel de MP → Notificaciones → Webhooks
2. Hacer click en "Simular notificación"
3. Verificar en los logs de Vercel que aparece: `Webhook MP recibido`

### 7.3 Test de pago completo

1. Registrarse como cliente
2. Crear una solicitud de servicio
3. Registrarse como profesional en otra sesión/dispositivo
4. Enviar presupuesto
5. Aceptar presupuesto (genera el engagement)
6. Pagar con Mercado Pago (cuenta de prueba en staging, cuenta real en producción)
7. Verificar que el estado pasa a `FUNDS_HELD`
8. El profesional marca el trabajo como terminado
9. El cliente libera los fondos
10. Verificar que el email de confirmación llega

---

## 8. Dominio personalizado en Vercel

1. Vercel → Settings → Domains → Agregar `fixya.emprenor.com`
2. En el DNS de tu proveedor agregar:
   - `CNAME fixya → cname.vercel-dns.com` (o el valor que Vercel indique)

---

## 9. Monitoreo post-lanzamiento

| Qué monitorear | Dónde |
|---|---|
| Errores de la app | Vercel → Functions → Logs |
| Webhooks MP fallidos | Vercel logs + `mp_webhook_logs` en DB |
| Emails no enviados | Dashboard Resend → Logs |
| Pagos pendientes sin procesar | Tabla `payments` donde `status=PENDING` y `created_at < NOW()-1h` |

---

## 10. Rollback de emergencia

```bash
# Listar deploys recientes
npx vercel ls

# Promover un deploy anterior a producción
npx vercel alias set <deploy-url> fixya.emprenor.com
```

---

## Checklist final de lanzamiento

- [ ] `JWT_SECRET` generado con al menos 64 chars
- [ ] `MP_ACCESS_TOKEN` es el token de **producción** (no test)
- [ ] `MP_WEBHOOK_SECRET` configurado y verificado con simulación
- [ ] `RESEND_API_KEY` activa y dominio verificado en Resend
- [ ] `ENABLE_SWAGGER=false` en producción
- [ ] `ENABLE_SANDBOX_PAYMENTS=false`
- [ ] `MP_SANDBOX=false`
- [ ] Base de datos sincronizada (`db:push` o `db:migrate:deploy`)
- [ ] Categorías de servicios cargadas (`db:seed`)
- [ ] Smoke test pasado (`curl /api/v1/health`)
- [ ] Webhook de MP verificado con simulación
- [ ] DNS apuntando al dominio correcto
- [ ] HTTPS activo (Vercel lo maneja automáticamente)
