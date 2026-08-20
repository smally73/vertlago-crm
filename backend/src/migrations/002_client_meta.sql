-- Ajoute le compte Instagram et le canal d'acquisition à la fiche client

ALTER TABLE clients ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS source TEXT
  CHECK (source IN ('salon', 'instagram', 'mailing', 'autre'));
