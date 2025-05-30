const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/users/by-division?division=cloud
router.get('/by-division', async (req, res) => {
  const { division } = req.query;

  if (!division) {
    return res.status(400).json({ error: 'Divisione mancante' });
  }

  try {
    const result = await db.query(
      'SELECT username FROM users WHERE division = $1 ORDER BY username',
      [division]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Errore recupero utenti per divisione:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

module.exports = router;
// Questo file definisce le route per la gestione degli utenti
// in base alla divisione. Permette di ottenere gli utenti filtrati