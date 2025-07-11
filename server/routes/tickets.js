const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const { Parser } = require('json2csv'); // 👉 libreria per convertire JSON in CSV
const sharp = require('sharp');
const { sendTelegramNotification } = require('../utils/telegram'); // <-- aggiunto qui
const fs = require('fs');

// --- INIZIO INTEGRAZIONE UPLOAD ---
const multer = require('multer');
const path = require('path');

// Estensioni accettate
const allowedExtensions = /\.(pdf|doc|docx|jpg|jpeg|png)$/i;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.floor(Math.random() * 1e5);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });
// --- FINE INTEGRAZIONE UPLOAD ---

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
      t.started_at,
      t.closed_at,
      t.working_hours,
      t.created_by,
      t.attachment,
      t.notes, -- 👈 AGGIUNTO QUI
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
  } else if (!isManager && division && !req.query.created_by) {
    whereClauses.push('t.division = $' + (params.length + 1));
    params.push(division);
  }

  // Filtro per search (titolo o descrizione o id)
  if (req.query.search) {
    const searchTerm = req.query.search.trim();
    const idSearch = parseInt(searchTerm.replace(/[^0-9]/g, ''), 10);

    if (!isNaN(idSearch)) {
      whereClauses.push(`(t.id = $${params.length + 1} OR t.title ILIKE $${params.length + 2} OR t.description ILIKE $${params.length + 3})`);
      params.push(idSearch, `%${searchTerm}%`, `%${searchTerm}%`);
    } else {
      whereClauses.push(`(t.title ILIKE $${params.length + 1} OR t.description ILIKE $${params.length + 2})`);
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }
  }

  // Filtro per assigned_to
  if (req.query.assigned_to) {
    whereClauses.push(`t.assigned_to = $${params.length + 1}`);
    params.push(req.query.assigned_to);
  }

  // Filtro per created_by
  if (req.query.created_by) {
    whereClauses.push(`t.created_by = $${params.length + 1}`);
    params.push(req.query.created_by);
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

// CREA nuovo ticket (con allegato, resize immagini e controllo dimensione documenti)
router.post('/', authMiddleware, upload.single('attachment'), async (req, res) => {
  const { title, description, division, client_id, project_id, assigned_to } = req.body;
  const created_by = req.user.username;
  let attachment = req.file ? req.file.filename : null;

  try {
    if (req.file) {
      const isImage = /\.(jpg|jpeg|png)$/i.test(req.file.originalname);
      const isDoc = /\.(pdf|doc|docx)$/i.test(req.file.originalname);

      // ✅ Se è immagine → ridimensiona
      if (isImage) {
        const inputPath = `uploads/${req.file.filename}`;
        const outputPath = `uploads/resized-${req.file.filename}`;
        await sharp(inputPath)
          .resize({ width: 1920, height: 1080, fit: 'inside' })
          .toFile(outputPath);

        // Elimina originale e salva il nome nuovo
        fs.unlinkSync(inputPath);
        attachment = `resized-${req.file.filename}`;
      }

      // 🚫 Se è documento > 8MB → rifiuta
      if (isDoc && req.file.size > 8 * 1024 * 1024) {
        fs.unlinkSync(req.file.path); // cancella il file
        return res.status(400).json({ error: 'I documenti possono pesare massimo 8MB' });
      }
    }

    // Fix: se project_id o client_id sono stringa vuota, passa null (evita errore integer)
    const projectIdValue = project_id === '' ? null : project_id;
    const clientIdValue = client_id === '' ? null : client_id;

    const result = await db.query(
      `INSERT INTO tickets 
      (title, description, division, client_id, project_id, assigned_to, created_by, attachment)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [title, description, division, clientIdValue, projectIdValue, assigned_to || null, created_by, attachment]
    );

    const newTicket = result.rows[0];

    // -> aggiungi queste righe per recuperare il nome
    const clientResult = await db.query('SELECT name FROM clients WHERE id = $1', [newTicket.client_id]);
    newTicket.client_name = clientResult.rows[0]?.name;

    // ora puoi mandare la notifica con client_name incluso
    if (newTicket.division === 'cloud') {
      sendTelegramNotification(newTicket);
    }

    res.status(201).json(newTicket);
  } catch (err) {
    console.error('Errore creazione ticket:', err);
    res.status(500).json({ error: 'Errore interno' });
  }
});

// ROTTA STATIC PER I FILE
router.use('/files', express.static('uploads'));

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

// PATCH /api/tickets/:id/status
router.patch('/:id/status', require('../middleware/authMiddleware'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const username = req.user.username;

  // Blocco manager fuori dalla propria divisione
  const ticketCheck = await db.query('SELECT division FROM tickets WHERE id = $1', [id]);
  const ticket = ticketCheck.rows[0];

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket non trovato' });
  }
  if (req.user.role === 'manager' && ticket.division !== req.user.division) {
    return res.status(403).json({ error: 'Non puoi modificare ticket di altre divisioni' });
  }

  try {
    if (status === 'in-progress') {
      // Leggi assigned_to attuale
      const { rows } = await db.query('SELECT assigned_to FROM tickets WHERE id = $1', [id]);
      if (!rows.length) return res.status(404).json({ error: 'Ticket non trovato' });

      let query, params;
      if (!rows[0].assigned_to) {
        // Se NON è già assegnato, assegnalo a chi ha fatto la richiesta
        query = `
          UPDATE tickets
          SET status = $1,
              assigned_to = $2,
              started_at = COALESCE(started_at, NOW())
          WHERE id = $3
          RETURNING *`;
        params = [status, username, id];
      } else {
        // Se già assegnato, solo cambia lo stato (e started_at)
        query = `
          UPDATE tickets
          SET status = $1,
              started_at = COALESCE(started_at, NOW())
          WHERE id = $2
          RETURNING *`;
        params = [status, id];
      }

      const result = await db.query(query, params);
      return res.json(result.rows[0]);
    } else if (status === 'closed') {
      const ticketRes = await db.query('SELECT started_at FROM tickets WHERE id = $1', [id]);
      const ticket = ticketRes.rows[0];

      if (!ticket || !ticket.started_at) {
        return res.status(400).json({ error: 'Ticket non avviato' });
      }

      const now = new Date();
      const startedAt = new Date(ticket.started_at);
      const workingHours = Math.floor((now - startedAt) / (1000 * 60 * 60));

      // ✅ Log utile per debug
      console.log('Chiudendo ticket ID:', id);
      console.log('started_at:', ticket.started_at);
      console.log('now:', now.toISOString());
      console.log('working_hours calcolate:', workingHours);

      const result = await db.query(
        `UPDATE tickets 
         SET status = $1,
             closed_at = $2,
             working_hours = $3
         WHERE id = $4
         RETURNING *`,
        [status, now, workingHours, id]
      );
      return res.json(result.rows[0]);
    } else {
      const result = await db.query(
        `UPDATE tickets
         SET status = $1
         WHERE id = $2
         RETURNING *`,
        [status, id]
      );
      return res.json(result.rows[0]);
    }
  } catch (err) {
    console.error('Errore aggiornamento stato ticket:', err);
    res.status(500).json({ error: 'Errore aggiornamento stato ticket' });
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

// Sostituisci la vecchia rotta export con questa versione che supporta il filtro division
router.get('/export', authMiddleware, async (req, res) => {
  const { division } = req.query;
  try {
    let query = `
      SELECT 
        t.id, t.title, t.description, t.division, t.assigned_to, t.status, 
        t.created_by, t.created_at, t.working_hours,
        p.name AS project_name,
        i.name AS infrastructure_name,
        c.name AS client_name
      FROM tickets t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN infrastructures i ON p.infrastructure_id = i.id
      LEFT JOIN clients c ON i.client_id = c.id
    `;

    const values = [];

    if (division) {
      query += ' WHERE t.division = $1';
      values.push(division);
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await db.query(query, values);

    const fields = [
      'id',
      'title',
      'description',
      'division',
      'assigned_to',
      'status',
      'created_by',
      'created_at',
      'working_hours',
      'project_name',
      'infrastructure_name',
      'client_name',
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(result.rows);

    res.header('Content-Type', 'text/csv');
    res.attachment(`tickets_${division || 'tutti'}.csv`);
    res.send(csv);
  } catch (err) {
    console.error('Errore CSV export:', err);
    res.status(500).json({ error: 'Errore nel download del CSV' });
  }
});

/**
 * PATCH /api/tickets/:id/start
 * Imposta lo stato a "in-progress" e salva l'orario di inizio
 */
router.patch('/:id/start', require('../middleware/authMiddleware'), async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const check = await db.query('SELECT division FROM tickets WHERE id = $1', [id]);
  const ticket = check.rows[0];

  if (!ticket) return res.status(404).json({ error: 'Ticket non trovato' });

  if (user.role === 'manager' && ticket.division !== user.division) {
    return res.status(403).json({ error: 'Non puoi avviare ticket di altre divisioni' });
  }

  try {
    const result = await db.query(
      `UPDATE tickets 
       SET status = 'in-progress', started_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Errore avvio ticket:', err);
    res.status(500).json({ error: 'Errore avvio ticket' });
  }
});

/**
 * PATCH /api/tickets/:id/pause
 * Imposta lo stato a "paused" (non modifica started_at)
 */
router.patch('/:id/pause', require('../middleware/authMiddleware'), async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const check = await db.query('SELECT division FROM tickets WHERE id = $1', [id]);
  const ticket = check.rows[0];

  if (!ticket) return res.status(404).json({ error: 'Ticket non trovato' });

  if (user.role === 'manager' && ticket.division !== user.division) {
    return res.status(403).json({ error: 'Non puoi mettere in pausa ticket di altre divisioni' });
  }

  try {
    const result = await db.query(
      `UPDATE tickets 
       SET status = 'paused' 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Errore pausa ticket:', err);
    res.status(500).json({ error: 'Errore pausa ticket' });
  }
});

/**
 * PATCH /api/tickets/:id/close
 * Imposta lo stato a "closed", salva l'orario di chiusura e calcola le ore
 */
router.patch('/:id/close', require('../middleware/authMiddleware'), async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const check = await db.query('SELECT division FROM tickets WHERE id = $1', [id]);
  const ticketCheck = check.rows[0];

  if (!ticketCheck) return res.status(404).json({ error: 'Ticket non trovato' });

  if (user.role === 'manager' && ticketCheck.division !== user.division) {
    return res.status(403).json({ error: 'Non puoi chiudere ticket di altre divisioni' });
  }

  try {
    const ticketRes = await db.query('SELECT started_at FROM tickets WHERE id = $1', [id]);
    const ticket = ticketRes.rows[0];

    if (!ticket || !ticket.started_at) {
      return res.status(400).json({ error: 'Ticket non avviato' });
    }

    const now = new Date();
    const startedAt = new Date(ticket.started_at);
    const workingHours = Math.floor((now - startedAt) / (1000 * 60 * 60)); // semplice

    const result = await db.query(
      `UPDATE tickets 
       SET status = 'closed', closed_at = $1, working_hours = $2 
       WHERE id = $3 
       RETURNING *`,
      [now, workingHours, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Errore chiusura ticket:', err);
    res.status(500).json({ error: 'Errore chiusura ticket' });
  }
});

/**
 * PATCH /api/tickets/:id/resume
 * Riporta il ticket in stato "in-progress" dopo una pausa
 */
router.patch('/:id/resume', require('../middleware/authMiddleware'), async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const check = await db.query('SELECT division FROM tickets WHERE id = $1', [id]);
  const ticket = check.rows[0];

  if (!ticket) return res.status(404).json({ error: 'Ticket non trovato' });

  if (user.role === 'manager' && ticket.division !== user.division) {
    return res.status(403).json({ error: 'Non puoi riprendere ticket di altre divisioni' });
  }

  try {
    const result = await db.query(
      `UPDATE tickets 
       SET status = 'in-progress'
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Errore ripresa ticket:', err);
    res.status(500).json({ error: 'Errore ripresa ticket' });
  }
});

// PATCH /api/tickets/:id/assign
router.patch('/:id/assign', require('../middleware/authMiddleware'), async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body;

  try {
    const result = await db.query(
      'UPDATE tickets SET assigned_to = $1 WHERE id = $2 RETURNING *',
      [assigned_to, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Errore durante la riassegnazione:', err);
    res.status(500).json({ error: 'Errore durante la riassegnazione' });
  }
});

// PATCH /api/tickets/:id/notes → Aggiunge o aggiorna le note
router.patch('/:id/notes', require('../middleware/authMiddleware'), async (req, res) => {
  const { id } = req.params;
  const { new_note } = req.body;

  try {
    // Recupera note attuali
    const result = await db.query('SELECT notes FROM tickets WHERE id = $1', [id]);
    const currentNotes = result.rows[0]?.notes || '';

    // Aggiungi nuova nota con timestamp e username
    const timestamp = new Date().toLocaleString('it-IT');
    const newEntry = `[${timestamp}] ${req.user.username}:\n${new_note}`;
    const updatedNotes = currentNotes ? `${currentNotes}\n\n${newEntry}` : newEntry;

    // Salva
    const update = await db.query(
      'UPDATE tickets SET notes = $1 WHERE id = $2 RETURNING *',
      [updatedNotes, id]
    );

    res.json(update.rows[0]); // 👈 restituisci tutto il ticket aggiornato
  } catch (err) {
    console.error('Errore aggiornamento note:', err);
    res.status(500).json({ error: 'Errore aggiornamento note' });
  }
});

// GET /api/tickets/stats
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const byStatus = await db.query(`
      SELECT status, COUNT(*) AS count
      FROM tickets
      GROUP BY status
    `);

    const byDivision = await db.query(`
      SELECT division, COUNT(*) AS count
      FROM tickets
      GROUP BY division
    `);

    res.json({
      byStatus: byStatus.rows,
      byDivision: byDivision.rows,
    });
  } catch (err) {
    console.error('Errore stats:', err);
    res.status(500).json({ error: 'Errore nel calcolo delle statistiche' });
  }
});

module.exports = router;