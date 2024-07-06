import { 
    GoogleGenerativeAI,
    FunctionDeclarationSchemaType
 } from "@google/generative-ai";

 import {
    safetySettings,
    generateQuestionsPrompt,
    genQuestionsTrain,
    generationConfig,
    generateMoreQuestionsPrompt,
    parseModelResponse
 } from "./generate-questions-training.js";

import * as dotenv from "dotenv";
dotenv.config();

const MODEL_NAME = "gemini-1.5-flash";
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
                        questions: {
                            type: FunctionDeclarationSchemaType.ARRAY,
                            items: {
                                type: FunctionDeclarationSchemaType.OBJECT,
                                properties: {
                                    question: { type: FunctionDeclarationSchemaType.STRING },
                                    type: { type: FunctionDeclarationSchemaType.STRING },
                                    options: { type: FunctionDeclarationSchemaType.ARRAY,
                                        items: { type: FunctionDeclarationSchemaType.STRING }
                                    },
                                    area: { type: FunctionDeclarationSchemaType.STRING }
                                }
                            }
                        }
                    }
                }
            } 
        } 
    });

    const convo = model.startChat({
        generationConfig,
        safetySettings,
        history: genQuestionsTrain
    });

    const prompt = generateQuestionsPrompt({
        feedbackTopic: "Software project delivery",
        feedbackContext:
            "I have submitted my work to my client. I want to gather feedback from them.",
        feedbackArea: ["Quality", "Speed", "Price"],
        targetReviewer: "the client",
        total_questions: 10,
    });

    const questions = [];

    let modelResponse = await convo.sendMessage(prompt);
    questions.push(parseModelResponse(modelResponse)); 

    const nextPrompt = generateMoreQuestionsPrompt(10);
    modelResponse = await convo.sendMessage(nextPrompt);
    questions.push(parseModelResponse(modelResponse));

    console.log(questions);
}



runChat();
