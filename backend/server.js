// Basic Express server for administracion laborde innovacion
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'mimagno123';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'mimagno123';

app.use(express.json());
app.use(cors());

const dataDir = path.join(__dirname, 'data');
const coursesFile = path.join(dataDir, 'courses.json');
const policiesFile = path.join(dataDir, 'policies.json');

async function readJson(file) {
  try {
    const content = await fs.readFile(file, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

async function writeJson(file, data) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

// login route
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ token: AUTH_TOKEN });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// auth middleware
function authGuard(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader === `Bearer ${AUTH_TOKEN}`) {
    return next();
  }
  return res.status(403).json({ error: 'Unauthorized' });
}

// Courses endpoints
app.get('/api/courses', authGuard, async (req, res) => {
  const data = await readJson(coursesFile);
  res.json(data);
});

app.post('/api/courses', authGuard, async (req, res) => {
  const data = await readJson(coursesFile);
  const newCourse = { id: Date.now(), ...req.body };
  data.push(newCourse);
  await writeJson(coursesFile, data);
  res.status(201).json(newCourse);
});

app.put('/api/courses/:id', authGuard, async (req, res) => {
  const id = parseInt(req.params.id);
  let data = await readJson(coursesFile);
  const index = data.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  data[index] = { ...data[index], ...req.body };
  await writeJson(coursesFile, data);
  res.json(data[index]);
});

app.delete('/api/courses/:id', authGuard, async (req, res) => {
  const id = parseInt(req.params.id);
  let data = await readJson(coursesFile);
  data = data.filter(c => c.id !== id);
  await writeJson(coursesFile, data);
  res.status(204).end();
});

// Policies endpoints
app.get('/api/policies', authGuard, async (req, res) => {
  const data = await readJson(policiesFile);
  res.json(data);
});

app.post('/api/policies', authGuard, async (req, res) => {
  const data = await readJson(policiesFile);
  const newPolicy = { id: Date.now(), ...req.body };
  data.push(newPolicy);
  await writeJson(policiesFile, data);
  res.status(201).json(newPolicy);
});

app.put('/api/policies/:id', authGuard, async (req, res) => {
  const id = parseInt(req.params.id);
  let data = await readJson(policiesFile);
  const index = data.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Not found' });
  }
  data[index] = { ...data[index], ...req.body };
  await writeJson(policiesFile, data);
  res.json(data[index]);
});

app.delete('/api/policies/:id', authGuard, async (req, res) => {
  const id = parseInt(req.params.id);
  let data = await readJson(policiesFile);
  data = data.filter(p => p.id !== id);
  await writeJson(policiesFile, data);
  res.status(204).end();
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
