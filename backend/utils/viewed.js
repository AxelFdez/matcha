// ws/viewedUser.js
const pool = require("../config/connectBdd");
const WebSocket = require("ws");
const { addNotification } = require("./notifications");

async function viewedUser(userId, message) {
  const { clients } = require("./websockets");
  const ws = clients.get(userId.toString());

  if (!ws) return;

  try {
    const username = message.user;
    const userViewedName = message.userViewed;

    // Vérification des données
    if (!username || !userViewedName || username === userViewedName) return;

    // 🔹 Récupérer l'utilisateur qui regarde
    let userRes = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [
      username,
    ]);
    const user = userRes.rows[0];
    if (!user) return;

    // 🔹 Récupérer l'utilisateur regardé
    let userViewedRes = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [
      userViewedName,
    ]);
    const userViewed = userViewedRes.rows[0];
    if (!userViewed) return;

    // 🔹 Vérifier le blocage
    const userBlacklist = user.blacklist || [];
    const userViewedBlacklist = userViewed.blacklist || [];
    if (
      userBlacklist.includes(userViewed.id.toString()) ||
      userViewedBlacklist.includes(user.id.toString())
    )
      return;

    // 🔹 Ajouter user.id à viewedby si pas déjà présent
    const updateViewedRes = await pool.query(
      `UPDATE users
       SET viewedby = CASE
         WHEN viewedby IS NULL THEN ARRAY[$1]
         ELSE array_append(viewedby, $1)
       END
       WHERE id = $2 AND NOT ($1 = ANY(COALESCE(viewedby, '{}')))
       RETURNING viewedby`,
      [user.id.toString(), userViewed.id]
    );

    if (updateViewedRes.rows.length === 0) return; // déjà vu

    // 🔹 Mettre à jour fameRating
    const newFameRating = (userViewed.famerating || 0) + 2;
    await pool.query("UPDATE users SET famerating = $1 WHERE id = $2", [
      newFameRating,
      userViewed.id,
    ]);

    // 🔹 Ajouter notification via utilitaire
    const notification = await addNotification(userViewed.id, {
      type: "viewed",
      title: "Profile Viewed",
      body: `${user.username} viewed your profile`,
      fromUser: user.username,
    });

    // 🔹 Envoyer notification WebSocket
    const wsViewed = clients.get(userViewed.id.toString());
    if (wsViewed && wsViewed.readyState === WebSocket.OPEN) {
      wsViewed.send(JSON.stringify({ type: "notification", message: notification }));
    }
  } catch (error) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "error",
          userId,
          message: { title: "server error", error: error.message },
        })
      );
    }
  }
}

module.exports = viewedUser;
