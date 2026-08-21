const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Liste des dépenses, avec filtres, + total par devise sur le résultat filtré
router.get('/', async (req, res) => {
  const { date_from, date_to, beneficiary, amount_min, amount_max, category } = req.query;
  const conditions = [];
  const params = [];

  if (date_from) {
    params.push(date_from);
    conditions.push(`expense_date >= $${params.length}`);
  }
  if (date_to) {
    params.push(date_to);
    conditions.push(`expense_date <= $${params.length}`);
  }
  if (beneficiary) {
    params.push(`%${beneficiary.toLowerCase()}%`);
    conditions.push(`LOWER(beneficiary) LIKE $${params.length}`);
  }
  if (amount_min) {
    params.push(amount_min);
    conditions.push(`amount >= $${params.length}`);
  }
  if (amount_max) {
    params.push(amount_max);
    conditions.push(`amount <= $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT * FROM expenses ${where} ORDER BY expense_date DESC, created_at DESC LIMIT 500`,
    params
  );
  const { rows: totals } = await pool.query(
    `SELECT currency, SUM(amount) AS total FROM expenses ${where} GROUP BY currency`,
    params
  );
  res.json({ rows, totals });
});

// Bénéficiaires déjà utilisés, pour l'autocomplétion
router.get('/beneficiaries', async (req, res) => {
  const { rows } = await pool.query(
    'SELECT DISTINCT beneficiary FROM expenses ORDER BY beneficiary LIMIT 200'
  );
  res.json(rows.map((r) => r.beneficiary));
});

// Détail d'une dépense
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM expenses WHERE id = $1', [id]);
  if (!rows[0]) {
    return res.status(404).json({ error: 'Dépense introuvable.' });
  }
  res.json(rows[0]);
});

// Création d'une dépense
router.post('/', async (req, res) => {
  const { amount, currency, expense_date, beneficiary, reason, category } = req.body;

  if (!amount || !beneficiary || !category) {
    return res.status(400).json({ error: 'Montant, bénéficiaire et typologie sont requis.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO expenses (amount, currency, expense_date, beneficiary, reason, category, created_by)
     VALUES ($1, COALESCE($2,'EUR'), COALESCE($3, CURRENT_DATE), $4, $5, $6, $7)
     RETURNING *`,
    [amount, currency, expense_date || null, beneficiary, reason, category, req.user.id]
  );
  res.status(201).json(rows[0]);
});

// Mise à jour d'une dépense
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const fields = ['amount', 'currency', 'expense_date', 'beneficiary', 'reason', 'category'];

  const updates = [];
  const params = [];
  for (const field of fields) {
    if (field in req.body) {
      params.push(req.body[field]);
      updates.push(`${field} = $${params.length}`);
    }
  }
  if (!updates.length) {
    return res.status(400).json({ error: 'Aucun champ à mettre à jour.' });
  }
  params.push(id);

  const { rows } = await pool.query(
    `UPDATE expenses SET ${updates.join(', ')}, updated_at = now() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) {
    return res.status(404).json({ error: 'Dépense introuvable.' });
  }
  res.json(rows[0]);
});

// Suppression d'une dépense
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
  if (!rowCount) {
    return res.status(404).json({ error: 'Dépense introuvable.' });
  }
  res.status(204).send();
});

module.exports = router;
