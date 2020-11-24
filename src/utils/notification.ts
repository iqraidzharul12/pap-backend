import * as admin from 'firebase-admin';

let serviceAccount = require("../../firebaseServiceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://papprogram-9ae93.firebaseio.com"
});

const options = {
  priority: "high",
  timeToLive: 60 * 60 * 24
};

export const sendNotification = (registrationToken: any, message: any) => {
  admin.messaging().sendToDevice(registrationToken, message, options)
    .then(response => {
      console.log("notification sent")
    })
    .catch(error => {
      console.log(error);
    });
}

export default admin;