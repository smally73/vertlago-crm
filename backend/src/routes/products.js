const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Liste des produits, avec recherche et filtres
router.get('/', async (req, res) => {
  const { search, category, status } = req.query;
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    conditions.push(
      `(LOWER(name) LIKE $${params.length} OR LOWER(COALESCE(sku, '')) LIKE $${params.length})`
    );
  }
  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT * FROM products ${where} ORDER BY name LIMIT 500`,
    params
  );
  res.json(rows);
});

// Détail d'un produit
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
  if (!rows[0]) {
    return res.status(404).json({ error: 'Produit introuvable.' });
  }
  res.json(rows[0]);
});

// Création d'un produit
router.post('/', async (req, res) => {
  const { name, sku, category, default_price, default_currency, status } = req.body;

  if (!name || !category) {
    return res.status(400).json({ error: 'Nom et catégorie sont requis.' });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO products (name, sku, category, default_price, default_currency, status, created_by)
       VALUES ($1, $2, $3, $4, COALESCE($5,'EUR'), COALESCE($6,'actif'), $7)
       RETURNING *`,
      [name, sku || null, category, default_price || null, default_currency, status, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Cette référence (SKU) est déjà utilisée.' });
    }
    throw err;
  }
});

// Mise à jour d'un produit
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const fields = ['name', 'sku', 'category', 'default_price', 'default_currency', 'status'];
  const nullableFields = ['sku'];

  const updates = [];
  const params = [];
  for (const field of fields) {
    if (field in req.body) {
      const value = nullableFields.includes(field) ? (req.body[field] || null) : req.body[field];
      params.push(value);
      updates.push(`${field} = $${params.length}`);
    }
  }
  if (!updates.length) {
    return res.status(400).json({ error: 'Aucun champ à mettre à jour.' });
  }
  params.push(id);

  try {
    const { rows } = await pool.query(
      `UPDATE products SET ${updates.join(', ')}, updated_at = now() WHERE id = $${params.length} RETURNING *`,
      params
    );
    if (!rows[0]) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Cette référence (SKU) est déjà utilisée.' });
    }
    throw err;
  }
});

module.exports = router;
