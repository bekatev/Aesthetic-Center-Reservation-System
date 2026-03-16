-- Aesthetic Center Reservation System - Initial Schema
-- Run with: psql -U your_user -d your_database -f 001_init.sql
--
-- Tables: staff, services, service_custom_fields, service_custom_field_values,
--         reservations, reservation_services, column_preferences.
-- Reservations are linked to staff and services; services can have custom columns.

-- Staff (specialists)
CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  photo_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  color VARCHAR(7) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom fields for services (dynamic columns)
CREATE TABLE service_custom_fields (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom field values per service
CREATE TABLE service_custom_field_values (
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  field_id INTEGER NOT NULL REFERENCES service_custom_fields(id) ON DELETE CASCADE,
  value TEXT,
  PRIMARY KEY (service_id, field_id)
);

-- Reservations
CREATE TABLE reservations (
  id SERIAL PRIMARY KEY,
  specialist_id INTEGER NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient daily schedule queries
CREATE INDEX idx_reservations_specialist_date ON reservations(specialist_id, date, start_time);

-- Reservation-Service junction (many-to-many; first service defines color/main label)
CREATE TABLE reservation_services (
  reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (reservation_id, service_id)
);

-- Column preferences for services table (persist column order)
CREATE TABLE column_preferences (
  id SERIAL PRIMARY KEY,
  column_key VARCHAR(50) NOT NULL UNIQUE,
  field_id INTEGER REFERENCES service_custom_fields(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default column order (base columns)
INSERT INTO column_preferences (column_key, field_id, position) VALUES
  ('color', NULL, 0),
  ('name', NULL, 1),
  ('price', NULL, 2);
