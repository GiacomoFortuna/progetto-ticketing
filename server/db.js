const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'ticketing_db',
  password: 'Fccinisello10!',
  port: 5432,
});

module.exports = pool;
// Questo modulo esporta un'istanza di Pool di pg per gestire le connessioni al database PostgreSQL.