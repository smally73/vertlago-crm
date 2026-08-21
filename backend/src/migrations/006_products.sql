-- Module Ventes, phase 1 : référentiel Produits (pas de gestion de stock)

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sku TEXT,
    category TEXT NOT NULL CHECK (category IN ('foulard', 'bandana', 'kimono', 'autre')),
    default_price NUMERIC(10, 2),
    default_currency TEXT NOT NULL DEFAULT 'EUR' CHECK (default_currency IN ('EUR', 'USD', 'GBP', 'CHF', 'JPY')),
    status TEXT NOT NULL DEFAULT 'actif' CHECK (status IN ('actif', 'inactif')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku_unique ON products (sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_name ON products (name);
