# Galan Ops Monitor

**Dashboard de monitoreo operativo para la planta HMW Phase 1 de Galan Lithium**

Prueba de concepto funcional que demuestra como un sistema de monitoreo operativo inteligente puede integrarse en las operaciones de extraccion de litio en el Salar del Hombre Muerto, Catamarca, Argentina.

> Este proyecto fue desarrollado como anexo tecnico a mi postulacion al puesto de **Analista Sr de Desarrollo, Automatizacion e Inteligencia Artificial** en Galan Lithium (ASX: GLN).

**Demo en vivo:** [https://galan-ops-monitor.vercel.app](https://galan-ops-monitor.vercel.app)

---

## Por que este proyecto

La vacante pide experiencia en desarrollo full-stack (Node.js, React, TypeScript), automatizacion con n8n, integracion de LLMs, y herramientas de desarrollo con IA. En lugar de solo describirlo en un CV, preferi **demostrarlo con un proyecto funcional**.
---

## Que hace

### Dashboard Principal (`/`)
Visualizacion del flujo completo del proceso de extraccion de litio:

- **Flujo de proceso interactivo**: 7 etapas desde la extraccion de salmuera (859 mg/L Li) hasta el producto final (LiCl al 6%, 58,000 mg/L)
- **8 KPIs operativos** en tiempo real: produccion, inventario, consumo de agua, evaporacion, estado planta NF, alertas
- **Barra de concentracion logaritmica** mostrando la progresion del litio a lo largo del proceso
- **Panel de alertas con IA** — recomendaciones tecnicas generadas por LLM
- **Datos meteorologicos** (temperatura, viento, radiacion a 4,000 msnm)
- **Indicadores de seguridad** (dias sin LTI, personal en sitio, LTIFR/TRIFR)
- Auto-refresco cada 15 segundos

### Pozas de Evaporacion (`/pozas`)
Monitoreo detallado de las 6 pozas en 4 etapas del proceso de concentracion:

- **Pipeline visual**: Halita -> Silvinita -> Carnalita -> Concentracion Final
- **Por cada poza**: concentracion Li, densidad, freeboard, tasa de evaporacion, dias de residencia
- **Barras de progreso** de dias transcurridos vs dias de residencia
- **Alertas de freeboard** cuando cae por debajo de 35 cm
- **Planta de Nanofiltracion**: throughput, recuperacion Li, ratio Mg:Li con gauge visual

### Centro de Alertas (`/alertas`)
Alertas operativas enriquecidas con recomendaciones de IA:

- Flujo automatizado: **Sensor** -> **n8n evalua umbral** -> **Groq LLM clasifica severidad** -> **Guarda + Notifica**
- Filtros por severidad (critica/alta/media/baja)
- Cada alerta incluye recomendacion tecnica contextualizada a operaciones de litio
- Modelo: Groq (LLaMA 3.1 8B) con temperatura 0.3 para respuestas deterministas

### Reportes de Turno (`/reportes`)
Resumenes ejecutivos generados automaticamente al cierre de cada turno:

- Workflow n8n recopila datos de produccion, alertas, personal y meteorologia
- Groq genera resumen de 200 palabras para el supervisor
- Reduccion de tiempo de cierre: de **45 minutos manual** a **5 minutos automatizado**
- Filtro por turno (manana/tarde/noche)

---

## Stack Tecnologico

| Capa | Tecnologia | Relevancia para el puesto |
|------|-----------|--------------------------|
| **Frontend** | Next.js 15, React 19, TypeScript | Desarrollo full-stack con frameworks modernos |
| **UI** | Tailwind CSS 4, Recharts, Lucide | Interfaces profesionales y responsivas |
| **Automatizacion** | n8n (workflows exportados) | Automatizacion de procesos con n8n |
| **IA/LLM** | Groq (LLaMA 3.1 8B) via n8n | Integracion de modelos LLM en workflows |
| **Base de datos** | PostgreSQL 16 / Supabase | Gestion de datos operativos |
| **Simulacion** | Python (generador de sensores) | Scripts de automatizacion |
| **Infraestructura** | Docker Compose, Vercel | Despliegue en la nube |
| **Desarrollo** | Claude Code, Git | Herramientas IA de desarrollo |

---

## Workflows n8n

Los workflows estan en `n8n/workflows/` listos para importar en cualquier instancia de n8n:

### 1. `alert-monitor.json` — Monitor de Alertas con IA
11 nodos: Schedule (5min) -> HTTP (datos sensores) -> IF (alertas activas?) -> Code (preparar contexto) -> Groq LLM (clasificar + recomendar) -> Code (formatear) -> HTTP (guardar) -> IF (critica?) -> Email (notificar)

### 2. `shift-report.json` — Generador de Reportes de Turno
9 nodos: Webhook (cierre turno) -> HTTP x2 (produccion + alertas en paralelo) -> Merge -> Code (contexto) -> Groq LLM (resumen ejecutivo) -> Code (formatear) -> HTTP (guardar) -> Respond

Ambos utilizan variables de entorno (`GROQ_API_KEY`, `APP_URL`) y son funcionales en n8n Cloud o self-hosted.

---

## Datos Operativos

Los datos simulados estan basados en informacion publica de Galan Lithium:

| Parametro | Valor | Fuente |
|-----------|-------|--------|
| Concentracion Li en salmuera | ~859 mg/L | Galan Resource Report |
| Pozos de produccion | 7 | HMW Phase 1 DFS |
| Inventario en pozas | ~10,000t LCE | ASX Announcements |
| Producto | LiCl concentrado al 6% | Acuerdo Authium |
| Capacidad Phase 1 | 5,200 tpa LCE | HMW Phase 1 |
| Altitud del sitio | ~4,000 msnm | Ubicacion geografica |
| Ratio Mg:Li objetivo | <2.8 | Candelas/HMW Reports |

El simulador Python (`scripts/simulate_sensors.py`) genera datos con ciclos diurnos realistas (temperatura, radiacion, evaporacion) y anomalias aleatorias.

---

## Arquitectura

```
                    Sensores HMW (simulados)
                             |
                    Python simulate_sensors.py
                             |
                    +--------v--------+
                    |    Supabase     |
                    |   PostgreSQL    |
                    +--------+--------+
                             |
             +---------------+---------------+
             |                               |
    +--------v--------+            +--------v--------+
    |   Next.js App   |            |       n8n       |
    |  Dashboard      |            |  alert-monitor  |
    |  /pozas         |            |  shift-report   |
    |  /alertas       |            |  + Groq LLM     |
    |  /reportes      |            +--------+--------+
    |  API routes     |                     |
    +--------+--------+             Alertas enriquecidas
             |                      Reportes con IA
        Vercel (deploy)
```

---

## Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
# Abrir http://localhost:3000
```

### Con Docker (stack completo: app + PostgreSQL + n8n)

```bash
docker compose up -d

# App:        http://localhost:3000
# n8n:        http://localhost:5678
# PostgreSQL: localhost:5432
```

### Simulador de sensores

```bash
cd scripts
pip install requests
python simulate_sensors.py --stdout          # Imprimir a consola
python simulate_sensors.py --interval 30     # Enviar cada 30s
```

---

## Estructura del Proyecto

```
galan-ops-monitor/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout con navegacion
│   │   ├── page.tsx                # Dashboard principal
│   │   ├── globals.css             # Tema corporativo Galan
│   │   ├── pozas/page.tsx          # Pozas de evaporacion + Planta NF
│   │   ├── alertas/page.tsx        # Centro de alertas con IA
│   │   ├── reportes/page.tsx       # Reportes de turno con IA
│   │   └── api/
│   │       ├── dashboard/route.ts  # GET datos completos
│   │       ├── alertas/route.ts    # GET/POST alertas
│   │       ├── reportes/route.ts   # GET/POST reportes
│   │       └── sensor-data/route.ts # POST datos de sensores
│   ├── components/
│   │   └── NavBar.tsx              # Navegacion con ruta activa
│   └── lib/
│       ├── types.ts                # Interfaces TypeScript
│       ├── mock-data.ts            # Datos seed realistas
│       ├── simulate.ts             # Funciones de variacion temporal
│       ├── fallback-data.ts        # Generador de datos dinamicos
│       └── supabase.ts             # Cliente REST Supabase
├── n8n/workflows/
│   ├── alert-monitor.json          # Workflow alertas con LLM (11 nodos)
│   └── shift-report.json           # Workflow reportes con LLM (9 nodos)
├── scripts/
│   ├── simulate_sensors.py         # Generador de datos Python
│   ├── seed-db.sql                 # Schema PostgreSQL
│   └── supabase-setup.sql          # Setup Supabase + RLS
├── docker-compose.yml
├── Dockerfile
└── package.json
```

---

## Sobre el autor

**Marcos Acosta** — Founder de [LOOM.IA](https://www.loomia.ar)

Consultora de ciberseguridad e IA aplicada con base en Cordoba y Catamarca. Desarrollo soluciones tecnologicas integrales para empresas: CRMs custom, agentes de IA, workflows n8n, chatbots con LLMs, y auditorias de seguridad.

- n8n + LLMs en produccion para multiples clientes
- ISO 27001, pentesting, hardening — experiencia corporativa y freelance
- Presencia en Catamarca (SFVC)
- Stack: Node.js, Python, React, TypeScript, Docker, Linux

Construido con Next.js, n8n, Groq y [Claude Code](https://claude.ai/claude-code).
