const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendTelegramNotification } = require('../utils/telegram');

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
  const { title, description, client_id, project_id, division } = req.body; // Estrae i dati dal body della richiesta
  const filename = req.file ? req.file.filename : null; // Ottiene il nome del file allegato se presente

  // 🔐 Recupera l'utente loggato dal token per salvare "created_by"
  const authHeader = req.headers.authorization; // Ottiene l'header di autorizzazione
  if (!authHeader) return res.status(401).json({ error: 'Token mancante' }); // Se manca il token, restituisce errore 401

  const token = authHeader.split(' ')[1]; // Estrae il token JWT dall'header
  let createdBy; // Variabile per memorizzare l'email dell'utente creatore

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verifica e decodifica il token JWT
    createdBy = decoded.email; // Usa l'email decodificata come creatore del ticket
  } catch (err) {
    return res.status(403).json({ error: 'Token non valido' }); // Se il token non è valido, restituisce errore 403
  }

  try {
    // Inserisce il nuovo ticket nel database
    const result = await db.query(
      `INSERT INTO tickets (title, description, division, status, created_at, project_id, client_id, attachment, created_by)
       VALUES ($1, $2, $3, 'open', NOW(), $4, $5, $6, $7)
       RETURNING *`,
      [title, description, division, project_id, client_id, filename, createdBy]
    );

    const newTicket = result.rows[0]; // Ottiene il ticket appena creato

    // Recupera nome cliente (richiesto da Telegram)
    const clientResult = await db.query('SELECT name FROM clients WHERE id = $1', [client_id]); // Query per ottenere il nome del cliente
    newTicket.client_name = clientResult.rows[0]?.name; // Aggiunge il nome cliente al ticket

    // Invia notifica solo se division è "cloud"
    if (division === 'cloud') {
      sendTelegramNotification(newTicket); // Invia la notifica Telegram per i ticket cloud
    }

    res.status(201).json(newTicket); // Restituisce il ticket creato come risposta JSON
  } catch (err) {
    console.error('Errore creazione ticket client:', err); // Logga eventuali errori
    res.status(500).json({ error: 'Errore creazione ticket' }); // Restituisce errore 500 in caso di problemi
  }
});

// GET /api/client-tickets/:client_id
router.get('/client-tickets/:client_id', async (req, res) => {
  const { client_id } = req.params;
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token mancante' });
  }

  const token = authHeader.split(' ')[1];
  let createdBy;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    createdBy = decoded.email; // oppure decoded.name
  } catch (err) {
    return res.status(403).json({ error: 'Token non valido' });
  }

  try {
    const result = await db.query(
      `SELECT 
         tickets.*, 
         projects.name AS project_name
       FROM tickets
       LEFT JOIN projects ON tickets.project_id = projects.id
       WHERE tickets.client_id = $1 AND tickets.created_by = $2
       ORDER BY tickets.created_at DESC`,
      [client_id, createdBy]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Errore nel recupero dei ticket cliente:', err);
    res.status(500).json({ error: 'Errore nel recupero dei ticket' });
  }
});

// POST /api/client-auth/change-password
router.post('/change-password', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token mancante' });

  const token = authHeader.split(' ')[1];
  let userEmail;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userEmail = decoded.email;
  } catch (err) {
    return res.status(403).json({ error: 'Token non valido' });
  }

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Inserisci vecchia e nuova password' });
  }

  try {
    const result = await db.query('SELECT * FROM client_users WHERE email = $1', [userEmail]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ error: 'Vecchia password errata' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE client_users SET password = $1 WHERE email = $2', [hashedPassword, userEmail]);

    res.json({ message: 'Password aggiornata con successo' });
  } catch (err) {
    console.error('Errore cambio password client:', err);
    res.status(500).json({ error: 'Errore interno cambio password' });
  }
});

module.exports = router;
// Questo file gestisce l'autenticazione degli utenti client.
// Permette il login verificando email e password, e genera un token JWT sicuro.
// Include anche il nome dell'azienda nel token per un contesto migliore.