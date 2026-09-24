import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Point dotenv directly to src/.env
config({ path: './src/.env' });

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});