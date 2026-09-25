import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { CONFIG } from './config';
import authRoutes from './routes/auth.routes';
import syncRoutes from './routes/sync.routes';
import backupRoutes from './routes/backup.routes';

const app = express();

// 1. Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Mobile API does not serve HTML
    crossOriginEmbedderPolicy: false,
  })
);

// 2. Cross-Origin Resource Sharing (CORS)
app.use(
  cors({
    origin: CONFIG.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

// 3. Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Health Check / Status
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'mm-music-sync-server',
    version: '1.0.0',
    timestamp: Date.now(),
  });
});

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/backup', backupRoutes);

// 6. 404 Not Found Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// 7. Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error.',
  });
});

// 8. Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(CONFIG.PORT, CONFIG.HOST, () => {
    console.log(`\n=================================================`);
    console.log(`🎵 MM Music Sync & Backup Server`);
    console.log(`🔒 Security: Helmet, Rate-Limiting, JWT & Bcrypt`);
    console.log(`📡 Listening at: http://${CONFIG.HOST}:${CONFIG.PORT}`);
    console.log(`🩺 Health check: http://${CONFIG.HOST}:${CONFIG.PORT}/health`);
    console.log(`=================================================\n`);
  });
}

export default app;
