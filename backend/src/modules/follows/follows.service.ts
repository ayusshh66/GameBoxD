
import * as followsRepository from "./follows.repository";
import { findUserByUsername } from "../users/users.repository";

// Follow a user
export const followUser = async (
  currentUserId: string,
  username: string
) => {
  const target = await findUserByUsername(username);

  if (!target) {
    return { status: "not_found" } as const;
  }

  if (currentUserId === target.id) {
    return { status: "self_follow" } as const;
  }

  const result = await followsRepository.addFollow(
    currentUserId,
    target.id
  );

  if (!result) {
    return { status: "already_following" } as const;
  }

  return { status: "followed" } as const;
};