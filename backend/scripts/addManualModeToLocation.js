const pool = require("../config/connectBdd");

async function addManualModeToLocation() {
  try {
    console.log("🚀 Starting migration: Adding manualMode to location field...");

    // Récupérer tous les utilisateurs avec leur location
    const usersResult = await pool.query("SELECT id, username, location FROM users");
    const users = usersResult.rows;

    console.log(`📊 Found ${users.length} users in database`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Si location est null, on skip
        if (!user.location) {
          console.log(`⏭️  Skipping user ${user.username} (ID: ${user.id}) - No location data`);
          skippedCount++;
          continue;
        }

        // Parser le JSON location
        let locationData;
        if (typeof user.location === "string") {
          locationData = JSON.parse(user.location);
        } else {
          locationData = user.location;
        }

        // Vérifier si manualMode existe déjà
        if (locationData.hasOwnProperty("manualMode")) {
          console.log(`⏭️  Skipping user ${user.username} (ID: ${user.id}) - manualMode already exists`);
          skippedCount++;
          continue;
        }

        // Ajouter manualMode: false
        locationData.manualMode = false;

        // Mettre à jour l'utilisateur
        await pool.query(
          "UPDATE users SET location = $1 WHERE id = $2",
          [JSON.stringify(locationData), user.id]
        );

        console.log(`✅ Updated user ${user.username} (ID: ${user.id})`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Error updating user ${user.username} (ID: ${user.id}):`, error.message);
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📈 Migration Summary:");
    console.log("=".repeat(50));
    console.log(`✅ Updated: ${updatedCount} users`);
    console.log(`⏭️  Skipped: ${skippedCount} users`);
    console.log(`❌ Errors: ${errorCount} users`);
    console.log(`📊 Total processed: ${users.length} users`);
    console.log("=".repeat(50));

    if (updatedCount > 0) {
      console.log("\n🎉 Migration completed successfully!");
    } else {
      console.log("\n⚠️  No users were updated. All users already have manualMode or no location data.");
    }

    // Afficher un exemple de location mise à jour
    if (updatedCount > 0) {
      const sampleUser = await pool.query(
        "SELECT username, location FROM users WHERE location IS NOT NULL LIMIT 1"
      );
      if (sampleUser.rows.length > 0) {
        console.log("\n📝 Sample location data after migration:");
        console.log(`User: ${sampleUser.rows[0].username}`);
        const locationData = typeof sampleUser.rows[0].location === 'string'
          ? JSON.parse(sampleUser.rows[0].location)
          : sampleUser.rows[0].location;
        console.log(`Location: ${JSON.stringify(locationData, null, 2)}`);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("💥 Fatal error during migration:", error);
    process.exit(1);
  }
}

// Exécuter la migration
addManualModeToLocation();
