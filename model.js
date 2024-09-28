/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 */

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const fileManager = new GoogleAIFileManager(apiKey);

/**
 * Uploads the given file to Gemini.
 *
 * See https://ai.google.dev/gemini-api/docs/prompting_with_media
 */
async function uploadToGemini(path, mimeType) {
  const uploadResult = await fileManager.uploadFile(path, {
    mimeType,
    displayName: path,
  });
  const file = uploadResult.file;
  console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
  return file;
}

/**
 * Waits for the given files to be active.
 *
 * Some files uploaded to the Gemini API need to be processed before they can
 * be used as prompt inputs. The status can be seen by querying the file's
 * "state" field.
 *
 * This implementation uses a simple blocking polling loop. Production code
 * should probably employ a more sophisticated approach.
 */
async function waitForFilesActive(files) {
  console.log("Waiting for file processing...");
  for (const name of files.map((file) => file.name)) {
    let file = await fileManager.getFile(name);
    while (file.state === "PROCESSING") {
      process.stdout.write(".")
      await new Promise((resolve) => setTimeout(resolve, 10_000));
      file = await fileManager.getFile(name)
    }
    if (file.state !== "ACTIVE") {
      throw Error(`File ${file.name} failed to process`);
    }
  }
  console.log("...all files ready\n");
}

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "Key Instructions:\n\nQuestion Variations:\n\nCreate questions in 3 difficulty levels: Easy, Medium, and Hard, as requested by the user.\nEnsure each question aligns with the specified difficulty level in its wording and complexity.\n\n\nOptions:\n\nEach question must have 4 answer options.\nEnsure all options are unique and none are duplicated.\nThe correct answer must be one of the options and should be case-sensitive where applicable.\nCorrect Answer & Feedback:\n\nThe correct answer must be based on the information from the document, and the feedback must explain why the correct answer is accurate.\nDont reference specific sections from the document in the feedback,  do not ask where things occur directly in the questions.\n\n\nQuestion Count:\n\nGenerate a minimum of 10 questions and a maximum of 20 questions per request.\n\n\nQuiz Name:\n\nCreate a creative title for the quiz, preferably not the same as the document or book title.\n\n\nOutput Format:\n\nReturn the result in the following JSON structure:\n\n{\n    \"name\": \"Creative Quiz Title\",\n    \"questions\": [\n        {\n            \"question\": \"Sample question text?\",\n            \"options\": [\"Option1\", \"Option2\", \"Option3\", \"Option4\"],\n            \"correctAnswer\": \"CorrectOption\",\n            \"feedBack\": \"Explanation of why CorrectOption is the right answer, potentially referencing the document.\"\n        },\n        {\n            \"question\": \"Another question?\",\n            \"options\": [\"OptionA\", \"OptionB\", \"OptionC\", \"OptionD\"],\n            \"correctAnswer\": \"OptionC\",\n            \"feedBack\": \"Explanation of why OptionC is correct.\"\n        }\n    ]\n}\nExample JSON Output:\n\n{\n    \"name\": \"General Knowledge Quiz\",\n    \"questions\": [\n        {\n            \"question\": \"What is the capital of France?\",\n            \"options\": [\"Paris\", \"London\", \"Berlin\", \"Madrid\"],\n            \"correctAnswer\": \"Paris\",\n            \"feedBack\": \"Paris is the capital of France, known for its rich culture and history.\"\n        },\n        {\n            \"question\": \"Which planet is known as the Red Planet?\",\n            \"options\": [\"Earth\", \"Mars\", \"Jupiter\", \"Venus\"],\n            \"correctAnswer\": \"Mars\",\n            \"feedBack\": \"Mars is known as the Red Planet due to its reddish appearance caused by iron oxide on its surface.\"\n        }\n    ]\n}\nAdditional Notes:\n\nEnsure accuracy in the correct answers based on the provided documents.\nBe mindful of the casing when generating the correct answers to avoid errors.\nAvoid redundancies or overly simple phrasing in the feedback to ensure it adds valuable context.\n",
});

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
        type: "string"
      },
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            question: {
              type: "string"
            },
            options: {
              type: "array",
              items: {
                type: "string"
              }
            },
            correctAnswer: {
              type: "string"
            },
            feedBack: {
              type: "string"
            }
          },
          required: [
            "question",
            "options",
            "correctAnswer",
            "feedBack"
          ]
        }
      }
    },
    required: [
      "name",
      "questions"
    ]
  },
};

