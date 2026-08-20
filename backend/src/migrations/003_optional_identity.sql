-- Autorise les fiches sans prénom/nom (contact connu seulement par email ou Instagram)
-- Un contact doit rester identifiable par au moins un moyen.

ALTER TABLE clients ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN last_name DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clients_identity_check'
  ) THEN
    ALTER TABLE clients ADD CONSTRAINT clients_identity_check
      CHECK (first_name IS NOT NULL OR last_name IS NOT NULL
             OR email IS NOT NULL OR instagram IS NOT NULL);
  END IF;
END $$;
