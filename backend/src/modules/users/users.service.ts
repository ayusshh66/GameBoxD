import * as usersRepository from "./users.repository";
import type { UpdateProfileInput } from "./users.validation";

export const getMyProfile = async (userId: string) => {
  return usersRepository.findUserById(userId);
};

export const getPublicProfile = async (
  username: string
) => {
  return usersRepository.findUserByUsername(username);
};

export const editMyProfile = async (
  userId: string,
  data: UpdateProfileInput
) => {
  return usersRepository.updateUserProfile(userId, data);
};