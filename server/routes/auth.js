const express = require('express'); // Importa Express per gestire le rotte HTTP
const bcrypt = require('bcrypt'); // Importa bcrypt per gestire l'hashing delle password
const jwt = require('jsonwebtoken'); // Importa jsonwebtoken per generare e verificare JWT
const dotenv = require('dotenv'); // Importa dotenv per caricare le variabili d'ambiente
const pool = require('../db'); // Importa la connessione al database

dotenv.config(); // Carica le variabili d'ambiente dal file .env
const router = express.Router(); // Crea un nuovo router Express

// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // Estrae username e password dal body della richiesta

  if (!username || !password) {
    // Se username o password mancano, restituisce errore 400
    return res.status(400).json({ error: 'Username e password obbligatori' });
  }

  try {
    // Cerca l'utente nel database tramite username
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length === 0) {
      // Se l'utente non esiste, restituisce errore 401
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const user = result.rows[0]; // Ottiene i dati dell'utente

    // ✅ Controlla la password
    const match = await bcrypt.compare(password, user.password_hash); // Confronta la password inserita con quella hashata
    if (!match) {
      // Se la password non corrisponde, restituisce errore 401
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // ✅ Aggiungi anche il ruolo al token
    const token = jwt.sign(
      {
        username: user.username, // Inserisce lo username nel payload del token
        division: user.division, // Inserisce la divisione nel payload del token
        role: user.role,         // Inserisce il ruolo nel payload del token
      },
      process.env.JWT_SECRET,    // Usa la chiave segreta dal file .env
      { expiresIn: '8h' }        // Imposta la scadenza del token a 8 ore
    );

    // Restituisce il token e i dati utente (senza password) come risposta JSON
    res.json({
      token,
      user: {
        username: user.username,
        division: user.division,
        role: user.role,
      },
    });
  } catch (err) {
    // Gestisce eventuali errori interni
    console.error('Errore login:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

module.exports = router; // Esporta il router per l'utilizzo nell'app principale


