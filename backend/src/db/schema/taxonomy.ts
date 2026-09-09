import {
  pgTable,
  uuid,
  varchar,
  primaryKey,
  index,
  date,
  text,
  timestamp,
  integer
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

export const platformsRelations = relations(platforms, ({many}) =>({ // we use ({}) when we dont wantt o use retrun, if we use {} then we must use return
  gamePlatforms : many(gamePlatforms),
  gameReleases : many(gameReleases),
}))

export const gamePlatformsRelations = relations(gamePlatforms, ({one}) =>({
  games : one(games, {
    fields : [gamePlatforms.gameId],
    references : [games.id]
  }),
  platforms : one(platforms, {
    fields : [gamePlatforms.platformId],
    references : [platforms.id]
  })
}))

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

export const tagsRelations = relations(tags,({many}) => ({
    gameTags: many(gameTags),
}))

export const gameTagsRelations = relations(gameTags, ({one}) => ({
    tags : one(tags,{
        fields : [gameTags.tagId],
        references : [tags.id],
    }),
    game: one(games,{
      fields : [gameTags.tagId],
      references : [games.id]
    })

}))

export const gameReleases = pgTable("game_releases", {
    id: uuid("id").defaultRandom().primaryKey(), // unique id

    gameId: uuid("game_id") // game id reference to games table id
      .notNull()
      .references(() => games.id, {
        onDelete: "cascade",
      }),

    platformId: uuid("platform_id") // platform id, if we delete a platform data then it will also be deleted
      .notNull()
      .references(() => platforms.id, {
        onDelete: "cascade",
      }),

    releaseDate: date("release_date") // rlease date of the game
      .notNull(),
 
    region: varchar("region", { // region
      length: 50,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },(table) =>[ 
//     Object {...} (Labeled Form): You use this when every item needs a unique, specific name.

// Columns need unique names: { name: varchar(), releaseDate: date() }

// Array [...] (Checklist): You use this when you just want to pass a list of items to the database, and the order/names inside don't act as lookup keys.

// Table constraints are just a list of rules: [ index_1, index_2, primaryKey_1 ]

    index("game_releases_date_idx").on(
      table.releaseDate,
    ),
    index("game_releases_platform_idx").on(
      table.platformId,
    ),

    index("game_releases_game_idx").on(
      table.gameId,
    ),
  ])

export const gameReleasesRelations = relations(gameReleases, ({one}) =>({
  platforms : one(platforms, {
    fields : [gameReleases.platformId],
    references : [platforms.id],
  }),
  games : one(games, {
    fields : [gameReleases.gameId],
    references : [games.id],
  })
}))

export const developers = pgTable(
  "developers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", {
      length: 255,
    }).notNull(),

    slug: varchar("slug", {
      length: 255,
    })
      .notNull()
      .unique(),

    description: text("description"),

    logoUrl: text("logo_url"),

    website: text("website"),
  },
);

export const gameDevelopers = pgTable(
  "game_developers",
  {
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, {
        onDelete: "cascade",
      }),

    developerId: uuid("developer_id")
      .notNull()
      .references(() => developers.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [
        table.gameId,
        table.developerId,
      ],
    }),
  ],
);

export const developersRelations = relations(developers, ({many}) => ({
  gameDevelopers : many(gameDevelopers),
}))

export const gameDevelopersRelations = relations(gameDevelopers, ({one}) =>({
  developers : one(developers, {
    fields : [gameDevelopers.developerId],
    references : [developers.id],
  }),
  games : one(games, {
    fields : [gameDevelopers.gameId],
    references : [games.id]
  })
}))

export const publishers = pgTable(
  "publishers",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    name: varchar("name", {
      length: 255,
    }).notNull(),

    slug: varchar("slug", {
      length: 255,
    })
      .notNull()
      .unique(),

    description: text("description"),

    logoUrl: text("logo_url"),

    website: text("website"),
  },
);

export const gamePublishers = pgTable(
  "game_publishers",
  {
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, {
        onDelete: "cascade",
      }),

    publisherId: uuid("publisher_id")
      .notNull()
      .references(() => publishers.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [
        table.gameId,
        table.publisherId,
      ],
    }),
  ],
);

export const gameScreenshots = pgTable(
  "game_screenshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, {
        onDelete: "cascade",
      }),

    imageUrl: text("image_url").notNull(),

    width: integer("width"),

    height: integer("height"),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("game_screenshots_game_idx").on(
      table.gameId,
    ),
  ],
);

export const gameVideos = pgTable(
  "game_videos",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, {
        onDelete: "cascade",
      }),

    name: varchar("name", {
      length: 255,
    }),

    videoUrl: text("video_url").notNull(),

    thumbnailUrl: text("thumbnail_url"),

    type: varchar("type", {
      length: 50,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("game_videos_game_idx").on(
      table.gameId,
    ),
  ],
);

