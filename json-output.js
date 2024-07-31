/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI({
  // Replace with your project ID from Google Cloud Console
  projectId: "gen-lang-client-0867977027",
  // This should be set as an environment variable for security
  apiKey: process.env.API_KEY,
});

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

async function run() {
  const chatSession = model.startChat({
    generationConfig,
 // safetySettings: Adjust safety settings
 // See https://ai.google.dev/gemini-api/docs/safety-settings
    history: [
      {
        role: "user",
        parts: [
          {text: "`Design questions to gather impactful feedback of for following detail. \n\t\n\t1) The feedback event name: Software project delivery \n\t2) The event purpose and context: I have submitted my work to my client. I want to gather feedback from them.\n\t3) Area topics to gather feedback: [\"Quality\", \"Speed\", \"Price\"]\n\t4) Questions types: [\"choices\"]\n\t5) Who will provide feedback: the client.\n\t6) Number of questions: 5\n\t`"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "{\n\"title\": \"Software Project Delivery Feedback\",\n\"description\": \"Thank you for giving us the opportunity to deliver this software project. Your feedback is important to us. Please take a moment to answer a few questions about your experience.\",\n\"questions\": [\n{\n\"type\": \"radiogroup\",\n\"name\": \"quality\",\n\"title\": \"How satisfied are you with the quality of the delivered software?\",\n\"choices\": [\n\"Very Satisfied\",\n\"Satisfied\",\n\"Neutral\",\n\"Dissatisfied\",\n\"Very Dissatisfied\"\n]\n},\n{\n\"type\": \"radiogroup\",\n\"name\": \"speed\",\n\"title\": \"How satisfied are you with the speed of project delivery?\",\n\"choices\": [\n\"Very Satisfied\",\n\"Satisfied\",\n\"Neutral\",\n\"Dissatisfied\",\n\"Very Dissatisfied\"\n]\n},\n{\n\"type\": \"radiogroup\",\n\"name\": \"price\",\n\"title\": \"How satisfied are you with the price of the project?\",\n\"choices\": [\n\"Very Satisfied\",\n\"Satisfied\",\n\"Neutral\",\n\"Dissatisfied\",\n\"Very Dissatisfied\"\n]\n},\n{\n\"type\": \"radiogroup\",\n\"name\": \"communication\",\n\"title\": \"How satisfied are you with the communication during the project?\",\n\"choices\": [\n\"Very Satisfied\",\n\"Satisfied\",\n\"Neutral\",\n\"Dissatisfied\",\n\"Very Dissatisfied\"\n]\n},\n{\n\"type\": \"radiogroup\",\n\"name\": \"overall\",\n\"title\": \"How likely are you to recommend our services to others?\",\n\"choices\": [\n\"Very Likely\",\n\"Likely\",\n\"Neutral\",\n\"Unlikely\",\n\"Very Unlikely\"\n]\n}\n]\n}\n"},
        ],
      },
    ],
  });

  const result = await chatSession.sendMessage("Generate 5 more different questions");
  console.log(result.response.text());
}

run();