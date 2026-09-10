import {
  boolean,
  decimal,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./users";
import { games } from "./games";

export const userGameRatings = pgTable(
  "user_game_ratings",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, {
        onDelete: "cascade",
      }),

    rating: decimal("rating", {
      precision: 2,
      scale: 1,
    }).notNull(),

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
    index("ratings_game_idx").on(
      table.gameId,
    ),

    index("ratings_user_idx").on(
      table.userId,
    ),

    primaryKey({
      columns: [
        table.userId,
        table.gameId,
      ],
    }),
  ],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, {
        onDelete: "cascade",
      }),

    content: text("content").notNull(),

    isSpoiler: boolean("is_spoiler")
      .notNull()
      .default(false),

    isEdited: boolean("is_edited")
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
    index("reviews_game_created_idx").on(
      table.gameId,
      table.createdAt,
    ),

    index("reviews_user_created_idx").on(
      table.userId,
      table.createdAt,
    ),
  ],
);

export const reviewLikes = pgTable(
  "review_likes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    reviewId: uuid("review_id")
      .notNull()
      .references(() => reviews.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    primaryKey({
      columns: [
        table.userId,
        table.reviewId,
      ],
    }),

    index("review_likes_review_idx").on(
      table.reviewId,
    ),
  ],
);