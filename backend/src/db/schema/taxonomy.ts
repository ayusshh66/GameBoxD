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
import { relations } from "drizzle-orm";

export const genres = pgTable(
  "genres",
  {
    id: uuid("id").defaultRandom().primaryKey(), // id of genre

    name: varchar("name", { // name of genre
      length: 100,
    }).notNull(),

    slug: varchar("slug", { // slog for genre action adventure game(action-adventure (in slug))
      length: 120,
    })
      .notNull()
      .unique(),
  },
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(), //id of tags

    name: varchar("name", { // name of tag
      length: 100,
    }).notNull(),

    slug: varchar("slug", { // slug for tag
      length: 120,
    })
      .notNull()
      .unique(),
  },
);

export const platforms = pgTable(
  "platforms",
  {
    id: uuid("id").defaultRandom().primaryKey(), // id of the platfor where I took api from
 
    name: varchar("name", { // steam, rawg, idgp
      length: 100,
    }).notNull(),

    slug: varchar("slug", { // slug of the platform
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
    gameId: uuid("game_id") // game id with reference with game table id
      .notNull()
      .references(() => games.id, {
        onDelete: "cascade",
      }),

    genreId: uuid("genre_id") // genre id with reference with genre tables id
      .notNull()
      .references(() => genres.id, {
        onDelete: "cascade", // cascade, if that genre is deleted then this table data will also be deleted
      }),
  },
  (table) => [
    primaryKey({
      columns: [
        table.gameId,
        table.genreId,
      ],
    }),

    index("game_genres_genre_id_idx").on( // indexing for less (ms)
      table.genreId,
    ),
  ],
);

export const gameTags = pgTable(
  "game_tags",
  {
    gameId: uuid("game_id") // id of game with referene to games table id 
      .notNull()
      .references(() => games.id, {
        onDelete: "cascade",
      }),

    tagId: uuid("tag_id") // tags with reference with tags tables id
      .notNull()
      .references(() => tags.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({ //need to get unique game tags for a user by making table gameid and tag as primary key together
      columns: [
        table.gameId,
        table.tagId,
      ],
    }),

    index("game_tags_tag_id_idx").on( // indexing for scalability
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

export const genresRelations = relations(genres,({many}) => ({
    gameGenres : many(gameGenres),
}))

export const gameGenresRelations = relations(gameGenres, ({one}) => ({
    genre : one(genres,{
        fields : [gameGenres.genreId],
        references : [genres.id],
    }),

    game : one(games, {
        fields : [gameGenres.gameId],
        references : [games.id],
    })
}))