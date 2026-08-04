#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

import { fileURLToPath } from 'url';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, 'coaching_state.json');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Initialize state file if not exists
if (!fs.existsSync(STATE_FILE)) {
  fs.writeFileSync(STATE_FILE, JSON.stringify({
    locale: 'tr',
    ratings: {},
    values: [],
    plans: []
  }, null, 2));
}

// ----------------------------------------------------
// 1. Start HTTP Server for Vue App & Static Serving
// ----------------------------------------------------
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/state' && req.method === 'GET') {
    try {
      const data = fs.readFileSync(STATE_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
  } else if (req.url === '/api/state' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        fs.writeFileSync(STATE_FILE, JSON.stringify(parsed, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    // Serve static files from './dist'
    let filePath = path.join(__dirname, 'dist', req.url === '/' ? 'index.html' : req.url);
    
    // Safety check to prevent directory traversal
    if (!filePath.startsWith(path.join(__dirname, 'dist'))) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || stats.isDirectory()) {
        // SPA Fallback: Serve index.html
        filePath = path.join(__dirname, 'dist', 'index.html');
      }

      fs.readFile(filePath, (readErr, content) => {
        if (readErr) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      });
    });
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[MCP HTTP API] Port ${PORT} already in use. Stdio MCP will still work.`);
  } else {
    throw err;
  }
});

server.listen(PORT, () => {
  console.error(`[MCP HTTP API] Listening on http://localhost:${PORT}`);
});

// ----------------------------------------------------
// 2. Start MCP Stdio JSON-RPC Interface
// ----------------------------------------------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    handleRequest(request);
  } catch (err) {
    sendError(null, -32700, "Parse error");
  }
});

function sendResponse(id, result) {
  const response = {
    jsonrpc: "2.0",
    id,
    result
  };
  process.stdout.write(JSON.stringify(response) + '\n');
}

function sendError(id, code, message) {
  const response = {
    jsonrpc: "2.0",
    id,
    error: { code, message }
  };
  process.stdout.write(JSON.stringify(response) + '\n');
}

function handleRequest(req) {
  const { method, id, params } = req;
  
  if (method === 'initialize') {
    sendResponse(id, {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: {}
      },
      serverInfo: {
        name: "interactive-coaching-mcp",
        version: "1.0.0"
      }
    });
    return;
  }
  
  if (method === 'notifications/initialized') {
    return;
  }
  
  if (method === 'tools/list') {
    sendResponse(id, {
      tools: [
        {
          name: "get_state",
          description: "Get the current coaching state containing Wheel of Life ratings, selected Core Values, and active T-GROW/KAMÇI coaching plans.",
          inputSchema: { type: "object", properties: {} }
        },
        {
          name: "update_ratings",
          description: "Update the Wheel of Life ratings. Provide ratings for life areas (health, career, social, family, friendship, finance, spiritual, growth). Each area should map to an object with current and target ratings (1-10).",
          inputSchema: {
            type: "object",
            properties: {
              ratings: {
                type: "object",
                description: "Object mapping life areas (health, career, social, family, friendship, finance, spiritual, growth) to their current and target scores."
              }
            },
            required: ["ratings"]
          }
        },
        {
          name: "update_values",
          description: "Update the selected core values. Provide exactly 5 values from the list of core values.",
          inputSchema: {
            type: "object",
            properties: {
              values: {
                type: "array",
                items: { type: "string" },
                description: "List of exactly 5 selected values."
              }
            },
            required: ["values"]
          }
        },
        {
          name: "add_plan",
          description: "Add a new T-GROW/KAMÇI coaching plan/commitment.",
          inputSchema: {
            type: "object",
            properties: {
              area: { type: "string", description: "Life area (health, career, social, family, friendship, finance, spiritual, growth)" },
              subject: { type: "string", description: "Topic or subject of the coaching plan" },
              goal: { type: "string", description: "The goal of the plan" },
              status: { type: "string", description: "Current reality or status" },
              cure: {
                type: "object",
                properties: {
                  what: { type: "string" },
                  why: { type: "string" },
                  how: { type: "string" },
                  where: { type: "string" },
                  when: { type: "string" },
                  who: { type: "string" },
                  obstacle: { type: "string" }
                },
                required: ["what", "why", "how", "where", "when", "who"]
              },
              commitment: { type: "string", description: "The final commitment statement" }
            },
            required: ["area", "subject", "goal", "status", "cure", "commitment"]
          }
        }
      ]
    });
    return;
  }
  
  if (method === 'tools/call') {
    const { name, arguments: args } = params;
    
    try {
      const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      
      if (name === 'get_state') {
        sendResponse(id, {
          content: [{
            type: "text",
            text: JSON.stringify(state, null, 2)
          }]
        });
        return;
      }
      
      if (name === 'update_ratings') {
        state.ratings = Object.assign({}, state.ratings, args.ratings);
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        sendResponse(id, {
          content: [{
            type: "text",
            text: "Ratings successfully updated."
          }]
        });
        return;
      }
      
      if (name === 'update_values') {
        state.values = args.values;
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        sendResponse(id, {
          content: [{
            type: "text",
            text: "Core values successfully updated."
          }]
        });
        return;
      }
      
      if (name === 'add_plan') {
        const newPlan = Object.assign({}, args, {
          id: 'plan_' + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toLocaleDateString('tr-TR')
        });
        state.plans.push(newPlan);
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
        sendResponse(id, {
          content: [{
            type: "text",
            text: `Coaching plan successfully added with ID: ${newPlan.id}`
          }]
        });
        return;
      }
      
      sendError(id, -32601, `Tool not found: ${name}`);
    } catch (err) {
      sendError(id, -32603, `Internal error: ${err.message}`);
    }
    return;
  }
  
  sendError(id, -32601, `Method not found: ${method}`);
}
