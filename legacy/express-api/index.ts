import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { AI_MODELS, type ScoreRequest, type ScoreResponse } from "../shared/ai-models.js";
import { db } from "./db/index.js";
import * as schema from "./db/schema.js";
import { eq, and, desc, asc, sql } from "drizzle-orm";

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AI API Configuration
const AI_API_BASE_URL = process.env.AI_API_BASE_URL || "http://127.0.0.1:8045/v1";
const AI_API_KEY = process.env.AI_API_KEY || "";
const DEFAULT_AI_MODEL = process.env.DEFAULT_AI_MODEL || "gemini-2.5-flash";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Parse JSON body
  app.use(express.json());

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // API: Get available AI models
  app.get("/api/models", (_req, res) => {
    res.json({
      models: AI_MODELS,
      defaultModel: DEFAULT_AI_MODEL,
    });
  });

  // API: Score an answer using AI
  app.post("/api/score", async (req, res) => {
    try {
      const { question, answer, model, technology } = req.body as ScoreRequest & { technology?: string };

      if (!question || !answer) {
        return res.status(400).json({ error: "Question and answer are required" });
      }

      if (!AI_API_KEY) {
        return res.status(500).json({ error: "AI API key not configured" });
      }

      const selectedModel = model || DEFAULT_AI_MODEL;
      const techName = technology || "lập trình";

      // Build the scoring prompt
      const systemPrompt = `Bạn là một chuyên gia phỏng vấn ${techName} với nhiều năm kinh nghiệm. 
Nhiệm vụ của bạn là đánh giá câu trả lời phỏng vấn và cung cấp phản hồi chi tiết.

Hãy đánh giá câu trả lời theo các tiêu chí sau:
1. Độ chính xác kỹ thuật (40%)
2. Độ đầy đủ của câu trả lời (30%)
3. Cách trình bày và giải thích (20%)
4. Ví dụ minh họa (10%)

Trả lời theo định dạng JSON sau:
{
  "score": <điểm từ 0-100>,
  "feedback": "<nhận xét tổng quan về câu trả lời>",
  "strengths": ["<điểm mạnh 1>", "<điểm mạnh 2>", ...],
  "improvements": ["<điểm cần cải thiện 1>", "<điểm cần cải thiện 2>", ...],
  "sampleAnswer": "<câu trả lời mẫu ngắn gọn và đầy đủ>"
}`;

      const userPrompt = `Câu hỏi phỏng vấn: ${question}

Câu trả lời của ứng viên: ${answer}

Hãy đánh giá câu trả lời trên.`;

      // Call the AI API (OpenAI-compatible format)
      const response = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", errorText);
        return res.status(500).json({ error: "Failed to get AI response" });
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content;

      if (!content) {
        return res.status(500).json({ error: "Empty AI response" });
      }

      // Parse the JSON response from AI
      try {
        // Extract JSON from the response (in case there's extra text)
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        const scoreResult: ScoreResponse = JSON.parse(jsonMatch[0]);
        return res.json(scoreResult);
      } catch (parseError) {
        console.error("Failed to parse AI response:", content);
        // Return a fallback response with the raw content
        return res.json({
          score: 0,
          feedback: content,
          strengths: [],
          improvements: ["Không thể phân tích phản hồi từ AI"],
          sampleAnswer: "",
        });
      }
    } catch (error) {
      console.error("Score API error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // API: Batch score multiple answers (for test mode)
  app.post("/api/score-batch", async (req, res) => {
    try {
      const { questions, model, technology } = req.body as {
        questions: { question: string; answer: string }[];
        model?: string;
        technology?: string;
      };

      if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: "Questions array is required" });
      }

      if (!AI_API_KEY) {
        return res.status(500).json({ error: "AI API key not configured" });
      }

      const selectedModel = model || DEFAULT_AI_MODEL;
      const techName = technology || "lập trình";

      // Build the batch scoring prompt
      const systemPrompt = `Bạn là một chuyên gia phỏng vấn ${techName} với nhiều năm kinh nghiệm.
Nhiệm vụ của bạn là đánh giá nhiều câu trả lời phỏng vấn cùng lúc và cung cấp phản hồi chi tiết cho từng câu.

Hãy đánh giá mỗi câu trả lời theo các tiêu chí sau:
1. Độ chính xác kỹ thuật (40%)
2. Độ đầy đủ của câu trả lời (30%)
3. Cách trình bày và giải thích (20%)
4. Ví dụ minh họa (10%)

Trả lời CHÍNH XÁC theo định dạng JSON sau (không thêm text ngoài JSON):
{
  "totalScore": <tổng điểm của tất cả câu>,
  "averageScore": <điểm trung bình>,
  "overallFeedback": "<nhận xét tổng quan về toàn bộ bài làm>",
  "results": [
    {
      "questionIndex": 0,
      "score": <điểm từ 0-100>,
      "feedback": "<nhận xét ngắn gọn>",
      "strengths": ["<điểm mạnh>"],
      "improvements": ["<cần cải thiện>"]
    },
    ... (cho tất cả ${questions.length} câu)
  ]
}`;

      // Format questions for the prompt
      const questionsText = questions
        .map(
          (q, i) => `--- CÂU ${i + 1} ---
Câu hỏi: ${q.question}
Câu trả lời: ${q.answer || "(Không có câu trả lời)"}
`
        )
        .join("\n");

      const userPrompt = `Hãy chấm điểm ${questions.length} câu trả lời phỏng vấn sau:

${questionsText}

Trả về kết quả theo định dạng JSON đã chỉ định.`;

      // Call the AI API
      const response = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 8000, // Higher limit for batch responses
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", errorText);
        return res.status(500).json({ error: "Failed to get AI response" });
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content;

      if (!content) {
        return res.status(500).json({ error: "Empty AI response" });
      }

      // Parse the JSON response from AI
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        const batchResult = JSON.parse(jsonMatch[0]);
        return res.json(batchResult);
      } catch (parseError) {
        console.error("Failed to parse batch AI response:", content);
        // Return a fallback response
        return res.json({
          totalScore: 0,
          averageScore: 0,
          overallFeedback: "Không thể phân tích phản hồi từ AI. Vui lòng thử lại.",
          results: questions.map((_, i) => ({
            questionIndex: i,
            score: 0,
            feedback: "Không thể chấm điểm",
            strengths: [],
            improvements: [],
          })),
        });
      }
    } catch (error) {
      console.error("Batch score API error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // API: Follow-up chat for clarification after scoring
  app.post("/api/chat", async (req, res) => {
    try {
      const { question, userAnswer, scoreResult, followUpQuestion, chatHistory, model, technology } = req.body as {
        question: string;
        userAnswer: string;
        scoreResult: {
          score: number;
          feedback: string;
          strengths: string[];
          improvements: string[];
          sampleAnswer: string;
        };
        followUpQuestion: string;
        chatHistory: { role: "user" | "assistant"; content: string }[];
        model?: string;
        technology?: string;
      };

      if (!followUpQuestion) {
        return res.status(400).json({ error: "Follow-up question is required" });
      }

      if (!AI_API_KEY) {
        return res.status(500).json({ error: "AI API key not configured" });
      }

      const selectedModel = model || DEFAULT_AI_MODEL;
      const techName = technology || "lập trình";

      // Build context-aware system prompt
      const systemPrompt = `Bạn là một chuyên gia phỏng vấn ${techName} với nhiều năm kinh nghiệm.
Bạn vừa chấm điểm một câu trả lời phỏng vấn và người dùng muốn hỏi thêm để hiểu rõ hơn.

Ngữ cảnh:
- Câu hỏi phỏng vấn: ${question}
- Câu trả lời của ứng viên: ${userAnswer}
- Điểm số: ${scoreResult.score}/100
- Nhận xét: ${scoreResult.feedback}
- Điểm mạnh: ${scoreResult.strengths?.join(", ") || "Không có"}
- Cần cải thiện: ${scoreResult.improvements?.join(", ") || "Không có"}
- Câu trả lời mẫu: ${scoreResult.sampleAnswer || "Không có"}

Hãy trả lời câu hỏi của người dùng một cách rõ ràng, dễ hiểu, có ví dụ cụ thể nếu cần.
Trả lời bằng tiếng Việt. Không cần format JSON, chỉ cần trả lời tự nhiên.`;

      // Build messages with chat history
      const messages: { role: string; content: string }[] = [
        { role: "system", content: systemPrompt },
      ];

      // Add chat history
      chatHistory.forEach((msg) => {
        messages.push({ role: msg.role, content: msg.content });
      });

      // Add current question
      messages.push({ role: "user", content: followUpQuestion });

      // Call the AI API
      const response = await fetch(`${AI_API_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI API error:", errorText);
        return res.status(500).json({ error: "Failed to get AI response" });
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content;

      if (!content) {
        return res.status(500).json({ error: "Empty AI response" });
      }

      return res.json({ reply: content });
    } catch (error) {
      console.error("Chat API error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // ============================================================================
  // DATABASE API ROUTES
  // ============================================================================

  // API: Get all technologies
  app.get("/api/technologies", async (_req, res) => {
    try {
      const techs = await db.select().from(schema.technologies);
      return res.json({ technologies: techs });
    } catch (error) {
      console.error("Get technologies error:", error);
      return res.status(500).json({ error: "Failed to fetch technologies" });
    }
  });

  // API: Get questions for a technology and level
  app.get("/api/technologies/:techId/questions", async (req, res) => {
    try {
      const { techId } = req.params;
      const { level } = req.query;

      // Get technology info
      const [tech] = await db.select().from(schema.technologies).where(eq(schema.technologies.id, techId));
      if (!tech) {
        return res.status(404).json({ error: "Technology not found" });
      }

      // Build query conditions
      const conditions = [eq(schema.questions.techId, techId)];
      if (level && typeof level === "string") {
        conditions.push(eq(schema.questions.level, level));
      }

      // Get categories for this tech/level
      const categoryConditions = [eq(schema.categories.techId, techId)];
      if (level && typeof level === "string") {
        categoryConditions.push(eq(schema.categories.level, level));
      }

      const categories = await db
        .select()
        .from(schema.categories)
        .where(and(...categoryConditions))
        .orderBy(asc(schema.categories.displayOrder));

      // Get questions
      const questions = await db
        .select()
        .from(schema.questions)
        .where(and(...conditions))
        .orderBy(asc(schema.questions.questionNumber));

      // Group questions by category
      const categorizedQuestions: Record<string, Record<string, typeof questions>> = {};

      for (const cat of categories) {
        if (!categorizedQuestions[cat.mainCategory]) {
          categorizedQuestions[cat.mainCategory] = {};
        }
        categorizedQuestions[cat.mainCategory][cat.subCategory] = questions.filter(
          (q) => q.categoryId === cat.id
        );
      }

      return res.json({
        technology: tech,
        level: level || "all",
        levelLabel: level === "junior" ? "Junior (1 năm kinh nghiệm)" : "Middle (2-3 năm kinh nghiệm)",
        categories: categorizedQuestions,
        questions: questions, // Also return flat list for convenience
        totalQuestions: questions.length,
      });
    } catch (error) {
      console.error("Get questions error:", error);
      return res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // API: Create or get session
  app.post("/api/sessions", async (req, res) => {
    try {
      const { sessionId } = req.body;

      if (sessionId) {
        // Check if session exists
        const [existing] = await db
          .select()
          .from(schema.sessions)
          .where(eq(schema.sessions.id, sessionId));

        if (existing) {
          // Update last active
          await db
            .update(schema.sessions)
            .set({ lastActiveAt: new Date() })
            .where(eq(schema.sessions.id, sessionId));

          return res.json({ sessionId: existing.id, isNew: false });
        }
      }

      // Create new session
      const newSessionId = sessionId || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const [session] = await db
        .insert(schema.sessions)
        .values({ id: newSessionId })
        .returning();

      return res.json({ sessionId: session.id, isNew: true });
    } catch (error) {
      console.error("Create session error:", error);
      return res.status(500).json({ error: "Failed to create session" });
    }
  });

  // API: Get answer history for a session
  app.get("/api/history", async (req, res) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const { questionId, limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : 100;

      let query = db
        .select()
        .from(schema.answerHistory)
        .where(eq(schema.answerHistory.sessionId, sessionId))
        .orderBy(desc(schema.answerHistory.createdAt))
        .limit(limitNum);

      const history = await query;

      // Get chat messages for each history entry
      const historyWithMessages = await Promise.all(
        history.map(async (entry) => {
          const messages = await db
            .select()
            .from(schema.chatMessages)
            .where(eq(schema.chatMessages.historyId, entry.id))
            .orderBy(asc(schema.chatMessages.createdAt));

          return {
            ...entry,
            chatMessages: messages.map((m) => ({ role: m.role, content: m.content })),
          };
        })
      );

      return res.json({ history: historyWithMessages });
    } catch (error) {
      console.error("Get history error:", error);
      return res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // API: Add new history entry
  app.post("/api/history", async (req, res) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const { questionId, techId, level, questionText, userAnswer, score, feedback, strengths, improvements, sampleAnswer, model } = req.body;

      if (!questionId || !questionText || !userAnswer) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Ensure session exists
      const [existingSession] = await db.select().from(schema.sessions).where(eq(schema.sessions.id, sessionId));
      if (!existingSession) {
        await db.insert(schema.sessions).values({ id: sessionId });
      }

      const [entry] = await db
        .insert(schema.answerHistory)
        .values({
          sessionId,
          questionId: parseInt(questionId),
          techId: techId || "",
          level: level || "",
          questionText,
          userAnswer,
          score: score || 0,
          feedback: feedback || "",
          strengths: strengths || [],
          improvements: improvements || [],
          sampleAnswer: sampleAnswer || "",
          model: model || "",
        })
        .returning();

      return res.json({ success: true, entry });
    } catch (error) {
      console.error("Add history error:", error);
      return res.status(500).json({ error: "Failed to add history entry" });
    }
  });

  // API: Update chat messages for a history entry
  app.post("/api/history/:historyId/chat", async (req, res) => {
    try {
      const { historyId } = req.params;
      const { messages } = req.body as { messages: { role: string; content: string }[] };

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array required" });
      }

      // Delete existing messages and insert new ones
      await db.delete(schema.chatMessages).where(eq(schema.chatMessages.historyId, parseInt(historyId)));

      if (messages.length > 0) {
        await db.insert(schema.chatMessages).values(
          messages.map((m) => ({
            historyId: parseInt(historyId),
            role: m.role,
            content: m.content,
          }))
        );
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("Update chat error:", error);
      return res.status(500).json({ error: "Failed to update chat messages" });
    }
  });

  // API: Delete history entry
  app.delete("/api/history/:historyId", async (req, res) => {
    try {
      const { historyId } = req.params;

      await db.delete(schema.answerHistory).where(eq(schema.answerHistory.id, parseInt(historyId)));

      return res.json({ success: true });
    } catch (error) {
      console.error("Delete history error:", error);
      return res.status(500).json({ error: "Failed to delete history entry" });
    }
  });

  // API: Clear all history for a session
  app.delete("/api/history", async (req, res) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      await db.delete(schema.answerHistory).where(eq(schema.answerHistory.sessionId, sessionId));

      return res.json({ success: true });
    } catch (error) {
      console.error("Clear history error:", error);
      return res.status(500).json({ error: "Failed to clear history" });
    }
  });

  // API: Get bookmarks for a session
  app.get("/api/bookmarks", async (req, res) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const bookmarks = await db
        .select({
          id: schema.bookmarks.id,
          questionId: schema.bookmarks.questionId,
          createdAt: schema.bookmarks.createdAt,
          question: schema.questions,
        })
        .from(schema.bookmarks)
        .leftJoin(schema.questions, eq(schema.bookmarks.questionId, schema.questions.id))
        .where(eq(schema.bookmarks.sessionId, sessionId))
        .orderBy(desc(schema.bookmarks.createdAt));

      return res.json({ bookmarks });
    } catch (error) {
      console.error("Get bookmarks error:", error);
      return res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });

  // API: Add bookmark
  app.post("/api/bookmarks", async (req, res) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const { questionId } = req.body;
      if (!questionId) {
        return res.status(400).json({ error: "Question ID required" });
      }

      // Ensure session exists
      const [existingSession] = await db.select().from(schema.sessions).where(eq(schema.sessions.id, sessionId));
      if (!existingSession) {
        await db.insert(schema.sessions).values({ id: sessionId });
      }

      // Check if already bookmarked
      const [existing] = await db
        .select()
        .from(schema.bookmarks)
        .where(and(eq(schema.bookmarks.sessionId, sessionId), eq(schema.bookmarks.questionId, questionId)));

      if (existing) {
        return res.json({ success: true, alreadyExists: true });
      }

      const [bookmark] = await db
        .insert(schema.bookmarks)
        .values({ sessionId, questionId })
        .returning();

      return res.json({ success: true, bookmark });
    } catch (error) {
      console.error("Add bookmark error:", error);
      return res.status(500).json({ error: "Failed to add bookmark" });
    }
  });

  // API: Remove bookmark
  app.delete("/api/bookmarks/:questionId", async (req, res) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      const { questionId } = req.params;

      await db
        .delete(schema.bookmarks)
        .where(and(eq(schema.bookmarks.sessionId, sessionId), eq(schema.bookmarks.questionId, parseInt(questionId))));

      return res.json({ success: true });
    } catch (error) {
      console.error("Remove bookmark error:", error);
      return res.status(500).json({ error: "Failed to remove bookmark" });
    }
  });

  // API: Get stats for a session
  app.get("/api/stats", async (req, res) => {
    try {
      const sessionId = req.headers["x-session-id"] as string;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID required" });
      }

      // Get answer stats
      const historyStats = await db
        .select({
          totalAnswers: sql<number>`count(*)`,
          avgScore: sql<number>`avg(${schema.answerHistory.score})`,
          totalTechs: sql<number>`count(distinct ${schema.answerHistory.techId})`,
        })
        .from(schema.answerHistory)
        .where(eq(schema.answerHistory.sessionId, sessionId));

      // Get score distribution
      const scoreDistribution = await db
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

      // Get bookmark count
      const [bookmarkStats] = await db
        .select({ count: sql<number>`count(*)` })
        .from(schema.bookmarks)
        .where(eq(schema.bookmarks.sessionId, sessionId));

      return res.json({
        totalAnswers: parseInt(String(historyStats[0]?.totalAnswers || 0)),
        averageScore: Math.round(parseFloat(String(historyStats[0]?.avgScore || 0))),
        totalTechnologies: parseInt(String(historyStats[0]?.totalTechs || 0)),
        totalBookmarks: parseInt(String(bookmarkStats?.count || 0)),
        scoreDistribution: Object.fromEntries(
          scoreDistribution.map((d) => [d.scoreRange, parseInt(String(d.count))])
        ),
      });
    } catch (error) {
      console.error("Get stats error:", error);
      return res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || (process.env.NODE_ENV === "production" ? 3000 : 3001);

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`AI API configured: ${AI_API_BASE_URL}`);
    console.log(`Default model: ${DEFAULT_AI_MODEL}`);
  });
}

startServer().catch(console.error);
