import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
  text,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "user",
  "moderator",
  "admin",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    username: varchar("username", { length: 30 })
      .notNull()
      .unique(),

    email: varchar("email", { length: 255 })
      .notNull()
      .unique(),

    passwordHash: text("password_hash").notNull(),

    displayName: varchar("display_name", { length: 100 }),

    bio: text("bio"),

    avatarUrl: text("avatar_url"),

    role: userRoleEnum("role")
      .notNull()
      .default("user"),

    isVerified: boolean("is_verified")
      .notNull()
      .default(false),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("users_username_idx").on(table.username),
    index("users_created_at_idx").on(table.createdAt),
  ],
);