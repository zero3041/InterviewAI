import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, ParseIntPipe, Post } from "@nestjs/common";
import { requireSessionId } from "../../common/session-id";
import { BookmarksService } from "./bookmarks.service";

@Controller("bookmarks")
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  getBookmarks(@Headers("x-session-id") sessionId?: string) {
    return this.bookmarksService.getBookmarks(requireSessionId(sessionId));
  }

  @Post()
  addBookmark(@Headers("x-session-id") sessionId?: string, @Body() body?: { questionId?: number }) {
    if (!body?.questionId) {
      throw new BadRequestException("Question ID required");
    }

    return this.bookmarksService.addBookmark(requireSessionId(sessionId), Number(body.questionId));
  }

  @Delete(":questionId")
  removeBookmark(
    @Param("questionId", ParseIntPipe) questionId: number,
    @Headers("x-session-id") sessionId?: string
  ) {
    return this.bookmarksService.removeBookmark(requireSessionId(sessionId), questionId);
  }
}
