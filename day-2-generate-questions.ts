// node --version # Should be >= 18
// npm install @google/generative-ai

import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
    ChatSession,
} from "@google/generative-ai";

import * as dotenv from "dotenv";
dotenv.config();

const MODEL_NAME = "gemini-1.5-pro";
const API_KEY = process.env.API_KEY!;

type QuestionsPromptOptions = {
    feedbackTopic: string;
    feedbackContext: string;
    feedbackArea: string[];
    targetReviewer: string;
    questionTypes?: string[];
    lang?: string;
    total_questions?: number;
};

function generateQuestionsPrompt(options: QuestionsPromptOptions): string {
    const {
        feedbackTopic,
        feedbackContext,
        feedbackArea,
        targetReviewer,
        questionTypes = ["scale", "choices", "text"],
        total_questions = 5,
    } = options;

    return `Design questions to gather impactful feedback of for following detail. 
	
	1) The feedback event name: ${feedbackTopic}. 
	2) The event purpose and context: ${feedbackContext}.
	3) Area topics to gather feedback: ${feedbackArea}.
	4) Questions types: ${questionTypes}. 
	5) Who will provide feedback: ${targetReviewer}.
	6) Number of questions: ${total_questions}.
	`;
}

function generateMoreQuestionsPrompt() {
    return "Generate 5 more different questions";
}

async function submitPrompt(prompt: string, convo: ChatSession) {
    const result = await convo.sendMessage(prompt);
    const responseText = result.response
        .text()
        .replace(/```/g, "")
        .replace(/json/gi, "")
        .trim();
    console.log(responseText);
}

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

    const convo = model.startChat({
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
            {
                role: "user",
                parts: [
                    {
                        text: generateQuestionsPrompt({
                            feedbackTopic: "Online Coaching",
                            feedbackContext:
                                "I've arranged online coaching to my students yesterday. I want to ask feedback from them.",
                            feedbackArea: [
                                "quality",
                                "time",
                                "content",
                                "engaging",
                                "practical",
                            ],
                            targetReviewer: "students",
                            questionTypes: ["scale", "choices", "text"],
                            total_questions: 5,
                        }),
                    },
                ],
            },
            {
                role: "model",
                parts: [
                    {
                        text: `{
                            "questions": [
                              {
                                "question": "How relevant and engaging did you find the content of the coaching session?",
                                "type": "scale",
                                "options": [1, 2, 3, 4, 5],
                                "optionLabels": [
                                    "Not at all relevant/engaging",
                                    "Somewhat relevant/engaging",
                                    "Neutral",
                                    "Very relevant/engaging",
                                    "Extremely relevant/engaging"
                                  ],
                                "area": "engaging"
                              },
                              {
                                "question": "What did you like most about the online coaching session?",
                                "type": "text",
                                "area": "quality"
                              }
                            ]
                        }`,
                    },
                ],
            },
            {
                role: "user",
                parts: [
                    {
                        text: `Generate 5 more different questions`,
                    },
                ],
            },
            {
                role: "model",
                parts: [
                    {
                        text: `{
                            "questions": [
                                {
                                    question: 'How would you rate the overall quality of the online coaching session?',
                                    type: "scale",
                                    options: [ 1, 2, 3, 4, 5 ],
                                    optionLabels: [ "Very poor", "Poor", "Neutral", "Good", "Excellent" ],
                                    area: "quality"
                                },
                                {
                                    "question": "Were there any specific topics or areas that you would have liked to have covered in more depth during the coaching session?",
                                    "type": "text",
                                    "area": "content"
                                },
                                {
                                    question: 'How satisfied are you with the amount of time allocated for the coaching session?',
                                    type: 'scale',
                                    options: [ 1, 2, 3, 4, 5 ],
                                    optionLabels: [
                                      "Very dissatisfied",
                                      "Dissatisfied",
                                      "Neutral",
                                      "Satisfied",
                                      "Very satisfied"
                                    ],
                                    area: "time"
                                },
                                {
                                    question: 'How practical and applicable was the content of the coaching session?',
                                    type: "scale",
                                    options: [ 1, 2, 3, 4, 5 ],
                                    optionLabels: [
                                      "Not at all practical/applicable",
                                      "Somewhat practical/applicable",
                                      "Neutral",
                                      "Very practical/applicable",
                                      "Extremely practical/applicable"
                                    ],
                                    area: "practical"
                                },
                                {
                                  "question": "Is there anything else that you would like to provide feedback on regarding the online coaching session?",
                                  "type": "text",
                                  "area": "engaging"
                                }
                            ]                           
                        }`,
                    },
                ],
            },
        ],
    });

    submitPrompt(
        generateQuestionsPrompt({
            feedbackTopic: "Software project delivery",
            feedbackContext:
                "I have submitted my work to my client. I want to gather feedback from them.",
            feedbackArea: ["Quality", "Speed", "Price"],
            targetReviewer: "the client",
        }),
        convo
    );

    submitPrompt(generateMoreQuestionsPrompt(), convo);
    submitPrompt(generateMoreQuestionsPrompt(), convo);
}

runChat();
