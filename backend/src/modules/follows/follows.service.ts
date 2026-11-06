
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

// Unfollow a user
export const unfollowUser = async (
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

  const result = await followsRepository.removeFollow(
    currentUserId,
    target.id
  );

  if (!result) {
    return { status: "not_following" } as const;
  }

  return { status: "unfollowed" } as const;
};

// Get followers
export const fetchFollowers = async (
  username: string,
  page: number,
  limit: number
) => {
  const target = await findUserByUsername(username);

  if (!target) return null;

  const offset = (page - 1) * limit;

  const users = await followsRepository.getFollowers(
    target.id,
    limit,
    offset
  );

  return { users, page, limit };
};

// Get following
export const fetchFollowing = async (
  username: string,
  page: number,
  limit: number
) => {
  const target = await findUserByUsername(username);

  if (!target) return null;

  const offset = (page - 1) * limit;

  const users = await followsRepository.getFollowing(
    target.id,
    limit,
    offset
  );

  return { users, page, limit };
};

// Check follow status
export const getFollowStatus = async (
  currentUserId: string,
  username: string
) => {
  const target = await findUserByUsername(username);

  if (!target) return null;

  if (currentUserId === target.id) {
    return {
      isFollowing: false,
      isOwnProfile: true,
    };
  }

  const follow = await followsRepository.findFollow(
    currentUserId,
    target.id
  );

  return {
    isFollowing: Boolean(follow),
    isOwnProfile: false,
  };
};