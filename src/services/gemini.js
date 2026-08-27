import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export async function askGeminiExplanation(questionItem) {
  if (!apiKey) {
    return "API Key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = 
      'You are the expert LET (Licensure Examination for Teachers) AI Study Companion for "Project Jill".\n' +
      'Analyze the following exam question thoroughly and break down why the correct answer is right and why the distractors are wrong:\n\n' +
      'Question: ' + questionItem.question + '\n' +
      'Subject/Topic: ' + (questionItem.subject || '') + ' - ' + (questionItem.topic || '') + '\n' +
      'Choices:\n' +
      'A: ' + (questionItem.choices?.A || '') + '\n' +
      'B: ' + (questionItem.choices?.B || '') + '\n' +
      'C: ' + (questionItem.choices?.C || '') + '\n' +
      'D: ' + (questionItem.choices?.D || '') + '\n\n' +
      'Official Correct Answer: ' + questionItem.correctAnswer + ' (' + (questionItem.choices ? questionItem.choices[questionItem.correctAnswer] : '') + ')\n\n' +
      'Provide a formatted, easy-to-read breakdown with:\n' +
      '- 🎯 Choice Analysis (brief reason for each option A, B, C, D)\n' +
      '- 💡 Core Pedagogical Concept / Memory Anchor\n' +
      '- ⚡ High-Yield LET Exam Tip';

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not connect to AI analysis. Please check your internet connection and API key.";
  }
}