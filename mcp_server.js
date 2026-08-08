#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { initialUsers, initialSessionNotes, initialCoachFeedbacks, defaultClientsMock, seedInitialData } from './seedData.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env file natively if available
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  try {
    process.loadEnvFile(envPath);
  } catch (e) {}
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/life-coach';
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

// ----------------------------------------------------
// MongoDB Connection & Schemas
// ----------------------------------------------------
let isMongoConnected = false;

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String },
  roles: [{ type: String, enum: ['coach', 'client'], required: true }],
  coachId: { type: String, default: null },
  avatarColor: { type: String, default: '#6366f1' }
}, { timestamps: true });

const coachingStateSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  locale: { type: String, default: 'tr' },
  ratings: { type: Object, default: {} },
  values: { type: Array, default: [] },
  plans: { type: Array, default: [] },
  colorAnswers: { type: Object, default: {} }
}, { timestamps: true });

const sessionNoteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clientId: { type: String, required: true },
  coachId: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: String, required: true },
  actionItems: [{ type: String }],
  tags: [{ type: String }]
}, { timestamps: true });

const coachFeedbackSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  clientId: { type: String, required: true },
  coachId: { type: String, required: true },
  clientName: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  categories: {
    communication: { type: Number, default: 5 },
    guidance: { type: Number, default: 5 },
    motivation: { type: Number, default: 5 }
  },
  title: { type: String, default: '' },
  comment: { type: String, required: true },
  date: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const CoachingState = mongoose.model('CoachingState', coachingStateSchema);
const SessionNote = mongoose.model('SessionNote', sessionNoteSchema);
const CoachFeedback = mongoose.model('CoachFeedback', coachFeedbackSchema);

let fallbackFeedbacks = [...(initialCoachFeedbacks || [])];

mongoose.connect(MONGO_URI).then(() => {
  isMongoConnected = true;
  console.log('[MongoDB] Connected successfully to', MONGO_URI);
  seedInitialData({ User, CoachingState, SessionNote, CoachFeedback }, STATE_FILE);
}).catch(err => {
  console.warn('[MongoDB] Warning: Could not connect to MongoDB. Operating in local JSON fallback mode.', err.message);
});

// Helper functions for state
async function getClientState(userId = 'client_1') {
  if (isMongoConnected) {
    let state = await CoachingState.findOne({ userId });
    if (!state) {
      state = await CoachingState.create({ userId, locale: 'tr', ratings: {}, values: [], plans: [], colorAnswers: {} });
    }
    return {
      locale: state.locale,
      ratings: state.ratings || {},
      values: state.values || [],
      plans: state.plans || [],
      colorAnswers: state.colorAnswers || {}
    };
  } else {
    if (fs.existsSync(STATE_FILE)) {
      try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) {}
    }
    return { locale: 'tr', ratings: {}, values: [], plans: [], colorAnswers: {} };
  }
}

