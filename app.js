require("dotenv").config();
const cors = require("cors");
const express = require("express");
const form = require("./Form");
const drive = require("./Drive");

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
    quizDescription = "Created by Quithn (GDSC UNIUYO Hackathon 2024)";
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
