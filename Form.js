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

const forms = google.forms({ version: "v1", auth });
const drive = google.drive({ version: "v3", auth });

// const questions = [
//   {
//     question: "What is the capital of France?",
//     options: ["Paris", "London", "Berlin", "Madrid"],
//     correctAnswer: "Paris",
//     feedBack: "Paris is the capiltal of France",
//   },
//   {
//     question: "Which planet is known as the Red Planet?",
//     options: ["Earth", "Mars", "Jupiter", "Venus"],
//     correctAnswer: "Mars",
//     feedBack: "Mars is the 'Red Planet'",
//   },
//   {
//     question: "What is the largest mammal?",
//     options: ["Elephant", "Whale", "Shark", "Giraffe"],
//     correctAnswer: "Whale",
//     feedBack: "Whale is the largest animal",
//   },
//   {
//     question: "What is the powerhouse of the cell?",
//     options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi apparatus"],
//     correctAnswer: "Mitochondria",
//     feedBack: "Mitochondria powers the cell",
//   },
//   {
//     question: "Who wrote 'Romeo and Juliet'?",
//     options: [
//       "William Shakespeare",
//       "Charles Dickens",
//       "Mark Twain",
//       "Jane Austen",
//     ],
//     correctAnswer: "William Shakespeare",
//     feedBack: "It was written by William in 1607",
//   },
// ];

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
    console.log(`Form link: ${formLink}`);
    return { formLink, formId };
  } catch (error) {
    console.error("Error creating quiz form:", error);
    throw error;
  }
}

module.exports = createQuizForm;
