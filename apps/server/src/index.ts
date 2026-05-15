import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { MockAdapter } from './adapters/mock.adapter.js';
import { AgentType } from '@agenthub/shared';
import type { ChatMessage } from '@agenthub/shared';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const aiAdapter = new MockAdapter();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('sendMessage', async (data: { messages: ChatMessage[], agentType: AgentType }) => {
    console.log('Message received for AI:', data.agentType);
    
    try {
      const stream = await aiAdapter.chatStream(data.messages, data.agentType);
      
      let fullContent = '';
      stream.onChunk((chunk) => {
        fullContent += chunk;
        socket.emit('aiChunk', { chunk, conversationId: data.messages[0]?.conversationId });
      });

      stream.onComplete((content) => {
        socket.emit('aiComplete', { 
          fullContent: content, 
          agentType: data.agentType,
          conversationId: data.messages[0]?.conversationId 
        });
      });
    } catch (error) {
      console.error('AI Stream Error:', error);
      socket.emit('error', { message: 'AI 响应失败' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
