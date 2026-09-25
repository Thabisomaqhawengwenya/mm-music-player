import { Router, Response } from 'express';
import { Database } from '../db/storage';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimit';

const router = Router();
const db = Database.getInstance();

// GET /api/backup/export — Export complete JSON snapshot of all user's offline music metadata
router.get('/export', requireAuth, apiRateLimiter, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const library = db.getUserLibrary(userId);

    const snapshot = {
      version: '1.0.0',
      exportedAt: Date.now(),
      user: {
        id: req.user!.id,
        email: req.user!.email,
      },
      data: library,
    };

    res.json(snapshot);
  } catch (err) {
    console.error('Backup export error:', err);
    res.status(500).json({ error: 'Failed to generate library backup snapshot.' });
  }
});

// POST /api/backup/import — Restore complete library snapshot
router.post('/import', requireAuth, apiRateLimiter, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.id;
    const { data } = req.body;

    if (!data || typeof data !== 'object') {
      res.status(400).json({ error: 'Invalid backup format provided.' });
      return;
    }

    const restoredLibrary = {
      userId,
      playlists: data.playlists || {},
      favorites: data.favorites || { trackIds: [], updatedAt: Date.now() },
      metadataOverrides: data.metadataOverrides || {},
      eqSettings: data.eqSettings || {
        name: 'Balanced Clean',
        bands: [2, 1, 0, 1, 3],
        bassBoost: 20,
        virtualizer: 15,
        updatedAt: Date.now(),
      },
      lastSyncedAt: Date.now(),
    };

    db.saveUserLibrary(restoredLibrary);

    res.json({
      success: true,
      message: 'Library snapshot restored successfully.',
      restoredAt: Date.now(),
    });
  } catch (err) {
    console.error('Backup import error:', err);
    res.status(500).json({ error: 'Failed to import backup snapshot.' });
  }
});

export default router;
