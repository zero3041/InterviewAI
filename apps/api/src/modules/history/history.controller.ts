import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post, Query } from "@nestjs/common";
import { requireSessionId } from "../../common/session-id";
import { HistoryService } from "./history.service";

@Controller("history")
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  getHistory(@Headers("x-session-id") sessionId?: string, @Query("limit") limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 100;

    return this.historyService.getHistory(requireSessionId(sessionId), parsedLimit);
  }

  @Post()
  addHistoryEntry(@Headers("x-session-id") sessionId?: string, @Body() body?: Record<string, unknown>) {
    if (!body?.questionId || !body.questionText || !body.userAnswer) {
      throw new BadRequestException("Missing required fields");
    }

    return this.historyService.addHistoryEntry({
      sessionId: requireSessionId(sessionId),
      questionId: parseInt(String(body.questionId), 10),
      techId: body.techId ? String(body.techId) : undefined,
      level: body.level ? String(body.level) : undefined,
      questionText: String(body.questionText),
      userAnswer: String(body.userAnswer),
      score: body.score ? parseInt(String(body.score), 10) : 0,
      feedback: body.feedback ? String(body.feedback) : "",
      strengths: Array.isArray(body.strengths) ? body.strengths.map(String) : [],
      improvements: Array.isArray(body.improvements) ? body.improvements.map(String) : [],
      sampleAnswer: body.sampleAnswer ? String(body.sampleAnswer) : "",
      model: body.model ? String(body.model) : "",
    });
  }

  @Post(":historyId/chat")
  updateChatMessages(
    @Param("historyId", ParseIntPipe) historyId: number,
    @Body() body?: { messages?: Array<{ role: string; content: string }> }
  ) {
    return this.historyService.updateChatMessages(historyId, body?.messages || []);
  }

  @Delete(":historyId")
  deleteHistoryEntry(@Param("historyId", ParseIntPipe) historyId: number) {
    return this.historyService.deleteHistoryEntry(historyId);
  }

  @Delete()
  clearHistory(@Headers("x-session-id") sessionId?: string) {
    return this.historyService.clearHistory(requireSessionId(sessionId));
  }
}
