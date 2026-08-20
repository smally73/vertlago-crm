const express = require('express');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// Liste des clients, avec recherche et filtre par statut/tag
router.get('/', async (req, res) => {
  const { search, status, tag } = req.query;
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    conditions.push(
      `(LOWER(first_name) LIKE $${params.length} OR LOWER(last_name) LIKE $${params.length} OR LOWER(COALESCE(company_name, '')) LIKE $${params.length} OR LOWER(COALESCE(email, '')) LIKE $${params.length})`
    );
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (tag) {
    params.push(tag);
    conditions.push(`$${params.length} = ANY(tags)`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT * FROM clients ${where} ORDER BY created_at DESC LIMIT 200`,
    params
  );
  res.json(rows);
});

// Détail d'un client + son journal d'interactions
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const clientRes = await pool.query('SELECT * FROM clients WHERE id = $1', [id]);
  if (!clientRes.rows[0]) {
    return res.status(404).json({ error: 'Client introuvable.' });
  }
  const interactionsRes = await pool.query(
    'SELECT * FROM client_interactions WHERE client_id = $1 ORDER BY created_at DESC',
    [id]
  );
  res.json({ ...clientRes.rows[0], interactions: interactionsRes.rows });
});

// Création d'une fiche client
router.post('/', async (req, res) => {
  const {
    first_name, last_name, company_name, email, phone,
    address_line1, address_line2, postal_code, city, country,
    tags, notes, status, instagram, source,
  } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'Prénom et nom sont requis.' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Email requis.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO clients
      (first_name, last_name, company_name, email, phone, address_line1, address_line2,
       postal_code, city, country, tags, notes, status, instagram, source, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,'Italie'),COALESCE($11::text[],'{}'),$12,COALESCE($13,'prospect'),$14,$15,$16)
     RETURNING *`,
    [first_name, last_name, company_name, email, phone, address_line1, address_line2,
      postal_code, city, country, tags, notes, status, instagram, source || null, req.user.id]
  );
  res.status(201).json(rows[0]);
});

// Mise à jour d'une fiche client
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const fields = [
    'first_name', 'last_name', 'company_name', 'email', 'phone',
    'address_line1', 'address_line2', 'postal_code', 'city', 'country',
    'tags', 'notes', 'status', 'instagram', 'source',
  ];

  if ('email' in req.body && !req.body.email) {
    return res.status(400).json({ error: 'Email requis.' });
  }

  const updates = [];
  const params = [];
  for (const field of fields) {
    if (field in req.body) {
      const value = field === 'source' ? (req.body[field] || null) : req.body[field];
      params.push(value);
      updates.push(`${field} = $${params.length}`);
    }
  }
  if (!updates.length) {
    return res.status(400).json({ error: 'Aucun champ à mettre à jour.' });
  }
  params.push(id);

  const { rows } = await pool.query(
    `UPDATE clients SET ${updates.join(', ')}, updated_at = now() WHERE id = $${params.length} RETURNING *`,
    params
  );
  if (!rows[0]) {
    return res.status(404).json({ error: 'Client introuvable.' });
  }
  res.json(rows[0]);
});

// Suppression d'une fiche client
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM clients WHERE id = $1', [id]);
  if (!rowCount) {
    return res.status(404).json({ error: 'Client introuvable.' });
  }
  res.status(204).send();
});

// Ajout d'une interaction (note, appel, email, réunion) au journal du client
router.post('/:id/interactions', async (req, res) => {
  const { id } = req.params;
  const { type, content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Le contenu est requis.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO client_interactions (client_id, user_id, type, content)
     VALUES ($1, $2, COALESCE($3, 'note'), $4) RETURNING *`,
    [id, req.user.id, type, content]
  );
  res.status(201).json(rows[0]);
});

// Modification d'une interaction du journal
router.put('/:id/interactions/:interactionId', async (req, res) => {
  const { interactionId } = req.params;
  const { type, content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Le contenu est requis.' });
  }

  const { rows } = await pool.query(
    `UPDATE client_interactions SET type = COALESCE($1, type), content = $2
     WHERE id = $3 RETURNING *`,
    [type, content, interactionId]
  );
  if (!rows[0]) {
    return res.status(404).json({ error: 'Interaction introuvable.' });
  }
  res.json(rows[0]);
});

// Suppression d'une interaction du journal
router.delete('/:id/interactions/:interactionId', async (req, res) => {
  const { interactionId } = req.params;
  const { rowCount } = await pool.query('DELETE FROM client_interactions WHERE id = $1', [interactionId]);
  if (!rowCount) {
    return res.status(404).json({ error: 'Interaction introuvable.' });
  }
  res.status(204).send();
});

module.exports = router;
