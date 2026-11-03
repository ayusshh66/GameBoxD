
import * as usersRepository from "./users.repository";
import type { UpdateProfileInput } from "./users.validation";

export const getMyProfile = async (userId: string) => {
  const user = await usersRepository.findUserById(userId);

  if (!user) return null;

  const [stats, favoriteGames] = await Promise.all([
    usersRepository.getUserProfileStats(user.id),
    usersRepository.getFavoriteGamesPreview(user.id),
  ]);

  return {
    ...user,
    stats,
    favoriteGames,
  };
};

export const getPublicProfile = async (username: string) => {
  const user = await usersRepository.findUserByUsername(username);

  if (!user) return null;

  const [stats, favoriteGames] = await Promise.all([
    usersRepository.getUserProfileStats(user.id),
    usersRepository.getFavoriteGamesPreview(user.id),
  ]);

  return {
    ...user,
    stats,
    favoriteGames,
  };
};

export const editMyProfile = async (
  userId: string,
  data: UpdateProfileInput
) => {
  return usersRepository.updateUserProfile(userId, data);
};
