import { Controller, Get, Param, Query } from "@nestjs/common";
import { TechnologiesService } from "./technologies.service";

@Controller("technologies")
export class TechnologiesController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Get()
  getTechnologies() {
    return this.technologiesService.getTechnologies();
  }

  @Get(":techId/questions")
  getQuestions(@Param("techId") techId: string, @Query("level") level?: string) {
    return this.technologiesService.getQuestions(techId, level);
  }
}
