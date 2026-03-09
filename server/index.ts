import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";
import { AI_MODELS, type ScoreRequest, type ScoreResponse } from "../shared/ai-models.js";

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
