require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testGenerate() {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Hola, di hola',
    });
    console.log("Success:", response.text);
  } catch (e) {
    console.error("Error generating:", e);
  }
}
testGenerate();
