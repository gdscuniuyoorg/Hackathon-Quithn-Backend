const { google } = require("googleapis");

// Load the service account key file
const keyFile = "quithn-78ccc83deebc.json";

const auth = new google.auth.GoogleAuth({
  keyFile: keyFile,
  scopes: [
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/drive",
  ],
});

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
