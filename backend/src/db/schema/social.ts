import {
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { games } from "./games";

// One current progress record per player per locally imported game.
export const userGameLogs = pgTable(
  "user_game_logs",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    gameId: uuid("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 16 }).notNull(), // playing | completed | paused | dropped | played
    playtimeMinutes: integer("playtime_minutes"),
    note: text("note"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.gameId] })],
);

// Notifications are derived from existing follows and review_likes; only read-state is stored.
export const notificationReads = pgTable(
  "notification_reads",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventKey: varchar("event_key", { length: 160 }).notNull(),
    readAt: timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.eventKey] })],
);
