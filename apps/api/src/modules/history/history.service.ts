import { Injectable } from "@nestjs/common";
import { asc, desc, eq } from "drizzle-orm";
import { DatabaseService } from "../../database/database.service";
import * as schema from "../../database/schema";

interface CreateHistoryEntryInput {
  sessionId: string;
  questionId: number;
  techId?: string;
  level?: string;
  questionText: string;
  userAnswer: string;
  score?: number;
  feedback?: string;
  strengths?: string[];
  improvements?: string[];
  sampleAnswer?: string;
  model?: string;
}

@Injectable()
export class HistoryService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getHistory(sessionId: string, limit = 100) {
    const history = await this.databaseService.db
      .select()
      .from(schema.answerHistory)
      .where(eq(schema.answerHistory.sessionId, sessionId))
      .orderBy(desc(schema.answerHistory.createdAt))
      .limit(limit);

    const historyWithMessages = await Promise.all(
      history.map(async (entry) => {
        const messages = await this.databaseService.db
          .select()
          .from(schema.chatMessages)
          .where(eq(schema.chatMessages.historyId, entry.id))
          .orderBy(asc(schema.chatMessages.createdAt));

        return {
          ...entry,
          chatMessages: messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        };
      })
    );

    return { history: historyWithMessages };
  }

  async addHistoryEntry(input: CreateHistoryEntryInput) {
    const [existingSession] = await this.databaseService.db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, input.sessionId));

    if (!existingSession) {
      await this.databaseService.db.insert(schema.sessions).values({ id: input.sessionId });
    }

    const [entry] = await this.databaseService.db
      .insert(schema.answerHistory)
      .values({
        sessionId: input.sessionId,
        questionId: input.questionId,
        techId: input.techId || "",
        level: input.level || "",
        questionText: input.questionText,
        userAnswer: input.userAnswer,
        score: input.score || 0,
        feedback: input.feedback || "",
        strengths: input.strengths || [],
        improvements: input.improvements || [],
        sampleAnswer: input.sampleAnswer || "",
        model: input.model || "",
      })
      .returning();

    return { success: true, entry };
  }

  async updateChatMessages(historyId: number, messages: Array<{ role: string; content: string }>) {
    await this.databaseService.db
      .delete(schema.chatMessages)
      .where(eq(schema.chatMessages.historyId, historyId));

    if (messages.length > 0) {
      await this.databaseService.db.insert(schema.chatMessages).values(
        messages.map((message) => ({
          historyId,
          role: message.role,
          content: message.content,
        }))
      );
    }

    return { success: true };
  }

  async deleteHistoryEntry(historyId: number) {
    await this.databaseService.db
      .delete(schema.answerHistory)
      .where(eq(schema.answerHistory.id, historyId));

    return { success: true };
  }

  async clearHistory(sessionId: string) {
    await this.databaseService.db
      .delete(schema.answerHistory)
      .where(eq(schema.answerHistory.sessionId, sessionId));

    return { success: true };
  }
}
