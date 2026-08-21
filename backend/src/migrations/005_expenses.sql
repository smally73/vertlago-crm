-- Module Dépenses

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'GBP', 'CHF', 'JPY')),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    beneficiary TEXT NOT NULL,
    reason TEXT,
    category TEXT NOT NULL CHECK (category IN ('textile', 'impression', 'publicite', 'salon', 'autre')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_beneficiary ON expenses (beneficiary);
