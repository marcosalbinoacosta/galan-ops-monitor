-- ============================================================
-- Galan Ops Monitor - Setup completo para Supabase
-- Ejecutar en SQL Editor de Supabase
-- ============================================================

-- Habilitar RLS pero permitir acceso publico (demo)
-- En produccion esto tendria auth

-- Tabla de lecturas de sensores (lo que manda el script Python)
CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    sitio VARCHAR(20) DEFAULT 'HMW-Phase1',
    data JSONB NOT NULL
);

-- Tabla de alertas (las genera n8n con recomendacion de IA)
CREATE TABLE IF NOT EXISTS alertas (
    id TEXT PRIMARY KEY DEFAULT 'ALT-' || LPAD(nextval('alertas_seq')::text, 4, '0'),
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

-- Secuencia para IDs de alertas
CREATE SEQUENCE IF NOT EXISTS alertas_seq START 1;

-- Recrear tabla alertas con secuencia
DROP TABLE IF EXISTS alertas;
CREATE TABLE alertas (
    id TEXT PRIMARY KEY,
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

-- Tabla de reportes de turno (genera n8n con IA)
CREATE TABLE IF NOT EXISTS reportes (
    id TEXT PRIMARY KEY,
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

-- Tabla de estado actual (snapshot que se actualiza)
CREATE TABLE IF NOT EXISTS estado_actual (
    id VARCHAR(20) PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL, -- 'pozo', 'poza', 'planta_nf', 'meteo', 'seguridad'
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_alertas_estado ON alertas(estado);
CREATE INDEX IF NOT EXISTS idx_alertas_timestamp ON alertas(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_estado_tipo ON estado_actual(tipo);

-- RLS: permitir lectura publica (demo)
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estado_actual ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read sensor_readings" ON sensor_readings FOR SELECT USING (true);
CREATE POLICY "Allow public insert sensor_readings" ON sensor_readings FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read alertas" ON alertas FOR SELECT USING (true);
CREATE POLICY "Allow public insert alertas" ON alertas FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update alertas" ON alertas FOR UPDATE USING (true);

CREATE POLICY "Allow public read reportes" ON reportes FOR SELECT USING (true);
CREATE POLICY "Allow public insert reportes" ON reportes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update reportes" ON reportes FOR UPDATE USING (true);

CREATE POLICY "Allow public read estado_actual" ON estado_actual FOR SELECT USING (true);
CREATE POLICY "Allow public insert estado_actual" ON estado_actual FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update estado_actual" ON estado_actual FOR UPDATE USING (true);
CREATE POLICY "Allow public upsert estado_actual" ON estado_actual FOR ALL USING (true);

-- ============================================================
-- SEED DATA: Estado inicial de la planta HMW
-- ============================================================

-- Pozos
INSERT INTO estado_actual (id, tipo, data) VALUES
('P-01', 'pozo', '{"nombre":"Pozo HMW-01","estado":"activo","caudal_lps":28.4,"concentracion_li_mgl":862,"presion_cabezal_bar":1.8,"temperatura_salmuera_c":19.2,"drawdown_m":2.1,"horas_operacion":12847}'),
('P-02', 'pozo', '{"nombre":"Pozo HMW-02","estado":"activo","caudal_lps":32.1,"concentracion_li_mgl":878,"presion_cabezal_bar":2.1,"temperatura_salmuera_c":18.7,"drawdown_m":1.8,"horas_operacion":11203}'),
('P-03', 'pozo', '{"nombre":"Pozo HMW-03","estado":"activo","caudal_lps":25.6,"concentracion_li_mgl":845,"presion_cabezal_bar":1.5,"temperatura_salmuera_c":20.1,"drawdown_m":2.8,"horas_operacion":13502}'),
('P-04', 'pozo', '{"nombre":"Pozo HMW-04","estado":"mantenimiento","caudal_lps":0,"concentracion_li_mgl":855,"presion_cabezal_bar":0,"temperatura_salmuera_c":17.3,"drawdown_m":0.5,"horas_operacion":9876}'),
('P-05', 'pozo', '{"nombre":"Pozo HMW-05","estado":"activo","caudal_lps":35.2,"concentracion_li_mgl":891,"presion_cabezal_bar":2.4,"temperatura_salmuera_c":18.9,"drawdown_m":1.5,"horas_operacion":10234}'),
('P-06', 'pozo', '{"nombre":"Pozo HMW-06","estado":"activo","caudal_lps":22.8,"concentracion_li_mgl":837,"presion_cabezal_bar":1.6,"temperatura_salmuera_c":19.8,"drawdown_m":3.2,"horas_operacion":8901}'),
('P-07', 'pozo', '{"nombre":"Pozo HMW-07","estado":"standby","caudal_lps":0,"concentracion_li_mgl":869,"presion_cabezal_bar":0,"temperatura_salmuera_c":18.1,"drawdown_m":0.8,"horas_operacion":6543}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

-- Meteo
INSERT INTO estado_actual (id, tipo, data) VALUES
('meteo-hmw', 'meteo', '{"temperatura_c":12.4,"humedad_relativa_pct":18,"velocidad_viento_kmh":14.2,"direccion_viento":"NW","radiacion_solar_kwh_m2":7.2,"indice_uv":13,"precipitacion_mm":0,"presion_barometrica_mbar":621,"tasa_evaporacion_mm_dia":5.6}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

-- Seguridad
INSERT INTO estado_actual (id, tipo, data) VALUES
('seguridad-hmw', 'seguridad', '{"ltifr":0.0,"trifr":1.2,"dias_sin_lti":187,"near_misses_mes":8,"observaciones_seguridad_mes":142,"personal_en_sitio":234,"incidentes_altitud_mes":1,"permisos_trabajo_activos":12,"simulacros_completados_mes":3}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

-- Planta NF
INSERT INTO estado_actual (id, tipo, data) VALUES
('planta-nf', 'planta_nf', '{"estado":"operativa","throughput_m3h":85,"recuperacion_li_pct":92.4,"presion_entrada_bar":12.5,"presion_salida_bar":3.2,"concentracion_entrada_mgl":5400,"concentracion_salida_mgl":58000,"ratio_mg_li":1.8,"horas_operacion":1247}')
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();

-- Alertas iniciales
INSERT INTO alertas (id, categoria, severidad, titulo, descripcion, recomendacion_ia, origen, estado) VALUES
('ALT-001', 'equipamiento', 'media', 'Vibracion elevada en bomba Pozo HMW-03', 'Sensor de vibracion registra 6.2 mm/s RMS, superando umbral de alerta (5.5 mm/s). Pozo continua operativo.', 'Programar inspeccion de rodamientos en proxima ventana de mantenimiento (48h). Monitorear tendencia: si supera 7.0 mm/s, detener bomba para evitar dano al eje.', 'Sensor vibracion P-03', 'activa'),
('ALT-002', 'meteorologia', 'baja', 'Rafagas de viento pronosticadas >50 km/h', 'Pronostico meteorologico indica rafagas de hasta 55 km/h para las proximas 6 horas.', 'Incrementar frecuencia de monitoreo de freeboard en pozas. Umbral de pausa operativa: 60 km/h.', 'Estacion meteorologica HMW', 'reconocida'),
('ALT-003', 'produccion', 'alta', 'Ratio Mg:Li elevado en salida de carnalita', 'Ratio Mg:Li en poza PE-C1 midiendo 2.6, acercandose al limite operativo de 2.8.', 'Reducir flujo de entrada a PE-C1 un 15% para permitir mayor tiempo de residencia. Tomar muestra manual para confirmar lectura del sensor. Si ratio supera 2.8, desviar flujo a poza de emergencia.', 'Analizador en linea PE-C1', 'activa')
ON CONFLICT (id) DO NOTHING;

-- Reporte de turno ejemplo
INSERT INTO reportes (id, turno, fecha, supervisor, resumen_ia, produccion_ton, alertas_generadas, alertas_resueltas, personal_presente, novedades, estado) VALUES
('RT-20260402-M', 'manana', '2026-04-02', 'Ing. Carolina Mendez', 'Turno manana con operacion estable. Produccion de 3.8 toneladas de concentrado LiCl al 5.9%, ligeramente por debajo del target de 4.2t por reduccion de flujo en PE-C1 debido a ratio Mg:Li elevado. Planta de nanofiltracion opero al 92% de capacidad. Se registro alerta de vibracion en bomba P-03 que requiere inspeccion programada. 234 personas en sitio, 187 dias sin LTI.', 3.8, 3, 1, 234, '["Reduccion de flujo 15% en PE-C1 por ratio Mg:Li","Inspeccion programada bomba P-03 para manana","Simulacro evacuacion planta NF completado"]', 'aprobado')
ON CONFLICT (id) DO NOTHING;
