require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Backend server is running');
});

// JWT authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ message: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user; // Contains userId, tenantId, role, tenantSlug
    next();
  });
}

// Login route - returns JWT
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: 'Invalid email or password' });

    const tokenPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      role: user.role,
      tenantSlug: user.tenant.slug,
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all notes for logged-in user's tenant
app.get('/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: { tenantId: req.user.tenantId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notes);
  } catch (err) {
    console.error('Get notes error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new note
app.post('/notes', authenticateToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const { tenantId, role, userId } = req.user;

    // Role check: only ADMIN or MEMBER can create notes
    if (role !== 'ADMIN' && role !== 'MEMBER') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Enforce note limit for FREE plan tenants
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (tenant.plan === 'FREE') {
      const noteCount = await prisma.note.count({ where: { tenantId } });
      if (noteCount >= 3) {
        return res
          .status(403)
          .json({ message: 'Note limit reached. Please upgrade your subscription.' });
      }
    }

    const note = await prisma.note.create({
      data: { title, content, tenantId, userId },
    });
    res.status(201).json(note);
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific note by ID
app.get('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const note = await prisma.note.findFirst({ where: { id, tenantId } });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    res.json(note);
  } catch (err) {
    console.error('Get note by ID error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a note by ID
app.put('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const { tenantId, role, userId } = req.user;

    const note = await prisma.note.findFirst({ where: { id, tenantId } });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Only ADMIN or note owner can update
    if (role !== 'ADMIN' && note.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update note' });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: { title, content },
    });

    res.json(updatedNote);
  } catch (err) {
    console.error('Update note error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a note by ID
app.delete('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId, role, userId } = req.user;

    const note = await prisma.note.findFirst({ where: { id, tenantId } });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Only ADMIN or note owner can delete
    if (role !== 'ADMIN' && note.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete note' });
    }

    await prisma.note.delete({ where: { id } });

    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upgrade tenant subscription to PRO (Admin only)
app.post('/tenants/:slug/upgrade', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const { tenantId, tenantSlug, role } = req.user;

    if (role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (slug !== tenantSlug) {
      return res.status(403).json({ message: 'Unauthorized for this tenant' });
    }

    await prisma.tenant.update({
      where: { id: tenantId },
      data: { plan: 'PRO' },
    });

    res.json({ message: 'Tenant upgraded to Pro plan successfully' });
  } catch (err) {
    console.error('Upgrade tenant error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});