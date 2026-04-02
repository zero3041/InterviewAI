import { Injectable, NotFoundException } from "@nestjs/common";
import { and, asc, eq } from "drizzle-orm";
import { DatabaseService } from "../../database/database.service";
import * as schema from "../../database/schema";

@Injectable()
export class TechnologiesService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getTechnologies() {
    const technologies = await this.databaseService.db.select().from(schema.technologies);

    return { technologies };
  }

  async getQuestions(techId: string, level?: string) {
    const [technology] = await this.databaseService.db
      .select()
      .from(schema.technologies)
      .where(eq(schema.technologies.id, techId));

    if (!technology) {
      throw new NotFoundException("Technology not found");
    }

    const questionConditions = [eq(schema.questions.techId, techId)];
    const categoryConditions = [eq(schema.categories.techId, techId)];

    if (level) {
      questionConditions.push(eq(schema.questions.level, level));
      categoryConditions.push(eq(schema.categories.level, level));
    }

    const categories = await this.databaseService.db
      .select()
      .from(schema.categories)
      .where(and(...categoryConditions))
      .orderBy(asc(schema.categories.displayOrder));

    const questions = await this.databaseService.db
      .select()
      .from(schema.questions)
      .where(and(...questionConditions))
      .orderBy(asc(schema.questions.questionNumber));

    const categorizedQuestions: Record<string, Record<string, typeof questions>> = {};

    for (const category of categories) {
      categorizedQuestions[category.mainCategory] ??= {};
      categorizedQuestions[category.mainCategory][category.subCategory] = questions.filter(
        (question) => question.categoryId === category.id
      );
    }

    return {
      technology,
      level: level || "all",
      levelLabel: level === "junior" ? "Junior (1 năm kinh nghiệm)" : "Middle (2-3 năm kinh nghiệm)",
      categories: categorizedQuestions,
      questions,
      totalQuestions: questions.length,
    };
  }
}
