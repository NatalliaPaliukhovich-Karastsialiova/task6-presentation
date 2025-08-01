import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import { Server } from 'socket.io';
import http from 'http';

import connectDB from './config/db.js';
import presentationSocket from './sockets/presentationSocket.js';


import presentationRoutes from './routes/presentationRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 1e8
});

app.use(express.json());

connectDB();

app.use('/api/presentations', presentationRoutes);
app.use('/api/users', userRoutes);

io.on('connection', (socket) => {
  presentationSocket(io, socket);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
