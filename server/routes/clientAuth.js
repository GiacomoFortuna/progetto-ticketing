const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// POST /api/clientAuth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Trova l’utente nella tabella client_users
    const result = await db.query(
      'SELECT * FROM client_users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email non registrata' });
    }

    const user = result.rows[0];

    // 2. Verifica la password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Password errata' });
    }

    // 3. Recupera il nome dell’azienda
    const aziendaRes = await db.query(
      'SELECT name FROM clients WHERE id = $1',
      [user.client_id]
    );
    const companyName = aziendaRes.rows[0]?.name || 'Azienda sconosciuta';

    // 4. Crea il token JWT con dati essenziali
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        client_id: user.client_id,
        company_name: companyName
      },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    // 5. Invia risposta sicura senza password
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name, // o first_name / full_name, come lo hai
        role: user.role,
        client_id: user.client_id,
        company_name: companyName
      }
    });
  } catch (err) {
    console.error('Errore login client:', err);
    res.status(500).json({ error: 'Errore login client' });
  }
});

module.exports = router;
// Questo file gestisce l'autenticazione degli utenti client.
// Permette il login verificando email e password, e genera un token JWT sicuro.
// Include anche il nome dell'azienda nel token per un contesto migliore.