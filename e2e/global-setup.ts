import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config as loadEnv } from 'dotenv';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const backendDir = path.join(rootDir, '..', 'backend');

loadEnv({ path: path.join(backendDir, '.env') });

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://pactum:change_me@localhost:5433/pactum_dev?schema=public';

export default async function globalSetup() {
  const env = {
    ...process.env,
    DATABASE_URL: databaseUrl,
    JWT_SECRET: process.env.JWT_SECRET ?? 'test-jwt-secret-for-e2e',
  };

  execSync('npx prisma migrate deploy', {
    cwd: backendDir,
    stdio: 'inherit',
    env,
  });

  execSync('npm run db:seed', {
    cwd: backendDir,
    stdio: 'inherit',
    env,
  });
}
