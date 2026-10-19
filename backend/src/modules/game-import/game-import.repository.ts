
import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { games, gameSources } from "../../db/schema";
import type { RawgGame } from "./rawg.client";

export const saveRawgGame = async (rawg: RawgGame) => {
  return db.transaction(async (tx) => {
    const externalId = String(rawg.id);
    const now = new Date();

    const [existingSource] = await tx
      .select({ gameId: gameSources.gameId })
      .from(gameSources)
      .where(
        and(
          eq(gameSources.source, "rawg"),
          eq(gameSources.externalId, externalId)
        )
      )
      .limit(1);

    const releaseDate =
      rawg.released && /^\d{4}-\d{2}-\d{2}$/.test(rawg.released)
        ? rawg.released
        : null;

    const status =
      rawg.tba || !releaseDate || releaseDate > now.toISOString().slice(0, 10)
        ? "upcoming" as const
        : "released" as const;

    const metadata = {
      name: rawg.name,
      description: rawg.description_raw ?? rawg.description ?? null,
      coverUrl: rawg.background_image ?? null,
      backgroundUrl:
        rawg.background_image_additional ??
        rawg.background_image ??
        null,
      releaseDate,
      status,
      metacriticScore: rawg.metacritic ?? null,
      updatedAt: now,
    };

    if (existingSource) {
      await tx
        .update(games)
        .set(metadata)
        .where(eq(games.id, existingSource.gameId));

      await tx
        .update(gameSources)
        .set({
          rawData: rawg,
          lastSyncedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(gameSources.source, "rawg"),
            eq(gameSources.externalId, externalId)
          )
        );

      return { gameId: existingSource.gameId, action: "updated" as const };
    }

    // Reuse an existing game with the same slug if one exists.
    const [matchingGame] = await tx
      .select({ id: games.id })
      .from(games)
      .where(eq(games.slug, rawg.slug))
      .limit(1);

    let gameId = matchingGame?.id;

    if (!gameId) {
      const [created] = await tx
        .insert(games)
        .values({
          ...metadata,
          slug: rawg.slug,
        })
        .returning({ id: games.id });

      gameId = created.id;
    }

    await tx.insert(gameSources).values({
      gameId,
      source: "rawg",
      externalId,
      rawData: rawg,
      lastSyncedAt: now,
    });

    return { gameId, action: "created" as const };
  });
};
