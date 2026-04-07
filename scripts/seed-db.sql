-- ============================================================
-- Galan Ops Monitor - Schema y datos iniciales
-- Hombre Muerto West Phase 1 - Galan Lithium (ASX: GLN)
-- ============================================================

-- Pozos de extraccion
CREATE TABLE IF NOT EXISTS pozos (
    id VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    estado VARCHAR(20) DEFAULT 'standby',
    caudal_lps DECIMAL(6,1),
    concentracion_li_mgl INTEGER,
    presion_cabezal_bar DECIMAL(4,1),
    temperatura_salmuera_c DECIMAL(4,1),
    drawdown_m DECIMAL(4,1),
    horas_operacion INTEGER DEFAULT 0,
    ultima_lectura TIMESTAMPTZ DEFAULT NOW()
);

-- Pozas de evaporacion
CREATE TABLE IF NOT EXISTS pozas (
    id VARCHAR(10) PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    etapa VARCHAR(30) NOT NULL,
    estado VARCHAR(20) DEFAULT 'operativa',
    area_m2 INTEGER,
    profundidad_cm DECIMAL(5,1),
    freeboard_cm DECIMAL(5,1),
    densidad_entrada DECIMAL(4,2),
    densidad_salida DECIMAL(4,2),
    concentracion_li_mgl INTEGER,
    tasa_evaporacion_mm_dia DECIMAL(4,1),
    dias_residencia INTEGER,
    dias_transcurridos INTEGER DEFAULT 0,
    ultima_lectura TIMESTAMPTZ DEFAULT NOW()
);

-- Alertas
CREATE TABLE IF NOT EXISTS alertas (
    id VARCHAR(20) PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    categoria VARCHAR(30) NOT NULL,
    severidad VARCHAR(10) NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    recomendacion_ia TEXT,
    origen VARCHAR(100),
    estado VARCHAR(20) DEFAULT 'activa',
    resuelta_por VARCHAR(100),
    resuelta_en TIMESTAMPTZ
);

-- Reportes de turno
CREATE TABLE IF NOT EXISTS reportes (
    id VARCHAR(30) PRIMARY KEY,
    turno VARCHAR(10) NOT NULL,
    fecha DATE NOT NULL,
    supervisor VARCHAR(100),
    resumen_ia TEXT,
    produccion_ton DECIMAL(6,1),
    alertas_generadas INTEGER DEFAULT 0,
    alertas_resueltas INTEGER DEFAULT 0,
    personal_presente INTEGER,
    novedades JSONB DEFAULT '[]',
    estado VARCHAR(20) DEFAULT 'borrador',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lecturas meteorologicas
CREATE TABLE IF NOT EXISTS meteo (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    temperatura_c DECIMAL(5,1),
    humedad_relativa_pct INTEGER,
    velocidad_viento_kmh DECIMAL(5,1),
    direccion_viento VARCHAR(5),
    radiacion_solar_kwh_m2 DECIMAL(4,1),
    indice_uv INTEGER,
    precipitacion_mm DECIMAL(5,1),
    presion_barometrica_mbar INTEGER,
    tasa_evaporacion_mm_dia DECIMAL(4,1)
);

-- Monitoreo ambiental
CREATE TABLE IF NOT EXISTS ambiental (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    nivel_freatico_m DECIMAL(4,2),
    pm10_ug_m3 INTEGER,
    pm25_ug_m3 INTEGER,
    conductividad_agua_us_cm INTEGER,
    li_en_arroyos_mgl DECIMAL(4,1),
    conteo_flamencos INTEGER,
    conteo_vicunas INTEGER
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_alertas_estado ON alertas(estado);
CREATE INDEX IF NOT EXISTS idx_alertas_timestamp ON alertas(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_meteo_timestamp ON meteo(timestamp DESC);

-- Insertar datos iniciales de pozos (7 pozos reales HMW)
INSERT INTO pozos (id, nombre, estado, caudal_lps, concentracion_li_mgl, presion_cabezal_bar, temperatura_salmuera_c, drawdown_m, horas_operacion) VALUES
('P-01', 'Pozo HMW-01', 'activo', 28.4, 862, 1.8, 19.2, 2.1, 12847),
('P-02', 'Pozo HMW-02', 'activo', 32.1, 878, 2.1, 18.7, 1.8, 11203),
('P-03', 'Pozo HMW-03', 'activo', 25.6, 845, 1.5, 20.1, 2.8, 13502),
('P-04', 'Pozo HMW-04', 'mantenimiento', 0, 855, 0, 17.3, 0.5, 9876),
('P-05', 'Pozo HMW-05', 'activo', 35.2, 891, 2.4, 18.9, 1.5, 10234),
('P-06', 'Pozo HMW-06', 'activo', 22.8, 837, 1.6, 19.8, 3.2, 8901),
('P-07', 'Pozo HMW-07', 'standby', 0, 869, 0, 18.1, 0.8, 6543)
ON CONFLICT (id) DO NOTHING;

-- Insertar datos iniciales de pozas
INSERT INTO pozas (id, nombre, etapa, estado, area_m2, profundidad_cm, freeboard_cm, densidad_entrada, densidad_salida, concentracion_li_mgl, tasa_evaporacion_mm_dia, dias_residencia, dias_transcurridos) VALUES
('PE-H1', 'Halita Norte', 'halita', 'operativa', 120000, 32, 48, 1.20, 1.23, 1050, 5.8, 90, 67),
('PE-H2', 'Halita Sur', 'halita', 'operativa', 95000, 28, 52, 1.19, 1.22, 980, 6.1, 90, 45),
('PE-S1', 'Silvinita 1', 'silvinita', 'operativa', 65000, 25, 45, 1.23, 1.26, 1850, 4.9, 60, 38),
('PE-S2', 'Silvinita 2', 'silvinita', 'carga', 58000, 12, 68, 1.22, 1.25, 1620, 5.2, 60, 15),
('PE-C1', 'Carnalita 1', 'carnalita', 'operativa', 32000, 22, 38, 1.26, 1.29, 3200, 4.1, 45, 32),
('PE-CF1', 'Concentracion Final', 'concentracion_final', 'operativa', 18000, 18, 42, 1.29, 1.31, 5400, 3.5, 30, 22)
ON CONFLICT (id) DO NOTHING;
