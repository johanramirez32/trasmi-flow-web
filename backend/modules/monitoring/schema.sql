CREATE TABLE IF NOT EXISTS monitoring_stations (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monitoring_zones (
  id BIGSERIAL PRIMARY KEY,
  station_id BIGINT NOT NULL REFERENCES monitoring_stations(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  area_m2 NUMERIC(10,2) CHECK (area_m2 IS NULL OR area_m2 > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(station_id, code)
);

CREATE TABLE IF NOT EXISTS monitoring_cameras (
  id BIGSERIAL PRIMARY KEY,
  zone_id BIGINT NOT NULL REFERENCES monitoring_zones(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  source TEXT NOT NULL,
  polygon JSONB NOT NULL DEFAULT '[]'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monitoring_metrics (
  id BIGSERIAL PRIMARY KEY,
  camera_id BIGINT NOT NULL REFERENCES monitoring_cameras(id) ON DELETE CASCADE,
  people_count INTEGER NOT NULL CHECK (people_count >= 0),
  occupancy_percentage NUMERIC(7,2) NOT NULL,
  density_people_m2 NUMERIC(7,2),
  crowd_level VARCHAR(30) NOT NULL,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_camera_time
  ON monitoring_metrics(camera_id, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitoring_metrics_time
  ON monitoring_metrics(captured_at DESC);

CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id BIGSERIAL PRIMARY KEY,
  zone_id BIGINT NOT NULL REFERENCES monitoring_zones(id) ON DELETE CASCADE,
  camera_id BIGINT REFERENCES monitoring_cameras(id) ON DELETE SET NULL,
  level VARCHAR(30) NOT NULL,
  message TEXT NOT NULL,
  occupancy_percentage NUMERIC(7,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'acknowledged', 'resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by VARCHAR(150)
);

CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_status_time
  ON monitoring_alerts(status, created_at DESC);
