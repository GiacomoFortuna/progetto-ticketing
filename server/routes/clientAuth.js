const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// POST /api/client-auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      'SELECT * FROM client_users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email non registrata' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Password errata' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        client_id: user.client_id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error('Errore login client:', err);
    res.status(500).json({ error: 'Errore login client' });
  }
});

module.exports = router;
// Questo file gestisce l'autenticazione per gli utenti client.
// Utilizza bcrypt per confrontare le password e jwt per generare i token.
// La rotta /login verifica le credenziali e restituisce un token JWT se sono corrette.