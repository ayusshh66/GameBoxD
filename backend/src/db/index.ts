import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless"; // 👈 Note: neon-serverless instead of neon-http
import ws from "ws";
import * as schema from "./schema";

// Configure WebSockets for Neon
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export const db = drizzle(pool, { schema });

export * from "./schema/index";