const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateResponse(content) {

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: content
    });

    return response.text; // correct
}

module.exports = {
    generateResponse
};