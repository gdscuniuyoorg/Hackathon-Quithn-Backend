require("dotenv").config();
const { google } = require("googleapis");
const { getGoogleAuth } = require("./googleAuth");

const auth = getGoogleAuth();

const drive = google.drive({ version: "v3", auth });

async function shareWithEmail(email, formId) {
  try {
    await drive.permissions.create({
      fileId: formId,
      requestBody: {
        role: "writer",
        type: "user",
        emailAddress: email,
      },
    });
  } catch (error) {
    console.error("Error sharing quiz form:", error);
  }
}

module.exports = shareWithEmail;
