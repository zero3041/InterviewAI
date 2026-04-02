import { Injectable } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import { DatabaseService } from "../../database/database.service";
import * as schema from "../../database/schema";

@Injectable()
export class StatsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getStats(sessionId: string) {
    const historyStats = await this.databaseService.db
      .select({
        totalAnswers: sql<number>`count(*)`,
        avgScore: sql<number>`avg(${schema.answerHistory.score})`,
        totalTechs: sql<number>`count(distinct ${schema.answerHistory.techId})`,
      })
      .from(schema.answerHistory)
      .where(eq(schema.answerHistory.sessionId, sessionId));

    const scoreDistribution = await this.databaseService.db
      .select({
        scoreRange: sql<string>`
          CASE 
            WHEN ${schema.answerHistory.score} >= 90 THEN 'excellent'
            WHEN ${schema.answerHistory.score} >= 70 THEN 'good'
            WHEN ${schema.answerHistory.score} >= 50 THEN 'average'
            ELSE 'needsWork'
          END
        `,
        count: sql<number>`count(*)`,
      })
      .from(schema.answerHistory)
      .where(eq(schema.answerHistory.sessionId, sessionId))
      .groupBy(sql`1`);

    const [bookmarkStats] = await this.databaseService.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.bookmarks)
      .where(eq(schema.bookmarks.sessionId, sessionId));

    return {
      totalAnswers: parseInt(String(historyStats[0]?.totalAnswers || 0), 10),
      averageScore: Math.round(parseFloat(String(historyStats[0]?.avgScore || 0))),
      totalTechnologies: parseInt(String(historyStats[0]?.totalTechs || 0), 10),
      totalBookmarks: parseInt(String(bookmarkStats?.count || 0), 10),
      scoreDistribution: Object.fromEntries(
        scoreDistribution.map((entry) => [entry.scoreRange, parseInt(String(entry.count), 10)])
      ),
    };
  }
}
