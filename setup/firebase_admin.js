
var admin = require("firebase-admin");

var serviceAccount = require("../config/firebase_adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://reservation-f9b4a-default-rtdb.firebaseio.com",
});

module.exports = admin;
