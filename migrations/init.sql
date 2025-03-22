-- NewGuardian İlk Kurulum SQL Dosyası - CamelCase Version

-- Kullanıcılar Tablosu
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "fullName" TEXT,
  "email" TEXT,
  "role" TEXT NOT NULL DEFAULT 'viewer',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "lastLoginAt" TIMESTAMP WITH TIME ZONE,
  "preferences" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "createdBy" INTEGER
);

-- Cihazlar Tablosu
CREATE TABLE IF NOT EXISTS "devices" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "ipAddress" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "location" TEXT,
  "maintenanceMode" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Monitörler Tablosu
CREATE TABLE IF NOT EXISTS "monitors" (
  "id" SERIAL PRIMARY KEY,
  "deviceId" INTEGER NOT NULL REFERENCES "devices"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "config" JSONB NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "interval" INTEGER NOT NULL DEFAULT 60,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Monitör Sonuçları Tablosu
CREATE TABLE IF NOT EXISTS "monitorResults" (
  "id" SERIAL PRIMARY KEY,
  "monitorId" INTEGER NOT NULL REFERENCES "monitors"("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL,
  "responseTime" INTEGER,
  "details" JSONB,
  "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Alarmlar Tablosu
CREATE TABLE IF NOT EXISTS "alerts" (
  "id" SERIAL PRIMARY KEY,
  "deviceId" INTEGER NOT NULL REFERENCES "devices"("id") ON DELETE CASCADE,
  "monitorId" INTEGER NOT NULL REFERENCES "monitors"("id") ON DELETE CASCADE,
  "message" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "acknowledgedAt" TIMESTAMP WITH TIME ZONE,
  "resolvedAt" TIMESTAMP WITH TIME ZONE
);

-- Varsayılan Admin Kullanıcı Oluştur
INSERT INTO "users" ("username", "password", "fullName", "email", "role")
VALUES ('admin', '$2b$10$6fHokczxfRhd4mGFnNBDYebzl8BhbxO5nNZ/J8x4ZOmI1JovA54ti', 'System Admin', 'admin@example.com', 'admin')
ON CONFLICT (username) DO NOTHING;

-- İndeksler
CREATE INDEX IF NOT EXISTS "devices_type_idx" ON "devices"("type");
CREATE INDEX IF NOT EXISTS "monitors_deviceId_idx" ON "monitors"("deviceId");
CREATE INDEX IF NOT EXISTS "monitorResults_monitorId_idx" ON "monitorResults"("monitorId");
CREATE INDEX IF NOT EXISTS "alerts_deviceId_idx" ON "alerts"("deviceId");
CREATE INDEX IF NOT EXISTS "alerts_monitorId_idx" ON "alerts"("monitorId");
CREATE INDEX IF NOT EXISTS "alerts_status_idx" ON "alerts"("status");