const WebSocket = require("ws");
const pool = require("../config/connectBdd");

async function unlike(userId, message) {
  // console.log("unlikeUser");
  // const { clients } = require("./websockets");
  // const username = message.user;
  // const userUnlikedM = message.userUnliked;
  // const ws = clients.get(userId);
  // if (!ws) return;
  // if (!message.user || !message.userUnliked || message.user === message.userUnliked) {
  //   ws.send(
  //     JSON.stringify({
  //       type: "error",
  //       userId,
  //       message: { title: "errors in data sent" },
  //     })
  //   );
  //   return;
  // }
  // let user = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
  // user = user.rows[0];
  // if (!user) {
  //   ws.send(
  //     JSON.stringify({
  //       type: "error",
  //       userId,
  //       message: { title: "user not found" },
  //     })
  //   );
  //   return;
  // }
  // let userUnliked = await pool.query("SELECT * FROM users WHERE username = $1", [userUnlikedM]);
  // userUnliked = userUnliked.rows[0];
  // if (!userUnliked) {
  //   ws.send(
  //     JSON.stringify({
  //       type: "error",
  //       userId,
  //       message: { title: "userUnliked not found" },
  //     })
  //   );
  //   return;
  // }
  // if (!userUnliked.likedby || !userUnliked.likedby.includes(user.id.toString())) {
  //   ws.send(
  //     JSON.stringify({
  //       type: "error",
  //       userId,
  //       message: { title: "user was not liked" },
  //     })
  //   );
  //   return;
  // }
  // // Retirer le like
  // await pool.query("UPDATE users SET likedby = array_remove(likedby, $1) WHERE id = $2", [
  //   user.id,
  //   userUnliked.id,
  // ]);
  // // Ajuster famerating
  // userUnliked.famerating = Math.max(0, (userUnliked.famerating || 0) - 10);
  // await pool.query("UPDATE users SET famerating = $1 WHERE id = $2", [
  //   userUnliked.famerating,
  //   userUnliked.id,
  // ]);
  // // Ajouter notification
  // await pool.query(
  //   `UPDATE users
  //    SET notifications = notifications || $1::jsonb
  //    WHERE id = $2`,
  //   [
  //     JSON.stringify({
  //       title: "unlike",
  //       body: `${user.username} unliked you`,
  //       createdAt: new Date(),
  //       viewed: false,
  //     }),
  //     userUnliked.id,
  //   ]
  // );
  // // Envoyer notification via WebSocket
  // const ws2 = clients.get(userUnliked.id.toString());
  // if (ws2 && ws2.readyState === WebSocket.OPEN) {
  //   ws2.send(
  //     JSON.stringify({
  //       type: "notification",
  //       message: { title: "unlike", user: user.username },
  //     })
  //   );
  // }
  // ws.send(
  //   JSON.stringify({
  //     type: "success",
  //     userId,
  //     message: { title: "unlike" },
  //   })
  // );
  // // Supprimer match si existant
  // let userMatcha = await pool.query("SELECT matcha FROM users WHERE id = $1", [user.id]);
  // userMatcha = userMatcha.rows[0].matcha || [];
  // const isMatch = userMatcha.includes(userUnliked.id);
  // if (isMatch) {
  //   // Retirer match pour les deux utilisateurs
  //   await pool.query(
  //     "UPDATE users SET matcha = array_remove(matcha, $1), famerating = GREATEST(famerating - 50, 0), notifications = array_append(notifications, $2) WHERE id = $3",
  //     [
  //       userUnliked.id,
  //       { title: "unmatch", body: `${userUnliked.username} unmatched with you` },
  //       user.id,
  //     ]
  //   );
  //   await pool.query(
  //     "UPDATE users SET matcha = array_remove(matcha, $1), famerating = GREATEST(famerating - 50, 0), notifications = array_append(notifications, $2) WHERE id = $3",
  //     [user.id, { title: "unmatch", body: `${user.username} unmatched with you` }, userUnliked.id]
  //   );
  //   // Envoyer notifications unmatch
  //   if (ws && ws.readyState === WebSocket.OPEN) {
  //     ws.send(
  //       JSON.stringify({
  //         type: "notification",
  //         message: { title: "unmatch", user: userUnliked.username },
  //       })
  //     );
  //   }
  //   if (ws2 && ws2.readyState === WebSocket.OPEN) {
  //     ws2.send(
  //       JSON.stringify({ type: "notification", message: { title: "unmatch", user: user.username } })
  //     );
  //   }
  // }
}

module.exports = unlike;
