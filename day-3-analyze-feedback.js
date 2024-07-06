import { FunctionDeclarationSchemaType, GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

import { 
    analyzeFeedbackTrain, 
    parseModelResponse,
    generationConfig,
    safetySettings
} from "./generate-questions-training.js";


const MODEL_NAME = "gemini-1.5-pro";
const API_KEY = process.env.API_KEY;

async function runChat() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME,
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: FunctionDeclarationSchemaType.ARRAY,
                items: {
                    type: FunctionDeclarationSchemaType.OBJECT,
                    properties: {
                        area: { type: FunctionDeclarationSchemaType.STRING },
                        score: { type: FunctionDeclarationSchemaType.NUMBER },
                        summary: { type: FunctionDeclarationSchemaType.STRING },
                        action: { type: FunctionDeclarationSchemaType.STRING }
                    }
                }
            }
        }
     });

    const convo = model.startChat({
        generationConfig,
        safetySettings,
        history: analyzeFeedbackTrain
    });

    const promptQuestion = "I have gather feedback from my client. These are the questions";
    const questionsText = await readJsonFile("./sample-questions.json");
    const promptAnalyze = "Help me analyze sentiment of the feedback on each area and overall as score 1-5 and provide a summary of the feedback. Response in Json format";
    const feedbackText = await readJsonFile("./sample-feedback-response.json");
    const prompt = `${promptQuestion}\n ${JSON.stringify(questionsText)}\n ${promptAnalyze} \n ${JSON.stringify(feedbackText)}`;
    const modelResponse = await convo.sendMessage(prompt);
    const parsedResponse = parseModelResponse(modelResponse);
    console.log(parsedResponse);
}

async function readJsonFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
}

runChat();
