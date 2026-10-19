
import {
  fetchRawgGames,
  fetchRawgGameDetails,
} from "./rawg.client";

import { saveRawgGame } from "./game-import.repository";
import { redis } from "../../config/redis";

export const importRawgPage = async (page = 1) => {
  const response = await fetchRawgGames(page, 20);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const item of response.results) {
    try {
      // Fetch complete information for this game.
      const details = await fetchRawgGameDetails(item.id);

      // Save the game in PostgreSQL.
      const result = await saveRawgGame(details);

      // Invalidate stale game details after an update.
      if (result.action === "updated") {
        try {
          const cacheKey =
            `gameboxd:game:slug:${result.slug}`;

          await redis.del(cacheKey);
        } catch (cacheError) {
          // A Redis failure should not undo a successful DB import.
          console.error(
            `Cache invalidation failed for ${result.slug}:`,
            cacheError
          );
        }
      }

      if (result.action === "created") {
        created++;
      } else {
        updated++;
      }

    } catch (error) {
      failed++;

      console.error(
        `Failed to import RAWG game ${item.id}:`,
        error
      );
    }
  }

  return {
    page,
    created,
    updated,
    failed,
    hasNextPage: Boolean(response.next),
  };
};
