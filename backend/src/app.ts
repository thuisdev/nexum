import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/auth.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import usersRouter from './routes/users.routes.js';
import projectsRouter from './routes/projects.routes.js';
import milestonesRouter from './routes/milestones.routes.js';
import jobsRouter from './routes/jobs.routes.js';
import notificationsRouter from './routes/notifications.routes.js';
import statsRouter from './routes/stats.routes.js';
import applicationsRouter from './routes/applications.routes.js';
import { uploadDirPath } from './lib/upload.js';

/** Reflect any origin in local/test; fail closed in production unless CORS_ORIGIN is set. */
export function resolveCorsOrigin(
  corsOrigin: string | undefined,
  nodeEnv: string | undefined,
): string | boolean {
  if (corsOrigin) {
    return corsOrigin;
  }

  return nodeEnv === 'production' ? false : true;
}

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: resolveCorsOrigin(process.env.CORS_ORIGIN, process.env.NODE_ENV),
    }),
  );
  app.use(morgan(process.env.NODE_ENV === 'test' ? 'tiny' : 'dev'));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/uploads', express.static(uploadDirPath));

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/projects', projectsRouter);
  app.use('/api/milestones', milestonesRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/applications', applicationsRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/stats', statsRouter);

  app.use(errorHandler);

  return app;
}
