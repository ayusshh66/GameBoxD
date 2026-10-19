
import "dotenv/config";

import { importRawgPage } from "../modules/game-import/game-import.service";
import { pool } from "../db";
import { redis } from "../config/redis";

async function main() {
  const page = Number(process.argv[2] ?? 1);

  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Page must be a positive integer");
  }

  const result = await importRawgPage(page);

  console.log("RAWG import completed:", result);
}

main()
  .catch((error) => {
    console.error("Import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    // Close the Redis connection.
    redis.disconnect();

    // Close PostgreSQL connections.
    await pool.end();
  });
