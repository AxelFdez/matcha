require('dotenv').config();

const mongoose = require('mongoose');

// Connexion à MongoDB
async function connectBdd(){
	mongoose.connect(process.env.MONGODB_URI)
	.then(() => console.log('Connexion à MongoDB réussie !'))
	.catch((err) => console.log('Connexion à MongoDB échouée !', err));
}

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