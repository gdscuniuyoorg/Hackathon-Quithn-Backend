require("dotenv").config();
const fs = require("fs").promises;
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const upload = multer();
const cors = require("cors");
const express = require("express");
const form = require("./Form");
const drive = require("./Drive");
const util = require("./util");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

const generationConfig = {
  temperature: 0.65,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: {
              type: "string",
            },
            options: {
              type: "array",
              items: {
                type: "string",
              },
            },
            correctAnswer: {
              type: "string",
            },
            feedBack: {
              type: "string",
            },
          },
          required: ["question", "options", "correctAnswer", "feedBack"],
        },
      },
    },
    required: ["name", "questions"],
  },
};

const app = express();
const port = process.env.PORT || 3000;
const defaultEmail = "quithn.me@gmail.com";
app.use(cors());
app.use(express.json());

app.listen(port, () => {
  console.log(`[quithn-backend] is listening on port ${port}`);
});

// Default route to check if server is running
app.get("/", (req, res) => {
  res.status(200).send("200 OK");
});

app.post("/create", async (req, res) => {
  try {
    quizData = req.body;
    quizName = quizData.name;
    quizDescription = "Created by Quithn(GDGoC UNIUYO Hackathon 2024)";
    quizQuestions = quizData.questions;
    const formData = await form(quizName, quizDescription, quizQuestions);
    res.status(200).json({ link: formData.formLink, id: formData.formId });
    await drive(defaultEmail, formData.formId);
  } catch (err) {
    console.log("Error while creating form: ", err);
    res.status(500).send("Server error");
  }
});

app.post("/share", async (req, res) => {
  try {
    data = req.body;
    console.log(data);
    email = data.email;
    id = data.id;
    await drive(email, id);
    res.status(200).send("Done");
  } catch (err) {
    console.log("Error while sharing form: ", err);
    res.status(500).send("Server error");
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }

  const { buffer } = req.file;
  const tempFileName = util.generateRandomHex();
  const textPrompt = req.headers.prompt ? req.headers.prompt : "";
  try {
    await fs.writeFile(`/tmp/${tempFileName}.pdf`, buffer);
    // Upload the file to Gemini API from /tmp
    const uploadResult = await fileManager.uploadFile(
      `/tmp/${tempFileName}.pdf`,
      {
        mimeType: "application/pdf",
        displayName: req.file.originalname,
      }
    );

    const file = uploadResult.file;
    await fs.unlink(`/tmp/${tempFileName}.pdf`);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        'Key Instructions:\n\nOptions:\n\nEach question must have 4 answer options.\nEnsure all options are unique and none are duplicated.\nThe correct answer must be one of the options and must be case-sensitive\nCorrect Answer & Feedback:\n\nThe correct answer must be based on the information from the document, and the feedback must explain why the correct answer is accurate.\nDont reference specific sections from the document in the feedback,  do not ask where things occur directly in the questions.\n\nQuiz Name:\n\nCreate a creative title for the quiz, preferably not the same as the document or book title.\n\n\nOutput Format:\n\nReturn the result in the following JSON structure:\n\n{\n    "name": "Creative Quiz Title",\n    "questions": [\n        {\n            "question": "Sample question text?",\n            "options": ["Option1", "Option2", "Option3", "Option4"],\n            "correctAnswer": "CorrectOption",\n            "feedBack": "Explanation of why CorrectOption is the right answer, potentially referencing the document."\n        },\n        {\n            "question": "Another question?",\n            "options": ["OptionA", "OptionB", "OptionC", "OptionD"],\n            "correctAnswer": "OptionC",\n            "feedBack": "Explanation of why OptionC is correct."\n        }\n    ]\n}\nExample JSON Output:\n\n{\n    "name": "General Knowledge Quiz",\n    "questions": [\n        {\n            "question": "What is the capital of France?",\n            "options": ["Paris", "London", "Berlin", "Madrid"],\n            "correctAnswer": "Paris",\n            "feedBack": "Paris is the capital of France, known for its rich culture and history."\n        },\n        {\n            "question": "Which planet is known as the Red Planet?",\n            "options": ["Earth", "Mars", "Jupiter", "Venus"],\n            "correctAnswer": "Mars",\n            "feedBack": "Mars is known as the Red Planet due to its reddish appearance caused by iron oxide on its surface."\n        }\n    ]\n}\nAdditional Notes:\n\nEnsure accuracy in the correct answers based on the provided documents.\nBe mindful of the casing when generating the correct answers to avoid errors.\nAvoid redundancies or overly simple phrasing in the feedback to ensure it adds valuable context.\nNever use a different schema from the one stated here.',
    });

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {
              fileData: {
                mimeType: file.mimeType,
                fileUri: file.uri,
              },
            },
          ],
        },
      ],
    });
    const result = await chatSession.sendMessage(textPrompt);
    try {
      const quizData = JSON.parse(result.response.text());
      const quizName = quizData.name;
      const quizDescription = "Created by Quithn(GDGoC UNIUYO Hackathon 2024)";
      const quizQuestions = quizData.questions;
      form(quizName, quizDescription, quizQuestions)
        .then(async (formData) => {
          res
            .status(200)
            .json({ link: formData.formLink, id: formData.formId });
          await drive(defaultEmail, formData.formId);
        })
        .catch((error) => {
          console.log(error);
          res
            .status(500)
            .send(`Failed to generate the quiz. Check logs for error`);
        });
    } catch (error) {
      console.log(error);
      res.status(500).send(`Failed to generate the quiz. Check logs for error`);
    }
  } catch (error) {
    console.error("Error uploading or processing file:", error);
    res.status(500).send(`Failed to process the file: ${error}`);
  }
});
