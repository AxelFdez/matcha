const { Pool } = require("pg");
const { faker } = require("@faker-js/faker");
const fs = require("fs").promises;
const path = require("path");
const cities = require("all-the-cities");
require("dotenv").config();

const USERS_PHOTOS_DIR = "photos/users_photos";

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

      await pool.query("SELECT 1");
      await pool.end();
      console.log("PostgreSQL is ready for seeding!");
      return true;
    } catch (err) {
      console.log(`Attempt ${i + 1}/${maxRetries}: Waiting for PostgreSQL... (${err.message})`);
      if (i < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw new Error("PostgreSQL is not ready after maximum retries");
};

// Configuration de la base de données
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

// Filtrer les villes pour ne garder que celles de taille moyenne/grande (> 50k habitants)
const largeCities = cities.filter((city) => city.population > 50000);

// Fonction pour obtenir une ville aléatoire
function getRandomCity() {
  const city = largeCities[Math.floor(Math.random() * largeCities.length)];
  return {
    name: city.name,
    country: city.country,
    coordinates: [city.loc.coordinates[0], city.loc.coordinates[1]], // [longitude, latitude]
  };
}

// Fonction pour lire les métadonnées
async function readMetadata(userFolder) {
  try {
    const metadataPath = path.join(userFolder, "metadata.txt");
    const content = await fs.readFile(metadataPath, "utf-8");

    const metadata = {};
    content.split("\n").forEach((line) => {
      const [key, value] = line.split(":").map((s) => s.trim());
      if (key && value) {
        metadata[key] = value;
      }
    });

    return metadata;
  } catch (err) {
    throw new Error(`Erreur lecture metadata: ${err.message}`);
  }
}

// Fonction pour convertir age_category en âge numérique
function getAgeFromCategory(category) {
  switch (category) {
    case "young":
      return faker.number.int({ min: 18, max: 30 });
    case "adult":
      return faker.number.int({ min: 31, max: 55 });
    case "old":
      return faker.number.int({ min: 56, max: 75 });
    default:
      return faker.number.int({ min: 18, max: 75 });
  }
}

// Fonction pour générer un utilisateur basé sur les métadonnées
function generateFakeUser(metadata, userFolder) {
  const gender = metadata.gender; // 'male' ou 'female'
  const age = getAgeFromCategory(metadata.age_category);

  // Générer un prénom et nom cohérent avec le genre
  const firstname =
    gender === "male" ? faker.person.firstName("male") : faker.person.firstName("female");
  const lastname = faker.person.lastName();

  // Construire les chemins des photos
  const photos = [
    path.join(userFolder, "base.jpg"),
    path.join(userFolder, "variant_1.jpg"),
    path.join(userFolder, "variant_2.jpg"),
    path.join(userFolder, "variant_3.jpg"),
    path.join(userFolder, "variant_4.jpg"),
  ];

  // Obtenir une ville aléatoire
  const city = getRandomCity();

  return {
    username: faker.internet.username({ firstName: firstname, lastName: lastname }),
    password: faker.internet.password(),
    firstname: firstname,
    lastname: lastname,
    email: faker.internet.email({ firstName: firstname, lastName: lastname }),
    gender: gender,
    sexualPreferences: faker.person.sex(),
    biography: faker.lorem.sentence(),
    lastconnection: faker.date.recent(),
    age: age,
    interests: [faker.hacker.noun(), faker.music.genre()],
    photos: photos,
    reported: 0,
    profilePicture: faker.number.int({ min: 0, max: 4 }),
    fameRating: faker.number.int({ min: 0, max: 1000 }),
    location: {
      authorization: faker.datatype.boolean(),
      manualMode: false,
      type: "Point",
      coordinates: city.coordinates,
    },
    verified: true,
    ready: true,
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
      user.username,
      user.password,
      user.firstname,
      user.lastname,
      user.email,
      user.gender,
      user.sexualPreferences,
      user.biography,
      user.lastconnection,
      user.age,
      user.interests,
      user.photos,
      user.profilePicture,
      user.fameRating,
      user.reported,
      JSON.stringify(user.location),
      user.verified,
      user.ready,
    ];
    const result = await pool.query(query, values);
    if (!result.rows.length) {
      throw new Error("Insertion échouée");
    }
    return result.rows[0].id;
  } catch (err) {
    throw err;
  }
}

// Fonction pour récupérer tous les dossiers utilisateurs
async function getUserFolders() {
  try {
    const entries = await fs.readdir(USERS_PHOTOS_DIR, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory() && entry.name.startsWith("user_"))
      .map((entry) => path.join(USERS_PHOTOS_DIR, entry.name))
      .sort(); // Trier pour avoir user_000, user_001, etc.
  } catch (err) {
    throw new Error(`Erreur lecture dossier: ${err.message}`);
  }
}

// Fonction principale
(async function () {
  try {
    console.log("Waiting for PostgreSQL to be ready for seeding...");
    await waitForPostgres();

    console.log("\n🔍 Recherche des utilisateurs avec photos...");
    const userFolders = await getUserFolders();
    console.log(`✅ ${userFolders.length} utilisateurs trouvés`);
    console.log(`🌍 Base de données: ${largeCities.length} villes disponibles\n`);

    console.log("📝 Insertion des utilisateurs...\n");

    let successCount = 0;
    let errorCount = 0;

    for (const userFolder of userFolders) {
      try {
        // Lire les métadonnées
        const metadata = await readMetadata(userFolder);

        // Générer l'utilisateur basé sur les métadonnées
        const user = generateFakeUser(metadata, userFolder);

        // Insérer en base de données
        const userId = await insertUser(user);

        successCount++;
        const folderName = path.basename(userFolder);
        console.log(
          `✅ [${successCount}/${userFolders.length}] ${folderName} - ${user.firstname} ${user.lastname} (${user.gender}, ${user.age} ans) - ID: ${userId}`
        );
      } catch (err) {
        errorCount++;
        // console.error(`❌ Erreur pour ${path.basename(userFolder)}: ${err.message}`);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSULTAT FINAL");
    console.log("=".repeat(60));
    console.log(`✅ Succès: ${successCount} utilisateurs`);
    console.log(`❌ Erreurs: ${errorCount} utilisateurs`);
    console.log("=".repeat(60));
  } catch (err) {
    // console.error('❌ Erreur critique:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
