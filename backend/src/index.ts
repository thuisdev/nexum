import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';
import authRouter from './routes/auth.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import usersRouter from './routes/users.routes.js';
import projectsRouter from './routes/projects.routes.js';
import jobsRouter from './routes/jobs.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/jobs', jobsRouter);

app.use(errorHandler);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Pactum backend listening on http://localhost:${port}`);
});
