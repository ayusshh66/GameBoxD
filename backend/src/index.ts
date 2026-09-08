import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as schema from "./db/schema/index.ts"; // Imports everything from src/db/schema/index.ts

dotenv.config();

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql });