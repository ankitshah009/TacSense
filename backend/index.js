const http = require('http');
const fs = require('fs');
const path = require('path');
const { analyzeTone } = require('./analysis');

function sendJson(res, data) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/analyze') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { voiceMetrics, heartRate } = JSON.parse(body || '{}');
        const emotionalState = analyzeTone(voiceMetrics, heartRate);
        sendJson(res, { emotionalState });
      } catch (e) {
        res.writeHead(400);
        res.end();
      }
    });
  } else if (req.method === 'GET' && req.url.startsWith('/intervention/')) {
    const state = req.url.split('/').pop();
    let response = 'Stay calm';
    if (state === 'stressed') {
      response = "You sound tense—let's try a quick breathing exercise.";
    }
    sendJson(res, { response });
  } else {
    const filePath = path.join(__dirname, '../frontend/index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
