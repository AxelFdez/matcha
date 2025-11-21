const WebSocket = require("ws");
const url = require("url");
const pool = require("../config/connectBdd");
const likeUser = require("./like");
const chatUser = require("./chatUser");
const unlikeUser = require("./unlike");
const viewedUser = require("./viewed");
const pingLocation = require("./pingLocation");
const ignoreUser = require("./ignore");
const reportUser = require("./report");
const blockUser = require("./block");
const { deleteNotification, notificationViewed } = require("./notificationHandler");

let clients = new Map();

async function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", async function connection(ws, req) {
    // // console.log('A new client Connected!');
    const location = url.parse(req.url, true);
    const userId = location.query.id;

    // Vérifier que l'ID utilisateur est fourni
    if (!userId) {
      // console.error('❌ WebSocket connection rejected: no userId provided');
      ws.close();
      return;
    }

    clients.set(userId, ws);

    // Marquer l'utilisateur comme connecté dès la connexion
    await pool.query("UPDATE users SET connected = $1, lastConnection = $2 WHERE id = $3", [
      true,
      new Date(),
      userId,
    ]);
    // // console.log(`✅ User ${userId} marked as connected`);

    ws.send(JSON.stringify({ type: "connected", userId: userId, message: "You are connected" }));

    const userResult = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    const user = userResult.rows[0];

    // Vérifier que l'utilisateur existe
    if (!user) {
      // console.error(`❌ User ${userId} not found in database`);
      ws.close();
      return;
    }

    // Parser le JSON location si nécessaire
    let locationData = user.location;
    if (typeof locationData === "string") {
      locationData = JSON.parse(locationData);
    }

    // Ne pinger que si l'utilisateur a autorisé et n'a PAS défini sa position manuellement
    const shouldPingLocation =
      user && locationData && locationData.authorization && !locationData.manualMode;

    if (shouldPingLocation) {
      // // console.log(`📍 Starting location ping for user ${userId} (manualMode: false)`);
      setInterval(() => {
        pingClientForCurrentLocation(userId);
      }, 100000);
    }
    // else if (locationData && locationData.manualMode) {
    // 	// // console.log(`🔒 Skipping location ping for user ${userId} (manualMode: true)`);
    // }

    ws.on("message", async function incoming(message) {
      const parsedMessage = JSON.parse(message);
      // console.log('received: %s', message, "\n");
      ws.send(
        JSON.stringify({ type: "receive", userId: userId, message: "message recieved by server" })
      );
      if (parsedMessage.type === "like") {
        likeUser(parsedMessage.userId, parsedMessage.message);
      } else if (parsedMessage.type === "unlike") {
        unlikeUser(parsedMessage.userId, parsedMessage.message);
      } else if (parsedMessage.type === "ignore") {
        ignoreUser(parsedMessage.userId, parsedMessage.message);
      } else if (parsedMessage.type === "viewed") {
        viewedUser(parsedMessage.userId, parsedMessage.message);
      } else if (parsedMessage.type === "report") {
        reportUser(parsedMessage.userId, parsedMessage.message);
      } else if (parsedMessage.type === "block") {
        blockUser(parsedMessage.userId, parsedMessage.message);
      } else if (parsedMessage.type === "notification") {
        notificationViewed(parsedMessage.userId);
        // } else if (parsedMessage.type === 'deleteNotification') {
        // 	deleteNotification(parsedMessage.userId, parsedMessage.message);
      } else if (parsedMessage.type === "chat") {
        chatUser(parsedMessage.userId, parsedMessage.message);
      } else if (parsedMessage.type === "newLocation") {
        // Récupérer l'utilisateur pour vérifier manualMode
        const userResult = await pool.query("SELECT location FROM users WHERE id = $1", [userId]);
        if (userResult.rows.length > 0) {
          let locationData = userResult.rows[0].location;

          // Parser le JSON si nécessaire
          if (typeof locationData === "string") {
            locationData = JSON.parse(locationData);
          }

          // Ne mettre à jour que si manualMode est false ou n'existe pas
          if (!locationData.manualMode) {
            // Format GeoJSON standard: [longitude, latitude]
            locationData.coordinates = [
              parsedMessage.location.longitude,
              parsedMessage.location.latitude,
            ];
            locationData.latitude = parsedMessage.location.latitude;
            locationData.longitude = parsedMessage.location.longitude;

            // Reverse geocoding pour obtenir city et country
            try {
              const axios = require('axios');
              const reverseGeoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${parsedMessage.location.latitude}&lon=${parsedMessage.location.longitude}&addressdetails=1`;
              const geoResponse = await axios.get(reverseGeoUrl, {
                headers: {
                  'User-Agent': 'Matcha Dating App'
                }
              });
              const geoData = geoResponse.data;
              // console.log('Reverse geocoding data:', geoData);
              if (geoData && geoData.address) {
                locationData.city = geoData.address.city || geoData.address.town || geoData.address.village || "Inconnue";
                locationData.country = geoData.address.country || "Inconnu";
              }
            } catch (error) {
              // console.error('Reverse geocoding error:', error);
              // En cas d'erreur, garder les valeurs par défaut
              if (!locationData.city) locationData.city = "Inconnue";
              if (!locationData.country) locationData.country = "Inconnu";
            }

            await pool.query("UPDATE users SET location = $1 WHERE id = $2", [
              JSON.stringify(locationData),
              userId,
            ]);
            // // console.log(`📍 Location updated for user ${userId} via WebSocket (manualMode: false)`);
          } else {
            // // console.log(`🔒 Location update ignored for user ${userId} (manualMode: true)`);
          }
        }
      } else if (parsedMessage.type === "test") {
        // console.log('Test received:', parsedMessage.message);
      }
    });

    ws.on("close", () => {
      //console.log('The client has disconnected.');
      disconnectUser(userId);
      clients.delete(userId);
    });

    ws.on("error", (error) => {
      // console.error('WebSocket error:', error);
    });
  });

  async function disconnectUser(userId) {
    await pool.query("UPDATE users SET connected = $1, lastConnection = $2 WHERE id = $3", [
      false,
      new Date(),
      userId,
    ]);
  }

  return wss;
}

async function pingClientForCurrentLocation(clientId) {
  for (let [userId, ws] of clients) {
    if (userId === clientId) {
      ws.send(JSON.stringify({ type: "pingLocation", userId: userId }));
    }
  }
}

module.exports = { setupWebSocket, clients };
