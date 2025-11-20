const pool = require("../config/connectBdd");

async function logoutUser(req, res) {
  try {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    if (user.rows.empty) {
      return res.status(404).json({ message: "User not found" });
    }
    user.rows[0].connected = false;
    user.rows[0].refreshToken = "None";
    await pool.query("UPDATE users SET connected = $1, refreshToken = $2 WHERE id = $3", [
      user.rows[0].connected,
      user.rows[0].refreshtoken,
      req.user.id,
    ]);
    res.status(200).json({ message: "User disconnected" });
  } catch (error) {
    // console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = logoutUser;
