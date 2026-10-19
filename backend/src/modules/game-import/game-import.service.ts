import { fetchRawgGames, fetchRawgGameDetails } from "./rawg.client";

import { saveRawgGame } from "./game-import.repository";

export const importRawgPage = async (page = 1) => {
  const response = await fetchRawgGames(page, 20);

  let created = 0;
  let updated = 0;
  let failed = 0;

  for (const item of response.results) {
    try {
      // Fetch full details, including description.
      const details = await fetchRawgGameDetails(item.id);

      const result = await saveRawgGame(details);

      if (result.action === "created") created++;
      else updated++;
    } catch (error) {
      failed++;
      console.error(`Failed to import RAWG game ${item.id}`, error);
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
