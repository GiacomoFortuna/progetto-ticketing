const express = require('express');
const cors = require('cors');
const app = express();
const ticketRoutes = require('./routes/tickets');

// Middleware
app.use(cors()); // Permette le richieste dal frontend (React)
app.use(express.json()); // Permette di leggere il corpo JSON delle richieste
app.use('/api/tickets', ticketRoutes);

// Route di test base
app.get('/', (req, res) => {
  res.send('Server backend attivo! ✅');
});

// Importeremo le vere route API qui:
// const ticketRoutes = require('./routes/tickets');
// app.use('/api/tickets', ticketRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server in ascolto su http://localhost:${PORT}`);
});
