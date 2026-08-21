-- Ajoute le statut "archive" (suppression douce) : DROP + ADD est idempotent
-- (contrairement à ADD CONSTRAINT seul, qui échouerait si déjà présente).
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE clients ADD CONSTRAINT clients_status_check
  CHECK (status IN ('prospect', 'actif', 'inactif', 'archive'));
