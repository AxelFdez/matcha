const pool = require('../config/connectBdd');

app.use(async (req, res, next) => {
    try {
        const client = await pool.connect(); // Vérifie la connexion
        client.release(); // Relâche la connexion
        next();
    } catch (err) {
        console.error('Erreur de connexion à la base de données :', err);
        res.status(500).send('Erreur de connexion à la base de données');
    }
});