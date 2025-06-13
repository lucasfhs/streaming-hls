const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = 3000;

// Sirva arquivos estáticos (HTML, JS)
app.use(express.static("public"));

// Rota principal
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Lógica WebRTC (Socket.io)
io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

  // Recebe uma oferta (offer) de um usuário e envia para outro
  socket.on("offer", (offer) => {
    socket.broadcast.emit("offer", offer); // Envia para todos, exceto o emissor
  });

  // Recebe uma resposta (answer) e envia de volta
  socket.on("answer", (answer) => {
    socket.broadcast.emit("answer", answer);
  });

  // Troca de ICE Candidates (conexão P2P)
  socket.on("ice-candidate", (candidate) => {
    socket.broadcast.emit("ice-candidate", candidate);
  });
});

http.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
