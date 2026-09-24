import { findAllGames, findGameBySlug, findLatestGames, findTopGames, findUpcominigGames, searchGames } from "./games.repository";
import { db, games, gameGenres, gamePlatforms, gameTags } from "../../db";
import { eq } from "drizzle-orm";

export const getAllGames = async (limit: number, page: number) => {
  const offset = (page - 1) * limit;
  return await findAllGames(limit, offset);
};

export const getGameBySlug = async (slug: string) => {
  return await findGameBySlug(slug);
};

export const getLatestGames = async (limit: number) => {
  return await findLatestGames(limit);
};

export const getUpcomingGames = async (limit: number) => {
  return await findUpcominigGames(limit);
};

export const getTopGames = async (limit: number) => {
  return await findTopGames(limit);
};

export const getSearchTopGames = async (query: string, limit: number, page: number) => {
  const offset = (page - 1) * limit;
  return await searchGames(query, limit, offset);
};

interface CreateGameInput {
  name: string;
  slug: string;
  description?: string;
  coverUrl?: string;
  backgroundUrl?: string;
  releaseDate?: string | Date;
  status: "upcoming" | "released" | "cancelled";
  metacriticScore?: number;

  tagIds: string[];
  genreIds: string[];
  platformIds: string[];
}

// Helper function to safely format standard YYYY-MM-DD
const formatDate = (date?: string | Date) => {
  if (!date) return null;
  if (typeof date === "string" && date.length === 10) return date; // Already YYYY-MM-DD
  return new Date(date).toISOString().slice(0, 10);
};

export const createGame = async (data: CreateGameInput) => {
  return await db.transaction(async (tx) => {
    const cleanDate = formatDate(data.releaseDate);

    const [game] = await tx
      .insert(games)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description,
        coverUrl: data.coverUrl,
        backgroundUrl: data.backgroundUrl,
        releaseDate: cleanDate,
        status: data.status,
        metacriticScore: data.metacriticScore,
      })
      .returning();

    if (data.tagIds?.length) {
      await tx.insert(gameTags).values(
        data.tagIds.map((tagId) => ({
          gameId: game.id,
          tagId: tagId,
        }))
      );
    }

    if (data.platformIds?.length) {
      await tx.insert(gamePlatforms).values(
        data.platformIds.map((platformId) => ({
          gameId: game.id,
          platformId: platformId,
        }))
      );
    }

    if (data.genreIds?.length) {
      await tx.insert(gameGenres).values(
        data.genreIds.map((genreId) => ({
          gameId: game.id,
          genreId: genreId,
        }))
      );
    }

    return game;
  });
};

interface UpdateGameInput {
  name?: string;
  slug?: string;
  description?: string;
  coverUrl?: string;
  backgroundUrl?: string;
  releaseDate?: string | Date;
  status?: "upcoming" | "released" | "cancelled";
  metacriticScore?: number;

  genreIds?: string[];
  platformIds?: string[];
  tagIds?: string[];
}

export const updateGame = async (gameId: string, data: UpdateGameInput) => {
  return db.transaction(async (tx) => {
    const existingGame = await tx.query.games.findFirst({
      where: (games, { eq }) => eq(games.id, gameId),
    });

    if (!existingGame) {
      return null;
    }

    const gameData = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
      ...(data.backgroundUrl !== undefined && { backgroundUrl: data.backgroundUrl }),
      ...(data.releaseDate !== undefined && { releaseDate: formatDate(data.releaseDate) }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.metacriticScore !== undefined && { metacriticScore: data.metacriticScore }),
      updatedAt: new Date(),
    };

    if (Object.keys(gameData).length > 1) {
      await tx.update(games).set(gameData).where(eq(games.id, gameId));
    }

    if (data.platformIds !== undefined) {
      await tx.delete(gamePlatforms).where(eq(gamePlatforms.gameId, gameId));

      if (data.platformIds.length > 0) {
        await tx.insert(gamePlatforms).values(
          data.platformIds.map((platformId) => ({
            gameId,
            platformId,
          }))
        );
      }
    }

    if (data.tagIds !== undefined) {
      await tx.delete(gameTags).where(eq(gameTags.gameId, gameId));

      if (data.tagIds.length > 0) {
        await tx.insert(gameTags).values(
          data.tagIds.map((tagId) => ({
            gameId,
            tagId,
          }))
        );
      }
    }

    if (data.genreIds !== undefined) {
      await tx.delete(gameGenres).where(eq(gameGenres.gameId, gameId));

      if (data.genreIds.length > 0) {
        await tx.insert(gameGenres).values(
          data.genreIds.map((genreId) => ({
            gameId,
            genreId,
          }))
        );
      }
    }

    const updatedGame = await tx.query.games.findFirst({
      where: (games, { eq }) => eq(games.id, gameId),
    });

    return updatedGame;
  });
};

export const deleteGame = async (gameId: string) => {
  const [deleted] = await db.delete(games).where(eq(games.id, gameId)).returning();

  if (!deleted) {
    return null;
  }

  return deleted;
};