async function saveClientState(userId = 'client_1', updateData) {
  if (isMongoConnected) {
    const existing = await getClientState(userId);
    const merged = Object.assign({}, existing, updateData);
    await CoachingState.findOneAndUpdate(
      { userId },
      { $set: merged },
      { upsert: true, new: true }
    );
    // Backup to local file for client_1
    if (userId === 'client_1') {
      try { fs.writeFileSync(STATE_FILE, JSON.stringify(merged, null, 2)); } catch (e) {}
    }
    return merged;
  } else {
    let existing = {};
    if (fs.existsSync(STATE_FILE)) {
      try { existing = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch (e) {}
    }
    const updated = Object.assign({}, existing, updateData);
    fs.writeFileSync(STATE_FILE, JSON.stringify(updated, null, 2));
    return updated;
  }
}

// ----------------------------------------------------
// 1. Start HTTP Server for Vue App & Static Serving & REST API
// ----------------------------------------------------
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = urlObj.pathname;
  const query = Object.fromEntries(urlObj.searchParams);

  // API: Get users list
  if (pathname === '/api/users' && req.method === 'GET') {
    try {
      if (isMongoConnected) {
        const filter = {};
        if (query.coachId) filter.coachId = query.coachId;
        if (query.role) filter.roles = query.role;
        const users = await User.find(filter);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
      } else {
        let defaultUsers = [...initialUsers];
        if (query.coachId) {
          defaultUsers = defaultUsers.filter(u => u.coachId === query.coachId);
        }
        if (query.role) {
          defaultUsers = defaultUsers.filter(u => u.roles.includes(query.role));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(defaultUsers));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API: Get state for specific client
  if (pathname === '/api/state' && req.method === 'GET') {
    try {
      const userId = query.userId || 'client_1';
      const state = await getClientState(userId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(state));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API: Post/Update state
  if (pathname === '/api/state' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body);
        const userId = query.userId || parsed.userId || 'client_1';
        delete parsed.userId;
        await saveClientState(userId, parsed);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // API: Get session notes
  if (pathname === '/api/notes' && req.method === 'GET') {
    try {
      const clientId = query.clientId || 'client_1';
      if (isMongoConnected) {
        const notes = await SessionNote.find({ clientId }).sort({ createdAt: -1 });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(notes));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([]));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API: Post/Update session note
  if (pathname === '/api/notes' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const noteData = JSON.parse(body);
        if (!noteData.id) {
          noteData.id = 'note_' + Date.now().toString(36);
        }
        if (isMongoConnected) {
          const updatedNote = await SessionNote.findOneAndUpdate(
            { id: noteData.id },
            { $set: noteData },
            { upsert: true, new: true }
          );
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(updatedNote));
        } else {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(noteData));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: Delete session note
  if (pathname === '/api/notes' && req.method === 'DELETE') {
    try {
      const noteId = query.id;
      if (isMongoConnected && noteId) {
        await SessionNote.deleteOne({ id: noteId });
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // API: Get coach feedbacks (evaluations)
  if (pathname === '/api/feedbacks' && req.method === 'GET') {
    try {
      if (isMongoConnected) {
        try {
          const filter = {};
          if (query.coachId) filter.coachId = query.coachId;
          if (query.clientId) filter.clientId = query.clientId;
          const feedbacks = await CoachFeedback.find(filter).sort({ createdAt: -1 });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(feedbacks));
          return;
        } catch (dbErr) {
          // Pass-through to fallback
        }
      }
      let results = [...fallbackFeedbacks];
      if (query.coachId) results = results.filter(f => f.coachId === query.coachId);
      if (query.clientId) results = results.filter(f => f.clientId === query.clientId);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results));
    } catch (err) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([...fallbackFeedbacks]));
    }
    return;
  }

  // API: Post/Update coach feedback
  if (pathname === '/api/feedbacks' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const fbData = JSON.parse(body);
        if (!fbData.id) {
          fbData.id = 'feedback_' + Date.now().toString(36);
        }
        if (!fbData.date) {
          fbData.date = new Date().toLocaleDateString('tr-TR');
        }

        if (isMongoConnected) {
          try {
            const updatedFeedback = await CoachFeedback.findOneAndUpdate(
              { id: fbData.id },
              { $set: fbData },
              { upsert: true, new: true }
            );
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updatedFeedback));
            return;
          } catch (dbErr) {}
        }

        const existingIdx = fallbackFeedbacks.findIndex(f => f.id === fbData.id || (f.clientId === fbData.clientId && f.coachId === fbData.coachId));
        if (existingIdx !== -1) {
          fallbackFeedbacks[existingIdx] = { ...fallbackFeedbacks[existingIdx], ...fbData };
        } else {
          fallbackFeedbacks.unshift(fbData);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(fbData));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API: Delete coach feedback
  if (pathname === '/api/feedbacks' && req.method === 'DELETE') {
    try {
      const fbId = query.id;
      if (isMongoConnected && fbId) {
        try { await CoachFeedback.deleteOne({ id: fbId }); } catch (e) {}
      }
      if (fbId) {
        fallbackFeedbacks = fallbackFeedbacks.filter(f => f.id !== fbId);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    }
    return;
  }

  // Serve static files from './dist' or proxy to Vite Dev Server
  const distDir = path.join(__dirname, 'dist');
  let filePath = path.join(distDir, pathname === '/' ? 'index.html' : pathname);

  if (fs.existsSync(distDir)) {
    if (!filePath.startsWith(distDir)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || stats.isDirectory()) {
        filePath = path.join(distDir, 'index.html');
      }

      const extname = String(path.extname(filePath)).toLowerCase();
      const contentType = MIME_TYPES[extname] || 'application/octet-stream';

      fs.readFile(filePath, (error, content) => {
        if (error) {
          res.writeHead(500);
          res.end('Server Error: ' + error.code);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content, 'utf-8');
        }
      });
    });
  } else {
    // Proxy to Vite dev server (http://127.0.0.1:5173)
    const viteReq = http.request({
      hostname: '127.0.0.1',
      port: 5173,
      path: req.url,
      method: req.method,
      headers: req.headers
    }, (viteRes) => {
      res.writeHead(viteRes.statusCode, viteRes.headers);
      viteRes.pipe(res, { end: true });
    });

    viteReq.on('error', () => {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Bad Gateway: Vite dev server is starting up or unavailable at port 5173.');
    });

    req.pipe(viteReq, { end: true });
  }
});

server.listen(PORT, () => {
  console.log(`[MCP HTTP API] Life COACH App running on http://localhost:${PORT}`);
});

