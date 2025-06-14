const http = require('http');
const fs = require('fs');
const path = require('path');
const { analyzeVoice, analyzeText, analyzeVisual, generateRecommendations } = require('./analysis');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Helper function to send JSON responses
function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 
    'Content-Type': 'application/json',
    ...corsHeaders 
  });
  res.end(JSON.stringify(data));
}

// In-memory data store (in a real app, use a database)
const tacticalData = {
  units: [],
  threats: [],
  lastUpdated: new Date().toISOString()
};

// Initialize mock data
function initializeMockData() {
  tacticalData.units = [
    { id: 'unit-1', callsign: 'Alpha', status: 'active', position: { lat: 34.0522, lng: -118.2437 } },
    { id: 'unit-2', callsign: 'Bravo', status: 'active', position: { lat: 34.0622, lng: -118.2537 } }
  ];
  tacticalData.threats = [
    { id: 'threat-1', type: 'suspicious_vehicle', position: { lat: 34.0572, lng: -118.2487 }, confidence: 0.85 }
  ];
}

// Process incoming requests
const server = http.createServer(async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // API Routes
  if (req.method === 'POST' && req.url.startsWith('/api/analyze/')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    
    req.on('end', async () => {
      try {
        const endpoint = req.url.split('/').pop();
        const data = body ? JSON.parse(body) : {};
        let result;

        switch(endpoint) {
          case 'voice':
            result = analyzeVoice(data.voiceMetrics || {});
            break;
          case 'text':
            result = analyzeText(data.text || '');
            break;
          case 'visual':
            result = analyzeVisual(data.visualData || {});
            break;
          default:
            throw new Error('Invalid analysis endpoint');
        }
        
        // Generate recommendations based on all available context
        const recommendations = generateRecommendations({
          voice: result.urgency ? result : {},
          text: result.intent ? result : {},
          visual: result.threats ? result : {}
        });

        sendJson(res, { 
          analysis: result,
          recommendations,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.error('Analysis error:', e);
        sendJson(res, { error: e.message }, 400);
      }
    });
  } 
  // Get tactical data
  else if (req.method === 'GET' && req.url === '/api/tactical-data') {
    sendJson(res, {
      ...tacticalData,
      timestamp: new Date().toISOString()
    });
  }
  // Update unit position
  else if (req.method === 'POST' && req.url === '/api/update-position') {
    let body = '';
    req.on('data', chunk => body += chunk);
    
    req.on('end', () => {
      try {
        const { unitId, position } = JSON.parse(body);
        const unit = tacticalData.units.find(u => u.id === unitId);
        if (unit) {
          unit.position = position;
          unit.lastUpdated = new Date().toISOString();
          tacticalData.lastUpdated = new Date().toISOString();
          sendJson(res, { success: true, unit });
        } else {
          sendJson(res, { error: 'Unit not found' }, 404);
        }
      } catch (e) {
        sendJson(res, { error: e.message }, 400);
      }
    });
  }
  // Serve frontend files
  else {
    let filePath = path.join(__dirname, '../frontend', req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    let contentType = 'text/html';

    // Set content type based on file extension
    switch (extname) {
      case '.js':
        contentType = 'text/javascript';
        break;
      case '.css':
        contentType = 'text/css';
        break;
      case '.json':
        contentType = 'application/json';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpg';
        break;
    }

    // Read and serve the file
    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // Page not found
          fs.readFile(path.join(__dirname, '../frontend/404.html'), (err, content) => {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(content || '404 Not Found');
          });
        } else {
          // Server error
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        // Success
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  }
});

// Initialize mock data
initializeMockData();

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`TacSense AI Server running on port ${PORT}`);
  console.log(`API Endpoints:`);
  console.log(`  POST /api/analyze/voice - Analyze voice commands`);
  console.log(`  POST /api/analyze/text - Analyze text intel`);
  console.log(`  POST /api/analyze/visual - Analyze visual data`);
  console.log(`  GET /api/tactical-data - Get current tactical data`);
  console.log(`  POST /api/update-position - Update unit position`);
});
