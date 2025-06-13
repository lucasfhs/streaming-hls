const express = require("express");
const fs = require("fs");
const { exec } = require("child_process");
const app = express();
const PORT = 3000;

// Configura o FFmpeg para gerar HLS
const inputVideo = "input.mp4";
const outputHLS = "stream.m3u8";

if (!fs.existsSync(inputVideo)) {
  console.error("Arquivo de vídeo não encontrado!");
  process.exit(1);
}

// Converte o vídeo para HLS usando FFmpeg
exec(
  `ffmpeg -i ${inputVideo} \
    -profile:v baseline -level 3.0 \
    -s 640x360 -start_number 0 \
    -hls_time 10 -hls_list_size 0 \
    -f hls ${outputHLS}`,
  (err) => {
    if (err) {
      console.error("Erro ao converter vídeo:", err);
      return;
    }
    console.log("Vídeo convertido para HLS!");
  }
);

// Rota para servir os arquivos HLS
app.use(express.static(__dirname));

// Rota principal (player HLS)
app.get("/", (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Player HLS com Express</title>
            <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
        </head>
        <body>
            <video id="video" width="640" controls></video>
            <script>
                const video = document.getElementById('video');
                if (Hls.isSupported()) {
                    const hls = new Hls();
                    hls.loadSource('/stream.m3u8');
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play());
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = '/stream.m3u8';
                    video.addEventListener('loadedmetadata', () => video.play());
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
