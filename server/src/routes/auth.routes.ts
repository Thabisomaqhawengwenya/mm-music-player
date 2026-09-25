import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { Database } from '../db/storage';
import { CONFIG } from '../config';
import { authRateLimiter } from '../middleware/rateLimit';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { User } from '../types';

const router = Router();
const db = Database.getInstance();

const RegisterSchema = z.object({
  email: z.string().email('Please provide a valid email address.').trim().toLowerCase(),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  name: z.string().min(2, 'Name must be at least 2 characters long.').trim(),
});

const LoginSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(1, 'Password is required.'),
});

function generateToken(user: User): string {
  return jwt.sign(
    { userId: user.id, email: user.email },
    CONFIG.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

// POST /api/auth/register
router.post('/register', authRateLimiter, async (req, res: Response): Promise<void> => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { email, password, name } = parsed.data;

    const existing = db.findUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    // Salt and hash password (cost factor 12 for strong security)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email,
      name,
      passwordHash,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };

    db.createUser(newUser);
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Account successfully registered.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', authRateLimiter, async (req, res: Response): Promise<void> => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const { email, password } = parsed.data;
    const user = db.findUserByEmail(email);

    if (!user) {
      // Timing-attack prevention: simulate work
      await bcrypt.compare(password, '$2a$12$e8Y6l9b1G6V5774q5d.pveH4C.jW2uV72kSgX85rS0eQ1zV388Qj.');
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    user.lastLoginAt = Date.now();
    db.updateUser(user);

    const token = generateToken(user);

    res.json({
      message: 'Authentication successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});

export default router;
