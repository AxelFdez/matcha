const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

const USERS_TO_CREATE = 500;

// Fonction pour attendre que PostgreSQL soit prêt
const waitForPostgres = async (maxRetries = 30, delay = 2000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const pool = new Pool({
                host: process.env.PGHOST,
                user: process.env.PGUSER,
                password: process.env.PGPASSWORD,
                database: process.env.PGDATABASE,
                connectionTimeoutMillis: 5000,
            });
            
            await pool.query('SELECT 1');
            await pool.end();
            console.log('PostgreSQL is ready for seeding!');
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

// Configuration de la base de données
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

function generateFakeUser() {
  return {
    username: faker.internet.username(),
    password: faker.internet.password(),
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    email: faker.internet.email(),
    gender: faker.person.sex(), // "male" ou "female"
    sexualPreferences: faker.person.sex(),
    biography: faker.lorem.sentence(),
    lastconnection: faker.date.recent(),
    age: faker.number.int({ min: 18, max: 99 }),
    interests: [faker.hacker.noun(), faker.music.genre()],
    photos: [null, null, null, null, null],
    profilePicture: faker.number.int({ min: 0, max: 4 }),
    fameRating: faker.number.int({ min: 0, max: 1000 }),
    location: {
      authorization: faker.datatype.boolean(),
      type: 'Point',
      coordinates: [faker.location.longitude(), faker.location.latitude()]
    },
    verified: true,
    ready : true
  };
}


// Fonction pour insérer un utilisateur
async function insertUser(user) {
  try {
    const query = `
      INSERT INTO users (
        username, password, firstname, lastname, email, gender, sexualPreferences,
        biography, lastconnection, age, interests, photos, profilePicture, fameRating, reported, location, verified, ready
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      )
      RETURNING id;
    `;
    const values = [
      user.username, user.password, user.firstname, user.lastname, user.email, user.gender,
      user.sexualPreferences, user.biography, user.lastconnnection, user.age, user.interests, user.photos,
      user.profilePicture, user.fameRating, user.reported, JSON.stringify(user.location),
      user.verified, user.ready
    ];
    const result = await pool.query(query, values);
    if (!result.rows.length) {
      throw new Error('Insertion échouée');
    }
  } catch (err) {
    throw err;
  }
}

// Fonction principale
(async function () {
  try {
    console.log('Waiting for PostgreSQL to be ready for seeding...');
    await waitForPostgres();
    
    console.log('Insertion des utilisateurs...');
    const fakeUsers = Array.from({ length: USERS_TO_CREATE }, generateFakeUser);
    for (const user of fakeUsers) {
      await insertUser(user);
    }
    console.log(`${USERS_TO_CREATE} utilisateurs ont été insérés avec succès.`);
  } catch (err) {
    console.error('Erreur lors de l\'insertion :', err.message);
    process.exit(1);
  } finally {
    await pool.end(); // Fermer le pool de connexions
  }
})();
