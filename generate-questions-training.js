import {
  HarmCategory,
  HarmBlockThreshold
} from "@google/generative-ai";

export const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048
};

export function parseModelResponse(modelResponse) {     
    const responseJson = modelResponse.response.text()
        .replace(/```/g, "")
        .replace(/json/gi, "")
        .trim();
    console.log(responseJson);
    const jsonResult = JSON.parse(responseJson);
    return jsonResult;
}

export const safetySettings = [
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

export function generateQuestionsPrompt(options) {
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
    
    response in json format strictly.
    `;
}

export const analyzeFeedbackTrain = [
    {
        role: "user",
        parts: [
            {
                text: "I have gather feedback from my client. These are the questions",
            },
            {
                text: `[
                    {
                        "question": "How would you rate the overall quality of the software project delivered?",
                        "type": "scale",
                        "options": [1, 2, 3, 4, 5],
                        "optionLabels": ["Very poor", "Poor", "Neutral", "Good", "Excellent"],
                        "area": "Quality"
                    },
                    {
                        "question": "How satisfied are you with the speed of the project delivery?",
                        "type": "scale",
                        "options": [1, 2, 3, 4, 5],
                        "optionLabels": ["Very dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very satisfied"],
                        "area": "Speed"
                    },
                    {
                        "question": "Do you believe the price of the project delivery was fair based on the quality of the work delivered?",
                        "type": "choices",
                        "options": ["Yes", "No", "Not sure"],
                        "area": "Price"
                    },
                    {
                        "question": "Are there any specific areas where you believe the project could have been improved upon?",
                        "type": "text",
                        "area": "Quality"
                    },
                    {
                        "question": "Do you have any other feedback regarding the project delivery that you would like to share?",
                        "type": "text",
                        "area": "All"
                    }
                ]`,
            },
            {
                text: "Help me analyze sentiment of the feedback on each area and overall as score 1-5 and provide a summary of the feedback. Response in Json format",
            },
            {
                text: `
                [
                    {
                        "Quality": 4,
                        "Speed": 3,
                        "Price": 5,
                        "Quality_text": "The software was very well-designed and met all of our requirements.",
                        "Overall_text": "The project was delivered on time, but we had some communication issues in the early stages."
                    },
                    {
                        "Quality": 5,
                        "Speed": 5,
                        "Price": 4,
                        "Quality_text": "The software was of excellent quality and exceeded our expectations.",
                        "Overall_text": "The project was delivered quickly and efficiently. The pricing was fair."
                    },
                    {
                        "Quality": 3,
                        "Speed": 2,
                        "Price": 3,
                        "Quality_text": "There were a few bugs in the software that needed to be fixed.",
                        "Overall_text": "The project was delivered later than expected and the price was a bit high."
                    },
                    {
                        "Quality": 4,
                        "Speed": 4,
                        "Price": 5,
                        "Quality_text": "The software was well-built and easy to use.",
                        "Overall_text": "The project was delivered on time and within budget. We were very happy with the results."
                    },
                    {
                        "Quality": 2,
                        "Speed": 1,
                        "Price": 2,
                        "Quality_text": "The software was not very user-friendly and had several technical issues.",
                        "Overall_text": "The project was delayed and the price was too high for the quality of the work."
                    }
                `
            }
        ],
    },
    {
        role: "model",
        parts: [
            {
                text: `[
                        { 
                            "area": "Quality",
                            "score": 4,
                            "summary": "The client was generally satisfied with the quality of the software project delivered. They appreciated the attention to detail and the thoroughness of the work. However, they felt that there were some areas where the project could have been improved upon.",
                            "action": "Consider providing more detailed documentation and clearer communication to address the client's concerns."

                        },
                        {
                            "area": "Speed",
                            "score": 3,
                            "summary": "The client was somewhat dissatisfied with the speed of the project delivery. They felt that the project took longer than expected and impacted their timeline. They suggested improving the project management and communication to ensure timely delivery."
                            "action": "Consider implementing project management tools and regular check-ins to keep the client informed of progress."
                        },
                        {
                            "area": "Price",
                            "score": 4,
                            "summary": "The client believed that the price of the project delivery was fair based on the quality of the work delivered. They appreciated the value they received for the cost.",
                            "action": "Consider providing a breakdown of the project costs and the value delivered to the client to justify the pricing."
                        },
                        {
                            "area": "All",
                            "score": 4,
                            "summary": "Overall, the client was satisfied with the project delivery. They appreciated the quality of the work and felt that the price was fair. However, they suggested improving the speed of the delivery and communication to enhance the overall experience.",
                            "action": "Consider implementing project management tools and regular check-ins to keep the client informed of progress."
                        }
                    ]`,
            },
        ],
    },
];

export const genQuestionsTrain = [
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
              text: `[{
                      "question": "How relevant and engaging did you find the content of the coaching session?",
                      "type": "scale",
                      "options": [
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
                    }]`,
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
              text: `[{
                          question: 'How would you rate the overall quality of the online coaching session?',
                          type: "scale",
                          options: [ "Very poor", "Poor", "Neutral", "Good", "Excellent" ],
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
                          options: [
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
                          options: [
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
                      }]`,
          },
      ],
  },
];

export async function submitPrompt(prompt, convo) {
  const result = await convo.sendMessage(prompt);
  console.log(result.response.text());
  const responseText = result.response
      .text()
      .replace(/```/g, "")
      .replace(/json/gi, "")
      .trim();
  console.log(responseText);
}

// type QuestionsPromptOptions = {
//     feedbackTopic: string;
//     feedbackContext: string;
//     feedbackArea: string[];
//     targetReviewer: string;
//     questionTypes?: string[];
//     lang?: string;
//     total_questions?: number;
// };

export function generateMoreQuestionsPrompt(numQuestions = 5) {
    return `Generate ${numQuestions} more different questions`;
}