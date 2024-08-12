import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ConnectDB from './db.js';
import { approuter } from './router.js';
import http from 'http';
import { Server } from 'socket.io';
import { postReq } from './controllers/ccavRequestHandler.js';
import { postRes } from './controllers/ccavResponseHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const SOCKET_PORT = 1338;

// Middleware for parsing the request body
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));

const allowedOrigins = ['http://localhost:3000', 'http://13.127.29.180'];

// Configure CORS
app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Use the router for API routes
app.use(approuter);

// Endpoint for CCAV request handler
app.post("/ccavRequestHandler", postReq);

// Endpoint for CCAV response handler
app.post('/ccavResponseHandler', (req, res) => {
    postRes(req, res);
});

// // Get the directory name for serving static files
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // Serve static files (if needed)
// app.use(express.static(path.join(__dirname, 'public'))); // Assuming 'public' is your static files directory

// Set up HTTP server and Socket.io
const httpServer = http.createServer(app);
const io = new Server(httpServer);

// Handle Socket.io connections
io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Define your socket event listeners here
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Connect to the database and start the servers
ConnectDB()
    .then(() => {
        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((e) => {
        console.error('MongoDB connection failed:', e.message);
    });
