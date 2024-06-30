// node --version # Should be >= 18
// npm install @google/generative-ai

import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";

import * as dotenv from "dotenv";
dotenv.config();

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.API_KEY!;

async function runChat() {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
    };

    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
            {
                role: "user",
                parts: [
                    {
                        text: "Hi, you are the feedback analysis expert helping me to prepare impactful questions for various kinds of events.",
                    },
                ],
            },
            {
                role: "model",
                parts: [
                    {
                        text: "Absolutely! I'm excited to help you craft impactful questions for your events. To get started, could you tell me a bit more about the specific type of event you're planning and the kind of feedback you're hoping to gather?  The more context I have, the better I can assist you in formulating effective questions.",
                    },
                ],
            },
        ],
    });

    const result = await chat.sendMessage(
        "Give me 5 questions to gather feedback from customers."
    );
    const response = result.response;
    console.log(response.text());
}

runChat();
