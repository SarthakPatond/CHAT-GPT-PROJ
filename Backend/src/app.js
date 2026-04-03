const express = require('express');
const cookieParser = require('cookie-parser');

const cors = require('cors');



/* Routes */
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');

const app = express();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

//middlewares

app.use(cors({
    origin: frontendUrl,
    credentials: true, // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes); 


module.exports = app;
