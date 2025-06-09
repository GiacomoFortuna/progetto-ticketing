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
router.get('/', require('../middleware/authMiddleware'), async (req, res) => {
  // Fix: Check if req.user exists and fallback if not
  const user = req.user || {};
  const division = user.division;
  const isManager = user.role === 'manager' || user.is_manager === true;

  let query = `
    SELECT 
      t.id,
      t.title,
      t.description,
      t.division,
      t.assigned_to,
      t.status,
      t.created_at,
      t.working_hours,
      t.created_by,
      p.name AS project_name,
      i.name AS infrastructure_name,
      c.name AS client_name
    FROM tickets t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN infrastructures i ON p.infrastructure_id = i.id
    LEFT JOIN clients c ON i.client_id = c.id
  `;
  const params = [];
  let whereClauses = [];

  // Filtro per divisione se manager o se query param presente
  if (isManager && req.query.division) {
    whereClauses.push('t.division = $' + (params.length + 1));
    params.push(req.query.division);
  } else if (!isManager && division) {
    whereClauses.push('t.division = $' + (params.length + 1));
    params.push(division);
  }

  // Filtro per search (titolo o descrizione)
  if (req.query.search) {
    whereClauses.push(`(t.title ILIKE $${params.length + 1} OR t.description ILIKE $${params.length + 1})`);
    params.push(`%${req.query.search}%`);
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }
  query += ' ORDER BY t.created_at DESC';

  try {
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Errore nel recupero dei ticket:', err);
    res.status(500).json({ error: 'Errore nel recupero dei ticket' });
  }
});

// POST /api/tickets
router.post('/', authMiddleware, async (req, res) => {
const { title, description, client_id, project_id, assigned_to, division } = req.body;
const created_by = req.user.username;

  try {
    const result = await db.query(
      `INSERT INTO tickets (title, description, division, client_id, project_id, assigned_to, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, 'open', $7) RETURNING *`,
      [title, description, division, client_id, project_id, assigned_to, created_by]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Errore nella creazione del ticket:', err);
    res.status(500).json({ error: 'Errore nella creazione del ticket' });
  }
});

// PUT /api/tickets/:id → aggiorna un ticket esistente
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userDivision = req.user.division; // divisione dell'utente loggato

  if (!status) {
    return res.status(400).json({ error: 'Stato mancante' });
  }

  try {
    // Verifica se il ticket esiste e a quale divisione appartiene
    const ticketCheck = await db.query('SELECT division, created_at FROM tickets WHERE id = $1', [id]);
    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket non trovato' });
    }

    const ticket = ticketCheck.rows[0];

    if (ticket.division !== userDivision) {
      return res.status(403).json({ error: 'Non autorizzato a modificare ticket di altre divisioni' });
    }

    let result;
    if (status === 'closed') {
      const closedAt = new Date();
      const workingHours = calcolaOreLavorative(ticket.created_at, closedAt);

      result = await db.query(
        `UPDATE tickets 
         SET status = $1, closed_at = $2, working_hours = $3
         WHERE id = $4
         RETURNING *`,
        [status, closedAt, workingHours, id]
      );
    } else {
      result = await db.query(
        `UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *`,
        [status, id]
      );
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
