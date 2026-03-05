import {
    pgTable,
    uuid,
    varchar,
    text,
    boolean,
    integer,
    jsonb,
    timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/* ------------------------------------------------------------------ */
/*  USERS                                                              */
/* ------------------------------------------------------------------ */

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    username: varchar("username", { length: 40 }).unique().notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: varchar("display_name", { length: 100 }),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
    pages: many(pages),
    sessions: many(sessions),
    subscriptions: many(subscriptions),
}));

/* ------------------------------------------------------------------ */
/*  PAGES                                                              */
/* ------------------------------------------------------------------ */

export const pages = pgTable("pages", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    title: varchar("title", { length: 200 }).notNull().default("My Bio"),
    slug: varchar("slug", { length: 100 }),
    isPublished: boolean("is_published").default(false),
    themeConfig: jsonb("theme_config").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const pagesRelations = relations(pages, ({ one, many }) => ({
    user: one(users, {
        fields: [pages.userId],
        references: [users.id],
    }),
    components: many(components),
}));

/* ------------------------------------------------------------------ */
/*  COMPONENTS                                                         */
/* ------------------------------------------------------------------ */

export const components = pgTable("components", {
    id: uuid("id").defaultRandom().primaryKey(),
    pageId: uuid("page_id")
        .references(() => pages.id, { onDelete: "cascade" })
        .notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    config: jsonb("config").notNull().default({}),
    isVisible: boolean("is_visible").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const componentsRelations = relations(components, ({ one }) => ({
    page: one(pages, {
        fields: [components.pageId],
        references: [pages.id],
    }),
}));

/* ------------------------------------------------------------------ */
/*  SUBSCRIPTIONS                                                      */
/* ------------------------------------------------------------------ */

export const subscriptions = pgTable("subscriptions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    lemonSqueezyId: varchar("lemonsqueezy_id", { length: 100 }).unique(),
    lemonSqueezyCustomerId: varchar("lemonsqueezy_customer_id", { length: 100 }),
    plan: varchar("plan", { length: 20 }).notNull().default("free"), // free, pro, team
    status: varchar("status", { length: 30 }).notNull().default("active"), // active, cancelled, paused, past_due, expired
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    user: one(users, {
        fields: [subscriptions.userId],
        references: [users.id],
    }),
}));

/* ------------------------------------------------------------------ */
/*  SESSIONS                                                           */
/* ------------------------------------------------------------------ */

export const sessions = pgTable("sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .notNull(),
    token: text("token").unique().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));
