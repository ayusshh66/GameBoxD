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

