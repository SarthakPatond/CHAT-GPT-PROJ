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

async function generateVector(content) {

    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: content,
        config: {
            temperature: 0.7,
            outputDimensionality: 768,
            systemInstructions: `
                        You are a helpful assistant that generates vector embeddings for text content. The embeddings should capture the semantic meaning of the text, allowing for similarity comparisons and retrieval in a vector database. Focus on understanding the context and nuances of the input text to produce accurate and meaningful vector representations.

                                `
        }
    });

    const vector = response?.embeddings?.[0]?.values;

    if (!Array.isArray(vector) || vector.length === 0) {
        throw new Error('Embedding generation returned no vector values.');
    }

    return vector;
}

module.exports = {
    generateResponse,
    generateVector
};
