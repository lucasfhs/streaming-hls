const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const PORT = 3001;

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/webrtc-client.html");
});

// Lógica de sinalização WebRTC
io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

  socket.on("offer", (offer) => {
    socket.broadcast.emit("offer", offer);
  });

  socket.on("answer", (answer) => {
    socket.broadcast.emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate) => {
    socket.broadcast.emit("ice-candidate", candidate);
  });
});

http.listen(PORT, () => {
  console.log(`Servidor WebRTC rodando em http://localhost:${PORT}`);
});
