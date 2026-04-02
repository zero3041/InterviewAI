import { Injectable } from "@nestjs/common";
import { and, desc, eq } from "drizzle-orm";
import { DatabaseService } from "../../database/database.service";
import * as schema from "../../database/schema";

@Injectable()
export class BookmarksService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getBookmarks(sessionId: string) {
    const bookmarks = await this.databaseService.db
      .select({
        id: schema.bookmarks.id,
        questionId: schema.bookmarks.questionId,
        createdAt: schema.bookmarks.createdAt,
        question: schema.questions,
      })
      .from(schema.bookmarks)
      .leftJoin(schema.questions, eq(schema.bookmarks.questionId, schema.questions.id))
      .where(eq(schema.bookmarks.sessionId, sessionId))
      .orderBy(desc(schema.bookmarks.createdAt));

    return { bookmarks };
  }

  async addBookmark(sessionId: string, questionId: number) {
    const [existingSession] = await this.databaseService.db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId));

    if (!existingSession) {
      await this.databaseService.db.insert(schema.sessions).values({ id: sessionId });
    }

    const [existingBookmark] = await this.databaseService.db
      .select()
      .from(schema.bookmarks)
      .where(and(eq(schema.bookmarks.sessionId, sessionId), eq(schema.bookmarks.questionId, questionId)));

    if (existingBookmark) {
      return { success: true, alreadyExists: true };
    }

    const [bookmark] = await this.databaseService.db
      .insert(schema.bookmarks)
      .values({ sessionId, questionId })
      .returning();

    return { success: true, bookmark };
  }

  async removeBookmark(sessionId: string, questionId: number) {
    await this.databaseService.db
      .delete(schema.bookmarks)
      .where(and(eq(schema.bookmarks.sessionId, sessionId), eq(schema.bookmarks.questionId, questionId)));

    return { success: true };
  }
}
