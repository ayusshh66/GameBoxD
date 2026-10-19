import { addToWishlist, getUserWishlist, removeFromWishlist } from "./library.repository";


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


