const dotenv = require('dotenv');
dotenv.config(); // ✅ Carica le variabili da .env

const express = require('express');
const cors = require('cors');
const app = express();

const ticketRoutes = require('./routes/tickets');
const authRoutes = require('./routes/auth');
const UserRoutes = require('./routes/users');

// Middleware
app.use(cors());
app.use(express.json());

app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', UserRoutes);

app.get('/', (req, res) => {
  res.send('Server backend attivo! ✅');
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server in ascolto su http://localhost:${PORT}`);
});
// Questo è il file principale del server Express
// che configura le rotte e avvia il server sulla porta 3001.