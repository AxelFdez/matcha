const WebSocket = require("ws");
const pool = require("../config/connectBdd");

async function ignoreUser(userId, message) {
  const { clients } = require("./websockets");
  const username = message.user;
  const userIgnoredM = message.userIgnored;
  const ws = clients.get(userId);

  if (!ws) {
    return;
  } else if (!message.user || !message.userIgnored || message.user === message.userIgnored) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId: userId,
        message: {
          title: "errors in data sent",
        },
      })
    );
    return;
  }

  let user = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [username]);
  user = user["rows"][0];

  if (!user) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId: userId,
        message: {
          title: "user not found",
        },
      })
    );
    return;
  }

  let userIgnored = await pool.query("SELECT * FROM users WHERE LOWER(username) = LOWER($1)", [userIgnoredM]);
  userIgnored = userIgnored["rows"][0];

  if (!userIgnored) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId: userId,
        message: {
          title: "userIgnored not found",
        },
      })
    );
    return;
  } else if (userIgnored.ignoreby && userIgnored.ignoreby.includes(user.id.toString())) {
    ws.send(
      JSON.stringify({
        type: "error",
        userId: userId,
        message: {
          title: "user already ignored",
        },
      })
    );
    return;
  } else {
    // Ajouter à ignoredby
    await pool.query("UPDATE users SET ignoredby = array_append(ignoredby, $1) WHERE id = $2", [
      user.id,
      userIgnored.id,
    ]);

    // Ajouter notification
    const notification = {
      title: "unlike",
      body: `${user.username} unlike you`,
    };
    await pool.query(
      "UPDATE users SET notifications = array_append(notifications, $1) WHERE id = $2",
      [notification, userIgnored.id]
    );

    // Envoyer notification si l'autre utilisateur est en ligne
    const ws2 = clients.get(userIgnored.id.toString());
    if (ws2 && ws2.readyState === WebSocket.OPEN) {
      ws2.send(
        JSON.stringify({
          type: "notification",
          message: notification,
        })
      );
    }

    // Confirmation à l'utilisateur qui ignore
    ws.send(
      JSON.stringify({
        type: "success",
        userId: userId,
        message: {
          title: "user ignored",
        },
      })
    );
  }
}

module.exports = ignoreUser;
