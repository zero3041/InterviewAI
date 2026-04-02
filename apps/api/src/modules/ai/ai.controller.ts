import { Body, Controller, Get, Post } from "@nestjs/common";
import { AiService } from "./ai.service";

@Controller()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get("models")
  getModels() {
    return this.aiService.getModels();
  }

  @Post("score")
  score(@Body() body: Record<string, unknown>) {
    return this.aiService.score(body);
  }

  @Post("score-batch")
  scoreBatch(@Body() body: Record<string, unknown>) {
    return this.aiService.scoreBatch(body);
  }

  @Post("chat")
  chat(@Body() body: Record<string, unknown>) {
    return this.aiService.chat(body);
  }
}
