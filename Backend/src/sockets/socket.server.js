const { Server } = require("socket.io");
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
const aiService = require('../services/ai.service');
const messageModel = require('../models/message.model');
const { createMemory, queryMemory } = require('../services/vector.service');

function getSocketToken(socket) {
    const cookies = cookie.parse(socket.handshake?.headers.cookie || '');
    if (cookies.token) return cookies.token;

    const authToken = socket.handshake?.auth?.token;
    if (authToken) return authToken;

    const authHeader = socket.handshake?.headers?.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return null;
}

function initSocketServer(httpServer) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const io = new Server(httpServer, {
        cors: {
            origin: frontendUrl,
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true, // Allow cookies to be sent
        }
    });

    // 🔐 AUTH MIDDLEWARE
    io.use(async (socket, next) => {
        const token = getSocketToken(socket);

        if (!token) {
            return next(new Error("Authentication error - No token provided"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.id);

            if (!user) {
                return next(new Error("Authentication error - User not found"));
            }

            socket.user = user;
            return next();
        } catch (error) {
            return next(new Error("Authentication error - Invalid token"));
        }
    });

    // 🔌 SOCKET CONNECTION
    io.on("connection", (socket) => {

        socket.on("ai-message", async (messagePayload) => {
            try {
                const content = messagePayload?.content?.trim();
                const chatId = messagePayload?.chat;

                if (!content || !chatId) {
                    return socket.emit("ai-error", {
                        message: "Invalid message payload."
                    });
                }

                // =========================
                // 1. SAVE USER MESSAGE
                // =========================
                const userMessage = await messageModel.create({
                    chat: chatId,
                    user: socket.user._id,
                    content,
                    role: 'user'
                });

                // =========================
                // 2. GENERATE VECTOR
                // =========================
                const vectors = await aiService.generateVector(content);

                if (!vectors || vectors.length === 0) {
                    console.log("❌ No vectors generated");
                } else {
                    // =========================
                    // 3. STORE IN PINECONE
                    // =========================
                    await createMemory({
                        vectors,
                        messageId: userMessage._id.toString(),
                        metadata: {
                            chat: String(chatId),
                            user: socket.user._id.toString(),
                            role: 'user',
                            text: content
                        }
                    });
                }

                // =========================
                // 4. FETCH MEMORY + HISTORY
                // =========================
                const [memory, chatHistory] = await Promise.all([
                    queryMemory({
                        queryVector: vectors,
                        limit: 3,
                        metadata: {
                            user: socket.user._id.toString()
                        }
                    }),
                    messageModel.find({ chat: chatId })
                        .sort({ createdAt: -1 })
                        .limit(20)
                        .lean()
                        .then(msgs => msgs.reverse())
                ]);

                // =========================
                // 5. PREPARE PROMPT
                // =========================
                const stm = chatHistory.map(item => ({
                    role: item.role,
                    parts: [{ text: item.content }]
                }));

                const ltm = [
                    {
                        role: 'user',
                        parts: [{
                            text: `
Previous relevant messages:
${memory.map(item => item.metadata?.text || '').join("\n")}
`
                        }]
                    }
                ];

                // =========================
                // 6. GENERATE AI RESPONSE
                // =========================
                const response = await aiService.generateResponse([...ltm, ...stm]);

                // =========================
                // 7. SEND RESPONSE TO CLIENT
                // =========================
                socket.emit("ai-response", {
                    content: response,
                    chat: chatId
                });

                // =========================
                // 8. SAVE AI MESSAGE
                // =========================
                const modelMessage = await messageModel.create({
                    chat: chatId,
                    user: socket.user._id,
                    content: response,
                    role: 'model'
                });

                // =========================
                // 9. STORE AI RESPONSE VECTOR
                // =========================
                const responseVectors = await aiService.generateVector(response);

                if (responseVectors && responseVectors.length > 0) {
                    await createMemory({
                        vectors: responseVectors,
                        messageId: modelMessage._id.toString(),
                        metadata: {
                            chat: String(chatId),
                            user: socket.user._id.toString(),
                            role: 'model',
                            text: response
                        }
                    });
                }

            } catch (error) {
                console.error("❌ AI message error:", error);
                socket.emit("ai-error", {
                    message: "Failed to process AI message."
                });
            }
        });

    });
}

module.exports = initSocketServer;
