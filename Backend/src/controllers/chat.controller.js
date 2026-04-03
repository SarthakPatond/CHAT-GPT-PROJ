const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');

function serializeChat(chat) {
    return {
        id: chat._id,
        title: chat.title,
        lastActivity: chat.lastActivity,
        user: chat.user
    };
}

async function createChat(req, res) {
    const { title } = req.body;
    const user = req.user;

    const chat = await chatModel.create({
        user: user._id,
        title
    });
    return res.status(201).json({
        message: 'Chat created successfully',
        chat: serializeChat(chat)
    });
}

async function getChats(req, res) {
    const user = req.user;
    const chats = await chatModel.find({ user: user._id });

    return res.status(200).json({
        message: 'Chats retrieved successfully',
        chats: chats.map(serializeChat)
    });
}

async function getMessages(req, res) {
    const chatId = req.params.id;
    // const user = req.user;

    // const chat = await chatModel.findOne({ _id: chatId, user: user._id }).populate('messages');

    const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });

    res.status(200).json({
        message: 'Messages retrieved successfully',
        messages: messages
    })

}

module.exports = {
    createChat,
    getChats,
    getMessages
};
