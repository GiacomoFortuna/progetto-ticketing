const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// Function to calculate working hours between two dates
function calcolaOreLavorative(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let ore = 0;
  const current = new Date(start);

  while (current < end) {
    const giorno = current.getDay(); // 0 = domenica, 6 = sabato
    const ora = current.getHours();

    const isLavorativo = giorno >= 1 && giorno <= 5 && ora >= 9 && ora < 18;

    if (isLavorativo) ore++;

    current.setHours(current.getHours() + 1);
  }

  return ore;
}

// GET /api/tickets → restituisce tutti i ticket
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        t.id,
        t.title,
        t.description,
        t.division,
        t.assigned_to,
        t.status,
        t.created_at,
        t.working_hours, -- Include working_hours in the query
        p.name AS project_name,
        i.name AS infrastructure_name,
        c.name AS client_name
      FROM tickets t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN infrastructures i ON p.infrastructure_id = i.id
      LEFT JOIN clients c ON i.client_id = c.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Errore nel recupero dei ticket:', err);
    res.status(500).json({ error: 'Errore nel recupero dei ticket' });
  }
});

// POST /api/tickets
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, project_id } = req.body;

  // Prendi i dati dal token JWT
  const username = req.user.username;
  const division = req.user.division;

  if (!title || !description || !project_id) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti' });
  }

  try {
    // Ricava il infrastructure_id dalla tabella projects
    const projectResult = await db.query(
      'SELECT infrastructure_id FROM projects WHERE id = $1',
      [project_id]
    );
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Progetto non trovato' });
    }

    const infra_id = projectResult.rows[0].infrastructure_id;

    // Ricava il client_id dalla tabella infrastructures
    const infraResult = await db.query(
      'SELECT client_id FROM infrastructures WHERE id = $1',
      [infra_id]
    );
    if (infraResult.rows.length === 0) {
      return res.status(404).json({ error: 'Infrastruttura non trovata' });
    }

    const client_id = infraResult.rows[0].client_id;

    // Crea il ticket
    const result = await db.query(
      `INSERT INTO tickets (title, description, division, assigned_to, client_id, project_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'open') RETURNING *`,
      [title, description, division, username, client_id, project_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Errore nella creazione del ticket:', err);
    res.status(500).json({ error: 'Errore nella creazione del ticket' });
  }
});

// PUT /api/tickets/:id → aggiorna un ticket esistente
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Stato mancante' });
  }

  try {
    let result;

    if (status === 'closed') {
      // Retrieve created_at for the ticket
      const ticketResult = await db.query('SELECT created_at FROM tickets WHERE id = $1', [id]);
      if (ticketResult.rows.length === 0) {
        return res.status(404).json({ error: 'Ticket non trovato' });
      }

      const createdAt = ticketResult.rows[0].created_at;
      const closedAt = new Date();
      const workingHours = calcolaOreLavorative(createdAt, closedAt);

      // Update the ticket with status, closed_at, and working_hours
      result = await db.query(
        `UPDATE tickets 
         SET status = $1, closed_at = $2, working_hours = $3
         WHERE id = $4
         RETURNING *`,
        [status, closedAt, workingHours, id]
      );
    } else {
      // Update only the status
      result = await db.query(
        `UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *`,
        [status, id]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket non trovato' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Errore aggiornamento stato:', err);
    res.status(500).json({ error: 'Errore interno durante l\'aggiornamento del ticket' });
  }
});

// GET /api/clients → restituisce tutti i clienti
router.get('/clients', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM clients ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Errore caricamento clienti:', err);
    res.status(500).json({ error: 'Errore nel recupero dei clienti' });
  }
});

// GET /api/infrastructures → restituisce le infrastrutture di un cliente
router.get('/infrastructures', async (req, res) => {
  const { client_id } = req.query;

  if (!client_id) {
    return res.status(400).json({ error: 'client_id mancante' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM infrastructures WHERE client_id = $1 ORDER BY name',
      [client_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Errore infrastrutture:', err);
    res.status(500).json({ error: 'Errore nel recupero delle infrastrutture' });
  }
});

// GET /api/projects → restituisce i progetti di un cliente
router.get('/projects', async (req, res) => {
  const { infrastructure_id } = req.query;

  if (!infrastructure_id) {
    return res.status(400).json({ error: 'infrastructure_id mancante' });
  }

  try {
    const result = await db.query(
      'SELECT * FROM projects WHERE infrastructure_id = $1 ORDER BY name',
      [infrastructure_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Errore progetti:', err);
    res.status(500).json({ error: 'Errore nel recupero dei progetti' });
  }
});

module.exports = router;
