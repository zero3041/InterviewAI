export const AI_MODELS = [
  { id: "gemini-3.1-pro-high", name: "Gemini 3.1 Pro High", provider: "Google" },
  { id: "gemini-3-pro-low", name: "Gemini 3 Pro Low", provider: "Google" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "Google" },
  { id: "gemini-3-flash", name: "Gemini 3 Flash", provider: "Google" },
  { id: "gemini-2.5-flash-lite", name: "Gemini 2.5 Flash Lite", provider: "Google" },
  { id: "claude-opus-4-6-thinking", name: "Claude Opus 4.6 Thinking", provider: "Anthropic" },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "Anthropic" },
  { id: "gemini-3-pro-high", name: "Gemini 3 Pro High", provider: "Google" },
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", provider: "Google" },
  { id: "gemini-3.1-flash-image", name: "Gemini 3.1 Flash Image", provider: "Google" },
  { id: "gemini-2.5-flash-thinking", name: "Gemini 2.5 Flash Thinking", provider: "Google" },
  { id: "gemini-3.1-pro-low", name: "Gemini 3.1 Pro Low", provider: "Google" },
  { id: "gpt-oss-120b-medium", name: "GPT OSS 120B Medium", provider: "OpenAI" },
] as const;

export interface ScoreResponse {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  sampleAnswer?: string;
}

export interface BatchScoreResponse {
  totalScore: number;
  averageScore: number;
  overallFeedback: string;
  results: Array<{
    questionIndex: number;
    score: number;
    feedback: string;
    strengths: string[];
    improvements: string[];
  }>;
}
