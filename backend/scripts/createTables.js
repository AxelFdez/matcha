const { Client } = require('pg');
require('dotenv').config();

const dbName = process.env.PGDATABASE;

// Connexion sans base spécifique pour créer la base si elle n'existe pas
const createDatabase = async () => {
    const client = new Client({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        port: 5432, // Port PostgreSQL
        database: 'template1' // Connexion à la base système par défaut
    });

    try {
        await client.connect();
        console.log("Connexion réussie à PostgreSQL.");

        // Vérifier si la base existe déjà
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
        if (res.rowCount === 0) {
            await client.query(`CREATE DATABASE ${dbName}`);
            console.log(`Base de données '${dbName}' créée.`);
        } else {
            console.log(`La base de données '${dbName}' existe déjà.`);
        }
    } catch (err) {
        console.error("Erreur lors de la création de la base de données :", err);
    } finally {
        await client.end();
    }
};

// Fonction pour créer la table users
const createUsersTable = async () => {
    const client = new Client({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: dbName,
        port: 5432,
    });

    try {
        await client.connect();
        console.log("Connexion à la base de données réussie.");

        const createTableQuery = `
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
                interests TEXT[] DEFAULT '{}',
                photos TEXT[] DEFAULT '{}',
                profilePicture INTEGER DEFAULT 0,
                fameRating INTEGER DEFAULT 0,
                reported INTEGER DEFAULT 0,
                location JSONB DEFAULT '{"authorization": false, "type": "Point", "coordinates": [0, 0]}',
                blackList TEXT[],
                viewedBy TEXT[],
                likedBy TEXT[],
                matcha TEXT[],
                ignoredBy TEXT[],
                notifications JSONB[],
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createTableQuery);
        console.log("Table 'users' créée ou déjà existante.");

        // Création de l'index pour les requêtes géographiques
        const createIndexQuery = `CREATE INDEX IF NOT EXISTS location_idx ON users USING GIN (location);`;
        await client.query(createIndexQuery);
        console.log("Index pour 'location' créé.");

    } catch (err) {
        console.error("Erreur lors de la configuration de la base de données :", err);
    } finally {
        await client.end();
        console.log("Connexion fermée.");
    }
};

// Fonction pour créer les tables de chat
const createChatTables = async () => {
    const client = new Client({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: dbName,
        port: 5432,
    });

    try {
        await client.connect();
        console.log("Connexion à la base de données réussie pour les tables de chat.");

        // Table pour les conversations
        const createConversationsTableQuery = `
            CREATE TABLE IF NOT EXISTS chat_conversations (
                id SERIAL PRIMARY KEY,
                user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user1_id, user2_id),
                CHECK (user1_id < user2_id)
            );
        `;
        await client.query(createConversationsTableQuery);
        console.log("Table 'chat_conversations' créée ou déjà existante.");

        // Table pour les messages
        const createMessagesTableQuery = `
            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
                sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await client.query(createMessagesTableQuery);
        console.log("Table 'chat_messages' créée ou déjà existante.");

        // Index pour optimiser les requêtes de conversation
        const createConversationIndexQuery = `
            CREATE INDEX IF NOT EXISTS idx_conversations_users 
            ON chat_conversations(user1_id, user2_id);
        `;
        await client.query(createConversationIndexQuery);
        console.log("Index pour les conversations créé.");

        // Index pour optimiser les requêtes de messages
        const createMessagesIndexQuery = `
            CREATE INDEX IF NOT EXISTS idx_messages_conversation_sent 
            ON chat_messages(conversation_id, sent_at DESC);
        `;
        await client.query(createMessagesIndexQuery);
        console.log("Index pour les messages créé.");

    } catch (err) {
        console.error("Erreur lors de la création des tables de chat :", err);
    } finally {
        await client.end();
        console.log("Connexion fermée pour les tables de chat.");
    }
};

// Exécuter les fonctions
(async () => {
    // await createDatabase();
    await createUsersTable();
    await createChatTables();
})();