// ----------------------------------------------------
// 2. Start Stdio MCP Protocol Server for AI Tools
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
    // Suppress non-JSON input errors
  }
});

function sendResponse(id, result) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, result }) + "\n");
}

function sendError(id, code, message) {
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } }) + "\n");
}

async function handleRequest(req) {
  const { id, method, params } = req;

  if (method === 'initialize') {
    sendResponse(id, {
      protocolVersion: "2.0",
      capabilities: { tools: {} },
      serverInfo: { name: "life-coach-mcp", version: "2.0.0" }
    });
    return;
  }

  if (method === 'tools/list') {
    sendResponse(id, {
      tools: [
        {
          name: "get_state",
          description: "Fetch the complete current coaching state (ratings, values, plans, DISC color answers) for a client.",
          inputSchema: {
            type: "object",
            properties: {
              userId: { type: "string", description: "Optional client ID (defaults to client_1)" }
            }
          }
        },
        {
          name: "update_ratings",
          description: "Update life area assessment ratings for a client.",
          inputSchema: {
            type: "object",
            properties: {
              userId: { type: "string" },
              ratings: {
                type: "object",
                properties: {
                  health: { type: "object", properties: { current: { type: "number" }, target: { type: "number" } } },
                  career: { type: "object", properties: { current: { type: "number" }, target: { type: "number" } } },
                  social: { type: "object", properties: { current: { type: "number" }, target: { type: "number" } } },
                  family: { type: "object", properties: { current: { type: "number" }, target: { type: "number" } } },
                  friendship: { type: "object", properties: { current: { type: "number" }, target: { type: "number" } } },
                  finance: { type: "object", properties: { current: { type: "number" }, target: { type: "number" } } },
                  spiritual: { type: "object", properties: { current: { type: "number" }, target: { type: "number" } } },
                  growth: { type: "object", properties: { current: { type: "number" }, target: { type: "number" } } }
                }
              }
            },
            required: ["ratings"]
          }
        },
        {
          name: "update_values",
          description: "Update top 5 selected core personal values.",
          inputSchema: {
            type: "object",
            properties: {
              userId: { type: "string" },
              values: {
                type: "array",
                items: { type: "string" },
                description: "Array of exactly 5 core value keys"
              }
            },
            required: ["values"]
          }
        },
        {
          name: "add_plan",
          description: "Add a new T-GROW/KAMÇI coaching commitment action plan.",
          inputSchema: {
            type: "object",
            properties: {
              userId: { type: "string" },
              area: { type: "string" },
              subject: { type: "string" },
              goal: { type: "string" },
              status: { type: "string" },
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
                }
              },
              commitment: { type: "string" }
            },
            required: ["area", "subject", "goal", "commitment"]
          }
        },
        {
          name: "update_color_answers",
          description: "Update the 16-question DISC personality color assessment answers.",
          inputSchema: {
            type: "object",
            properties: {
              userId: { type: "string" },
              colorAnswers: { type: "object" }
            },
            required: ["colorAnswers"]
          }
        },
        {
          name: "get_clients",
          description: "Fetch list of all clients assigned to a coach.",
          inputSchema: { type: "object", properties: {} }
        },
        {
          name: "get_session_notes",
          description: "Fetch coaching session notes for a specific client.",
          inputSchema: {
            type: "object",
            properties: {
              clientId: { type: "string", description: "Client ID to fetch notes for" }
            },
            required: ["clientId"]
          }
        },
        {
          name: "add_session_note",
          description: "Add a new coaching session note for a client.",
          inputSchema: {
            type: "object",
            properties: {
              clientId: { type: "string" },
              coachId: { type: "string" },
              title: { type: "string" },
              content: { type: "string" },
              date: { type: "string" },
              actionItems: { type: "array", items: { type: "string" } },
              tags: { type: "array", items: { type: "string" } }
            },
            required: ["clientId", "title", "content"]
          }
        },
        {
          name: "get_coach_feedbacks",
          description: "Fetch coach evaluations, ratings, and feedback comments submitted by clients.",
          inputSchema: {
            type: "object",
            properties: {
              coachId: { type: "string", description: "Optional coach ID" },
              clientId: { type: "string", description: "Optional client ID" }
            }
          }
        },
        {
          name: "add_coach_feedback",
          description: "Submit or update an evaluation rating and feedback note for a coach.",
          inputSchema: {
            type: "object",
            properties: {
              clientId: { type: "string" },
              coachId: { type: "string" },
              clientName: { type: "string" },
              rating: { type: "number", description: "Overall rating 1-5" },
              categories: {
                type: "object",
                properties: {
                  communication: { type: "number" },
                  guidance: { type: "number" },
                  motivation: { type: "number" }
                }
              },
              title: { type: "string" },
              comment: { type: "string" }
            },
            required: ["clientId", "coachId", "rating", "comment"]
          }
        }
      ]
    });
    return;
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params;

    try {
      const userId = args?.userId || 'client_1';

      if (name === 'get_state') {
        const state = await getClientState(userId);
        sendResponse(id, { content: [{ type: "text", text: JSON.stringify(state, null, 2) }] });
        return;
      }

      if (name === 'update_ratings') {
        const state = await getClientState(userId);
        state.ratings = Object.assign({}, state.ratings, args.ratings);
        await saveClientState(userId, state);
        sendResponse(id, { content: [{ type: "text", text: "Ratings successfully updated." }] });
        return;
      }

      if (name === 'update_values') {
        const state = await getClientState(userId);
        state.values = args.values;
        await saveClientState(userId, state);
        sendResponse(id, { content: [{ type: "text", text: "Values successfully updated." }] });
        return;
      }

      if (name === 'add_plan') {
        const state = await getClientState(userId);
        const newPlan = {
          id: 'plan_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
          area: args.area,
          subject: args.subject,
          goal: args.goal,
          status: args.status || '',
          cure: args.cure || { what: '', why: '', how: '', where: '', when: '', who: '', obstacle: '' },
          commitment: args.commitment,
          createdAt: new Date().toLocaleDateString('tr-TR')
        };
        state.plans.push(newPlan);
        await saveClientState(userId, state);
        sendResponse(id, { content: [{ type: "text", text: `Plan successfully created with ID: ${newPlan.id}` }] });
        return;
      }

      if (name === 'update_color_answers') {
        const state = await getClientState(userId);
        state.colorAnswers = Object.assign({}, state.colorAnswers, args.colorAnswers);
        await saveClientState(userId, state);
        sendResponse(id, { content: [{ type: "text", text: "Personality color test answers successfully updated." }] });
        return;
      }

      if (name === 'get_clients') {
        let clients = [];
        if (isMongoConnected) {
          clients = await User.find({ role: 'client' });
        } else {
          clients = defaultClientsMock;
        }
        sendResponse(id, { content: [{ type: "text", text: JSON.stringify(clients, null, 2) }] });
        return;
      }

      if (name === 'get_session_notes') {
        let notes = [];
        if (isMongoConnected) {
          notes = await SessionNote.find({ clientId: args.clientId }).sort({ createdAt: -1 });
        }
        sendResponse(id, { content: [{ type: "text", text: JSON.stringify(notes, null, 2) }] });
        return;
      }

      if (name === 'add_session_note') {
        const noteId = 'note_' + Date.now().toString(36);
        const newNote = {
          id: noteId,
          clientId: args.clientId,
          coachId: args.coachId || 'coach_1',
          title: args.title,
          content: args.content,
          date: args.date || new Date().toLocaleDateString('tr-TR'),
          actionItems: args.actionItems || [],
          tags: args.tags || []
        };
        if (isMongoConnected) {
          await SessionNote.create(newNote);
        }
        sendResponse(id, { content: [{ type: "text", text: `Session note created with ID: ${noteId}` }] });
        return;
      }

      if (name === 'get_coach_feedbacks') {
        let feedbacks = [];
        if (isMongoConnected) {
          const filter = {};
          if (args?.coachId) filter.coachId = args.coachId;
          if (args?.clientId) filter.clientId = args.clientId;
          feedbacks = await CoachFeedback.find(filter).sort({ createdAt: -1 });
        } else {
          feedbacks = fallbackFeedbacks;
          if (args?.coachId) feedbacks = feedbacks.filter(f => f.coachId === args.coachId);
          if (args?.clientId) feedbacks = feedbacks.filter(f => f.clientId === args.clientId);
        }
        sendResponse(id, { content: [{ type: "text", text: JSON.stringify(feedbacks, null, 2) }] });
        return;
      }

      if (name === 'add_coach_feedback') {
        const fbId = 'feedback_' + Date.now().toString(36);
        const newFb = {
          id: fbId,
          clientId: args.clientId,
          coachId: args.coachId,
          clientName: args.clientName || '',
          rating: args.rating || 5,
          categories: args.categories || { communication: 5, guidance: 5, motivation: 5 },
          title: args.title || '',
          comment: args.comment || '',
          date: new Date().toLocaleDateString('tr-TR')
        };
        if (isMongoConnected) {
          await CoachFeedback.findOneAndUpdate(
            { id: fbId },
            { $set: newFb },
            { upsert: true, new: true }
          );
        } else {
          fallbackFeedbacks.unshift(newFb);
        }
        sendResponse(id, { content: [{ type: "text", text: `Coach feedback successfully submitted with ID: ${fbId}` }] });
        return;
      }

      sendError(id, -32601, `Tool not found: ${name}`);
    } catch (err) {
      sendError(id, -32603, `Internal error: ${err.message}`);
    }
  }
}
