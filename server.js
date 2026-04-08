const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// ✅ CRIA PRIMEIRO
const app = express();



// ✅ DEPOIS usa
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: '*', // ou coloca o domínio da Hostinger
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// 🔥 ROTAS PRIMEIRO
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/communities', require('./routes/communities'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/user', require('./routes/user'));

// uploads
app.use('/uploads', express.static('uploads'));

// 🔥 STATIC DEPOIS (importante)
app.use(express.static(path.join(__dirname, 'public')));
const db = require('./config/database'); // importa seu MySQL

io.on('connection', (socket) => {
  console.log('Usuário conectado:', socket.id);

  socket.on('join_community', (communityId) => {
    socket.join(`community_${communityId}`);
  });

  socket.on('send_message', async (data) => {
    const { communityId, text, userId } = data;

    try {
      // Salva no banco
      const [result] = await db.execute(
        'INSERT INTO mensagens (comunidade_id, usuario_id, text) VALUES (?, ?, ?)',
        [communityId, userId, text]
      );

      const message = {
        id: result.insertId,
        comunidade_id: communityId,
        usuario_id: userId,
        text,
        status: 'sent',
        time: new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };

      // Envia para todos da comunidade
      io.to(`community_${communityId}`).emit('new_message', message);

      // Simula status "delivered" após 1s
      setTimeout(async () => {
        await db.execute("UPDATE mensagens SET status='delivered' WHERE id = ?", [result.insertId]);
        io.to(`community_${communityId}`).emit('update_message_status', {
          id: result.insertId,
          status: 'delivered'
        });
      }, 1000);

    } catch (err) {
      console.error(err);
      socket.emit('error_message', { error: 'Erro ao enviar mensagem' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
  });
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
});