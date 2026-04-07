# Documentacion de Desarrollo — Galan Ops Monitor

## Indice

1. [Vision general](#vision-general)
2. [Arquitectura del sistema](#arquitectura-del-sistema)
3. [Stack tecnologico y justificacion](#stack-tecnologico-y-justificacion)
4. [Estructura del proyecto](#estructura-del-proyecto)
5. [Frontend — Next.js App](#frontend--nextjs-app)
6. [Backend — API Routes](#backend--api-routes)
7. [Simulacion de datos](#simulacion-de-datos)
8. [Automatizacion — Workflows n8n](#automatizacion--workflows-n8n)
9. [Integracion de IA — Groq LLM](#integracion-de-ia--groq-llm)
10. [Base de datos — Supabase/PostgreSQL](#base-de-datos--supabasepostgresql)
11. [Infraestructura y despliegue](#infraestructura-y-despliegue)
12. [Seguridad](#seguridad)
13. [Datos operativos reales utilizados](#datos-operativos-reales-utilizados)
14. [Decisiones de diseno](#decisiones-de-diseno)
15. [Flujo de datos end-to-end](#flujo-de-datos-end-to-end)

---

## Vision general

Galan Ops Monitor es un dashboard de monitoreo operativo para la planta HMW Phase 1 de Galan Lithium. Simula el monitoreo en tiempo real de operaciones de extraccion de litio en el Salar del Hombre Muerto, Catamarca, Argentina.

El sistema tiene tres capas:

1. **Dashboard web** — Visualizacion de datos operativos en tiempo real
2. **API REST** — Endpoints que sirven datos y reciben inputs de sensores y workflows
3. **Automatizacion con IA** — Workflows n8n que procesan alertas y generan reportes usando LLMs

El objetivo es demostrar como la tecnologia (desarrollo full-stack, automatizacion con n8n, integracion de LLMs) puede aplicarse a operaciones mineras reales para reducir tiempos de respuesta, automatizar reportes y enriquecer alertas con inteligencia artificial.

---

## Arquitectura del sistema

```
+------------------+     +-------------------+     +------------------+
|                  |     |                   |     |                  |
|  Simulador       |     |    n8n Cloud      |     |   Groq API       |
|  Python          |     |                   |     |   (LLaMA 3.1)    |
|  (sensores)      |     |  alert-monitor    |     |                  |
|                  |     |  shift-report     |     +--------+---------+
+--------+---------+     +--------+----------+              |
         |                        |                         |
         |  POST /api/sensor-data |  GET /api/dashboard     | HTTP POST
         |                        |  GET /api/alertas       | (chat completions)
         v                        v  POST /api/alertas      |
+--------+------------------------+-------------------------+---------+
|                                                                     |
|                    Vercel (Next.js 15)                               |
|                                                                     |
|  +------------------+  +------------------+  +-------------------+  |
|  | /                |  | /api/dashboard   |  | /api/alertas      |  |
|  | Dashboard        |  | GET datos        |  | GET/POST alertas  |  |
|  +------------------+  +------------------+  +-------------------+  |
|  | /pozas           |  | /api/reportes    |  | /api/sensor-data  |  |
|  | Evaporacion      |  | GET/POST reports |  | POST sensores     |  |
|  +------------------+  +------------------+  +-------------------+  |
|  | /alertas         |                                               |
|  | Centro alertas   |  +------------------------------------------+ |
|  +------------------+  | Supabase (PostgreSQL) — opcional          | |
|  | /reportes        |  | Si no esta configurado, usa datos        | |
|  | Reportes turno   |  | simulados dinamicos (fallback)           | |
|  +------------------+  +------------------------------------------+ |
|                                                                     |
+---------------------------------------------------------------------+
```

### Flujo principal

1. El **simulador Python** genera datos de sensores con variaciones realistas y los envia a la API
2. La **API** almacena datos en Supabase o los genera dinamicamente si Supabase no esta configurado
3. El **dashboard** consume la API cada 15 segundos y muestra datos actualizados
4. **n8n** consulta la API cada 5 minutos, detecta alertas, las envia a Groq para clasificacion
5. **Groq (LLaMA 3.1)** analiza la alerta en contexto operativo y devuelve severidad + recomendacion
6. n8n guarda la alerta enriquecida y notifica por email si es critica/alta

---

## Stack tecnologico y justificacion

### Frontend

| Tecnologia | Version | Por que |
|-----------|---------|---------|
| **Next.js** | 15.3 | Framework React con SSR, API routes integradas, y despliegue nativo en Vercel. Elegido porque permite tener frontend y backend en un solo proyecto, con TypeScript nativo, y el App Router simplifica el routing por carpetas. La version 15 trae React 19 y Turbopack para desarrollo rapido. |
| **React** | 19.1 | Biblioteca de UI. La version 19 trae mejoras de rendimiento y Server Components. Se usa en modo cliente (`"use client"`) para los dashboards interactivos que necesitan estado y actualizacion en tiempo real. |
| **TypeScript** | 5.8 | Tipado estatico sobre JavaScript. Critico en un proyecto con multiples interfaces de datos (pozos, pozas, alertas, reportes, KPIs). Los tipos en `src/lib/types.ts` documentan la estructura de datos y previenen errores en compilacion. |
| **Tailwind CSS** | 4.1 | Framework de utilidades CSS. Permite iterar rapido en el diseno sin archivos CSS separados por componente. La version 4 introduce el sistema `@theme` para variables CSS nativas y mejor integracion con PostCSS. |
| **Recharts** | 2.15 | Biblioteca de graficos para React basada en D3. Se eligio sobre Chart.js o Nivo por su API declarativa con componentes React nativos y su buen soporte de TypeScript. |
| **Lucide React** | 0.487 | Set de iconos SVG optimizados. Fork mantenido de Feather Icons con mas iconos y tree-shaking nativo (solo se importan los iconos que se usan). |
| **date-fns** | 4.1 | Utilidades de fecha. Mas liviana que Moment.js y con tree-shaking. Se usa para formateo de timestamps en reportes y alertas. |

### Backend / API

| Tecnologia | Por que |
|-----------|---------|
| **Next.js API Routes** | Las API routes del App Router (`src/app/api/*/route.ts`) permiten definir endpoints REST sin un servidor separado. Cada archivo exporta funciones `GET` y `POST` que Next.js despliega como funciones serverless en Vercel. Esto elimina la necesidad de un backend Express o Fastify separado. |
| **Supabase** | Base de datos PostgreSQL como servicio con API REST automatica. Se eligio porque ofrece tier gratuito, no requiere gestion de infraestructura, y tiene Row Level Security para control de acceso. Se usa solo como capa de persistencia — la logica esta en las API routes. |
| **Modo fallback** | Si Supabase no esta configurado (como en la demo de Vercel), la app genera datos simulados dinamicos usando funciones matematicas que simulan ciclos diurnos, variacion gaussiana y anomalias aleatorias. Esto permite que la demo funcione sin dependencias externas. |

### Automatizacion

| Tecnologia | Por que |
|-----------|---------|
| **n8n** | Plataforma de automatizacion de workflows. Se eligio porque: 1) La vacante de Galan Lithium menciona explicitamente n8n, 2) Permite disenar flujos visuales que son faciles de entender y modificar, 3) Soporta HTTP requests, code nodes con JavaScript, y cientos de integraciones, 4) Tiene version cloud (sin infraestructura) y self-hosted. Los workflows se exportan como JSON, lo que permite versionarlos en git. |
| **n8n Cloud** | Instancia gestionada de n8n. Se usa para la demo porque no requiere VPS ni Docker. Los workflows corren en la nube de n8n y se comunican con la app en Vercel via HTTP. |

### Inteligencia Artificial

| Tecnologia | Por que |
|-----------|---------|
| **Groq** | Proveedor de inferencia LLM con latencia ultra-baja (~100ms). Se eligio sobre OpenAI o Anthropic por: 1) Tier gratuito generoso, 2) Latencia minima (importante para workflows automaticos que corren cada 5 minutos), 3) API compatible con OpenAI (facil de intercambiar). |
| **LLaMA 3.1 8B** | Modelo open-source de Meta. Se usa la version 8B (mas rapida) via Groq. Es suficiente para clasificacion de alertas y generacion de resumenes. El modelo recibe un system prompt contextualizado a operaciones de litio en el Salar del Hombre Muerto para dar recomendaciones tecnicas relevantes. |

### Simulacion

| Tecnologia | Por que |
|-----------|---------|
| **Python** | El simulador de sensores (`scripts/simulate_sensors.py`) genera datos realistas de 7 pozos, meteorologia y anomalias. Se usa Python porque: 1) Es el lenguaje estandar para scripts de datos y sensores en la industria, 2) Las funciones matematicas (gaussianas, ciclos sinusoidales) son mas legibles en Python, 3) Demuestra capacidad poliglota (TypeScript en el frontend, Python en backend/scripts). |

### Infraestructura

| Tecnologia | Por que |
|-----------|---------|
| **Vercel** | Plataforma de despliegue para Next.js. Despliegue automatico desde GitHub, SSL incluido, CDN global, funciones serverless. El tier gratuito es suficiente para la demo. |
| **Docker Compose** | Para desarrollo local con el stack completo (app + PostgreSQL + n8n). Define tres servicios interconectados con un solo comando `docker compose up`. |
| **GitHub** | Control de versiones y repositorio publico. Sirve como portfolio tecnico para la postulacion. |

---

## Estructura del proyecto

```
galan-ops-monitor/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Layout raiz con NavBar y footer
│   │   ├── page.tsx                  # Dashboard principal (/)
│   │   ├── globals.css               # Sistema de diseno (colores, tipografia, componentes)
│   │   ├── pozas/
│   │   │   └── page.tsx              # Pozas de evaporacion (/pozas)
│   │   ├── alertas/
│   │   │   └── page.tsx              # Centro de alertas (/alertas)
│   │   ├── reportes/
│   │   │   └── page.tsx              # Reportes de turno (/reportes)
│   │   └── api/
│   │       ├── dashboard/route.ts    # GET — datos completos del dashboard
│   │       ├── alertas/route.ts      # GET/POST — alertas operativas
│   │       ├── reportes/route.ts     # GET/POST — reportes de turno
│   │       └── sensor-data/route.ts  # POST — recibe datos del simulador
│   ├── components/
│   │   └── NavBar.tsx                # Navegacion con indicador de ruta activa
│   └── lib/
│       ├── types.ts                  # Interfaces TypeScript (Pozo, Poza, Alerta, etc.)
│       ├── mock-data.ts              # Datos semilla estaticos basados en datos reales
│       ├── simulate.ts               # Funciones de variacion temporal (gaussiana, ciclos)
│       ├── fallback-data.ts          # Generador de datos dinamicos (reemplaza mock estático)
│       └── supabase.ts               # Cliente REST para Supabase
├── n8n/workflows/
│   ├── alert-monitor.json            # Workflow: monitoreo de alertas con IA (11 nodos)
│   └── shift-report.json             # Workflow: reportes de turno con IA (9 nodos)
├── scripts/
│   ├── simulate_sensors.py           # Generador de datos de sensores en Python
│   ├── seed-db.sql                   # Schema PostgreSQL + datos iniciales
│   └── supabase-setup.sql            # Setup Supabase con RLS
├── docs/
│   └── DESARROLLO.md                 # Este documento
├── docker-compose.yml                # Stack completo (app + PostgreSQL + n8n)
├── Dockerfile                        # Imagen de la app
├── package.json                      # Dependencias y scripts
├── tsconfig.json                     # Configuracion TypeScript
└── .env.example                      # Variables de entorno requeridas
```

---

## Frontend — Next.js App

### Paginas

#### Dashboard Principal (`/` — `src/app/page.tsx`)

La pagina principal muestra el flujo completo del proceso de extraccion de litio en 7 etapas interactivas:

1. **Extraccion** (7 pozos) → 2. **Halita** → 3. **Silvinita** → 4. **Carnalita** → 5. **Concentracion Final** → 6. **Nanofiltracion** → 7. **LiCl 6%**

Cada nodo del proceso es clickeable y muestra datos detallados en un panel lateral. Los datos se obtienen de `/api/dashboard` y se refrescan cada 15 segundos.

Elementos principales:
- **Barra superior**: Seguridad (dias sin LTI), meteorologia (temp, viento, radiacion), alertas activas
- **Diagrama de proceso**: 7 nodos interactivos con concentracion de Li, estado, detalle
- **Barra de concentracion**: Visualizacion logaritmica de 859 mg/L a 58,000 mg/L
- **Panel de detalle**: Muestra datos especificos del nodo seleccionado (pozos individuales, pozas por etapa, planta NF)
- **Panel de alertas**: Top 4 alertas activas con recomendaciones de IA
- **KPIs**: 6 tarjetas (produccion, acumulado, inventario, agua, evaporacion, Mg:Li)
- **Quick links**: Acceso directo a pozas, alertas y reportes

Estado: `useState` para datos (`DashData`), nodo seleccionado (`NodeId`), loading, lastUpdate.
Refresh: `useEffect` con `setInterval` de 15 segundos.
Loading: Skeleton animado mientras carga la primera vez.

#### Pozas de Evaporacion (`/pozas` — `src/app/pozas/page.tsx`)

Monitoreo detallado de las 6 pozas de evaporacion en 4 etapas del proceso de concentracion de litio:

- **Pipeline visual**: Muestra las 4 etapas con concentracion promedio y cantidad de pozas
- **Cards por poza**: ID, estado, concentracion Li, densidad entrada/salida, freeboard, evaporacion, area, profundidad
- **Barras de progreso**: Dias transcurridos vs dias de residencia para cada poza
- **Alertas de freeboard**: Warning visual cuando freeboard < 35 cm
- **Planta NF**: Estado, throughput, recuperacion Li, presiones, ratio Mg:Li con gauge visual

#### Centro de Alertas (`/alertas` — `src/app/alertas/page.tsx`)

Visualizacion de alertas operativas enriquecidas con recomendaciones de IA:

- **Explicacion del flujo**: Sensor → n8n → Groq LLM → Guardar + Notificar
- **Filtros por severidad**: Todas, critica, alta, media, baja (con contadores)
- **Cards de alerta**: Severidad, categoria, titulo, descripcion, origen, timestamp relativo
- **Recomendacion IA**: Box destacado con la recomendacion tecnica generada por Groq/LLaMA 3.1
- **Estados**: Activa, reconocida, resuelta (con badges visuales)

Consume el endpoint `/api/alertas` directamente (no `/api/dashboard`).

#### Reportes de Turno (`/reportes` — `src/app/reportes/page.tsx`)

Reportes ejecutivos generados automaticamente por IA:

- **Explicacion**: Reduccion de 45 min manual a 5 min automatizado
- **Filtro por turno**: Todos, manana, tarde, noche
- **Cards de reporte**: Fecha, turno (con color), supervisor, estado (aprobado/borrador)
- **Metricas**: Produccion, personal, alertas generadas, alertas resueltas
- **Resumen IA**: Texto de 200 palabras generado por Groq
- **Novedades**: Lista de eventos relevantes del turno

Consume el endpoint `/api/reportes` directamente.

### Sistema de diseno

Definido en `src/app/globals.css`:

- **Tipografia**: Montserrat (headings), Open Sans (body), JetBrains Mono (datos numericos)
- **Colores corporativos**: Gradiente Galan (azul #1a2332 → teal #3a8c8c → verde #5ba555)
- **Alertas**: Critica (#ef4444), Alta (#f97316), Media (#eab308), Baja (#3b82f6)
- **Componentes CSS**: `.galan-hero`, `.process-node`, `.detail-panel`, `.alert-badge`, `.ia-recommendation`, `.highlight-box`, `.status-dot`
- **Fondo**: #fafafa (gris claro, no blanco puro — reduce fatiga visual en monitorizacion)

### Navegacion

`src/components/NavBar.tsx` — Componente cliente con `usePathname()` para indicar la ruta activa. Links a: Proceso, Pozas, Alertas, Reportes. Indicador "OPERATIVO" con dot pulsante.

---

## Backend — API Routes

### GET /api/dashboard (`src/app/api/dashboard/route.ts`)

Endpoint principal. Retorna el estado completo de la operacion:

```typescript
{
  timestamp: string,          // ISO timestamp
  source: "supabase" | "generated",  // Origen de datos
  kpis: {                     // 18 indicadores clave
    produccion_hoy_ton,
    produccion_mes_ton,
    target_mes_ton,           // 433 (5200/12)
    inventario_pozas_lce_ton, // ~10,000t
    pozos_activos, pozos_total,
    pozas_operativas, pozas_total,
    planta_nf_estado,
    concentracion_promedio_li,
    dias_sin_lti,
    personal_en_sitio,
    consumo_agua_m3_ton,
    temperatura_actual_c,
    viento_actual_kmh,
    tasa_evaporacion_hoy,
    alertas_activas,
    alertas_criticas
  },
  pozos: [...],               // 7 pozos con caudal, Li, presion
  pozas: [...],               // 6 pozas con densidad, freeboard, evaporacion
  planta_nf: {...},           // Estado planta nanofiltracion
  meteo: {...},               // Temperatura, viento, radiacion, evaporacion
  seguridad: {...},           // LTIFR, TRIFR, dias sin LTI
  alertas: [...],             // Ultimas alertas con recomendacion IA
  reportes: [...]             // Ultimos reportes de turno
}
```

Logica:
1. Si Supabase esta configurado (`isSupabaseConfigured()`), consulta las tablas `estado_actual`, `alertas` y `reportes`
2. Si no, llama a `generateFallbackData()` que genera datos dinamicos usando funciones de `simulate.ts`

### GET/POST /api/alertas (`src/app/api/alertas/route.ts`)

- **GET**: Retorna alertas con filtros opcionales (`?severidad=alta&estado=activa&limit=20`)
- **POST**: Recibe una alerta nueva (usado por n8n para guardar alertas enriquecidas)

### GET/POST /api/reportes (`src/app/api/reportes/route.ts`)

- **GET**: Retorna reportes con filtros opcionales (`?turno=manana&fecha=2026-04-07&limit=10`)
- **POST**: Recibe un reporte nuevo (usado por n8n al generar reportes de turno)

### POST /api/sensor-data (`src/app/api/sensor-data/route.ts`)

Recibe datos del simulador Python. Si Supabase esta configurado, hace upsert a la tabla `estado_actual`.

---

## Simulacion de datos

### Generador fallback (`src/lib/fallback-data.ts`)

Cuando Supabase no esta disponible (modo demo), la funcion `generateFallbackData()` genera datos completos y variados:

- **7 pozos** con caudal, concentracion Li, presion, temperatura variando con funciones gaussianas
- **6 pozas** en 4 etapas con datos de evaporacion correlacionados con meteorologia
- **Meteorologia** con ciclos diurnos realistas (temperatura minima ~06:00, maxima ~14:00; radiacion solar gaussiana centrada en 13:00)
- **3-6 alertas** seleccionadas aleatoriamente de un pool de 8 alertas diferentes, cada una con recomendacion IA detallada
- **5 reportes de turno** de los ultimos 2 dias con resumenes IA unicos

### Funciones de variacion (`src/lib/simulate.ts`)

Funciones matematicas que modelan comportamiento fisico real:

- `variarTemperatura()` — Ciclo sinusoidal diurno + ruido gaussiano. Rango: -20 a 25°C
- `variarRadiacion()` — Gaussiana centrada en 13:00 local. Pico: 8.5 kWh/m²
- `variarEvaporacion(radiacion, viento)` — Correlacionada con radiacion (70%) y viento (2%). Rango: 2-9 mm/dia
- `variarViento()` — Normal(15, 8) km/h con 5% probabilidad de rafaga (50-80 km/h). Direccion NW dominante (35%)
- `variarCaudal(base)` — Gaussian(base, 1.5). Bounds: 15-40 L/s
- `variarConcentracionLi(base)` — Gaussian(base, 8). Bounds: 820-900 mg/L

### Simulador Python (`scripts/simulate_sensors.py`)

Script standalone que genera lecturas cada N segundos:

- Genera datos para 7 pozos (5 activos, 1 mantenimiento, 1 standby)
- Meteorologia con ciclos diurnos
- Detecta anomalias (vibracion >5.5mm/s, caudal <18L/s, viento >50km/h, precipitacion)
- Modos: `--stdout` (imprimir), `--once` (una vez), default (loop cada 30s)
- Destinos: Supabase (upsert) + n8n webhook (si hay anomalias)

---

## Automatizacion — Workflows n8n

### alert-monitor.json (11 nodos)

**Proposito**: Monitorear la operacion cada 5 minutos y generar alertas inteligentes.

```
Schedule (5min) → HTTP GET /api/dashboard → IF alertas > 0?
  → SI: Code (preparar contexto) → HTTP POST Groq → Code (formatear)
        → HTTP POST /api/alertas → IF critica/alta?
            → SI: Gmail (notificar)
            → NO: NoOp
  → NO: NoOp
```

**Nodos detallados:**

1. **Cada 5 minutos** (`scheduleTrigger`) — Trigger temporal
2. **Obtener datos sensores** (`httpRequest`) — GET al dashboard de Vercel
3. **Hay alertas activas?** (`if`) — Evalua `kpis.alertas_activas > 0`
4. **Preparar alerta para LLM** (`code`) — Extrae la primera alerta activa, construye contexto operativo (pozos, meteo, produccion), arma el body para Groq como objeto JavaScript (evita problemas de escape JSON)
5. **Groq LLM - Analizar alerta** (`httpRequest`) — POST a Groq con `JSON.stringify($json.groq_body)`. System prompt contextualizado a operaciones de litio. Temp: 0.3 (determinista)
6. **Formatear alerta enriquecida** (`code`) — Parsea respuesta JSON del LLM con fallback para markdown code blocks. Extrae severidad, recomendacion, requiere_escalamiento
7. **Guardar alerta enriquecida** (`httpRequest`) — POST a `/api/alertas` con `JSON.stringify($json)`
8. **Es critica o alta?** (`if`) — Combinator OR: severidad === "critica" || severidad === "alta"
9. **Notificar por email** (`gmail`) — Envia a marcosalbinoacosta@gmail.com con detalle de la alerta
10. **Sin alertas criticas** (`noOp`) — Rama false del check de severidad
11. **Sin alertas activas** (`noOp`) — Rama false del check inicial

### shift-report.json (9 nodos)

**Proposito**: Generar reportes de turno con resumen ejecutivo de IA.

```
Webhook POST → HTTP GET /api/dashboard (paralelo)
             → HTTP GET /api/alertas   (paralelo)
                      ↓
               Merge → Code (contexto) → HTTP POST Groq
                     → Code (formatear) → HTTP POST /api/reportes
                     → Respond webhook
```

**Nodos detallados:**

1. **Webhook - Cierre de turno** (`webhook`) — POST `/webhook/shift-report`. Recibe `{ turno, supervisor }`
2. **Datos de produccion** (`httpRequest`) — GET /api/dashboard (en paralelo con alertas)
3. **Alertas del turno** (`httpRequest`) — GET /api/alertas (en paralelo con dashboard)
4. **Consolidar datos** (`merge`) — Combina ambas respuestas por posicion
5. **Preparar contexto LLM** (`code`) — Extrae KPIs, pozos, meteo, seguridad, alertas. Arma groq_body como objeto JavaScript
6. **Groq LLM - Generar resumen** (`httpRequest`) — POST a Groq. System prompt para resumen ejecutivo de 200 palabras. Temp: 0.4
7. **Formatear reporte** (`code`) — Estructura el reporte con turno, horario, supervisor, resumen_ia, metricas, estado "borrador"
8. **Guardar reporte** (`httpRequest`) — POST a `/api/reportes`
9. **Responder webhook** (`respondToWebhook`) — Retorna JSON de confirmacion al caller

---

## Integracion de IA — Groq LLM

### Por que Groq y no OpenAI/Anthropic

1. **Latencia**: Groq responde en ~100-200ms vs 1-3s de OpenAI. Critico para workflows que corren cada 5 minutos
2. **Costo**: Tier gratuito de 30 requests/min, suficiente para la demo
3. **API compatible**: Misma estructura que OpenAI (`/v1/chat/completions`), facil de migrar
4. **Modelo open-source**: LLaMA 3.1 de Meta, sin vendor lock-in

### System prompts

**Para alertas** (temperature 0.3 — mas determinista):
```
Eres un analista de operaciones de una planta de extraccion de litio en el
Salar del Hombre Muerto, Catamarca, Argentina, a 4000 msnm. La operacion
incluye 7 pozos de extraccion de salmuera (820-900 mg/L Li), 6 pozas de
evaporacion en 4 etapas (halita, silvinita, carnalita, concentracion final),
y una planta de nanofiltracion.

Tu tarea:
1) Clasificar la severidad (baja/media/alta/critica)
2) Dar una recomendacion tecnica especifica en 2-3 oraciones
3) Indicar si requiere escalamiento al supervisor

Responde en formato JSON con las claves: severidad, recomendacion,
requiere_escalamiento (boolean).
```

**Para reportes** (temperature 0.4 — algo mas creativo):
```
Genera un resumen ejecutivo de turno de 200 palabras en espanol para una
operacion de litio en el Salar del Hombre Muerto, Catamarca, Argentina,
a 4000 msnm. Incluye: produccion, estado de pozos y pozas, alertas
relevantes, condiciones meteorologicas, personal, y recomendaciones para
el proximo turno. Se conciso, profesional y tecnico.
```

### Manejo de respuestas

El Code node que parsea la respuesta del LLM tiene tres niveles de fallback:

1. Intenta `JSON.parse(content)` directo
2. Si falla, busca JSON dentro de bloques markdown (` ```json ... ``` `)
3. Si falla, usa el texto completo como recomendacion con severidad "media" por defecto

---

## Base de datos — Supabase/PostgreSQL

### Schema

Dos modos de operacion:

**Modo Supabase** (`scripts/supabase-setup.sql`):
- `estado_actual` — Tabla de snapshots con JSONB flexible. Cada registro tiene `id`, `tipo` (pozo/meteo/seguridad/planta_nf), y `data` (JSONB)
- `alertas` — Registro de alertas con severidad, recomendacion IA, estado
- `reportes` — Reportes de turno con resumen IA
- `sensor_readings` — Time-series de lecturas raw (append-only)
- RLS habilitado con politicas publicas (modo demo)

**Modo PostgreSQL local** (`scripts/seed-db.sql`):
- `pozos` — 7 pozos con schema fijo (caudal, concentracion, presion)
- `pozas` — 6 pozas con etapa, densidad, freeboard
- `alertas`, `reportes`, `meteo`, `ambiental` — Tablas normalizadas
- Indices en alertas(estado, timestamp) y meteo(timestamp)

### Fallback sin base de datos

Si `NEXT_PUBLIC_SUPABASE_URL` no esta configurado, `isSupabaseConfigured()` retorna false y toda la app usa datos generados en memoria. Esto permite que la demo en Vercel funcione sin ninguna dependencia externa.

---

## Infraestructura y despliegue

### Vercel (produccion)

- Deploy automatico desde GitHub (push a `main` → build → deploy)
- Next.js 15 con App Router
- API routes desplegadas como funciones serverless (Edge Runtime)
- SSL automatico, CDN global
- URL: `galan-ops-monitor.vercel.app`

### Docker Compose (desarrollo local)

```yaml
services:
  app:        # Next.js en puerto 3000
  postgres:   # PostgreSQL 16 en puerto 5432
  n8n:        # n8n en puerto 5678
```

PostgreSQL se inicializa con `scripts/seed-db.sql` via `docker-entrypoint-initdb.d`.

### n8n Cloud (automatizacion)

- Instancia gestionada en `loomia.app.n8n.cloud`
- Workflows importados como JSON
- Se comunica con Vercel via HTTP y con Groq via API
- Gmail OAuth2 para notificaciones por email

---

## Seguridad

1. **Credenciales**: Todas las claves (Supabase, Groq) estan en variables de entorno, no en codigo fuente
2. **Supabase client**: `isSupabaseConfigured()` verifica que las variables existan antes de intentar conectar
3. **API publica**: Los endpoints GET son publicos (necesario para n8n Cloud). En produccion se agregaria autenticacion
4. **Git**: `.gitignore` excluye `.env`, `.env.local`, `node_modules`, `.next`
5. **RLS**: Supabase tiene Row Level Security habilitado (politicas demo permisivas, ajustables para produccion)
6. **Sanitizacion**: `dompurify` disponible como dependencia para sanitizar HTML si se implementa input de usuario

---

## Datos operativos reales utilizados

Toda la informacion operativa esta basada en datos publicos de Galan Lithium:

| Parametro | Valor | Fuente |
|-----------|-------|--------|
| Concentracion Li en salmuera | ~859 mg/L | Galan Resource Report |
| Pozos de produccion | 7 | HMW Phase 1 DFS (Definitive Feasibility Study) |
| Inventario en pozas | ~10,000t LCE | ASX Announcements 2025/2026 |
| Producto final | LiCl concentrado al 6% | Acuerdo Galan-Authium |
| Capacidad Phase 1 | 5,200 tpa LCE | HMW Phase 1 |
| Altitud del sitio | ~4,000 msnm | Ubicacion geografica |
| Presion atmosferica | ~620 mbar | Derivada de altitud |
| Ratio Mg:Li objetivo | <2.8 | Candelas/HMW Resource Reports |
| Etapas de evaporacion | Halita → Silvinita → Carnalita → Conc. Final | Proceso estandar de salmueras |
| Tecnologia NF | Authium (nanofiltracion) | Acuerdo Authium-Galan |
| Offtake | Authium 45kt + Glencore US$100M | ASX Announcements |

Las simulaciones modelan correctamente:
- Ciclos diurnos de temperatura (-20 a 25°C en Puna)
- Radiacion solar extrema (hasta 8.5 kWh/m²/dia)
- Vientos predominantes del NW
- Tasa de evaporacion correlacionada con radiacion y viento
- Presion barometrica reducida por altitud

---

## Decisiones de diseno

### Por que un solo proyecto Next.js y no microservicios

Para una POC, la simplicidad es clave. Next.js permite tener frontend + API + SSR en un solo repositorio desplegable con un click. En produccion, las API routes podrian migrarse a un backend separado si la escala lo requiere.

### Por que datos simulados como default y no Supabase obligatorio

La demo debe funcionar sin configuracion. Un reclutador que abra la URL debe ver datos inmediatamente, sin necesidad de crear cuentas o configurar bases de datos. Supabase es una mejora opcional para persistencia real.

### Por que Tailwind inline y no componentes UI (shadcn, MUI)

Control total del diseno. El dashboard tiene un look industrial/corporativo especifico que es mas facil de lograr con utilidades directas que configurando un design system generico. Ademas, menos dependencias = build mas rapido.

### Por que el LLM no procesa TODAS las alertas en cada ciclo

El workflow procesa la primera alerta activa por ciclo (cada 5 minutos). Esto es intencional: 1) No saturar el tier gratuito de Groq, 2) En produccion se procesaria en lote o con colas, 3) Para la demo es suficiente para mostrar el flujo completo.

### Por que Gmail y no un servicio de email transaccional

Para la demo, Gmail via OAuth2 en n8n Cloud es la opcion mas simple. En produccion se usaria SendGrid, SES, o un relay SMTP corporativo.

---

## Flujo de datos end-to-end

### Escenario: Alerta de vibracion elevada en bomba

1. `simulate_sensors.py` genera lectura de P-03 con vibracion 6.2 mm/s (>5.5 umbral)
2. Python envia POST a `/api/sensor-data` con los datos
3. API actualiza Supabase (o ignora si no esta configurado)
4. Dashboard en Vercel refresca cada 15s, muestra la nueva lectura
5. n8n `alert-monitor` corre su ciclo de 5 minutos
6. GET `/api/dashboard` → ve `alertas_activas > 0`
7. Code node extrae la alerta y arma contexto operativo
8. POST a Groq: "Analiza esta alerta: vibracion 6.2mm/s en bomba P-03..."
9. Groq responde: `{ "severidad": "media", "recomendacion": "Programar inspeccion de rodamientos en 48h. Si supera 7.0 mm/s, detener bomba preventivamente.", "requiere_escalamiento": false }`
10. Code node formatea la alerta enriquecida
11. POST `/api/alertas` guarda la alerta
12. IF `severidad === alta || critica` → NO (es media) → fin del ciclo
13. Dashboard muestra la alerta con recomendacion IA en la seccion de alertas

### Escenario: Cierre de turno manana

1. Supervisor (o cron) hace POST al webhook n8n: `{ "turno": "manana", "supervisor": "Ing. Mendez" }`
2. n8n en paralelo: GET `/api/dashboard` + GET `/api/alertas`
3. Merge combina ambas respuestas
4. Code node arma contexto completo: produccion 4.1t, 5 pozos activos, temp 18°C, 3 alertas, 234 personas
5. POST a Groq: "Genera resumen ejecutivo del turno..."
6. Groq genera: "Turno mañana estable. Produccion de 4.1 toneladas de LiCl al 6%. 5 pozos operativos..."
7. Code node formatea el reporte como borrador
8. POST `/api/reportes` guarda el reporte
9. Webhook responde: `{ "success": true, "turno": "manana", "estado": "borrador" }`
10. Dashboard en `/reportes` muestra el nuevo reporte con badge "Borrador"

---

*Documentacion generada el 7 de abril de 2026.*
*Desarrollado por Marcos Acosta (LOOM.IA) con Claude Code.*
