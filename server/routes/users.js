const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const authMiddleware = require('../middleware/authMiddleware');

// 🔹 GET /api/users/by-division?division=cloud
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

// 🔹 POST /api/users - Creazione nuovo utente (solo manager)
router.post('/register', authMiddleware, async (req, res) => {
  const { username, password, division, role } = req.body;

  // Solo i manager possono creare utenti
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Non autorizzato' });
  }

  if (!username || !password || !division || !role) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO users (username, password_hash, division, role)
       VALUES ($1, $2, $3, $4) RETURNING id, username, division, role`,
      [username, hashedPassword, division, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Errore creazione utente:', err);
    if (err.code === '23505') {
      res.status(409).json({ error: 'Username già esistente' });
    } else {
      res.status(500).json({ error: 'Errore interno' });
    }
  }
});

module.exports = router;
//
// Questo file definisce le rotte per la gestione degli utenti.