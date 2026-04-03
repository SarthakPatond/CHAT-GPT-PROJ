const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');

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
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes); 

// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, '../public', 'index.html'));
// })

// Serve frontend build
app.use(express.static(path.join(__dirname, "../../Frontend/dist")));

// When user opens site
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../Frontend/dist/index.html"));
});

// For unknown API routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});


module.exports = app;
