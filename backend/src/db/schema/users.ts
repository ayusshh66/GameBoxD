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
  "user", // edit, post. delete reviews and all etc..
  "moderator", // give permission, delete post, restrict etcc...
  "admin", // gives role, delete , ban users etc..
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(), // id 

    username: varchar("username", { length: 30 }) // users name
      .notNull()
      .unique(),

    email: varchar("email", { length: 255 }) // users email
      .notNull()
      .unique(),

    passwordHash: text("password_hash").notNull(), // hashed password will be stored here

    displayName: varchar("display_name", { length: 100 }), // users name that we they want to display

    bio: text("bio"), // bio of user

    avatarUrl: text("avatar_url"),

    role: userRoleEnum("role") //role
      .notNull()
      .default("user"),

    isVerified: boolean("is_verified") // user is varified or not its  a boolean tho
      .notNull()
      .default(false),

    createdAt: timestamp("created_at", { // get details of created data
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { // get record of updated details
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