
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { users } from "../../db/schema";
import type { UpdateProfileInput } from "./users.validation";

const privateFields = {
  id: users.id,
  username: users.username,
  email: users.email,
  displayName: users.displayName,
  bio: users.bio,
  avatarUrl: users.avatarUrl,
  role: users.role,
  isVerified: users.isVerified,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export const findUserById = async (userId: string) => {
  const [user] = await db
    .select(privateFields)
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user ?? null;
};
