# FIXYA — Documento Funcional Empresarial

**Versión:** 1.0.0  
**Fecha:** 13 de junio de 2026  
**Estado:** Aprobación pendiente  
**Alcance geográfico inicial:** Argentina  
**Alcance geográfico objetivo:** Latinoamérica  
**Clasificación:** Confidencial — Uso interno  

---

## Control de versiones

| Versión | Fecha | Autor | Descripción |
|---------|-------|-------|-------------|
| 1.0.0 | 2026-06-13 | Equipo FixYa | Documento funcional inicial — Fase 1 |

---

## Tabla de contenidos

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Visión y objetivos de negocio](#2-visión-y-objetivos-de-negocio)
3. [Alcance del producto](#3-alcance-del-producto)
4. [Stakeholders y personas](#4-stakeholders-y-personas)
5. [Modelo de negocio](#5-modelo-de-negocio)
6. [Ecosistema e integraciones](#6-ecosistema-e-integraciones)
7. [Actores, roles y permisos](#7-actores-roles-y-permisos)
8. [Arquitectura multi-tenant](#8-arquitectura-multi-tenant)
9. [Flujos de negocio principales](#9-flujos-de-negocio-principales)
10. [Módulos funcionales](#10-módulos-funcionales)
11. [Expediente digital único](#11-expediente-digital-único)
12. [Wallet contable](#12-wallet-contable)
13. [Integración Mercado Pago Argentina](#13-integración-mercado-pago-argentina)
14. [Sistema Emitia (facturación fiscal)](#14-sistema-emitia-facturación-fiscal)
15. [Compliance Argentina](#15-compliance-argentina)
16. [Módulo de inteligencia artificial](#16-módulo-de-inteligencia-artificial)
17. [Requisitos no funcionales](#17-requisitos-no-funcionales)
18. [Casos de uso](#18-casos-de-uso)
19. [User stories priorizadas](#19-user-stories-priorizadas)
20. [Criterios de aceptación globales](#20-criterios-de-aceptación-globales)
21. [Glosario](#21-glosario)
22. [Anexos](#22-anexos)

---

## 1. Resumen ejecutivo

### 1.1 Propósito del documento

Este documento define de manera integral los requisitos funcionales de **FixYa**, plataforma empresarial diseñada para operar como el **Sistema Operativo para Servicios** en Argentina desde el primer día de producción, con capacidad de escalar a Latinoamérica y soportar más de 1.000.000 de usuarios concurrentes registrados.

No describe un MVP, prototipo ni demo. Establece el contrato funcional entre negocio, producto, ingeniería, compliance y operaciones para el desarrollo de una plataforma lista para producción.

### 1.2 Problema de negocio

En el mercado de servicios profesionales y técnicos en Argentina existe fragmentación operativa:

- Los clientes no tienen un canal unificado para solicitar, comparar, contratar y dar seguimiento a servicios.
- Los profesionales carecen de herramientas integradas para presupuestar, facturar, cobrar y gestionar proyectos.
- Las empresas contratistas no disponen de un ERP/CRM/documental adaptado al ciclo completo del servicio.
- Los pagos, la facturación fiscal (ARCA), la documentación legal y la garantía postventa operan en sistemas desconectados.
- No existe trazabilidad end-to-end de una contratación.

### 1.3 Solución propuesta

FixYa unifica en una sola plataforma multi-tenant:

| Capa | Capacidad |
|------|-----------|
| Marketplace | Descubrimiento, cotización y contratación de servicios |
| CRM | Gestión comercial de leads, clientes y oportunidades |
| Proyectos | Ejecución, hitos, tareas y seguimiento |
| Documental | Contratos, actas, certificados, firmas y versionado |
| Pagos | Integración nativa con Mercado Pago Argentina |
| Wallet contable | Registro contable de retenciones, liberaciones y comisiones |
| Facturación | Sistema propio Emitia con emisión fiscal ARCA |
| Chat | Comunicación en tiempo real entre actores |
| IA | Asistentes especializados por módulo |
| Compliance | Validación de CUIT, IVA, matrículas, seguros y vencimientos |

### 1.4 Propuesta de valor por actor

| Actor | Valor |
|-------|-------|
| Cliente | Contratar servicios con transparencia, pago seguro, factura fiscal y garantía |
| Profesional | Captar clientes, presupuestar, ejecutar proyectos y cobrar con conciliación automática |
| Empresa | Operar múltiples profesionales, contratos, documentación y facturación centralizada |
| Operador/Supervisor | Gestionar operaciones, aprobar documentos y monitorear SLA |
| Contador | Acceder a libros contables, movimientos y comprobantes fiscales |
| Super Admin FixYa | Administrar tenants, comisiones, disputas y configuración global |

### 1.5 Métricas de éxito (KPIs de producto)

| KPI | Objetivo año 1 | Objetivo escala |
|-----|----------------|-----------------|
| Usuarios registrados | 100.000 | 1.000.000+ |
| Contrataciones completadas/mes | 10.000 | 500.000+ |
| Tasa de conversión solicitud → contratación | ≥ 25% | ≥ 35% |
| Tiempo medio solicitud → pago | ≤ 48 h | ≤ 24 h |
| Disponibilidad plataforma | 99.9% | 99.95% |
| Emisión fiscal exitosa (Emitia) | ≥ 99.5% | ≥ 99.9% |
| NPS clientes | ≥ 45 | ≥ 60 |
| Disputas resueltas en SLA | ≥ 90% | ≥ 95% |

---

## 2. Visión y objetivos de negocio

### 2.1 Visión

**FixYa es el Sistema Operativo para Servicios**: la plataforma que conecta clientes, profesionales, empresas, contratistas y proveedores, gestionando integralmente el ciclo de vida de un servicio desde la solicitud hasta la postventa.

### 2.2 Misión

Digitalizar, estandarizar y hacer trazable la contratación de servicios en Argentina, integrando pagos (Mercado Pago), facturación fiscal (Emitia/ARCA) y gestión operativa en un ecosistema confiable, escalable y compliant.

### 2.3 Objetivos estratégicos

1. **Operación Argentina día 1:** Cumplir normativa fiscal, laboral y de facturación electrónica vigente.
2. **Confianza transaccional:** Pagos con retención lógica, liberación condicionada y garantía postventa.
3. **Trazabilidad total:** Expediente digital único por contratación con auditoría inmutable.
4. **Escalabilidad regional:** Arquitectura multi-tenant preparada para expansión LATAM.
5. **Eficiencia operativa:** Reducir fricción entre solicitud, presupuesto, contrato, pago y ejecución.
6. **Inteligencia de negocio:** IA embebida para asistencia comercial, documental y operativa.

### 2.4 Principios de producto

| Principio | Descripción |
|-----------|-------------|
| No somos banco | FixYa no custodia dinero; registra operaciones contables vinculadas a Mercado Pago |
| Compliance by design | Toda entidad fiscal y documental nace con validaciones argentinas |
| Tenant-first | Cada empresa opera en aislamiento lógico con configuración propia |
| Event-driven | Todo cambio de estado genera eventos de dominio auditables |
| Expediente único | Una contratación = un expediente con todos sus artefactos |
| Producción desde el inicio | Sin deuda funcional crítica diferida a "fases futuras" |

---

## 3. Alcance del producto

### 3.1 Dentro del alcance (Fase 1 — documento funcional)

Definición completa de requisitos funcionales para los 15 módulos core de la plataforma, incluyendo integraciones con Mercado Pago, Emitia y compliance ARCA.

### 3.2 Módulos incluidos

| # | Módulo | Descripción |
|---|--------|-------------|
| M1 | Core / Identidad | Autenticación, autorización, tenants, usuarios |
| M2 | Marketplace | Catálogo, búsqueda, cotizaciones, contrataciones |
| M3 | CRM | Leads, pipeline, clientes, oportunidades |
| M4 | Proyectos | Tareas, hitos, cronogramas, avances |
| M5 | Gestión documental | Versionado, flujos, firmas, plantillas |
| M6 | Chat | Mensajería realtime privada y grupal |
| M7 | Wallet contable | Ledger, retenciones, comisiones, conciliación |
| M8 | Mercado Pago | Checkout, webhooks, reembolsos, disputas |
| M9 | Emitia | Facturación fiscal multi-CUIT, CAE/CAEA |
| M10 | Notificaciones | Email, push, WhatsApp |
| M11 | Compliance AR | CUIT, IVA, matrículas, seguros, alertas |
| M12 | IA | Asistentes por módulo |
| M13 | Auditoría | Logs, trazabilidad, reportes |
| M14 | Configuración | Parámetros por tenant |
| M15 | Reporting | Dashboards operativos y financieros |

### 3.3 Fuera del alcance explícito

| Elemento | Motivo |
|----------|--------|
| Custodia de fondos / cuenta bancaria propia | FixYa no es entidad financiera |
| Emisión de tarjetas o créditos | Fuera del modelo de negocio |
| Logística física de materiales | Solo registro documental de proveedores |
| Nómina y liquidación de sueldos | Integración futura, no core |
| App nativa iOS/Android v1 | Web responsive PWA; apps nativas en roadmap posterior |
| Mercados fuera de Argentina v1 | Preparación arquitectónica sí; localización fiscal no |

### 3.4 Supuestos

1. Mercado Pago mantiene APIs estables para Checkout Pro, API, QR, Links y Webhooks en Argentina.
2. ARCA (ex-AFIP) mantiene WSFE/WSFEX operativos para CAE y CAEA.
3. Los tenants proveen datos fiscales válidos (CUIT, condición IVA, puntos de venta).
4. WhatsApp Business API se contrata por tenant o centralizado según configuración.
5. Infraestructura AWS disponible en región sa-east-1 (São Paulo) con latencia aceptable para AR.

### 3.5 Restricciones

1. Stack tecnológico obligatorio según especificación del proyecto.
2. Cumplimiento Ley 25.326 de Protección de Datos Personales (Argentina).
3. Facturación electrónica según RG AFIP/ARCA vigente.
4. Retención de datos fiscales mínimo 10 años.
5. Multi-tenant con aislamiento estricto de datos por tenant.

---

## 4. Stakeholders y personas

### 4.1 Stakeholders

| Stakeholder | Interés | Influencia |
|-------------|---------|------------|
| Cliente final | Contratar servicios confiables | Alta |
| Profesional independiente | Generar ingresos, reducir gestión admin | Alta |
| Empresa de servicios | Escalar operaciones | Alta |
| FixYa (plataforma) | Comisiones, volumen transaccional | Alta |
| ARCA / fisco | Cumplimiento fiscal | Alta |
| Mercado Pago | Procesamiento de pagos | Media |
| Contador del tenant | Reportes fiscales y contables | Media |
| Auditor interno | Trazabilidad y compliance | Media |

### 4.2 Personas

#### Persona 1: María — Cliente residencial

- **Edad:** 38 años, CABA
- **Necesidad:** Contratar plomero certificado con presupuesto claro y garantía
- **Dolor:** No sabe si el profesional está habilitado; pagó en efectivo sin factura antes
- **Objetivo FixYa:** Solicitar servicio, comparar propuestas, pagar con MP, recibir factura y acta de conformidad

#### Persona 2: Carlos — Profesional matriculado

- **Edad:** 45 años, Rosario
- **Necesidad:** Conseguir clientes y administrar proyectos sin Excel
- **Dolor:** Presupuestos informales, cobros demorados, documentación dispersa
- **Objetivo FixYa:** Recibir solicitudes, enviar presupuestos, ejecutar proyecto, cobrar al liberarse fondos

#### Persona 3: Laura — Gerente de Empresa de mantenimiento

- **Edad:** 42 años, Córdoba
- **Necesidad:** Gestionar 30 técnicos, contratos corporativos y facturación centralizada
- **Dolor:** Sin visibilidad de pipeline ni compliance de matrículas del equipo
- **Objetivo FixYa:** Operar como tenant EMPRESA con supervisores, operadores y contador

#### Persona 4: Diego — Operador FixYa / Supervisor tenant

- **Necesidad:** Aprobar documentos, monitorear SLA, resolver disputas
- **Objetivo FixYa:** Panel operativo con alertas de vencimientos y excepciones

#### Persona 5: Ana — Contadora del tenant

- **Necesidad:** Libro diario, mayor, conciliación MP vs Emitia
- **Objetivo FixYa:** Exportar reportes contables y fiscales por período

---

## 5. Modelo de negocio

### 5.1 Flujos de ingreso FixYa

| Fuente | Descripción | Momento de cobro |
|--------|-------------|------------------|
| Comisión por transacción | % sobre monto contratado | Al confirmar pago MP |
| Comisión profesional premium | Suscripción mensual profesional destacado | Mensual vía MP Suscripciones |
| Comisión empresa | Plan por volumen/usuarios tenant | Mensual |
| Servicios de valor agregado | IA avanzada, reportes, integraciones | Mensual o por uso |

### 5.2 Modelo de retención de fondos (Wallet contable)

```
Cliente paga vía Mercado Pago
        ↓
FixYa registra: SALDO RETENIDO (pendiente de liberación)
        ↓
Proyecto en ejecución
        ↓
Cliente aprueba conformidad
        ↓
FixYa registra: SALDO LIBERADO → Profesional/Empresa
FixYa registra: COMISIÓN FIXYA
        ↓
Emitia emite comprobantes según corresponda
```

**Importante:** El dinero fluye vía Mercado Pago (split payment / marketplace según configuración). FixYa registra el estado contable; no custodia fondos.

### 5.3 Tipos de tenant

| Tipo | Descripción |
|------|-------------|
| FixYa Platform | Tenant raíz (SUPER_ADMIN) |
| Empresa | Organización con múltiples profesionales |
| Profesional individual | Tenant unipersonal |
| Cliente corporativo | Cuenta empresa con múltiples solicitantes (futuro) |

---

## 6. Ecosistema e integraciones

### 6.1 Diagrama de ecosistema

```
┌─────────────────────────────────────────────────────────────┐
│                        FIXYA PLATFORM                        │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │Marketplace│ │  CRM   │ │Proyectos│ │Documental│          │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       └───────────┴───────────┴───────────┘                 │
│                         │                                    │
│              ┌──────────┴──────────┐                        │
│              │   WALLET CONTABLE    │                        │
│              └──────────┬──────────┘                        │
└─────────────────────────┼───────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ MERCADO PAGO  │ │    EMITIA     │ │     ARCA      │
│   Argentina   │ │  (propio)     │ │   (fisco)     │
│               │ │               │ │               │
│ Checkout Pro  │ │ Factura A/B/C │ │ CAE / CAEA    │
│ Checkout API  │ │ NC / ND       │ │ Validación    │
│ QR / Links    │ │ PDF / XML     │ │ CUIT          │
│ Webhooks      │ │ Multi-CUIT    │ │               │
│ Suscripciones │ │               │ │               │
└───────────────┘ └───────────────┘ └───────────────┘
```

### 6.2 Integraciones externas

| Sistema | Propósito | Tipo | Criticidad |
|---------|-----------|------|------------|
| Mercado Pago AR | Pagos, reembolsos, disputas | API REST + Webhooks | Crítica |
| ARCA (AFIP) | Validación CUIT, CAE/CAEA | WS SOAP vía Emitia | Crítica |
| Resend | Email transaccional | API REST | Alta |
| WhatsApp Business API | Notificaciones | API REST | Media |
| Firebase Cloud Messaging | Push mobile/web | SDK | Media |
| AWS S3 / Cloudflare R2 | Almacenamiento documentos | SDK | Alta |
| Google Maps / Mapbox | Geolocalización marketplace | API REST | Media |

### 6.3 Integración Emitia (sistema propio)

Emitia NO es proveedor externo. Es suite de microservicios propios desplegados junto a FixYa:

| Microservicio | Responsabilidad |
|---------------|-----------------|
| emitia-api | Gateway interno facturación |
| emitia-auth | Autenticación servicios Emitia |
| emitia-invoicing | Emisión facturas A/B/C/E |
| emitia-credit-notes | Notas de crédito |
| emitia-debit-notes | Notas de débito |
| emitia-pdf-engine | Generación PDF comprobantes |
| emitia-arca | Comunicación WS ARCA |
| emitia-reporting | Reportes fiscales |
| emitia-audit | Auditoría emisiones |

---

## 7. Actores, roles y permisos

### 7.1 Matriz de roles

| Rol | Descripción | Ámbito |
|-----|-------------|--------|
| SUPER_ADMIN | Administración global FixYa | Plataforma |
| EMPRESA | Administrador de tenant empresarial | Tenant |
| PROFESIONAL | Prestador de servicios | Tenant / Personal |
| CLIENTE | Solicitante de servicios | Cross-tenant |
| OPERADOR | Operaciones diarias, aprobaciones L1 | Tenant |
| SUPERVISOR | Supervisión equipos, aprobaciones L2 | Tenant |
| AUDITOR | Solo lectura + reportes auditoría | Tenant |
| CONTADOR | Acceso fiscal y contable | Tenant |
| GESTOR_DOCUMENTAL | Gestión flujos documentales | Tenant |

### 7.2 Modelo de autorización

- **RBAC (Role-Based Access Control):** Permisos base por rol.
- **ABAC (Attribute-Based Access Control):** Reglas contextuales (ej: solo ve proyectos asignados, solo documentos de su región).
- Permisos granularizados por módulo y acción: `CREATE`, `READ`, `UPDATE`, `DELETE`, `APPROVE`, `SIGN`, `EXPORT`.

### 7.3 Permisos por módulo (resumen)

| Módulo | SUPER_ADMIN | EMPRESA | PROFESIONAL | CLIENTE | OPERADOR | SUPERVISOR | AUDITOR | CONTADOR | GESTOR_DOC |
|--------|:-----------:|:-------:|:-----------:|:-------:|:--------:|:----------:|:-------:|:--------:|:----------:|
| Marketplace - publicar | ✓ | ✓ | ✓ | — | — | ✓ | R | — | — |
| Marketplace - contratar | — | ✓ | — | ✓ | — | — | R | — | — |
| CRM - gestionar | — | ✓ | ✓* | — | ✓ | ✓ | R | R | — |
| Proyectos - ejecutar | — | ✓ | ✓ | R | ✓ | ✓ | R | — | — |
| Documentos - aprobar | — | ✓ | — | R | ✓ | ✓ | R | — | ✓ |
| Wallet - ver | ✓ | ✓ | ✓ | R | ✓ | ✓ | R | ✓ | — |
| Emitia - emitir | — | ✓ | ✓** | — | — | ✓ | R | ✓ | — |
| Config tenant | ✓ | ✓ | — | — | — | — | R | — | — |

*Profesional: solo sus leads/clientes asignados  
**Profesional: solo si configuración tenant lo permite  

---

## 8. Arquitectura multi-tenant

### 8.1 Estrategia de aislamiento

**Modelo híbrido recomendado:**

| Capa | Estrategia |
|------|------------|
| Base de datos | Shared database, shared schema con `tenant_id` en todas las tablas + Row Level Security (RLS) |
| Almacenamiento | Prefijo S3/R2: `{tenant_id}/{module}/{entity_id}/` |
| Cache Redis | Prefijo keys: `tenant:{tenant_id}:*` |
| Colas BullMQ | Prefijo queues por tenant para jobs críticos |
| Búsqueda | Índices filtrados por tenant_id |

### 8.2 Contexto de tenant

Todo request autenticado resuelve:

```
JWT → user_id → tenant_memberships → active_tenant_id → TenantContext
```

El `TenantContext` se propaga via middleware NestJS a repositorios, eventos y logs.

### 8.3 Entidades por tenant

Cada tenant posee de forma aislada:

- Usuarios y membresías
- Clientes y contactos CRM
- Documentación y plantillas
- Configuración fiscal (CUIT, PV, condición IVA)
- Wallet y movimientos contables
- Proyectos y contrataciones
- Contratos y configuraciones operativas
- Catálogo de servicios (marketplace)

### 8.4 Reglas de seguridad multi-tenant

1. Ninguna query sin filtro `tenant_id` excepto SUPER_ADMIN con auditoría.
2. Cross-tenant solo permitido en relaciones explícitas (ej: CLIENTE contrata servicio de tenant B).
3. Documentos en storage con signed URLs temporales scoped a tenant.
4. Webhooks MP mapeados a tenant via `external_reference` encoding.
5. Violaciones de tenant isolation = alerta SRE crítica + bloqueo request.

---

## 9. Flujos de negocio principales

### 9.1 Flujo principal — Contratación de servicio (Happy Path)

```
┌──────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ CLIENTE  │───▶│ SOLICITUD   │───▶│ PROPUESTAS   │───▶│ APROBACIÓN  │
│ solicita │    │ de servicio │    │ profesionales│    │ presupuesto │
└──────────┘    └─────────────┘    └──────────────┘    └──────┬──────┘
                                                               │
┌──────────┐    ┌─────────────┐    ┌──────────────┐           │
│ CIERRE   │◀───│ GARANTÍA    │◀───│ EJECUCIÓN    │◀──────────┤
│ proyecto │    │ postventa   │    │ proyecto     │           │
└──────────┘    └─────────────┘    └──────────────┘           │
       ▲              ▲                    ▲                   │
       │              │                    │           ┌──────▼──────┐
       │              │                    │           │  CONTRATO   │
       │              │                    │           │  automático │
       │              │                    │           └──────┬──────┘
       │              │                    │                  │
       │              │             ┌────────▼────────┐  ┌──────▼──────┐
       │              │             │ LIBERACIÓN      │  │ PAGO MP     │
       │              │             │ fondos wallet   │  │ + webhook   │
       │              │             └────────┬────────┘  └──────┬──────┘
       │              │                      │                  │
       │              │             ┌────────▼────────┐  ┌──────▼──────┐
       │              └─────────────│ CONFORMIDAD     │  │ WALLET      │
       │                            │ cliente         │  │ contable    │
       └────────────────────────────┴─────────────────┘  └──────┬──────┘
                                                                 │
                                                        ┌────────▼────────┐
                                                        │ EMITIA → ARCA   │
                                                        │ comprobante     │
                                                        └─────────────────┘
```

### 9.2 Estados del ciclo de contratación

| Estado | Descripción | Actor responsable | Evento de dominio |
|--------|-------------|-------------------|-------------------|
| DRAFT | Solicitud en borrador | Cliente | `ServiceRequestCreated` |
| PUBLISHED | Solicitud visible en marketplace | Cliente | `ServiceRequestPublished` |
| QUOTING | Recibiendo propuestas | Sistema | `QuotationReceived` |
| QUOTE_SELECTED | Presupuesto seleccionado | Cliente | `QuotationAccepted` |
| CONTRACT_GENERATING | Generando contrato | Sistema | `ContractGenerationStarted` |
| CONTRACT_PENDING_SIGN | Pendiente firma | Cliente + Profesional | `ContractGenerated` |
| CONTRACT_SIGNED | Contrato firmado | Ambos | `ContractSigned` |
| PAYMENT_PENDING | Esperando pago MP | Cliente | `PaymentInitiated` |
| PAYMENT_CONFIRMED | Pago acreditado | Sistema (webhook MP) | `PaymentConfirmed` |
| FUNDS_HELD | Fondos retenidos en wallet | Sistema | `FundsHeld` |
| INVOICE_ISSUED | Factura emitida | Emitia | `InvoiceIssued` |
| IN_PROGRESS | Proyecto en ejecución | Profesional | `ProjectStarted` |
| PENDING_APPROVAL | Esperando conformidad cliente | Cliente | `ProjectCompleted` |
| FUNDS_RELEASED | Fondos liberados | Sistema | `FundsReleased` |
| WARRANTY | Período de garantía activo | Sistema | `WarrantyStarted` |
| CLOSED | Contratación cerrada | Sistema | `EngagementClosed` |
| CANCELLED | Cancelada | Variable | `EngagementCancelled` |
| DISPUTED | En disputa | Operador | `DisputeOpened` |

### 9.3 Flujo de disputa

1. Cliente o profesional abre disputa con evidencia documental.
2. Fondos permanecen en estado `HELD` (no liberados).
3. Operador/Supervisor revisa expediente completo.
4. Resolución: liberar a profesional, reembolsar parcial/total vía MP, o mediación.
5. Emitia emite NC/ND según resolución.
6. Cierre disputa con acta y auditoría.

### 9.4 Flujo de reembolso

1. Trigger: cancelación pre-ejecución, disputa resuelta a favor cliente, contracargo MP.
2. Solicitud de reembolso vinculada a pago original MP.
3. Webhook MP confirma reembolso.
4. Wallet registra movimiento inverso.
5. Emitia emite Nota de Crédito si ya existía factura.

### 9.5 Flujo onboarding tenant EMPRESA

1. Registro con CUIT empresa + validación ARCA.
2. Configuración fiscal (condición IVA, IIBB, puntos de venta).
3. Carga documentación legal (estatuto, poderes).
4. Alta profesionales con matrículas y seguros.
5. Configuración comisiones y métodos de pago MP.
6. Activación tenant por SUPER_ADMIN o auto-aprobación según plan.

---

## 10. Módulos funcionales

### 10.1 M1 — Core / Identidad y acceso

#### RF-M1-001 Registro de usuarios
El sistema debe permitir registro con email, teléfono (validación OTP), nombre, apellido y tipo de actor.

#### RF-M1-002 Autenticación JWT
Login con email/contraseña emitiendo access token (15 min) y refresh token (30 días rotativo).

#### RF-M1-003 MFA
Autenticación multifactor obligatoria para EMPRESA, CONTADOR, SUPER_ADMIN y opcional para demás roles.

#### RF-M1-004 Gestión de sesiones
Revocación de sesiones activas, límite de dispositivos concurrentes configurable por tenant.

#### RF-M1-005 Invitaciones
EMPRESA puede invitar PROFESIONAL, OPERADOR, SUPERVISOR via email con token temporal.

#### RF-M1-006 Perfil de usuario
Avatar, datos de contacto, preferencias de notificación, idioma (es-AR default).

#### RF-M1-007 Cambio de tenant activo
Usuarios multi-tenant pueden switch entre tenants sin re-login.

---

### 10.2 M2 — Marketplace

#### RF-M2-001 Catálogo jerárquico
Categorías → Subcategorías → Servicios con atributos configurables (unidad, precio base, duración estimada).

#### RF-M2-002 Publicación de servicios
PROFESIONAL/EMPRESA publica servicios con descripción, fotos, zona de cobertura, precio desde.

#### RF-M2-003 Solicitud de servicio
CLIENTE crea solicitud con categoría, descripción, ubicación (geo), urgencia, adjuntos, presupuesto estimado opcional.

#### RF-M2-004 Propuestas / Presupuestos
PROFESIONAL responde con ítems, precio total, plazo, condiciones, validez del presupuesto.

#### RF-M2-005 Comparador
CLIENTE visualiza propuestas lado a lado: precio, plazo, rating, distancia, compliance score.

#### RF-M2-006 Favoritos
CLIENTE guarda profesionales y servicios favoritos.

#### RF-M2-007 Ranking
Score compuesto: calificaciones, tasa de finalización, tiempo de respuesta, compliance, disputas.

#### RF-M2-008 Geolocalización
Búsqueda por radio (km), mapa interactivo, filtro por barrio/localidad/provincia.

#### RF-M2-009 Búsqueda avanzada
Full-text search con filtros: categoría, precio, rating, disponibilidad, certificaciones.

#### RF-M2-010 Historial de contrataciones
CLIENTE y PROFESIONAL acceden a historial completo con re-contratación rápida.

#### RF-M2-011 Moderación
SUPER_ADMIN/OPERADOR puede suspender publicaciones que incumplan políticas.

---

### 10.3 M3 — CRM

#### RF-M3-001 Leads
Captura automática desde solicitudes marketplace + alta manual. Campos: origen, score, estado.

#### RF-M3-002 Clientes
Ficha 360: datos personales/fiscales, historial contrataciones, comunicaciones, documentos.

#### RF-M3-003 Contactos
Múltiples contactos por cliente (decisor, pagador, técnico) con roles.

#### RF-M3-004 Oportunidades
Pipeline comercial vinculado a presupuestos con valor estimado y probabilidad.

#### RF-M3-005 Pipeline configurable
Etapas customizables por tenant: Nuevo → Contactado → Propuesta → Negociación → Ganado/Perdido.

#### RF-M3-006 Contratos CRM
Vista de contratos activos, vencimientos, renovaciones.

#### RF-M3-007 Agenda
Calendario integrado: visitas, llamadas, vencimientos documentales.

#### RF-M3-008 Seguimientos
Registro de interacciones (llamada, email, reunión, WhatsApp) con timestamp y responsable.

#### RF-M3-009 Recordatorios
Alertas automáticas y manuales por fecha/condición (ej: presupuesto por vencer).

---

### 10.4 M4 — Proyectos

#### RF-M4-001 Creación automática
Al confirmar pago, se crea proyecto vinculado al expediente de contratación.

#### RF-M4-002 Tareas y subtareas
Jerarquía ilimitada con asignación, prioridad, fechas, dependencias.

#### RF-M4-003 Hitos (milestones)
Puntos de control con criterios de aceptación y porcentaje de avance.

#### RF-M4-004 Cronograma
Vista Gantt y Kanban. Fechas planificadas vs reales.

#### RF-M4-005 Avances
PROFESIONAL registra avance % con evidencia fotográfica/documental.

#### RF-M4-006 Comentarios
Thread de comentarios por tarea/hito con menciones @usuario.

#### RF-M4-007 Adjuntos
Upload a S3/R2 vinculado a tarea con versionado.

#### RF-M4-008 Estados de proyecto
`NOT_STARTED` → `IN_PROGRESS` → `ON_HOLD` → `COMPLETED` → `APPROVED` → `CLOSED`.

#### RF-M4-009 Notificaciones de proyecto
Cambios de estado, tareas vencidas, hitos completados → push/email/WhatsApp.

---

### 10.5 M5 — Gestión documental

#### RF-M5-001 Repositorio documental
Almacenamiento organizado por expediente, tipo, entidad.

#### RF-M5-002 Versionado
Cada modificación genera nueva versión con diff metadata. Versiones anteriores inmutables.

#### RF-M5-003 Flujos de aprobación
Workflow configurable: secuencial, paralelo, condicional. Roles aprobadores por etapa.

#### RF-M5-004 Rechazo con motivo
Aprobador rechaza con comentario obligatorio → notificación al autor.

#### RF-M5-005 Firma digital
Firma electrónica simple (click-to-sign con audit trail) y avanzada (integración futura certificadora).

#### RF-M5-006 Plantillas
Motor de plantillas con variables: `{{cliente.nombre}}`, `{{contrato.monto}}`, etc.

#### RF-M5-007 Tipos documentales
Contratos, actas conformidad, certificados, pólizas seguro, matrículas, facturas, informes.

#### RF-M5-008 Auditoría documental
Log inmutable: quién creó, modificó, aprobó, firmó, descargó, con IP y timestamp.

#### RF-M5-009 Trazabilidad
Cadena de custodia documental vinculada al expediente digital.

#### RF-M5-010 OCR + clasificación
IA clasifica documento subido y extrae campos (CUIT, vencimiento, monto).

---

### 10.6 M6 — Chat

#### RF-M6-001 Chat privado
Conversación 1:1 entre CLIENTE ↔ PROFESIONAL vinculada a contratación.

#### RF-M6-002 Chat grupal
Por proyecto: CLIENTE + PROFESIONAL + OPERADOR + SUPERVISOR según permisos.

#### RF-M6-003 Tiempo real
Socket.IO con reconexión automática, rooms por conversación.

#### RF-M6-004 Tipos de mensaje
Texto, imagen, archivo, audio, video, mensaje sistema.

#### RF-M6-005 Confirmación de lectura
Read receipts por mensaje con timestamp.

#### RF-M6-006 Indicador "escribiendo"
Typing indicator en tiempo real.

#### RF-M6-007 Historial persistente
Mensajes almacenados en PostgreSQL, archivos en S3/R2.

#### RF-M6-008 Moderación
SUPER_ADMIN puede acceder a chats en disputa con registro de auditoría.

---

### 10.7 M7 — Wallet contable (NO fintech)

> **Principio fundamental:** FixYa NO custodia dinero. El wallet es un registro contable que refleja estados de operaciones procesadas por Mercado Pago.

#### RF-M7-001 Libro mayor por tenant
Cuentas contables virtuales: Retenido, Pendiente, Liberado, Comisiones FixYa, Comisiones MP.

#### RF-M7-002 Movimientos (ledger)
Cada operación genera asiento doble: débito + crédito con referencia a pago MP y contratación.

#### RF-M7-003 Estados de saldo

| Estado | Significado |
|--------|-------------|
| RETENIDO | Cliente pagó; fondos no liberados al profesional |
| PENDIENTE | Liberación programada (ej: hito completado, pendiente conformidad) |
| LIBERADO | Fondos disponibles para el profesional vía MP |
| COMISIÓN | Porción retenida para FixYa |

#### RF-M7-004 Libro diario
Registro cronológico de todos los movimientos con numeración secuencial por tenant/período.

#### RF-M7-005 Conciliación
Matching automático: pago MP ↔ movimiento wallet ↔ factura Emitia. Reporte de diferencias.

#### RF-M7-006 Comisiones configurables
Por tenant/categoría: % fijo, % escalonado, mínimo, máximo.

#### RF-M7-007 Liquidaciones
Proceso batch/programado de consolidación de movimientos LIBERADOS por período.

#### RF-M7-008 Reportes contables
Export CSV/PDF: libro diario, mayor, balance de comprobación. Rol CONTADOR.

#### RF-M7-009 Inmutabilidad
Movimientos registrados no se editan; correcciones via movimiento de ajuste vinculado.

---

### 10.8 M8 — Mercado Pago Argentina

#### RF-M8-001 Checkout Pro
Redirect a checkout MP para pagos con tarjeta, débito, MP wallet.

#### RF-M8-002 Checkout API
Checkout transparente embebido en FixYa para UX nativa.

#### RF-M8-003 QR dinámico
Generación QR interoperable para pagos presenciales/remotos.

#### RF-M8-004 Links de pago
URL de pago compartible con monto, descripción, vencimiento.

#### RF-M8-005 Suscripciones
Planes premium profesionales/empresas con cobro recurrente MP.

#### RF-M8-006 Cuotas
Configuración cuotas con/sin interés según acuerdo comercial MP del tenant.

#### RF-M8-007 Webhooks
Procesamiento idempotente de: `payment.created`, `payment.updated`, `chargebacks`, `claims`.

#### RF-M8-008 Reembolsos
Total y parcial vinculado a pago original con trazabilidad wallet + Emitia NC.

#### RF-M8-009 Contracargos y disputas MP
Recepción webhook → congelar fondos → flujo disputa FixYa → resolución.

#### RF-M8-010 Conciliación MP
Import/reporte movimientos MP vs wallet. Detección automática de discrepancias.

#### RF-M8-011 Logs financieros
Log estructurado de toda interacción MP con request/response sanitizado (sin PAN).

#### RF-M8-012 Split / Marketplace payments
Configuración de split según modelo acordado con MP para liberación a profesional.

---

### 10.9 M9 — Emitia (Facturación fiscal propia)

#### RF-M9-001 Emisión Factura A
Para clientes Responsables Inscriptos con discriminação IVA.

#### RF-M9-002 Emisión Factura B
Para consumidor final / monotributista cliente.

#### RF-M9-003 Emisión Factura C
Para emisor monotributista.

#### RF-M9-004 Emisión Factura E
Exportación de servicios (preparación LATAM).

#### RF-M9-005 Notas de Crédito
Anulación parcial/total de comprobante previo.

#### RF-M9-006 Notas de Débito
Ajustes por diferencias de monto.

#### RF-M9-007 CAE / CAEA
Obtención automática vía WS ARCA. Fallback CAEA en contingencia.

#### RF-M9-008 PDF y XML
Generación PDF con código QR AFIP + XML fiscal almacenado.

#### RF-M9-009 Multiempresa / Multi-CUIT
Tenant EMPRESA con múltiples razones sociales emisoras.

#### RF-M9-010 Multi Punto de Venta
Selección automática o manual de PV según tipo operación.

#### RF-M9-011 Emisión automática post-pago
Trigger: `PaymentConfirmed` → Emitia genera comprobante según perfil fiscal cliente/profesional.

#### RF-M9-012 Auditoría Emitia
Registro inmutable de cada intento de emisión con respuesta ARCA.

---

### 10.10 M10 — Notificaciones

#### RF-M10-001 Email (Resend)
Templates transaccionales: registro, pago, factura, vencimiento, disputa.

#### RF-M10-002 WhatsApp Business API
Notificaciones críticas: pago confirmado, turno agendado, documento pendiente firma.

#### RF-M10-003 Push (Firebase)
Notificaciones mobile/web en tiempo real.

#### RF-M10-004 Preferencias
Usuario configura canal y frecuencia por tipo de evento.

#### RF-M10-005 In-app
Centro de notificaciones con badge, historial y mark-as-read.

---

### 10.11 M11 — Compliance Argentina

#### RF-M11-001 Validación CUIT
Verificación formato + consulta padrón ARCA en onboarding y periódicamente.

#### RF-M11-002 Condición IVA
Validación coherencia emisor/receptor para tipo comprobante correcto.

#### RF-M11-003 Ingresos Brutos
Registro jurisdicción IIBB, alícuota, nro inscripción. Alerta vencimiento.

#### RF-M11-004 Matrículas profesionales
Registro nro matrícula, colegio, jurisdicción, vencimiento. Bloqueo si vencida.

#### RF-M11-005 Seguros y ART
Póliza responsabilidad civil, ART para empresa. Upload + fecha vencimiento.

#### RF-M11-006 Documentación vencida
Job diario detecta vencimientos → alerta 30/15/7/1 días antes → suspensión si vencido.

#### RF-M11-007 Compliance score
Score visible en marketplace basado en documentación al día.

#### RF-M11-008 Bloqueo operativo
Profesional con compliance vencido no puede recibir solicitudes ni cobrar.

---

### 10.12 M12 — Inteligencia Artificial

#### RF-M12-001 Asistente comercial
Sugerencias de respuesta a solicitudes, pricing recomendado basado en histórico.

#### RF-M12-002 Asistente documental
Generación borrador contratos, extracción datos de PDFs, clasificación automática.

#### RF-M12-003 Asistente presupuestos
Sugerencia de ítems y precios basado en categoría + zona + histórico.

#### RF-M12-004 Asistente CRM
Scoring leads, próxima mejor acción, detección churn.

#### RF-M12-005 Asistente proyectos
Estimación duración, detección riesgo retraso, resumen de avances.

#### RF-M12-006 Generación informes
Informe automático de cierre de proyecto con métricas y documentación.

#### RF-M12-007 Guardrails
Toda sugerencia IA marcada como tal. No emisión fiscal automática sin confirmación humana.

---

### 10.13 M13 — Auditoría y logging

#### RF-M13-001 Audit log global
Toda acción CRUD en entidades críticas registrada con actor, tenant, IP, payload diff.

#### RF-M13-002 Retención logs
Mínimo 7 años datos fiscales, 2 años logs operativos (configurable).

#### RF-M13-003 Export auditoría
AUDITOR exporta logs filtrados por entidad, actor, rango fechas.

---

### 10.14 M14 — Configuración tenant

Parámetros configurables: comisiones, workflows documentales, pipeline CRM, templates, integraciones MP/Emitia, branding (logo, colores), zonas geográficas, horarios operativos, SLA.

---

### 10.15 M15 — Reporting

Dashboards: contrataciones/día, GMV, comisiones, funnel conversión, compliance, disputas, NPS, performance profesionales. Export PDF/Excel. Rol-based views.

---

## 11. Expediente digital único

### 11.1 Definición

Cada **contratación** (engagement) genera un expediente digital único e inmutable como contenedor de toda la información del ciclo de vida.

### 11.2 Componentes del expediente

| Componente | Descripción |
|------------|-------------|
| Identificadores | ID expediente, ID contratación, tenant_id, timestamps |
| Actores | Cliente, profesional, empresa, operador asignado |
| Solicitud | Detalle original del pedido |
| Presupuestos | Todas las propuestas + seleccionada |
| Contrato | Versiones, firmas, estado |
| Proyecto | Tareas, hitos, avances |
| Documentos | Todos los archivos con versionado |
| Comunicaciones | Chat + emails + WhatsApp log |
| Pagos | Transacciones MP vinculadas |
| Wallet | Movimientos contables del engagement |
| Facturas | Comprobantes Emitia (PDF + XML) |
| Actas | Conformidad, entrega, cierre |
| Garantías | Período, condiciones, reclamos |
| Disputas | Si aplica: evidencia y resolución |
| Auditoría | Timeline completo de eventos |

### 11.3 Reglas del expediente

1. Un expediente no se elimina; solo se archiva (`CLOSED`).
2. Todo artefacto referencia `engagement_id`.
3. Timeline unificada ordenada cronológicamente.
4. Acceso según RBAC/ABAC del actor respecto al engagement.
5. Export completo del expediente en PDF/ZIP para auditorías legales.

---

## 12. Wallet contable — Especificación funcional detallada

### 12.1 Modelo conceptual

```
┌─────────────────────────────────────────────────┐
│              CUENTA: RETENIDO (2110)             │
│  Saldo = pagos confirmados - liberaciones        │
└───────────────────────┬─────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  LIBERADO   │ │  COMISIÓN   │ │ REEMBOLSO   │
│  (profes.)  │ │  (FixYa)    │ │  (cliente)  │
└─────────────┘ └─────────────┘ └─────────────┘
```

### 12.2 Tipos de movimiento

| Tipo | Débito | Crédito | Trigger |
|------|--------|---------|---------|
| PAGO_RECIBIDO | Retenido | — | Webhook MP approved |
| COMISION_FIXYA | Retenido | Comisión FixYa | Al retener |
| COMISION_MP | Retenido | Comisión MP | Al retener |
| LIBERACION | Retenido | Liberado | Conformidad cliente |
| REEMBOLSO | Retenido | Cliente (via MP) | Cancelación/disputa |
| AJUSTE | Variable | Variable | Manual CONTADOR con aprobación |

### 12.3 Reglas de negocio wallet

1. No existe saldo negativo en cuenta Retenido sin ajuste autorizado.
2. Liberación requiere: proyecto `APPROVED` + sin disputa abierta + compliance vigente.
3. Comisión FixYa se calcula sobre monto bruto del pago.
4. Período de retención mínimo configurable por tenant (default: hasta conformidad).
5. Garantía: 5% opcional retenido adicional por 30 días post-conformidad (configurable).

---

## 13. Integración Mercado Pago Argentina

### 13.1 Configuración por tenant

Cada tenant EMPRESA/PROFESIONAL vincula cuenta MP via OAuth con `access_token` almacenado en Secrets Manager. FixYa actúa como marketplace/plataforma según acuerdo MP.

### 13.2 Flujo de pago Checkout Pro

1. Cliente aprueba presupuesto y contrato.
2. FixYa crea preferencia MP con `external_reference: {tenant_id}:{engagement_id}`.
3. Cliente redirigido a MP, completa pago.
4. Webhook `payment` → FixYa valida firma → idempotency key → registra wallet → trigger Emitia.
5. Redirect success/failure/pending URLs retornan a FixYa.

### 13.3 Webhooks — Eventos procesados

| Evento MP | Acción FixYa |
|-----------|--------------|
| payment.created | Log + estado PENDING |
| payment.approved | Wallet RETENIDO + Emitia + proyecto IN_PROGRESS |
| payment.rejected | Notificar cliente, engagement PAYMENT_PENDING |
| payment.refunded | Wallet reverso + Emitia NC |
| chargebacks | Disputa automática + congelar fondos |
| merchant_order | Conciliación |

### 13.4 Idempotencia

Todo webhook procesado con clave `{payment_id}:{status}:{date}` en Redis. Duplicados ignorados con log.

### 13.5 Seguridad MP

- Validación firma x-signature/x-request-id headers.
- IPs whitelist MP (configurable).
- Tokens nunca expuestos al frontend.

---

## 14. Sistema Emitia (facturación fiscal)

### 14.1 Arquitectura funcional Emitia

Emitia opera como subsistema desacoplado con API interna consumida por FixYa backend via eventos de dominio.

### 14.2 Flujo de emisión automática

```
PaymentConfirmed (evento)
    → FixYa determina tipo comprobante (A/B/C) según emisor/receptor IVA
    → emitia-invoicing construye request WSFE
    → emitia-arca solicita CAE
    → emitia-pdf-engine genera PDF + QR
    → Comprobante almacenado en expediente
    → Notificación a CONTADOR + CLIENTE
```

### 14.3 Reglas fiscales Argentina

| Emisor | Receptor | Comprobante |
|--------|----------|-------------|
| RI | RI | Factura A |
| RI | CF/Monotributo | Factura B |
| Monotributo | Cualquiera | Factura C |
| RI | Exterior | Factura E |

### 14.4 Contingencia CAEA

Si WSFE CAE no disponible: modo CAEA pre-solicitado. Emitia gestiona stock CAEA por PV.

### 14.5 Almacenamiento fiscal

XML autorizado ARCA + PDF + metadata almacenados 10+ años en S3 con WORM policy.

---

## 15. Compliance Argentina

### 15.1 Checklist onboarding profesional

- [ ] CUIT validado ARCA
- [ ] Condición IVA registrada
- [ ] Constancia AFIP/ARCA (< 30 días)
- [ ] Matrícula profesional vigente
- [ ] Seguro responsabilidad civil vigente
- [ ] CBU/CVU para cobros MP
- [ ] Aceptación T&C FixYa

### 15.2 Checklist onboarding empresa

- Todos los anteriores a nivel empresa
- [ ] Estatuto / contrato social
- [ ] Acta designación autoridades
- [ ] IIBB multi-jurisdiccional
- [ ] ART vigente
- [ ] Póliza seguro general

### 15.3 Alertas automáticas

| Alerta | Anticipación | Acción |
|--------|--------------|--------|
| Matrícula por vencer | 30/15/7 días | Email + push |
| Seguro por vencer | 30/15/7 días | Email + push |
| Constancia AFIP vieja | > 30 días | Warning badge |
| Documento vencido | 0 días | Suspensión operativa |

### 15.4 Protección de datos (Ley 25.326)

- Consentimiento explícito tratamiento datos.
- Derecho acceso, rectificación, supresión (excepto retención fiscal).
- DPO designado.
- Política privacidad y cookies.

---

## 16. Módulo de inteligencia artificial

### 16.1 Casos de uso IA v1

| Caso | Entrada | Salida | Human-in-the-loop |
|------|---------|--------|-------------------|
| Clasificar documento | PDF/imagen | Tipo + campos extraídos | Confirmación GESTOR_DOC |
| Borrador contrato | Datos engagement | Documento draft | Aprobación EMPRESA |
| Sugerir presupuesto | Solicitud + histórico | Ítems + rango precio | PROFESIONAL edita |
| Score lead | Datos CRM | 0-100 + razones | Informativo |
| Resumen proyecto | Tareas + chat | Informe texto | Informativo |
| Chat asistente | Pregunta usuario | Respuesta contextual | Siempre |

### 16.2 Restricciones IA

- No emitir comprobantes fiscales sin aprobación humana.
- No liberar fondos automáticamente.
- No firmar contratos en nombre del usuario.
- Logs de prompts y respuestas para auditoría.

---

## 17. Requisitos no funcionales

### 17.1 Performance

| Métrica | Objetivo |
|---------|----------|
| API response p95 | < 200ms (lectura), < 500ms (escritura) |
| Página carga inicial | < 2s (LCP) |
| WebSocket latencia | < 100ms |
| Búsqueda marketplace | < 300ms p95 |
| Emisión Emitia | < 5s p95 |

### 17.2 Escalabilidad

- 1.000.000+ usuarios registrados.
- 50.000 requests/segundo pico (con auto-scaling ECS).
- 10.000 pagos/hora pico.
- Particionado PostgreSQL por tenant_id en tablas > 100M rows.

### 17.3 Disponibilidad

- 99.9% uptime (8.76h downtime/año máx).
- RTO: 1 hora. RPO: 15 minutos.
- Multi-AZ RDS, Redis cluster, ECS multi-AZ.

### 17.4 Seguridad

| Control | Implementación |
|---------|----------------|
| Autenticación | JWT + refresh rotation + MFA |
| Autorización | RBAC + ABAC |
| OWASP Top 10 | Mitigaciones en cada capa |
| Rate limiting | 100 req/min usuario, 1000 req/min tenant |
| XSS/CSRF | CSP headers, CSRF tokens, sanitización |
| SQL Injection | Prisma ORM + parameterized queries + RLS |
| Secrets | AWS Secrets Manager, nunca en código |
| Encryption at rest | RDS, S3 SSE-KMS |
| Encryption in transit | TLS 1.3 everywhere |
| Auditoría | Immutable audit log |

### 17.5 Testing (objetivo Fase 13)

- Cobertura mínima 95% backend.
- E2E flujos críticos: contratación, pago, emisión, liberación.
- Load test: 10x tráfico esperado año 1.

### 17.6 Observabilidad

- Grafana + Prometheus métricas infra y app.
- Sentry errores frontend/backend.
- Logs centralizados CloudWatch → OpenSearch.
- Alertas PagerDuty: pago fallido masivo, Emitia down, MP webhook backlog.

### 17.7 Accesibilidad

- WCAG 2.1 AA mínimo.
- Soporte lectores de pantalla en flujos críticos.

### 17.8 Internacionalización (preparación LATAM)

- i18n framework desde v1 (es-AR default).
- Formato moneda ARS, fecha DD/MM/YYYY, timezone America/Argentina/Buenos_Aires.
- Campos fiscales extensibles por país.

---

## 18. Casos de uso

### CU-001 Solicitar servicio

| Campo | Valor |
|-------|-------|
| Actor | CLIENTE |
| Precondición | Usuario autenticado, perfil completo |
| Flujo principal | 1. Selecciona categoría 2. Describe necesidad 3. Indica ubicación 4. Adjunta fotos 5. Publica solicitud |
| Postcondición | Solicitud visible para profesionales en zona |
| Alternativa | Borrador guardado para publicar después |

### CU-002 Enviar presupuesto

| Campo | Valor |
|-------|-------|
| Actor | PROFESIONAL |
| Precondición | Compliance vigente, solicitud en zona |
| Flujo principal | 1. Ve solicitud 2. Crea ítems 3. Define precio y plazo 4. Envía propuesta |
| Postcondición | Cliente notificado, propuesta en comparador |

### CU-003 Contratar y pagar

| Campo | Valor |
|-------|-------|
| Actor | CLIENTE |
| Precondición | Propuesta seleccionada |
| Flujo principal | 1. Aprueba presupuesto 2. Sistema genera contrato 3. Firma digital 4. Redirect MP 5. Paga 6. Webhook confirma |
| Postcondición | Wallet retenido, factura emitida, proyecto creado |

### CU-004 Ejecutar y cerrar proyecto

| Campo | Valor |
|-------|-------|
| Actor | PROFESIONAL, CLIENTE |
| Precondición | Pago confirmado |
| Flujo principal | 1. Profesional ejecuta tareas 2. Marca completado 3. Cliente revisa 4. Aprueba conformidad 5. Fondos liberados 6. Garantía inicia 7. Cierre |
| Postcondición | Engagement CLOSED, expediente archivado |

### CU-005 Emitir factura

| Campo | Valor |
|-------|-------|
| Actor | Sistema (Emitia) |
| Precondición | Pago confirmado, datos fiscales completos |
| Flujo principal | 1. Determina tipo comprobante 2. Solicita CAE ARCA 3. Genera PDF/XML 4. Almacena en expediente |
| Alternativa | CAEA en contingencia |

### CU-006 Abrir disputa

| Campo | Valor |
|-------|-------|
| Actor | CLIENTE o PROFESIONAL |
| Precondición | Engagement activo con pago |
| Flujo principal | 1. Describe motivo 2. Adjunta evidencia 3. Fondos congelados 4. Operador media 5. Resolución |
| Postcondición | Liberación o reembolso según resolución |

### CU-007 Onboarding empresa

| Campo | Valor |
|-------|-------|
| Actor | EMPRESA |
| Precondición | CUIT válido |
| Flujo principal | 1. Registro 2. Validación ARCA 3. Config fiscal 4. Vincular MP 5. Invitar equipo 6. Activación |
| Postcondición | Tenant operativo |

### CU-008 Conciliación contable

| Campo | Valor |
|-------|-------|
| Actor | CONTADOR |
| Precondición | Período cerrado |
| Flujo principal | 1. Selecciona período 2. Sistema compara MP/wallet/Emitia 3. Muestra diferencias 4. Export reportes |
| Postcondición | Reporte conciliación generado |

---

## 19. User stories priorizadas

### Epic E1 — Contratación core (P0 — Must Have)

| ID | Story | Prioridad |
|----|-------|-----------|
| US-001 | Como CLIENTE quiero solicitar un servicio para resolver mi necesidad | P0 |
| US-002 | Como PROFESIONAL quiero enviar presupuestos para conseguir trabajos | P0 |
| US-003 | Como CLIENTE quiero comparar presupuestos para elegir la mejor opción | P0 |
| US-004 | Como sistema quiero generar contrato automático al aprobar presupuesto | P0 |
| US-005 | Como CLIENTE quiero pagar con Mercado Pago de forma segura | P0 |
| US-006 | Como sistema quiero retener fondos hasta conformidad del cliente | P0 |
| US-007 | Como PROFESIONAL quiero recibir fondos al aprobar el cliente | P0 |
| US-008 | Como sistema quiero emitir factura fiscal automáticamente | P0 |

### Epic E2 — Operación (P0)

| ID | Story | Prioridad |
|----|-------|-----------|
| US-009 | Como PROFESIONAL quiero gestionar tareas del proyecto | P0 |
| US-010 | Como CLIENTE quiero ver avances del proyecto en tiempo real | P0 |
| US-011 | Como CLIENTE quiero aprobar conformidad para liberar pago | P0 |
| US-012 | Como usuario quiero chatear con la contraparte del servicio | P0 |

### Epic E3 — Compliance (P0)

| ID | Story | Prioridad |
|----|-------|-----------|
| US-013 | Como sistema quiero validar CUIT contra ARCA en onboarding | P0 |
| US-014 | Como sistema quiero alertar documentación por vencer | P0 |
| US-015 | Como CLIENTE quiero ver compliance score del profesional | P1 |

### Epic E4 — Empresa (P1)

| ID | Story | Prioridad |
|----|-------|-----------|
| US-016 | Como EMPRESA quiero invitar profesionales a mi tenant | P1 |
| US-017 | Como SUPERVISOR quiero ver dashboard operativo del equipo | P1 |
| US-018 | Como CONTADOR quiero exportar libros contables | P1 |

### Epic E5 — CRM y Marketplace avanzado (P1-P2)

| ID | Story | Prioridad |
|----|-------|-----------|
| US-019 | Como PROFESIONAL quiero pipeline CRM para mis leads | P1 |
| US-020 | Como CLIENTE quiero buscar servicios por geolocalización | P1 |
| US-021 | Como CLIENTE quiero guardar favoritos | P2 |
| US-022 | Como PROFESIONAL quiero suscripción premium destacada | P2 |

### Epic E6 — IA (P2)

| ID | Story | Prioridad |
|----|-------|-----------|
| US-023 | Como PROFESIONAL quiero sugerencia IA de presupuesto | P2 |
| US-024 | Como GESTOR_DOC quiero clasificación automática de documentos | P2 |

---

## 20. Criterios de aceptación globales

### 20.1 Definición de "Done" producción

- [ ] Funcionalidad cumple RF del módulo correspondiente.
- [ ] Tests unitarios + integración pasan (cobertura ≥ 95% backend).
- [ ] E2E del flujo afectado pasa en staging.
- [ ] Documentación Swagger actualizada.
- [ ] Auditoría de seguridad OWASP pasada.
- [ ] Performance dentro de SLAs definidos.
- [ ] Logs y métricas instrumentados.
- [ ] Revisión de código aprobada.
- [ ] Compliance Argentina validado para funcionalidad fiscal.

### 20.2 Criterios flujo contratación end-to-end

1. Cliente publica solicitud → visible en < 5 segundos para profesionales elegibles.
2. Profesional envía presupuesto → cliente recibe notificación < 30 segundos.
3. Cliente aprueba → contrato generado < 10 segundos.
4. Pago MP aprobado → wallet + factura + proyecto en < 30 segundos.
5. Conformidad cliente → liberación fondos registrada < 10 segundos.
6. Expediente contiene 100% artefactos del ciclo.

### 20.3 Criterios wallet

- Doble entrada siempre balanceada (débitos = créditos).
- Cero discrepancias no explicadas post-conciliación automática.
- Movimientos inmutables con cadena de referencia a MP.

### 20.4 Criterios Emitia

- 99.5% emisiones exitosas en condiciones normales ARCA.
- PDF con QR AFIP válido verificable.
- XML almacenado y recuperable 10+ años.

---

## 21. Glosario

| Término | Definición |
|---------|------------|
| Engagement | Instancia de contratación de servicio (ciclo completo) |
| Expediente | Contenedor digital único de un engagement |
| Tenant | Organización aislada lógicamente en la plataforma |
| Wallet contable | Registro contable de estados financieros (no custodia) |
| Emitia | Sistema propio de facturación electrónica FixYa |
| ARCA | Agencia de Recaudación y Control Aduanero (ex AFIP) |
| CAE | Código de Autorización Electrónico |
| CAEA | Código de Autorización Electrónico Anticipado |
| CUIT | Clave Única de Identificación Tributaria |
| IVA | Impuesto al Valor Agregado |
| IIBB | Ingresos Brutos |
| RI | Responsable Inscripto |
| CF | Consumidor Final |
| MP | Mercado Pago |
| RBAC | Control de acceso basado en roles |
| ABAC | Control de acceso basado en atributos |
| GMV | Gross Merchandise Value (volumen transaccional bruto) |
| SLA | Service Level Agreement |
| NC / ND | Nota de Crédito / Nota de Débito |
| Split payment | División de pago entre plataforma y vendedor via MP |
| RLS | Row Level Security (PostgreSQL) |

---

## 22. Anexos

### Anexo A — Mapa de fases del proyecto

| Fase | Entregable | Dependencias |
|------|------------|--------------|
| **1** | **Documento funcional (este documento)** | — |
| 2 | Arquitectura completa (C4, UML, infra) | Fase 1 |
| 3 | Modelo de datos (ERD, Prisma, migraciones) | Fase 2 |
| 4 | Backend core (NestJS) | Fase 3 |
| 5 | Frontend core (Next.js 15) | Fase 4 |
| 6 | Marketplace | Fase 4, 5 |
| 7 | CRM | Fase 4, 5 |
| 8 | Documental | Fase 4, 5 |
| 9 | Wallet contable | Fase 4 |
| 10 | Mercado Pago | Fase 4, 9 |
| 11 | Emitia | Fase 4, 9, 10 |
| 12 | IA | Fase 4-8 |
| 13 | Testing (95% cobertura) | Fase 4-12 |
| 14 | DevOps / CI/CD | Fase 4 |
| 15 | Producción | Fase 13, 14 |

### Anexo B — Entidades principales (vista funcional)

```
Tenant ──┬── User (membership)
         ├── Client (CRM)
         ├── Service / Category (Marketplace)
         ├── ServiceRequest → Quotation → Engagement
         ├── Contract → Document → Signature
         ├── Project → Task → Milestone
         ├── Payment (MP) → WalletMovement → LedgerEntry
         ├── Invoice (Emitia) → FiscalDocument
         ├── ChatConversation → ChatMessage
         ├── ComplianceDocument
         └── AuditLog
```

### Anexo C — Eventos de dominio principales

| Evento | Productor | Consumidores |
|--------|-----------|--------------|
| ServiceRequestPublished | Marketplace | CRM, Notifications, IA |
| QuotationAccepted | Marketplace | Documental, Contracts |
| ContractSigned | Documental | Payments |
| PaymentConfirmed | MercadoPago | Wallet, Emitia, Projects |
| InvoiceIssued | Emitia | Documental, Notifications |
| ProjectCompleted | Projects | Wallet, Notifications |
| FundsReleased | Wallet | Notifications, MercadoPago |
| ComplianceExpiring | Compliance | Notifications, Marketplace |
| DisputeOpened | Core | Wallet, Chat, Notifications |

### Anexo D — Matriz de notificaciones

| Evento | Email | Push | WhatsApp | In-app |
|--------|:-----:|:----:|:--------:|:------:|
| Nueva solicitud en zona | ✓ | ✓ | — | ✓ |
| Presupuesto recibido | ✓ | ✓ | ✓ | ✓ |
| Pago confirmado | ✓ | ✓ | ✓ | ✓ |
| Factura emitida | ✓ | — | — | ✓ |
| Documento pendiente firma | ✓ | ✓ | ✓ | ✓ |
| Proyecto completado | ✓ | ✓ | ✓ | ✓ |
| Doc. por vencer | ✓ | ✓ | — | ✓ |
| Disputa abierta | ✓ | ✓ | ✓ | ✓ |

### Anexo E — Riesgos funcionales

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Indisponibilidad ARCA | Alto | Modo CAEA contingencia |
| Webhook MP perdido | Alto | Polling reconciliación cada 15 min |
| Documento vencido no detectado | Medio | Job diario + alertas escalonadas |
| Disputa sin resolución SLA | Medio | Escalamiento automático a SUPERVISOR |
| Breach tenant isolation | Crítico | RLS + middleware + tests + alertas |

### Anexo F — Aprobaciones requeridas

| Rol | Nombre | Firma | Fecha |
|-----|--------|-------|-------|
| CEO | Pendiente | | |
| CTO | Pendiente | | |
| Product Manager | Pendiente | | |
| Compliance Legal AR | Pendiente | | |
| Backend Lead | Pendiente | | |
| Frontend Lead | Pendiente | | |

---

**Fin del Documento Funcional — Fase 1**

*Próximo paso: Fase 2 — Arquitectura completa (C4, UML, ERD preliminar, componentes, secuencia, infraestructura AWS)*

