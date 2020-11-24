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

export const sendPushNotification = async (registrationToken: any, title: any, body: any) => {
  const message = {
    notification: {
      title: title,
      body: body
    }
  };

  let result: any = ""

  if (registrationToken) {
    result = await admin.messaging().sendToDevice(registrationToken, message, options)
  }

  return result
}

export default admin;