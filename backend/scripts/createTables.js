const { Client } = require('pg');
require('dotenv').config();


// Configuration de la base de données
const client = new Client({
    host: 'localhost',
    user: 'myuser',
    password: 'mypassword',
    database: 'mydatabase',
    // user: 'postgres',
    // password: 'mysecretpassword',
    // database: 'postgres',
    port: 5432, // Port par défaut de PostgreSQL
});

(async () => {
    try {
        await client.connect();
        console.log("Connexion à la base de données réussie.");

        // Création de la table "users"
        const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        firstname VARCHAR(255) NOT NULL,
        lastname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        verified BOOLEAN DEFAULT false,
        ready BOOLEAN DEFAULT false,
        refreshToken VARCHAR(255) DEFAULT 'None',
        connected BOOLEAN DEFAULT false,
        lastConnection TIMESTAMP DEFAULT NULL,
        gender VARCHAR(50) DEFAULT 'None',
        sexualPreferences VARCHAR(50) DEFAULT 'None',
        biography TEXT DEFAULT 'bio here',
        age INTEGER DEFAULT NULL,
        interests TEXT[] DEFAULT '{}', -- Tableau de chaînes de caractères
        photos TEXT[] DEFAULT '{}',
        profilePicture INTEGER DEFAULT 0,
        fameRating INTEGER DEFAULT 0,
        reported INTEGER DEFAULT 0,
        location JSONB DEFAULT '{"authorization": false, "type": "Point", "coordinates": [0, 0]}',
        blackList text[], -- Tableau d'IDs d'utilisateurs
        viewedBy text[],
        likedBy text[],
        matcha text[],
        notifications JSONB[],
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

        // Exécuter la requête pour créer la table
        await client.query(createUsersTable);
        console.log("Table 'users' créée ou déjà existante.");

        // Index pour les requêtes géographiques (location)
        const createIndex = `
      CREATE INDEX IF NOT EXISTS location_idx ON users USING GIN (location);
    `;
        await client.query(createIndex);
        console.log("Index pour 'location' créé.");

    } catch (err) {
        console.error("Erreur lors de la configuration de la base de données :", err);
    } finally {
        await client.end();
        console.log("Connexion fermée.");
    }
})();
