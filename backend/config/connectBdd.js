require('dotenv').config({ path: '../../.env' });
// Connexion a PostgreSQL
const { Pool } = require('pg');

// console.log('DB HOST:', process.env.PGHOST);
// console.log('DB PORT:', process.env.PGPORT);
// console.log('DB USER:', process.env.PGUSER);
// console.log('DB NAME:', process.env.PGDATABASE);
// console.log('DB PASSWORD:', process.env.PGPASSWORD);


const pool = new Pool({
	user: process.env.PGUSER,
  	host: process.env.PGHOST,
  	database: process.env.PGDATABASE,
  	password: process.env.PGPASSWORD,
  	port: process.env.PGPORT,
});


module.exports = pool;
