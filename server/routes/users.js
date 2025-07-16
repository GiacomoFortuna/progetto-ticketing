const express = require('express'); // Importa Express per gestire le rotte HTTP
const router = express.Router(); // Crea un nuovo router Express
const db = require('../db'); // Importa la connessione al database
const bcrypt = require('bcrypt'); // Importa bcrypt per gestire l'hashing delle password
const authMiddleware = require('../middleware/authMiddleware'); // Importa il middleware di autenticazione

// 🔹 GET /api/users/by-division?division=cloud
router.get('/by-division', async (req, res) => {
  const { division } = req.query; // Estrae la divisione dai parametri della query

  if (!division) {
    // Se la divisione non è fornita, restituisce errore 400
    return res.status(400).json({ error: 'Divisione mancante' });
  }

  try {
    // Query per recuperare gli username degli utenti della divisione richiesta
    const result = await db.query(
      'SELECT username FROM users WHERE division = $1 ORDER BY username',
      [division]
    );
    res.json(result.rows); // Restituisce la lista degli username come JSON
  } catch (err) {
    console.error('Errore recupero utenti per divisione:', err); // Logga eventuali errori
    res.status(500).json({ error: 'Errore interno' }); // Restituisce errore 500
  }
});

// 🔹 POST /api/users - Creazione nuovo utente (solo manager)
router.post('/register', authMiddleware, async (req, res) => {
  const { username, password, division, role } = req.body; // Estrae i dati dal body della richiesta

  // Solo i manager possono creare utenti
  if (req.user.role !== 'manager') {
    return res.status(403).json({ error: 'Non autorizzato' }); // Restituisce errore 403 se non è manager
  }

  if (!username || !password || !division || !role) {
    // Se manca uno dei campi obbligatori, restituisce errore 400
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Cifra la password con bcrypt

    // Query per inserire il nuovo utente nel database
    const result = await db.query(
      `INSERT INTO users (username, password_hash, division, role)
       VALUES ($1, $2, $3, $4) RETURNING id, username, division, role`,
      [username, hashedPassword, division, role]
    );

    res.status(201).json(result.rows[0]); // Restituisce i dati dell'utente creato come JSON
  } catch (err) {
    console.error('Errore creazione utente:', err); // Logga eventuali errori
    if (err.code === '23505') {
      // Se l'errore è per username duplicato, restituisce errore 409
      res.status(409).json({ error: 'Username già esistente' });
    } else {
      res.status(500).json({ error: 'Errore interno' }); // Altri errori restituisce errore 500
    }
  }
});

// PATCH /api/users/update
router.patch('/update', authMiddleware, async (req, res) => { // Definisce una route PATCH '/update' protetta da authMiddleware
  const { newPassword } = req.body; // Estrae 'newPassword' dal corpo della richiesta
  const username = req.user.username; // Ottiene lo username dell'utente autenticato dal middleware

  if (!newPassword) { // Controlla se la nuova password è stata fornita
    return res.status(400).json({ error: 'Password mancante' }); // Risponde con errore 400 se manca la password
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10); // Cifra la nuova password con bcrypt usando 10 salt rounds
    await db.query('UPDATE users SET password_hash = $1 WHERE username = $2', [hashed, username]); // Aggiorna la password cifrata nel database per l'utente specifico
    res.json({ message: 'Password aggiornata con successo' }); // Risponde con un messaggio di successo
  } catch (err) {
    console.error('Errore aggiornamento password:', err); // Logga eventuali errori nel server
    res.status(500).json({ error: 'Errore interno' }); // Risponde con errore 500 in caso di problemi interni
  }
});

module.exports = router; // Esporta il router per l'utilizzo nell'app principale
//
// Questo file definisce le rotte per la gestione degli utenti.