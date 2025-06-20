const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

function authClientMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token mancante' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!['client_user', 'client_manager'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Ruolo non autorizzato' });
    }

    req.clientUser = decoded; // contiene username, client_id, id, ruolo, ecc.
    next();
  } catch (err) {
    console.error('Token client non valido:', err);
    res.status(401).json({ error: 'Token non valido' });
  }
}

module.exports = authClientMiddleware;
// Questo middleware verifica il token JWT per gli utenti client.
// Controlla che il token sia presente e valido, e che l'utente abbia un ruolo autorizzato.
// Se tutto è corretto, aggiunge i dati dell'utente alla richiesta per l'uso nelle rotte successive.