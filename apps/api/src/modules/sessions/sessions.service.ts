import { Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DatabaseService } from "../../database/database.service";
import * as schema from "../../database/schema";

@Injectable()
export class SessionsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createOrGetSession(sessionId?: string) {
    if (sessionId) {
      const [existingSession] = await this.databaseService.db
        .select()
        .from(schema.sessions)
        .where(eq(schema.sessions.id, sessionId));

      if (existingSession) {
        await this.databaseService.db
          .update(schema.sessions)
          .set({ lastActiveAt: new Date() })
          .where(eq(schema.sessions.id, sessionId));

        return { sessionId: existingSession.id, isNew: false };
      }
    }

    const nextSessionId = sessionId || `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const [session] = await this.databaseService.db
      .insert(schema.sessions)
      .values({ id: nextSessionId })
      .returning();

    return { sessionId: session.id, isNew: true };
  }
}
