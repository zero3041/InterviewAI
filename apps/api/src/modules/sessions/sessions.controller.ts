import { Body, Controller, Post } from "@nestjs/common";
import { SessionsService } from "./sessions.service";

@Controller("sessions")
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  createOrGetSession(@Body() body: { sessionId?: string }) {
    return this.sessionsService.createOrGetSession(body?.sessionId);
  }
}
