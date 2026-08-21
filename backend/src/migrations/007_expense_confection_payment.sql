-- Ajoute la typologie "Confection" et un champ Modalité de paiement (facultatif)

ALTER TABLE expenses DROP CONSTRAINT IF EXISTS expenses_category_check;
ALTER TABLE expenses ADD CONSTRAINT expenses_category_check
  CHECK (category IN ('textile', 'impression', 'publicite', 'salon', 'confection', 'autre'));

ALTER TABLE expenses ADD COLUMN IF NOT EXISTS payment_method TEXT
  CHECK (payment_method IN ('cash', 'virement_bancaire'));
