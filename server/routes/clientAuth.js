const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage per file allegati
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});
const upload = multer({ storage });

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

// GET /api/clientAuth/client-projects/:client_id
router.get('/client-projects/:client_id', async (req, res) => {
  const { client_id } = req.params;

  try {
    const result = await db.query(
      `SELECT projects.id, projects.name 
       FROM projects
       JOIN infrastructures ON projects.infrastructure_id = infrastructures.id
       WHERE infrastructures.client_id = $1`,
      [client_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Errore nel recupero progetti cliente:', err);
    res.status(500).json({ error: 'Errore nel recupero progetti' });
  }
});

// POST /api/clientAuth/client-tickets
router.post('/client-tickets', upload.single('attachment'), async (req, res) => {
  const { title, description, client_id, project_id } = req.body;
  const filename = req.file ? req.file.filename : null;

  try {
    const result = await db.query(
      `INSERT INTO tickets (title, description, division, status, created_at, project_id, client_id, attachment)
       VALUES ($1, $2, $3, 'open', NOW(), $4, $5, $6)
       RETURNING *`,
      [title, description, 'it-care', project_id, client_id, filename]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Errore creazione ticket client:', err);
    res.status(500).json({ error: 'Errore creazione ticket' });
  }
});

// GET /api/client-tickets/:client_id
router.get('/client-tickets/:client_id', async (req, res) => {
  const { client_id } = req.params;

  try {
    const result = await db.query(
      `SELECT 
         tickets.*, 
         projects.name AS project_name
       FROM tickets
       LEFT JOIN projects ON tickets.project_id = projects.id
       WHERE tickets.client_id = $1
       ORDER BY tickets.created_at DESC`,
      [client_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Errore nel recupero dei ticket cliente:', err);
    res.status(500).json({ error: 'Errore nel recupero dei ticket' });
  }
});

module.exports = router;
// Questo file gestisce l'autenticazione degli utenti client.
// Permette il login verificando email e password, e genera un token JWT sicuro.
// Include anche il nome dell'azienda nel token per un contesto migliore.