import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { extractJsonObject } from "../../common/parse-ai-json";
import { AI_MODELS, type BatchScoreResponse, type ScoreResponse } from "./ai.models";

interface ScoreRequestBody {
  question?: string;
  answer?: string;
  model?: string;
  technology?: string;
}

interface ScoreBatchRequestBody {
  questions?: Array<{ question: string; answer: string }>;
  model?: string;
  technology?: string;
}

interface ChatRequestBody {
  question?: string;
  userAnswer?: string;
  scoreResult?: ScoreResponse;
  followUpQuestion?: string;
  chatHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  model?: string;
  technology?: string;
}

@Injectable()
export class AiService {
  constructor(private readonly configService: ConfigService) {}

  getModels() {
    return {
      models: AI_MODELS,
      defaultModel: this.defaultModel,
    };
  }

  async score(body: ScoreRequestBody) {
    const { question, answer } = body;

    if (!question || !answer) {
      throw new BadRequestException("Question and answer are required");
    }

    const content = await this.callAi({
      model: body.model,
      messages: [
        {
          role: "system",
          content: `Bạn là một chuyên gia phỏng vấn ${body.technology || "lập trình"} với nhiều năm kinh nghiệm. 
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
}`,
        },
        {
          role: "user",
          content: `Câu hỏi phỏng vấn: ${question}

Câu trả lời của ứng viên: ${answer}

Hãy đánh giá câu trả lời trên.`,
        },
      ],
      maxTokens: 4096,
    });

    try {
      return extractJsonObject<ScoreResponse>(content);
    } catch {
      return {
        score: 0,
        feedback: content,
        strengths: [],
        improvements: ["Không thể phân tích phản hồi từ AI"],
        sampleAnswer: "",
      };
    }
  }

  async scoreBatch(body: ScoreBatchRequestBody) {
    if (!body.questions || body.questions.length === 0) {
      throw new BadRequestException("Questions array is required");
    }

    const questionsText = body.questions
      .map(
        (question, index) => `--- CÂU ${index + 1} ---
Câu hỏi: ${question.question}
Câu trả lời: ${question.answer || "(Không có câu trả lời)"}
`
      )
      .join("\n");

    const content = await this.callAi({
      model: body.model,
      messages: [
        {
          role: "system",
          content: `Bạn là một chuyên gia phỏng vấn ${body.technology || "lập trình"} với nhiều năm kinh nghiệm.
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
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Hãy chấm điểm ${body.questions.length} câu trả lời phỏng vấn sau:

${questionsText}

Trả về kết quả theo định dạng JSON đã chỉ định.`,
        },
      ],
      maxTokens: 8000,
    });

    try {
      return extractJsonObject<BatchScoreResponse>(content);
    } catch {
      return {
        totalScore: 0,
        averageScore: 0,
        overallFeedback: "Không thể phân tích phản hồi từ AI. Vui lòng thử lại.",
        results: body.questions.map((_, index) => ({
          questionIndex: index,
          score: 0,
          feedback: "Không thể chấm điểm",
          strengths: [],
          improvements: [],
        })),
      };
    }
  }

  async chat(body: ChatRequestBody) {
    if (!body.followUpQuestion) {
      throw new BadRequestException("Follow-up question is required");
    }

    const content = await this.callAi({
      model: body.model,
      messages: [
        {
          role: "system",
          content: `Bạn là một chuyên gia phỏng vấn ${body.technology || "lập trình"} với nhiều năm kinh nghiệm.
Bạn vừa chấm điểm một câu trả lời phỏng vấn và người dùng muốn hỏi thêm để hiểu rõ hơn.

Ngữ cảnh:
- Câu hỏi phỏng vấn: ${body.question || ""}
- Câu trả lời của ứng viên: ${body.userAnswer || ""}
- Điểm số: ${body.scoreResult?.score || 0}/100
- Nhận xét: ${body.scoreResult?.feedback || ""}
- Điểm mạnh: ${body.scoreResult?.strengths?.join(", ") || "Không có"}
- Cần cải thiện: ${body.scoreResult?.improvements?.join(", ") || "Không có"}
- Câu trả lời mẫu: ${body.scoreResult?.sampleAnswer || "Không có"}

Hãy trả lời câu hỏi của người dùng một cách rõ ràng, dễ hiểu, có ví dụ cụ thể nếu cần.
Trả lời bằng tiếng Việt. Không cần format JSON, chỉ cần trả lời tự nhiên.`,
        },
        ...(body.chatHistory || []),
        { role: "user", content: body.followUpQuestion },
      ],
      maxTokens: 2048,
    });

    return { reply: content };
  }

  private get apiBaseUrl() {
    return this.configService.get("AI_API_BASE_URL") || "http://127.0.0.1:8045/v1";
  }

  private get apiKey() {
    return this.configService.get("AI_API_KEY") || "";
  }

  private get defaultModel() {
    return this.configService.get("DEFAULT_AI_MODEL") || "gemini-2.5-flash";
  }

  private async callAi(params: {
    model?: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens: number;
  }) {
    if (!this.apiKey) {
      throw new InternalServerErrorException("AI API key not configured");
    }

    const response = await fetch(`${this.apiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: params.model || this.defaultModel,
        messages: params.messages,
        temperature: 0.7,
        max_tokens: params.maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new InternalServerErrorException(`Failed to get AI response: ${errorText}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new InternalServerErrorException("Empty AI response");
    }

    return content as string;
  }
}
