require("dotenv").config();
const { google } = require("googleapis");
// Load the service account key file
const keyObject = {
  type: "service_account",
  project_id: "quithn",
  private_key_id: "78ccc83deebc814a7bbcee8fd1fa05a3df3e2880",
  private_key: `-----BEGIN PRIVATE KEY-----\n${process.env.BEGIN_SERVICE_ACCOUNT_KEY}\npc62bKneDygSgLJeP3IZL03p4SA6qLDTPzSdoZZ3B4bzj6NiUxCVSHhijrhNiZh9\nl7a9or3bouPYxuYQksT8ZdLy8x0eNMP5/u9rHYdUz2VJg61qC+me4M15McrQzexs\nuNOskcuyV7sKt65s14f8TnoxAtuT2DtT6TSpBIGteUx2Ei5OrlUKhH17ECKbRPB0\nIjdWLaQKvand+2fPm/S7Sktgbt8DWY+jlSqPW27MPqpfbE9mcKrbtS8/+ZojbJY+\n7iYYG0yY96VEsX0RVcM1WAH+2y5m3EkIU0s2blQ9vvqD/GViv2Oq+Le1k2OOYY0V\nb/JYc2jNAgMBAAECggEACckxylmyOo51ptWxT0cpDDxVfr9sE9j21gBPEGUAO3rz\nUo+WvGAcQ648dsogu9fLgA2f4/3slQjRR4nF3ShLwP92AYjjP2J2S1joh81weyt4\n6Bps4b+cpsVN1QDV2pORaNkFOHnPrDTLoymDL2xQhiBjAzIe/4vXx8Qi4vQ/WCNn\ne0iopWeYzwS6ltyViKrUkAX7YYz1qlo8Psp3yc5+4rurzpsKDj03uEp4X43+7Jx6\nxWCQ8iO2ykUwXhZ1naGtBLzEoStEU1LodImH/it5HVLELamJlfWby2eBASiRCKBY\nMVfaT/oIv6Ab/FQcxH3UNvwHa0TktXp/TOUMo/sjwQKBgQDo4exrnCegNza8umlw\nyo+SVFb4e1TuBNPNKQ0SHRX7D8WcvIxqO3E5CMkYJ1lULM44KDakZOhmIxKWXbwP\n3rFzQO02z9FWyBYzXMf0Y1gUG3i7Qnzy3RFGbT8C3mfGFuNpslonRN4qgdCZUEIQ\nG7T1n+H1WQheABr9DbpRLNC8uQKBgQDDSrDphkAlNlQIvdhd1cmTkGmyasmV7j2c\noCEElUK6De84Og05VvLbE4BxoCrIWTXc89QTqQ4gxdKuXfXD2X2BLyYMKB2pbmWT\n2n3OcpEQcCwfKe/yxGwTMIhx0Z/ti94mjkaaYd3VXtS8giblVQoYmuKt/O28WJQ6\nsU+wIZTKtQKBgAbmmvDdYbc3q6GQDIvRFMwLP8CBNxUOg5AyxTZiMkKMRxjL5YVI\nWaSNBBh5IgaChWHYnzXj35cXNvfJs0btHGkD5YOYSOW/bBj9iNdPEk8WOU+jOryf\nnGFv30wgdwbBqt947372ZXbw/dNtM2fyyjv1DucMSlkuu54ACCNbppvRAoGATAT8\nHrsipxmh1pFH8ybwQ5/YdRo6hEFr/Fcc4zLS+afI8gMu+J4PBRZvTkvBu6F2ZR8I\n8+o/1KQM4dEzhNxZjXrz/ZF0Emsl4UsQ49cW/uYbVro1bDPnugSPaHboIUjr3ehO\nNXRZLOCwQP0M9QKIXpGUIZQuWr3EXaB925sG120CgYB8bkNolr1Lsou9uBRHJZWo\nzIXysl9V653sT/I4GmyydlFx3Ogo2fd/GK6andP9bNPNOoE58h80L3Z41Oliz3bq\nHK7DLt8f1hsbqUXs456yaPXThoAIAOT3pSnYSYF2ETumn8vfgIS/MaEVDEkTTRIu\nib9W6aOOsex/IgrP+kbrCw==\n-----END PRIVATE KEY-----\n`,
  client_email: process.env.CLIENT_EMAIL,
  client_id: "106754076355244108952",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/quithn-creator%40quithn.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

const auth = new google.auth.GoogleAuth({
  credentials: keyObject,
  scopes: [
    "https://www.googleapis.com/auth/forms.body",
    "https://www.googleapis.com/auth/drive",
  ],
});

const forms = google.forms({ version: "v1", auth });
const drive = google.drive({ version: "v3", auth });

const questions = [
  {
    question: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    correctAnswer: "Paris",
    feedBack: "Paris is the capiltal of France",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswer: "Mars",
    feedBack: "Mars is the 'Red Planet'",
  },
  {
    question: "What is the largest mammal?",
    options: ["Elephant", "Whale", "Shark", "Giraffe"],
    correctAnswer: "Whale",
    feedBack: "Whale is the largest animal",
  },
  {
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
    correctAnswer: "Mitochondria",
    feedBack: "Mitochondria powers the cell",
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: [
      "William Shakespeare",
      "Charles Dickens",
      "Mark Twain",
      "Jane Austen",
    ],
    correctAnswer: "William Shakespeare",
    feedBack: "It was written by William in 1607",
  },
];

async function createQuizForm(title, description, questions) {
  try {
    const form = await forms.forms.create({
      requestBody: {
        info: {
          title,
        },
      },
    });
    const formId = form.data.formId;

    const res = await forms.forms.batchUpdate({
      formId,
      requestBody: {
        requests: [
          {
            updateSettings: {
              settings: {
                quizSettings: {
                  isQuiz: true,
                },
              },
              updateMask: "quizSettings.isQuiz",
            },
          },
          // Update the form description
          {
            updateFormInfo: {
              info: {
                description,
              },
              updateMask: "description",
            },
          },
        ],
      },
    });

    // Add questions to the form
    for (const q of questions) {
      await forms.forms.batchUpdate({
        formId,
        requestBody: {
          requests: [
            {
              createItem: {
                item: {
                  title: q.question,
                  questionItem: {
                    question: {
                      required: true,
                      choiceQuestion: {
                        type: "RADIO",
                        options: q.options.map((option) => ({ value: option })),
                      },
                      grading: {
                        pointValue: 1,
                        correctAnswers: {
                          answers: [{ value: q.correctAnswer }],
                        },
                        whenRight: { text: q.feedBack },
                        whenWrong: { text: q.feedBack },
                      },
                    },
                  },
                },
                location: {
                  index: 0,
                },
              },
            },
          ],
        },
      });
    }

    await drive.files.update({
      fileId: formId,
      requestBody: {
        name: title, // Set the name of the file in Google Drive
      },
    });

    // Construct the link to the form
    const formLink = `https://docs.google.com/forms/d/${formId}/viewform`;
    return { formLink, formId };
  } catch (error) {
    console.error("Error creating quiz form:", error);
    throw error;
  }
}

module.exports = createQuizForm;
