const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = 3001;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/meet-client.html');
});

// Armazenamento de sala (simplificado)
const rooms = {};

io.on('connection', (socket) => {
  console.log('Novo usuário conectado:', socket.id);

  // Entrar na sala padrão (poderia ser parametrizado)
  const roomId = 'default-room';
  socket.join(roomId);
  
  // Notificar os outros usuários na sala sobre o novo participante
  socket.to(roomId).emit('user-connected', socket.id);

  // Enviar lista de usuários existentes para o novo participante
  const users = [];
  io.sockets.adapter.rooms.get(roomId)?.forEach(id => {
    if (id !== socket.id) users.push(id);
  });
  socket.emit('existing-users', users);

  // Gerenciamento de ofertas/respostas WebRTC
  socket.on('signal', (data) => {
    io.to(data.target).emit('signal', {
      ...data,
      sender: socket.id
    });
  });

  // Quando um usuário desconecta
  socket.on('disconnect', () => {
    console.log('Usuário desconectado:', socket.id);
    socket.to(roomId).emit('user-disconnected', socket.id);
  });
});

http.listen(PORT, () => {
  console.log(`Servidor Meet rodando em http://localhost:${PORT}`);
});