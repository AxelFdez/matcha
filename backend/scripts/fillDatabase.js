const { Pool } = require('pg');

// Configuration de la base de données
const pool = new Pool({
  user: 'myuser',       // Remplace par ton utilisateur PostgreSQL
  host: 'localhost',       // Adresse de la base de données
  database: 'mydatabase', // Nom de la base de données
  password: 'mypassword', // Mot de passe PostgreSQL
  port: 5432,              // Port par défaut de PostgreSQL
});

// Les données des utilisateurs à insérer
const users = [
  {
    username: 'john_doe',
    password: 'password123',
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    gender: 'Male',
    sexualPreferences: 'Female',
    biography: 'Just a simple guy.',
    age: 30,
    interests: ['#music', '#travel'],
    photos: [null, null, null, null, null],
    profilePicture: 0,
    fameRating: 10,
    reported: 0,
    location: { authorization: true, type: 'Point', coordinates: [48.8566, 2.3522] }, // Paris
  },
  {
    username: 'jane_smith',
    password: 'password456',
    firstname: 'Jane',
    lastname: 'Smith',
    email: 'jane.smith@example.com',
    gender: 'Female',
    sexualPreferences: 'Male',
    biography: 'Love hiking and coding.',
    age: 28,
    interests: ['#hiking', '#coding'],
    photos: [null, null, null, null, null],
    profilePicture: 1,
    fameRating: 20,
    reported: 0,
    location: { authorization: true, type: 'Point', coordinates: [34.0522, -118.2437] }, // Los Angeles
  },
  // Ajoute d'autres utilisateurs ici
];

// Fonction pour insérer un utilisateur
async function insertUser(user) {
  try {
    const query = `
      INSERT INTO users (
        username, password, firstname, lastname, email, gender, sexualPreferences,
        biography, age, interests, photos, profilePicture, fameRating, reported, location
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14, $15
      )
      RETURNING id;
    `;
    const values = [
      user.username, user.password, user.firstname, user.lastname, user.email, user.gender,
      user.sexualPreferences, user.biography, user.age, user.interests, user.photos,
      user.profilePicture, user.fameRating, user.reported, JSON.stringify(user.location),
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
    for (const user of users) {
      await insertUser(user);
    }
    console.log('Tous les utilisateurs ont été insérés avec succès.');
  } catch (err) {
    console.error('Erreur lors de l\'insertion :', err.message);
  } finally {
    await pool.end(); // Fermer le pool de connexions
  }
})();
