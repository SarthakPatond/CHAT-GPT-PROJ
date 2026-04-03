import React, { useEffect, useRef, useState } from 'react';
import { io } from "socket.io-client";
import ChatMobileBar from '../components/chat/ChatMobileBar.jsx';
import ChatSidebar from '../components/chat/ChatSidebar.jsx';
import ChatMessages from '../components/chat/ChatMessages.jsx';
import ChatComposer from '../components/chat/ChatComposer.jsx';
import '../components/chat/ChatLayout.css';
import { useDispatch, useSelector } from 'react-redux';
import {
    startNewChat,
    selectChat,
    setInput,
    sendingStarted,
    sendingFinished,
    setChats
} from '../store/chatSlice.js';
import { api, getAuthToken, normalizeChat, SOCKET_URL } from '../lib/api.js';

const Home = () => {
    const dispatch = useDispatch();
    const chats = useSelector(state => state.chat.chats);
    const activeChatId = useSelector(state => state.chat.activeChatId);
    const input = useSelector(state => state.chat.input);
    const isSending = useSelector(state => state.chat.isSending);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);

    const getMessages = async (chatId) => {
        const response = await api.get(`/chat/messages/${chatId}`);

        setMessages(response.data.messages.map(m => ({
            type: m.role === 'user' ? 'user' : 'ai',
            content: m.content
        })));
    };

    const handleNewChat = async () => {
        let title = window.prompt('Enter a title for the new chat:', '');
        if (title) title = title.trim();
        if (!title) return;

        try {
            const response = await api.post('/chat', {
                title
            });

            const newChat = normalizeChat(response.data.chat);
            dispatch(startNewChat(newChat));
            setMessages([]);
            setSidebarOpen(false);
        } catch (error) {
            console.error('Failed to create chat:', error);
            if (error.response?.status === 401) {
                alert('Your session is missing or expired. Please log in again.');
            }
        }
    };

    useEffect(() => {
        let mounted = true;

        api.get('/chat')
            .then(async (response) => {
                if (!mounted) return;

                const normalizedChats = response.data.chats
                    .map(normalizeChat)
                    .filter(Boolean)
                    .reverse();

                dispatch(setChats(normalizedChats));

                if (normalizedChats.length > 0) {
                    const firstChatId = normalizedChats[0].id;
                    dispatch(selectChat(firstChatId));
                    await getMessages(firstChatId);
                }
            })
            .catch((error) => {
                console.error('Failed to load chats:', error);
            });

        const authToken = getAuthToken();
        const tempSocket = io(SOCKET_URL, {
            withCredentials: true,
            auth: authToken ? { token: authToken } : undefined,
        });

        tempSocket.on("ai-response", (messagePayload) => {
            console.log("Received AI response:", messagePayload);

            setMessages((prevMessages) => [...prevMessages, {
                type: 'ai',
                content: messagePayload.content
            }]);

            dispatch(sendingFinished());
        });

        tempSocket.on("ai-error", (errorPayload) => {
            console.error("AI error:", errorPayload);
            dispatch(sendingFinished());
        });

        tempSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
            dispatch(sendingFinished());
        });

        socketRef.current = tempSocket;

        return () => {
            mounted = false;
            tempSocket.disconnect();
        };
    }, [dispatch]);

    const sendMessage = async () => {
        const trimmed = input.trim();
        if (!trimmed || !activeChatId || isSending) return;

        if (!socketRef.current?.connected) {
            console.error('Socket is not connected.');
            return;
        }

        dispatch(sendingStarted());

        const newMessages = [...messages, {
            type: 'user',
            content: trimmed
        }];

        console.log("New messages:", newMessages);

        setMessages(newMessages);
        dispatch(setInput(''));

        socketRef.current.emit("ai-message", {
            chat: activeChatId,
            content: trimmed
        });
    };

    return (
        <div className="chat-layout minimal">
            <ChatMobileBar
                onToggleSidebar={() => setSidebarOpen(o => !o)}
                onNewChat={handleNewChat}
            />
            <ChatSidebar
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={(id) => {
                    dispatch(selectChat(id));
                    setSidebarOpen(false);
                    getMessages(id);
                }}
                onNewChat={handleNewChat}
                open={sidebarOpen}
            />
            <main className="chat-main" role="main">
                {messages.length === 0 && (
                    <div className="chat-welcome" aria-hidden="true">
                        <div className="chip">Early Preview</div>
                        <h1>ChatGPT Clone</h1>
                        <p>Ask anything. Paste text, brainstorm ideas, or get quick explanations. Your chats stay in the sidebar so you can pick up where you left off.</p>
                    </div>
                )}
                <ChatMessages messages={messages} isSending={isSending} />
                {
                    activeChatId &&
                    <ChatComposer
                        input={input}
                        setInput={(v) => dispatch(setInput(v))}
                        onSend={sendMessage}
                        isSending={isSending}
                    />}
            </main>
            {sidebarOpen && (
                <button
                    className="sidebar-backdrop"
                    aria-label="Close sidebar"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Home;
