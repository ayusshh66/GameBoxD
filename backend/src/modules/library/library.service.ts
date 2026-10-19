import { addToFavorites, addToWishlist, getUserWishlist, removeFromFavorites, removeFromWishlist } from "./library.repository";


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