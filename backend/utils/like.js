const WebSocket = require("ws");
const pool = require("../config/connectBdd");
const { createConversation } = require("./createConversation");
const { addNotification } = require("./notifications"); // helper centralisé

async function likeUser(userId, message) {
  const { clients } = require("./websockets");
  const username = message.user;
  const userLikedM = message.userLiked;
  const ws = clients.get(userId);

  if (!ws) return;

  if (!username || !userLikedM || username === userLikedM) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "Invalid data" } }));
    return;
  }

  // Récupérer l'utilisateur courant
  let userRes = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [username]);
  const user = userRes.rows[0];
  if (!user) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "User not found" } }));
    return;
  }

  // Récupérer l'utilisateur liké
  let likedRes = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [userLikedM]);
  const userLiked = likedRes.rows[0];
  if (!userLiked) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "User liked not found" } }));
    return;
  }

  // Vérifier les blocages
  const userBlacklist = user.blacklist || [];
  const likedBlacklist = userLiked.blacklist || [];
  if (userBlacklist.includes(userLiked.id.toString()) || likedBlacklist.includes(user.id.toString())) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "Cannot like blocked user" } }));
    return;
  }

  // Vérifier si déjà liké
  if (userLiked.likedby?.includes(user.id.toString())) {
    ws.send(JSON.stringify({ type: "error", userId, message: { title: "Already liked" } }));
    return;
  }

  // Ajouter à likedby
  await pool.query("UPDATE users SET likedby = array_append(likedby, $1) WHERE id = $2", [
    user.id,
    userLiked.id,
  ]);

  // Ajouter notification centralisée
  const notification = await addNotification(userLiked.id, {
    type: "like",
    title: "Like",
    body: `${user.username} liked you`,
    fromUser: user.username,
  });

  // Envoyer WS notification
  const ws2 = clients.get(userLiked.id.toString());
  if (ws2 && ws2.readyState === WebSocket.OPEN) {
    ws2.send(JSON.stringify({ type: "notification", message: notification }));
  }

  // Mettre à jour famerating
  userLiked.famerating += 10;
  await pool.query("UPDATE users SET famerating = $1 WHERE id = $2", [userLiked.famerating, userLiked.id]);

  // Confirmer à l'utilisateur qui like
  ws.send(JSON.stringify({ type: "success", userId, message: { title: "Like sent" } }));

  // Vérifier si c'est un match
  const userLikedbyRes = await pool.query("SELECT likedby FROM users WHERE id = $1", [user.id]);
  const userLikedby = userLikedbyRes.rows[0]?.likedby || [];
  if (!userLikedby.includes(userLiked.id.toString())) return;

  // Ajouter match et notifications centralisées
  await pool.query("UPDATE users SET matcha = array_append(matcha, $1) WHERE id = $2", [userLiked.id, user.id]);
  await pool.query("UPDATE users SET matcha = array_append(matcha, $1) WHERE id = $2", [user.id, userLiked.id]);

  const notif1 = await addNotification(user.id, { type: "match", title: "Match!", body: `${userLiked.username} matched with you`, fromUser: userLiked.username });
  const notif2 = await addNotification(userLiked.id, { type: "match", title: "Match!", body: `${user.username} matched with you`, fromUser: user.username });

  // Envoyer WS notifications match
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "notification", message: notif1 }));
  if (ws2 && ws2.readyState === WebSocket.OPEN) ws2.send(JSON.stringify({ type: "notification", message: notif2 }));

  // Mise à jour famerating pour le match
  user.famerating += 50;
  userLiked.famerating += 50;
  await pool.query("UPDATE users SET famerating = $1 WHERE id = $2", [user.famerating, user.id]);
  await pool.query("UPDATE users SET famerating = $1 WHERE id = $2", [userLiked.famerating, userLiked.id]);

  // Créer conversation si match
  try {
    await createConversation(user.id, userLiked.id);
  } catch (err) {
    console.error("Failed to create conversation on match:", err);
  }

  // Confirmer match côté WS
  ws.send(JSON.stringify({ type: "matcha", userId, message: { title: "matcha" } }));
}

module.exports = likeUser;
