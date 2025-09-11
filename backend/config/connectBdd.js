require('dotenv').config({ path: '../../.env' });
// Connexion a PostgreSQL
const { Pool } = require('pg');

const pool = new Pool({
	user: process.env.PGUSER,
  	host: process.env.PGHOST,
  	database: process.env.PGDATABASE,
  	password: process.env.PGPASSWORD,
  	port: process.env.PGPORT,
});


module.exports = pool;