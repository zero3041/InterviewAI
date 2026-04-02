import { BadRequestException } from "@nestjs/common";

export const requireSessionId = (sessionId?: string) => {
  if (!sessionId) {
    throw new BadRequestException("Session ID required");
  }

  return sessionId;
};