async function run() {
  // TODO Make these files available on the local file system
  // You may need to update the file paths
  const files = [
    await uploadToGemini("[B.D._Bunday,_H._Mulholland]_Pure_Mathematics_for_(z-lib.org).pdf", "application/pdf"),
  ];

  // Some files have a processing delay. Wait for them to be ready.
  await waitForFilesActive(files);

  const chatSession = model.startChat({
    generationConfig,
 // safetySettings: Adjust safety settings
 // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [
      {
        role: "user",
        parts: [
          {
            fileData: {
              mimeType: files[0].mimeType,
              fileUri: files[0].uri,
            },
          },
          {text: "Medium"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "```json\n{\"name\": \"Advanced Mathematics Quiz\", \"questions\": [{\"correctAnswer\": \"The Binomial Theorem\", \"feedBack\": \"The Binomial Theorem provides a formula for expanding expressions of the form (a + x)n, where n is a positive integer. It's a fundamental tool in algebra and calculus.\", \"options\": [\"The Quadratic Equation\", \"The Arithmetic Sequence\", \"The Binomial Theorem\", \"The Logarithmic Function\"], \"question\": \"Which topic is covered in Chapter 3 of the book?\"}, {\"correctAnswer\": \"The derivative of a function represents the rate of change of the function.\", \"feedBack\": \"In calculus, the derivative of a function measures how rapidly the function's output changes with respect to its input. This concept is crucial for understanding slopes of tangents, velocity, and acceleration.\", \"options\": [\"The derivative of a function represents the area under the curve.\", \"The derivative of a function represents the average value of the function.\", \"The derivative of a function represents the rate of change of the function.\", \"The derivative of a function represents the maximum value of the function.\"], \"question\": \"What does the derivative of a function represent?\"}, {\"correctAnswer\": \"The rate of change of a function\", \"feedBack\": \"The rate of change of a function is a key concept in calculus, representing how quickly the function's output changes with respect to its input. It's closely related to the derivative and helps us understand things like slopes of tangents, velocity, and acceleration.\", \"options\": [\"The area under the curve\", \"The average value of the function\", \"The rate of change of a function\", \"The maximum value of the function\"], \"question\": \"What is the primary focus of Chapter 9, 'The Fundamental Ideas of the Differential Calculus'?\"}, {\"correctAnswer\": \"The value of one quantity depends on the value of another quantity.\", \"feedBack\": \"The concept of a function is central to calculus. It describes a relationship where the output (dependent variable) is determined by the input (independent variable).  This dependence is essential for understanding how quantities change and relate to each other.\", \"options\": [\"The value of one quantity remains constant.\", \"The value of one quantity is always positive.\", \"The value of one quantity depends on the value of another quantity.\", \"The value of one quantity is always negative.\"], \"question\": \"What is the fundamental concept of a function?\"}, {\"correctAnswer\": \"The equation of the straight line parallel to the y-axis.\", \"feedBack\": \"In coordinate geometry, a straight line parallel to the y-axis has a constant x-coordinate. This means its equation is of the form x = a, where 'a' is the constant x-value.\", \"options\": [\"The equation of the straight line parallel to the x-axis.\", \"The equation of the straight line passing through the origin.\", \"The equation of the straight line parallel to the y-axis.\", \"The equation of the straight line perpendicular to the x-axis.\"], \"question\": \"What does the equation 'x = a' represent?\"}, {\"correctAnswer\": \"It is a geometric representation of complex numbers.\", \"feedBack\": \"The Argand diagram is a graphical tool for visualizing complex numbers. It maps each complex number to a unique point in the plane, making it easier to understand their properties and operations.\", \"options\": [\"It is a method for solving quadratic equations.\", \"It is a geometric representation of complex numbers.\", \"It is a formula for calculating the derivative of a function.\", \"It is a technique for integrating functions.\"], \"question\": \"What is the Argand diagram?\"}, {\"correctAnswer\": \"The value of the function is always positive.\", \"feedBack\": \"A quadratic function of the form y = ax^2 + bx + c, where 'a' is positive, has a graph that opens upwards. This means the value of y is always positive for all real values of x.\", \"options\": [\"The value of the function is always negative.\", \"The value of the function is always zero.\", \"The value of the function is always positive.\", \"The value of the function can be positive or negative.\"], \"question\": \"What is true about the value of the quadratic function y = ax^2 + bx + c when 'a' is positive?\"}, {\"correctAnswer\": \"The length of the latus rectum is 2b^2/a.\", \"feedBack\": \"The latus rectum of an ellipse is a line segment passing through the focus and perpendicular to the major axis. Its length is related to the semi-major axis (a) and the semi-minor axis (b) by the formula 2b^2/a.\", \"options\": [\"The length of the latus rectum is a^2/b.\", \"The length of the latus rectum is b^2/a.\", \"The length of the latus rectum is 2a^2/b.\", \"The length of the latus rectum is 2b^2/a.\"], \"question\": \"What is the length of the latus rectum of the ellipse x^2/a^2 + y^2/b^2 = 1?\"}, {\"correctAnswer\": \"The eccentricity of a hyperbola is always greater than 1.\", \"feedBack\": \"The eccentricity of a hyperbola measures its deviation from a circle. Unlike ellipses, where eccentricity is less than 1, hyperbolas have an eccentricity greater than 1, indicating their characteristic 'open' shape.\", \"options\": [\"The eccentricity of a hyperbola is always less than 1.\", \"The eccentricity of a hyperbola is always equal to 1.\", \"The eccentricity of a hyperbola is always between 0 and 1.\", \"The eccentricity of a hyperbola is always greater than 1.\"], \"question\": \"What is true about the eccentricity of a hyperbola?\"}, {\"correctAnswer\": \"The area of the triangle is given by the formula 1/2 * (b * c * sin A).\", \"feedBack\": \"The area of a triangle can be calculated using the formula 1/2 * (base * height). In this case, we use the sine rule to express the height in terms of the sides and the angle between them.\", \"options\": [\"The area of the triangle is given by the formula 1/2 * (a * b * sin C).\", \"The area of the triangle is given by the formula 1/2 * (a * c * sin B).\", \"The area of the triangle is given by the formula 1/2 * (b * c * sin A).\", \"The area of the triangle is given by the formula 1/2 * (a * b * sin A).\"], \"question\": \"How is the area of a triangle calculated?\"}, {\"correctAnswer\": \"The formula is known as Hero's formula.\", \"feedBack\": \"Hero's formula provides a method for calculating the area of a triangle when all three sides are known. It's a useful tool in geometry and is derived from the cosine rule and the area formula.\", \"options\": [\"The formula is known as Pythagoras' theorem.\", \"The formula is known as the Law of Sines.\", \"The formula is known as the Law of Cosines.\", \"The formula is known as Hero's formula.\"], \"question\": \"What is the name of the formula for calculating the area of a triangle when all three sides are known?\"}, {\"correctAnswer\": \"The value of the function is always positive.\", \"feedBack\": \"The function y = x^4 - 4x^3 + 3x^2 is a quartic function with a positive leading coefficient. This means its graph opens upwards, and its value is always positive for all real values of x.\", \"options\": [\"The value of the function is always negative.\", \"The value of the function is always zero.\", \"The value of the function is always positive.\", \"The value of the function can be positive or negative.\"], \"question\": \"What is true about the value of the function y = x^4 - 4x^3 + 3x^2?\"}, {\"correctAnswer\": \"The area of the surface swept out when the curve is rotated about the x-axis.\", \"feedBack\": \"The volume of a solid of revolution is calculated by rotating a curve around an axis.  The formula involves integrating the squared function of the curve with respect to the axis of rotation.\", \"options\": [\"The volume of the solid swept out when the curve is rotated about the y-axis.\", \"The area of the surface swept out when the curve is rotated about the x-axis.\", \"The length of the curve.\", \"The distance between the curve and the x-axis.\"], \"question\": \"What does the volume of a solid of revolution represent?\"}, {\"correctAnswer\": \"The rate of change of the velocity.\", \"feedBack\": \"In kinematics, acceleration is the rate of change of velocity. It measures how quickly the velocity of an object changes over time. This concept is crucial for understanding motion and is often represented by the second derivative of displacement.\", \"options\": [\"The rate of change of the displacement.\", \"The rate of change of the acceleration.\", \"The rate of change of the velocity.\", \"The rate of change of the time.\"], \"question\": \"What does acceleration represent?\"}, {\"correctAnswer\": \"The solution involves finding the values of the unknown variables that satisfy all the equations simultaneously.\", \"feedBack\": \"Solving a system of equations means finding a set of values for the unknown variables that make all the equations true at the same time. This is a fundamental technique in algebra and is often used to model real-world problems.\", \"options\": [\"The solution involves finding the sum of all the equations.\", \"The solution involves finding the product of all the equations.\", \"The solution involves finding the difference of all the equations.\", \"The solution involves finding the values of the unknown variables that satisfy all the equations simultaneously.\"], \"question\": \"What does solving a system of equations involve?\"}, {\"correctAnswer\": \"It is a technique for finding the derivative of a function by taking the logarithm of both sides of the equation.\", \"feedBack\": \"Logarithmic differentiation is a useful technique in calculus for finding derivatives of complex functions, especially those involving products, quotients, and powers. It simplifies the differentiation process by manipulating logarithms.\", \"options\": [\"It is a method for solving quadratic equations.\", \"It is a technique for integrating functions.\", \"It is a method for finding the area under a curve.\", \"It is a technique for finding the derivative of a function by taking the logarithm of both sides of the equation.\"], \"question\": \"What is logarithmic differentiation?\"}, {\"correctAnswer\": \"It is a series representation of a function.\", \"feedBack\": \"A Maclaurin series is a power series representation of a function. It provides an approximation of the function using an infinite sum of terms, where each term involves derivatives of the function evaluated at zero. This technique is particularly useful for approximating functions and understanding their behavior near zero.\", \"options\": [\"It is a method for solving differential equations.\", \"It is a technique for integrating functions.\", \"It is a series representation of a function.\", \"It is a method for finding the maximum value of a function.\"], \"question\": \"What is a Maclaurin series?\"}, {\"correctAnswer\": \"The integral of the function with respect to x.\", \"feedBack\": \"Integration is the inverse process of differentiation in calculus. It involves finding a function whose derivative is the given function.  The integral is often represented by the symbol ∫ and is used to calculate areas, volumes, and other quantities.\", \"options\": [\"The derivative of the function with respect to x.\", \"The average value of the function.\", \"The maximum value of the function.\", \"The integral of the function with respect to x.\"], \"question\": \"What is the integral of a function?\"}, {\"correctAnswer\": \"It is a method for finding the integral of a product of two functions.\", \"feedBack\": \"Integration by parts is a technique used to evaluate integrals of products of functions. It involves breaking the integrand into two parts and applying a specific formula. This technique is particularly useful for integrals that cannot be directly solved using standard integration techniques.\", \"options\": [\"It is a method for finding the integral of a quotient of two functions.\", \"It is a method for finding the integral of a sum of two functions.\", \"It is a method for finding the integral of a product of two functions.\", \"It is a method for finding the derivative of a product of two functions.\"], \"question\": \"What is integration by parts?\"}]\n}\n\n```"},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
  console.log(result.response.text());
}

run();
