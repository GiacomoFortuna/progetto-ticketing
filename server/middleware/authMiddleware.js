const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token mancante o malformato' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attacca i dati dell'utente a req.user
    req.user = {
      username: decoded.username,
      division: decoded.division,
      role: decoded.role, // 👈 Aggiunto il ruolo
    };

    next();
  } catch (err) {
    console.error('Token JWT non valido:', err);
    res.status(401).json({ error: 'Token non valido' });
  }
}

module.exports = authMiddleware;

// Questo middleware verifica il token JWT presente nell'header Authorization
// e decodifica le informazioni dell'utente, rendendole disponibili in req.user.