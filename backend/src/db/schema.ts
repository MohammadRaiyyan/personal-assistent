import { relations } from "drizzle-orm";
import { boolean, doublePrecision, index, integer, json, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
// Define enums first
export const marketOutlookEnum = pgEnum("market_outlook", ["negative", "stable", "positive"]);
export const demandLevelEnum = pgEnum("demand_level", ["low", "medium", "high"]);
export const letterStatusEnum = pgEnum("letter_status", ["draft", "reviewed", "finalized"]);


export const users = pgTable("users", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});

export const sessions = pgTable(
    "sessions",
    {
        id: text("id").primaryKey(),
        expiresAt: timestamp("expires_at").notNull(),
        token: text("token").notNull().unique(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
    },
    (table) => [index("session_userId_idx").on(table.userId)],
);

export const accounts = pgTable(
    "accounts",
    {
        id: text("id").primaryKey(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at"),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
        scope: text("scope"),
        password: text("password"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
    "verification",
    {
        id: text("id").primaryKey(),
        identifier: text("identifier").notNull(),
        value: text("value").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at")
            .defaultNow()
            .$onUpdate(() => /* @__PURE__ */ new Date())
            .notNull(),
    },
    (table) => [index("verification_identifier_idx").on(table.identifier)],
);



// Tables
export const userProfiles = pgTable("user_profiles", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
    onboarded: boolean("onboarded").notNull().default(false),
    industry: text("industry").notNull(),
    experience: integer("experience").notNull(),
    bio: text("bio").notNull(),
    skills: text("skills").array().notNull(),
    country: text("country"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
}, (table) => [
    index("user_profiles_userId_idx").on(table.userId),
]);

export const industryInsights = pgTable("industry_insights", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),
    industry: text("industry").notNull(),
    salaryRanges: json("salary_range").$type<{ role: string, location: string, min: number; max: number; currency: string, median: number }>().array().notNull(),
    jobGrowth: doublePrecision("job_growth").notNull(),
    demandLevel: demandLevelEnum("demand_level").notNull(),
    keySkills: text("key_skills").array().notNull(),
    keyTrends: text("key_trends").array().notNull(),
    recommendedSkills: text("recommended_skills").array().notNull(),
    marketOutlook: marketOutlookEnum("market_outlook").notNull(),
    lastUpdated: timestamp("last_updated").defaultNow().notNull(),
    nextUpdate: timestamp("next_update").notNull(),
}, (table) => [
    index("industry_insights_industry_idx").on(table.industry),
]);

export const assessments = pgTable("assessments", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    category: text("category").notNull(),
    score: doublePrecision("score").notNull(),
    questions: json("questions").$type<Array<{ question: string; answer: string; isCorrect: boolean, userAnswer: string, explanation: string }>>().notNull(),
    improvementTips: text("improvement_tips").array(),
    skillFocus: text("skill_focus").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
}, (table) => [
    index("assessments_userId_idx").on(table.userId),
    index("assessments_category_idx").on(table.category),
]);

export const resumes = pgTable("resumes", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    title: text("title"),
    content: text("content").notNull(),
    atsScore: doublePrecision("ats_score"),
    feedback: text("feedback").array(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
}, (table) => [
    index("resumes_userId_idx").on(table.userId),
]);

export const coverLetters = pgTable("cover_letters", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    content: text("content").notNull(),
    jobDescription: text("job_description"),
    companyName: text("company_name"),
    positionTitle: text("position_title"),
    status: letterStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
}, (table) => [
    index("cover_letters_userId_idx").on(table.userId),
    index("cover_letters_status_idx").on(table.status),
]);

// Relations
export const userRelations = relations(users, ({ one, many }) => ({
    profile: one(userProfiles, {
        fields: [users.id],
        references: [userProfiles.userId],
    }),
    assessments: many(assessments),
    resumes: many(resumes),
    coverLetters: many(coverLetters),
    sessions: many(sessions),
    accounts: many(accounts),
    industryInsights: many(industryInsights)
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
    user: one(users, {
        fields: [userProfiles.userId],
        references: [users.id],
    }),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
    user: one(users, {
        fields: [assessments.userId],
        references: [users.id],
    }),
}));

export const resumesRelations = relations(resumes, ({ one }) => ({
    user: one(users, {
        fields: [resumes.userId],
        references: [users.id],
    }),
}));

export const coverLettersRelations = relations(coverLetters, ({ one }) => ({
    user: one(users, {
        fields: [coverLetters.userId],
        references: [users.id],
    }),
}));


export const sessionRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id],
    }),
}));


export type User = typeof users.$inferInsert


export const createCoverLetterSchema = createInsertSchema(coverLetters);

