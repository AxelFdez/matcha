const { Pool } = require('pg');
const { faker } = require('@faker-js/faker');
require('dotenv').config();

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
    console.log(`Utilisateur inséré avec ID : ${result.rows[0].id}`);
  } catch (err) {
    console.error('Erreur lors de l\'insertion de l\'utilisateur :', err.message);
  }
}

// Fonction principale
(async function () {
  try {
    console.log('Insertion des utilisateurs...');
    const fakeUsers = Array.from({ length: 500 }, generateFakeUser);
    for (const user of fakeUsers) {
      await insertUser(user);
    }
    console.log('Tous les utilisateurs ont été insérés avec succès.');
  } catch (err) {
    console.error('Erreur lors de l\'insertion :', err.message);
  } finally {
    await pool.end(); // Fermer le pool de connexions
  }
})();
