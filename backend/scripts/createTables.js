const { Client } = require('pg');
require('dotenv').config();

// Fonction pour attendre que PostgreSQL soit prêt
const waitForPostgres = async (maxRetries = 30, delay = 2000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const client = new Client({
                host: process.env.PGHOST,
                user: process.env.PGUSER,
                password: process.env.PGPASSWORD,
                database: process.env.PGDATABASE,
                connectionTimeoutMillis: 5000,
            });

            await client.connect();
            await client.query('SELECT 1');
            await client.end();
            console.log('PostgreSQL is ready!');
            return true;
        } catch (err) {
            console.log(`Attempt ${i + 1}/${maxRetries}: Waiting for PostgreSQL... (${err.message})`);
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    throw new Error('PostgreSQL is not ready after maximum retries');
};

// Fonction pour créer la table users
const createUsersTable = async () => {
    const client = new Client({
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
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
        database: process.env.PGDATABASE,
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

        // Table pour les messages avec support des messages non lus
        const createMessagesTableQuery = `
            CREATE TABLE IF NOT EXISTS chat_messages (
                id SERIAL PRIMARY KEY,
                conversation_id INTEGER NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
                sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                message TEXT NOT NULL,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                read_at TIMESTAMP DEFAULT NULL
            );
        `;
        await client.query(createMessagesTableQuery);
        console.log("Table 'chat_messages' créée ou déjà existante.");

        // Ajouter la colonne read_at si elle n'existe pas déjà (pour les bases existantes)
        const addReadAtColumnQuery = `
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'chat_messages' AND column_name = 'read_at'
                ) THEN
                    ALTER TABLE chat_messages ADD COLUMN read_at TIMESTAMP DEFAULT NULL;
                    RAISE NOTICE 'Colonne read_at ajoutée à chat_messages';
                END IF;
            END $$;
        `;
        await client.query(addReadAtColumnQuery);
        console.log("Colonne 'read_at' vérifiée/ajoutée.");

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

        // Index pour optimiser les requêtes de messages non lus
        const createUnreadMessagesIndexQuery = `
            CREATE INDEX IF NOT EXISTS idx_messages_unread
            ON chat_messages(conversation_id, read_at)
            WHERE read_at IS NULL;
        `;
        await client.query(createUnreadMessagesIndexQuery);
        console.log("Index pour les messages non lus créé.");

    } catch (err) {
        console.error("Erreur lors de la création des tables de chat :", err);
    } finally {
        await client.end();
        console.log("Connexion fermée pour les tables de chat.");
    }
};

// Exécuter les fonctions
(async () => {
    try {
        console.log('Waiting for PostgreSQL to be ready...');
        await waitForPostgres();

        console.log('Creating database tables...');
        await createUsersTable();
        await createChatTables();

        console.log('Database initialization completed successfully!');
    } catch (err) {
        console.error('Database initialization failed:', err);
        process.exit(1);
    }
})();
