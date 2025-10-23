import { pgTable, timestamp, uuid, unique, text } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull().unique(),
});
export type User = typeof users.$inferSelect;


export const feeds = pgTable("feeds",{
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    name: text("name").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
          .notNull()
          .defaultNow()
          .$onUpdate(() => new Date()),
    url: text("url").notNull().unique(),
    userID: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    lastFetchAt: timestamp("last_fetch_at"),
  }
);
export type Feed = typeof feeds.$inferSelect;

export const feedFollows = pgTable(
  "feeds_follow",
  {
      id: uuid("id").primaryKey().defaultRandom().notNull(),
      createdAt: timestamp("created_at").notNull().defaultNow(),
      updatedAt: timestamp("updated_at")
          .notNull()
          .defaultNow()
          .$onUpdate(() => new Date()),
      userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
      feedId: uuid('feed_id').references(() => feeds.id, { onDelete: 'cascade' }).notNull(),
  },
  (table) => [
      unique().on(table.userId, table.feedId),
  ],
);


export const posts = pgTable("posts",
  {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
    title: text("title").notNull(),
    url: text("url").notNull().unique(),
    description: text("description"),
    publishedAt: timestamp("published_at"),
    feedId: uuid("feed_id")
    .notNull()
    .references(() => feeds.id, { onDelete: "cascade" }),

  },
);
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;