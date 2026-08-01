# Hackathon-Quithn-Backend

![cover](https://github.com/user-attachments/assets/12e1d774-f210-4b44-9bd1-32d633945121)


## Project Overview
This is the frontend of an application that presents the user with a UI to upload a file. The app presents everything to the user through a clean and intuitive UI. The goal is to make it easy for educators to quickly convert learning materials into Google Forms quizzes.

## Features
- **User-Friendly UI/UX**: Simple, intuitive, and smooth user interface.
- **Quiz Generation**: Upload a PDF and automatically generate quiz questions.
- **Google Forms Integration**: Automatically creates Google Forms quizzes from the processed PDFs.
- **Responsive Design**: Optimized for all screen sizes, including mobile and desktop.

## Tech Stack
- **HTML/CSS/JavaScript**: Core frontend technologies.
- **Bootstrap**: For responsive and mobile-first design.
- **Axios**: To handle API requests to the backend.
- **Gemini API**: Used for parsing PDFs and generating questions.
- **Google Forms API**: Integrated to create and manage Google Forms quizzes.

## Environment Variables
Create a `.env` file and set:

- `GEMINI_API_KEY`
- `GOOGLE_SERVICE_ACCOUNT_JSON` (full Google service account JSON as a single string)

Alternatively, provide these individual Google credential fields:

- `GOOGLE_PROJECT_ID`
- `GOOGLE_PRIVATE_KEY_ID`
- `GOOGLE_PRIVATE_KEY` (use `\n` for line breaks)
- `GOOGLE_CLIENT_EMAIL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_X509_CERT_URL` (optional)
