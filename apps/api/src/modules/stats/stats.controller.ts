import { Controller, Get, Headers } from "@nestjs/common";
import { requireSessionId } from "../../common/session-id";
import { StatsService } from "./stats.service";

@Controller("stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getStats(@Headers("x-session-id") sessionId?: string) {
    return this.statsService.getStats(requireSessionId(sessionId));
  }
}
