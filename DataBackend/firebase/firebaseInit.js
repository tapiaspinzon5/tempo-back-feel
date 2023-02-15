const admin = require("firebase-admin");
const firebaseAccount = require("./firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(firebaseAccount),
  storageBucket: "firebase-296723.appspot.com",
});

const bucket = admin.storage().bucket("gs://feel-platform");

module.exports = {
  bucket,
};
