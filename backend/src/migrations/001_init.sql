-- Migration initiale : utilisateurs internes + fiches clients
-- Conçue pour pouvoir accueillir plus tard : commandes, stocks, contrôle de gestion

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Employés ayant accès au back-office
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'employe' CHECK (role IN ('admin', 'employe')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fiches clients (CRM)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Identité / contact
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    postal_code TEXT,
    city TEXT,
    country TEXT DEFAULT 'Italie',
    -- Segmentation
    tags TEXT[] NOT NULL DEFAULT '{}',
    -- Suivi commercial
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'prospect' CHECK (status IN ('prospect', 'actif', 'inactif')),
    -- Métadonnées
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_last_name ON clients (last_name);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients (status);
CREATE INDEX IF NOT EXISTS idx_clients_tags ON clients USING GIN (tags);

-- Journal d'interactions (appels, emails, notes) par client
-- Prépare le terrain pour le futur module de suivi commercial avancé
CREATE TABLE IF NOT EXISTS client_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    type TEXT NOT NULL DEFAULT 'note' CHECK (type IN ('note', 'appel', 'email', 'reunion')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interactions_client ON client_interactions (client_id);

-- Table de réserve pour le futur module "commandes" (non utilisée en V1,
-- mais la clé étrangère client_id est déjà prête)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id),
    status TEXT NOT NULL DEFAULT 'brouillon',
    total_amount NUMERIC(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
