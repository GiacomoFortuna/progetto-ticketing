const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const pool = require('../db');

dotenv.config();
const router = express.Router();

// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password obbligatori' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const user = result.rows[0];

    // ✅ Controlla la password
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // ✅ Aggiungi anche il ruolo al token
    const token = jwt.sign(
      {
        username: user.username,
        division: user.division,
        role: user.role, // 👈 qui aggiungi il campo role
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      user: {
        username: user.username,
        division: user.division,
        role: user.role, // 👈 e anche qui nella risposta
      },
    });
  } catch (err) {
    console.error('Errore login:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

module.exports = router;


