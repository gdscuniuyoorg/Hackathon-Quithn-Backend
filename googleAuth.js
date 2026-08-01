require("dotenv").config();
const { google } = require("googleapis");

const scopes = [
  "https://www.googleapis.com/auth/forms.body",
  "https://www.googleapis.com/auth/drive",
];

function getServiceAccountCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, "\n");
    }
    return credentials;
  }

  const requiredEnvVars = [
    "GOOGLE_PROJECT_ID",
    "GOOGLE_PRIVATE_KEY_ID",
    "GOOGLE_PRIVATE_KEY",
    "GOOGLE_CLIENT_EMAIL",
    "GOOGLE_CLIENT_ID",
  ];

  const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);
  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required Google service account environment variables: ${missingEnvVars.join(
        ", "
      )}`
    );
  }

  return {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
    universe_domain: "googleapis.com",
  };
}

function getGoogleAuth() {
  return new google.auth.GoogleAuth({
    credentials: getServiceAccountCredentials(),
    scopes,
  });
}

module.exports = { getGoogleAuth };
