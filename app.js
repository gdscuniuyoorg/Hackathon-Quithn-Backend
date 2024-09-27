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

const apiKey = "AIzaSyAOMgl6Lt9mNASqPRM4zzUUaIcr-w6qm0g";
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const app = express();
const port = 3000;
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
    quizDescription = "Created by Quithn(GDSC UNIUYO Hackathon 2024)";
    quizQuestions = quizData.questions;
    const formData = await form(quizName, quizDescription, quizQuestions);
    res.status(200).json({ link: formData.formLink, id: formData.formId });
  } catch (err) {
    console.log("Error while creating form: ", err);
    res.status(500).send("Server error");
  }
});

app.post("/share", async (req, res) => {
  try {
    data = req.body;
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

  const { buffer, mimetype } = req.file;

  try {
    await fs.writeFile("/tmp/mediadata.wav", buffer);
    // Upload the file to Gemini API from buffer or temp path
    const uploadResult = await fileManager.uploadFile("/tmp/mediadata.wav", {
      mimeType: "audio/wav",
      displayName: req.file.originalname,
    });

    const file = uploadResult.file;
    await fs.unlink("/tmp/mediadata.wav");

    // Generate content using the uploaded file
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "Generate audio diarization, including transcriptions and speaker information for each transcription, for this interview. Organize the transcription by the time they happened.",
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
    const result = await chatSession.sendMessage("");
    res.status(200).send(result.response.text());
  } catch (error) {
    console.error("Error uploading or processing file:", error);
    res.status(500).send(`Failed to process the file: ${error}`);
  }
});
