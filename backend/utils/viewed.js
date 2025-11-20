const pool = require("../config/connectBdd");
const WebSocket = require("ws");

async function viewedUser(userId, message) {
  const { clients } = require("./websockets");
  const ws = clients.get(userId.toString());

  // console.log("viewedUser called with userId:", userId, "message:", message);

  try {
    // 🔹 Récupérer l'utilisateur qui regarde
    const userRes = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [
      message.user,
    ]);
    const user = userRes.rows[0];
    if (!user) {
      // console.warn("Viewer not found in DB:", message.user);
      return;
    }

    // 🔹 Récupérer l'utilisateur regardé
    const userViewedRes = await pool.query(
      "SELECT * FROM users WHERE LOWER(username) = LOWER($1)",
      [message.userViewed]
    );
    const userViewed = userViewedRes.rows[0];
    if (!userViewed) {
      // console.warn("Viewed user not found in DB:", message.userviewed);
      return;
    }

    // 🔹 Check if either user has blocked the other
    const userBlacklist = user.blacklist || [];
    const userViewedBlacklist = userViewed.blacklist || [];

    if (
      userBlacklist.includes(userViewed.id.toString()) ||
      userViewedBlacklist.includes(user.id.toString())
    ) {
      // console.log(`View notification blocked: ${user.username} or ${userViewed.username} has blocked the other`);
      return; // Don't generate notification or update viewedby for blocked users
    }

    // 🔹 Ajouter user.id à viewedby de façon atomique si pas déjà présent
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

    if (updateViewedRes.rows.length === 0) {
      // console.log(`${user.username} already viewed ${userViewed.username}`);
    } else {
      // console.log("Updated viewedby:", updateViewedRes.rows[0].viewedby);

      // 🔹 Mettre à jour fameRating
      const newFameRating = (userViewed.famerating || 0) + 2;
      await pool.query("UPDATE users SET famerating = $1 WHERE id = $2", [
        newFameRating,
        userViewed.id,
      ]);

      // 🔹 Ajouter notification JSONB
      const notification = {
        title: "viewed",
        body: `${user.username} viewed your profile`,
      };
      await pool.query(
        "UPDATE users SET notifications = array_append(notifications, $1) WHERE id = $2",
        [notification, userViewed.id]
      );

      // 🔹 Envoyer notification WebSocket si l'autre utilisateur est en ligne
      const wsViewed = clients.get(userViewed.id.toString());
      if (wsViewed && wsViewed.readyState === WebSocket.OPEN) {
        wsViewed.send(JSON.stringify({ type: "notification", message: notification }));
      }
    }

    // 🔹 Confirmer au viewer
    // ws.send(JSON.stringify({ type: "success", userId, message: { title: "viewed" } }));
  } catch (error) {
    // console.error("Error in viewedUser:", error);
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
