const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/tickets → restituisce tutti i ticket
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM tickets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Errore nel recupero dei ticket:', err);
    res.status(500).json({ error: 'Errore nel recupero dei ticket' });
  }
});

module.exports = router;
// POST /api/tickets → inserisce un nuovo ticket
router.post('/', async (req, res) => {
  const { title, description, division, client, project, assigned_to } = req.body;

  if (!title || !description || !division || !client) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti' });
  }

  try {
    const result = await db.query(
      `INSERT INTO tickets (title, description, division, client, project, assigned_to)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, division, client, project || null, assigned_to || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Errore inserimento ticket:', err);
    res.status(500).json({ error: 'Errore durante la creazione del ticket' });
  }
});
// PUT /api/tickets/:id → aggiorna un ticket esistente
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Stato mancante' });
  }

  try {
    const result = await db.query(
      `UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket non trovato' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Errore aggiornamento stato:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});