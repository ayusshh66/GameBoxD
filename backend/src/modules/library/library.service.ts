import { addToFavorites, addToWishlist, getUserFavorites, getUserWishlist, removeFromFavorites, removeFromWishlist } from "./library.repository";


export const addWishlistGame = async (
  userId: string,
  gameId: string
) => {
  const result = await addToWishlist(
    userId,
    gameId
  );

  return result;
};

export const deleteWishlistGame = async (
  userId: string,
  gameId: string
) => {
  const result = await removeFromWishlist(
    userId,
    gameId
  );

  return Boolean(result);
};

export const fetchUserWishlist = async (
  userId: string,
  page: number,
  limit: number
) => {
  const offset = (page - 1) * limit;

  const games = await getUserWishlist(
    userId,
    limit,
    offset
  );

  return {
    games,
    page,
    limit,
  };
};

export const addFavoriteGame = async (
  userId: string,
  gameId: string
) => {
  const result = await addToFavorites(
    userId,
    gameId
  );

  return result;
};

export const deleteFavoriteGame = async (
  userId: string,
  gameId: string
) => {
  const result = await removeFromFavorites(
    userId,
    gameId
  );

  return Boolean(result);
};

export const fetchUserFavorites = async (
  userId: string,
  page: number,
  limit: number
) => {
  const offset = (page - 1) * limit;

  const games = await getUserFavorites(
    userId,
    limit,
    offset
  );

  return {
    games,
    page,
    limit,
  };
};

//when someone supplies a valid UUID that doesn't correspond to any game, PostgreSQL raises a foreign-key violation (23503).
export const isMissingGameError = (error: unknown): boolean => {
  let current: unknown = error;

  while (current && typeof current === "object") {
    if ("code" in current && current.code === "23503") {
      return true;
    }

    current = "cause" in current ? current.cause : null;
  }

  return false;
};