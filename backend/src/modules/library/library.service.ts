import { addToWishlist } from "./library.repository";


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