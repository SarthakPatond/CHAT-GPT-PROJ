// Import the Pinecone library
const { Pinecone } = require('@pinecone-database/pinecone')

// Initialize a Pinecone client with your API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const cohortChatGptIndex = pc.Index('cohort-chat-gpt'); // Replace with your index name

async function createMemory({ vectors, metadata, messageId }) {
    if (!Array.isArray(vectors) || vectors.length === 0) {
        return null;
    }

    await cohortChatGptIndex.upsert({
        records: [{
            id: messageId,
            values: vectors,
            metadata
        }]
    });
}

async function queryMemory({ queryVector, limit = 5, metadata }) {
    if (!Array.isArray(queryVector) || queryVector.length === 0) {
        return [];
    }

    const data = await cohortChatGptIndex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata || undefined,
        includeMetadata: true
    });
    return data.matches || [];
}


module.exports = {
    createMemory,
    queryMemory
}
