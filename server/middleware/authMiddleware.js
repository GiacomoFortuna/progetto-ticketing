const jwt = require('jsonwebtoken');
require('dotenv').config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token mancante o non valido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Token non valido' });
  }
}

module.exports = authMiddleware;
// Questo middleware verifica il token JWT presente nell'header Authorization
// e decodifica le informazioni dell'utente, rendendole disponibili in req.user.