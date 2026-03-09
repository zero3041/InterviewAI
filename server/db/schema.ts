import { pgTable, text, integer, timestamp, jsonb, serial, varchar, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Technologies table (java-springboot, php, react, etc.)
export const technologies = pgTable("technologies", {
  id: varchar("id", { length: 50 }).primaryKey(), // e.g., "java-springboot"
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  description: text("description").notNull(),
  color: varchar("color", { length: 20 }).notNull(),
  levels: jsonb("levels").$type<string[]>().notNull().default(["junior", "middle"]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table (e.g., "OOP", "Collections Framework")
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  techId: varchar("tech_id", { length: 50 }).notNull().references(() => technologies.id, { onDelete: "cascade" }),
  level: varchar("level", { length: 20 }).notNull(), // "junior" | "middle"
  mainCategory: varchar("main_category", { length: 200 }).notNull(), // e.g., "A. Java Core"
  subCategory: varchar("sub_category", { length: 200 }).notNull(), // e.g., "1. OOP"
  displayOrder: integer("display_order").notNull().default(0),
}, (table) => [
  index("category_tech_level_idx").on(table.techId, table.level),
]);

// Questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  techId: varchar("tech_id", { length: 50 }).notNull().references(() => technologies.id, { onDelete: "cascade" }),
  level: varchar("level", { length: 20 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  questionNumber: integer("question_number").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("question_tech_level_idx").on(table.techId, table.level),
  index("question_tech_level_num_idx").on(table.techId, table.level, table.questionNumber),
]);

// User sessions (optional - for tracking anonymous users)
export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 100 }).primaryKey(), // Browser-generated session ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow().notNull(),
});

// Answer history
export const answerHistory = pgTable("answer_history", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull().references(() => sessions.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  techId: varchar("tech_id", { length: 50 }).notNull(),
  level: varchar("level", { length: 20 }).notNull(),
  questionText: text("question_text").notNull(),
  userAnswer: text("user_answer").notNull(),
  score: integer("score").notNull(),
  feedback: text("feedback").notNull(),
  strengths: jsonb("strengths").$type<string[]>().notNull().default([]),
  improvements: jsonb("improvements").$type<string[]>().notNull().default([]),
  sampleAnswer: text("sample_answer").notNull().default(""),
  model: varchar("model", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("history_session_idx").on(table.sessionId),
  index("history_question_idx").on(table.questionId),
  index("history_created_idx").on(table.createdAt),
]);

// Chat messages for follow-up questions
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  historyId: integer("history_id").notNull().references(() => answerHistory.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("chat_history_idx").on(table.historyId),
]);

// Bookmarks
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull().references(() => sessions.id, { onDelete: "cascade" }),
  questionId: integer("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("bookmark_session_idx").on(table.sessionId),
  index("bookmark_session_question_idx").on(table.sessionId, table.questionId),
]);

// Relations
export const technologiesRelations = relations(technologies, ({ many }) => ({
  categories: many(categories),
  questions: many(questions),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  technology: one(technologies, {
    fields: [categories.techId],
    references: [technologies.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  technology: one(technologies, {
    fields: [questions.techId],
    references: [technologies.id],
  }),
  category: one(categories, {
    fields: [questions.categoryId],
    references: [categories.id],
  }),
  history: many(answerHistory),
  bookmarks: many(bookmarks),
}));

export const sessionsRelations = relations(sessions, ({ many }) => ({
  history: many(answerHistory),
  bookmarks: many(bookmarks),
}));

export const answerHistoryRelations = relations(answerHistory, ({ one, many }) => ({
  session: one(sessions, {
    fields: [answerHistory.sessionId],
    references: [sessions.id],
  }),
  question: one(questions, {
    fields: [answerHistory.questionId],
    references: [questions.id],
  }),
  chatMessages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  history: one(answerHistory, {
    fields: [chatMessages.historyId],
    references: [answerHistory.id],
  }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  session: one(sessions, {
    fields: [bookmarks.sessionId],
    references: [sessions.id],
  }),
  question: one(questions, {
    fields: [bookmarks.questionId],
    references: [questions.id],
  }),
}));

// Type exports
export type Technology = typeof technologies.$inferSelect;
export type NewTechnology = typeof technologies.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type AnswerHistoryEntry = typeof answerHistory.$inferSelect;
export type NewAnswerHistoryEntry = typeof answerHistory.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type Bookmark = typeof bookmarks.$inferSelect;
export type NewBookmark = typeof bookmarks.$inferInsert;
