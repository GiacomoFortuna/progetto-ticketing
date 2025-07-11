const dotenv = require('dotenv');
dotenv.config(); // ✅ Carica le variabili da .env

const express = require('express');
const cors = require('cors');
const app = express();

// Prendi le variabili da .env
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// Importa le route
const ticketRoutes = require('./routes/tickets');
const authRoutes = require('./routes/auth');
const UserRoutes = require('./routes/users');
const clientAuthRoutes = require('./routes/clientAuth');

// Rotte API
app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', UserRoutes);
app.use('/api/clientAuth', clientAuthRoutes);

// Static files per gli allegati
app.use('/uploads', express.static('uploads'));

// Rotta di test
app.get('/', (req, res) => {
  res.send('Server backend attivo! ✅');
});

// Avvio server
app.listen(PORT, () => {
  console.log(`✅ Server in ascolto su http://localhost:${PORT}`);
});

// Esporta l'app per test o altri usi
module.exports = app;
