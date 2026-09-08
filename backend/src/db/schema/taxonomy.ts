import {
  pgTable,
  uuid,
  varchar,
  primaryKey,
  index,
  date,
  text,
} from "drizzle-orm/pg-core";

import { games } from "./games";

export const genres = pgTable(
  "genres",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", {
      length: 100,
    }).notNull(),

    slug: varchar("slug", {
      length: 120,
    })
      .notNull()
      .unique(),
  },
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", {
      length: 100,
    }).notNull(),

    slug: varchar("slug", {
      length: 120,
    })
      .notNull()
      .unique(),
  },
);

export const platforms = pgTable(
  "platforms",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", {
      length: 100,
    }).notNull(),

    slug: varchar("slug", {
      length: 120,
    })
      .notNull()
      .unique(),

    logoUrl: text("logo_url"),
  },
);

export const gameGenres = pgTable(
  "game_genres",
  {
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, {
        onDelete: "cascade",
      }),

    genreId: uuid("genre_id")
      .notNull()
      .references(() => genres.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [
        table.gameId,
        table.genreId,
      ],
    }),

    index("game_genres_genre_id_idx").on(
      table.genreId,
    ),
  ],
);

export const gameTags = pgTable(
  "game_tags",
  {
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, {
        onDelete: "cascade",
      }),

    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [
        table.gameId,
        table.tagId,
      ],
    }),

    index("game_tags_tag_id_idx").on(
      table.tagId,
    ),
  ],
);

export const gamePlatforms = pgTable(
  "game_platforms",
  {
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, {
        onDelete: "cascade",
      }),

    platformId: uuid("platform_id")
      .notNull()
      .references(() => platforms.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [
        table.gameId,
        table.platformId,
      ],
    }),

    index("game_platforms_platform_id_idx").on(
      table.platformId,
    ),
  ],
);