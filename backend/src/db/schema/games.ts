import { relations } from "drizzle-orm";
import {
  date,
  index,
  integer,
  numeric,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const gameStatusEnum = pgEnum("game_status", [
  "upcoming",
  "released",
  "cancelled",
]);

export const gameSources = pgTable( // if i use different apis to fetch info about games, then  it is usefull and scalable
  "game_sources",
  {
    id: uuid("id").defaultRandom().primaryKey(), // id 

    gameId: uuid("game_id") // game whose info i wanna fetch, that is linked with games table below
      .notNull()
      .references(() => games.id, {
        onDelete: "cascade", // if i delete that game, then this data will automatically be deleted, "cascade"
      }),

    source: varchar("source", { // name of api that i used
      length: 50,
    }).notNull(),

    externalId: varchar("external_id", { // external id of api
      length: 100,
    }).notNull(),

    rawData: jsonb("raw_data"), // all the data we get from that api

    lastSyncedAt: timestamp("last_synced_at", { // last update in the api
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", { // when it is created
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { // last updated in db
      withTimezone: true,
    })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    unique("game_source_external_unique").on( // makes unique the tables source and external id to identify easily
      table.source,
      table.externalId,
    ),

    index("game_sources_game_id_idx").on(table.gameId), // gives indexing to table game id, so if we want to fetch the game, it will fetch quicly with less than ~1ms
    // if we dont use this, then it might tale upto ~300ms to fetch if data is about 100k 
  ],
);

export const games = pgTable(
  "games",
  {
    id: uuid("id").defaultRandom().primaryKey(), // id of game

    slug: varchar("slug", { // name of the game as slug in params
      length: 255,
    })
      .notNull()
      .unique(),

    name: varchar("name", { // name of the game
      length: 255,
    }).notNull(),

    description: text("description"), // description of the game

    coverUrl: text("cover_url"),

    backgroundUrl: text("background_url"),

    releaseDate: date("release_date"),

    status: gameStatusEnum("status") // status enum defined above 
      .notNull()
      .default("upcoming"),

    metacriticScore: integer("metacritic_score"),

    averageRating: integer("average_rating"),

    ratingsCount: integer("ratings_count")
      .notNull()
      .default(0),

    reviewsCount: integer("reviews_count")
      .notNull()
      .default(0),

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
    index("games_release_date_idx").on(
      table.releaseDate,
    ),

    index("games_status_idx").on(
      table.status,
    ),

    index("games_name_idx").on(
      table.name,
    ),
  ],
);

export const gamesRelations = relations(games, ({ many }) => ({
  sources: many(gameSources),
}));

export const gameSourcesRelations = relations(gameSources, ({ one }) => ({
  game: one(games, {
    fields: [gameSources.gameId],
    references: [games.id],
  }),
}));