import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CheckCircle, AlertCircle, Lightbulb, Send, MessageCircle, ChevronDown, ChevronUp, History, Trash2 } from "lucide-react";
import type { ScoreResponse } from "@shared/ai-models";
import { useHistoryApi, type HistoryEntry, type ChatMessage } from "@/hooks/useHistoryApi";
import { MarkdownContent } from "@/components/MarkdownContent";

interface AIModel {
  id: string;
  name: string;
  provider: string;
}

interface ModelsResponse {
  models: AIModel[];
  defaultModel: string;
}

interface AnswerScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: string;
  questionNumber: number;
  questionId: number;  // Database question ID
  technology?: string;
  techId?: string;
  level?: string;
  onHistorySaved?: () => void;
}

export function AnswerScoreDialog({
  open,
  onOpenChange,
  question,
  questionNumber,
  questionId,
  technology = "lập trình",
  techId = "unknown",
  level = "junior",
  onHistorySaved,
}: AnswerScoreDialogProps) {
  const [answer, setAnswer] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [scoreResult, setScoreResult] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Chat follow-up state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [followUpInput, setFollowUpInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // History state
  const { addEntry, updateChatMessages, getQuestionHistory, deleteEntry } = useHistoryApi();
  const [viewMode, setViewMode] = useState<"answer" | "history">("answer");
  const [currentHistoryId, setCurrentHistoryId] = useState<number | null>(null);
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<HistoryEntry | null>(null);

  const questionHistory = getQuestionHistory(questionId);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Fetch available models on mount
  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch("/api/models");
        if (response.ok) {
          const data: ModelsResponse = await response.json();
          setModels(data.models);
          setSelectedModel(data.defaultModel);
        } else {
          setError("Không thể tải danh sách model");
        }
      } catch (err) {
        console.error("Failed to fetch models:", err);
        setError("Không thể kết nối đến server");
      } finally {
        setIsLoadingModels(false);
      }
    }

    if (open) {
      fetchModels();
    }
  }, [open]);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setAnswer("");
      setScoreResult(null);
      setError(null);
      setChatOpen(false);
      setChatMessages([]);
      setFollowUpInput("");
      setViewMode("answer");
      setCurrentHistoryId(null);
      setSelectedHistoryEntry(null);
    }
  }, [open]);

  // Save chat messages to history when they change
  useEffect(() => {
    if (currentHistoryId && chatMessages.length > 0) {
      updateChatMessages(currentHistoryId, chatMessages);
    }
  }, [chatMessages, currentHistoryId, updateChatMessages]);

  // Handle sending follow-up question
  const handleSendFollowUp = async () => {
    if (!followUpInput.trim() || !scoreResult) return;

    const userMessage = followUpInput.trim();
    setFollowUpInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsSendingChat(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          userAnswer: answer,
          scoreResult,
          followUpQuestion: userMessage,
          chatHistory: chatMessages,
          model: selectedModel,
          technology,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại." },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Không thể kết nối đến server." },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError("Vui lòng nhập câu trả lời");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          answer: answer.trim(),
          model: selectedModel,
          technology,
        }),
      });

      if (response.ok) {
        const result: ScoreResponse = await response.json();
        setScoreResult(result);

        // Save to history (async)
        const historyId = await addEntry({
          questionId,
          questionText: question,
          techId,
          level,
          userAnswer: answer.trim(),
          score: result.score,
          feedback: result.feedback,
          strengths: result.strengths || [],
          improvements: result.improvements || [],
          sampleAnswer: result.sampleAnswer || "",
          chatMessages: [],
          model: selectedModel,
        });
        setCurrentHistoryId(historyId);
        onHistorySaved?.();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Có lỗi xảy ra khi chấm điểm");
      }
    } catch (err) {
      console.error("Score submission error:", err);
      setError("Không thể kết nối đến server");
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl max-w-[95vw] w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold items-center justify-center">
                {questionNumber}
              </span>
              <span className="text-lg">Trả lời câu hỏi</span>
            </div>
            {/* History Toggle */}
            {questionHistory.length > 0 && (
              <Button
                variant={viewMode === "history" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode(viewMode === "history" ? "answer" : "history");
                  setSelectedHistoryEntry(null);
                }}
                className="gap-2"
              >
                <History className="w-4 h-4" />
                Lịch sử ({questionHistory.length})
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Question Display */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <p className="text-slate-900 font-medium">{question}</p>
        </div>

        {/* History View Mode */}
        {viewMode === "history" ? (
          <div className="space-y-4">
            {selectedHistoryEntry ? (
              /* Show selected history entry details */
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedHistoryEntry(null)}
                  >
                    ← Quay lại
                  </Button>
                  <span className="text-sm text-slate-500">
                    {new Date(selectedHistoryEntry.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>

                {/* User's Answer */}
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Câu trả lời của bạn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedHistoryEntry.userAnswer}</p>
                  </CardContent>
                </Card>

                {/* Score Card */}
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span>Điểm số</span>
                      <Badge variant={getScoreBadgeVariant(selectedHistoryEntry.score)} className="text-lg px-3 py-1">
                        {selectedHistoryEntry.score}/100
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={selectedHistoryEntry.score} className="h-3 mb-4" />
                    <p className={`text-lg font-semibold ${getScoreColor(selectedHistoryEntry.score)}`}>
                      {selectedHistoryEntry.score >= 80
                        ? "Xuất sắc!"
                        : selectedHistoryEntry.score >= 60
                          ? "Khá tốt"
                          : selectedHistoryEntry.score >= 40
                            ? "Cần cải thiện"
                            : "Cần học thêm"}
                    </p>
                  </CardContent>
                </Card>

                {/* Feedback */}
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Nhận xét</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700">{selectedHistoryEntry.feedback}</p>
                  </CardContent>
                </Card>

                {/* Strengths */}
                {selectedHistoryEntry.strengths.length > 0 && (
                  <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        Điểm mạnh
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedHistoryEntry.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-green-800">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Improvements */}
                {selectedHistoryEntry.improvements.length > 0 && (
                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                        <Lightbulb className="w-5 h-5" />
                        Cần cải thiện
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedHistoryEntry.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2 text-orange-800">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Sample Answer */}
                {selectedHistoryEntry.sampleAnswer && (
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                        <Lightbulb className="w-5 h-5" />
                        Câu trả lời mẫu
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MarkdownContent content={selectedHistoryEntry.sampleAnswer} className="text-blue-800" />
                    </CardContent>
                  </Card>
                )}

                {/* Chat History */}
                {selectedHistoryEntry.chatMessages.length > 0 && (
                  <Card className="border-purple-200 bg-purple-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-purple-700">
                        <MessageCircle className="w-5 h-5" />
                        Lịch sử hỏi đáp
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedHistoryEntry.chatMessages.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                msg.role === "user"
                                  ? "bg-purple-600 text-white"
                                  : "bg-white text-slate-800 border border-purple-100"
                              }`}
                            >
                              {msg.role === "assistant" ? (
                                <MarkdownContent content={msg.content} />
                              ) : (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedHistoryEntry(null)}>
                    Quay lại danh sách
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              /* Show history list */
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  Bạn đã trả lời câu hỏi này {questionHistory.length} lần
                </p>
                {questionHistory.map((entry) => (
                  <Card
                    key={entry.id}
                    className="border-slate-200 cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => setSelectedHistoryEntry(entry)}
                  >
                    <CardContent className="py-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <Badge variant={getScoreBadgeVariant(entry.score)}>
                            {entry.score}/100
                          </Badge>
                          <span className="text-sm text-slate-500">
                            {new Date(entry.createdAt).toLocaleString("vi-VN")}
                          </span>
                          {entry.chatMessages.length > 0 && (
                            <span className="text-xs text-purple-600 flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {entry.chatMessages.length} tin nhắn
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                          {entry.userAnswer.slice(0, 100)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEntry(entry.id);
                          }}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <DialogFooter className="flex gap-2">
                  <Button variant="outline" onClick={() => setViewMode("answer")}>
                    Trả lời mới
                  </Button>
                  <Button onClick={() => onOpenChange(false)}>Đóng</Button>
                </DialogFooter>
              </div>
            )}
          </div>
        ) : !scoreResult ? (
          <>
            {/* Model Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Chọn AI Model để chấm điểm
              </label>
              {isLoadingModels ? (
                <div className="flex items-center gap-2 text-slate-500">
                  <Spinner className="w-4 h-4" />
                  <span>Đang tải danh sách model...</span>
                </div>
              ) : (
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex items-center gap-2">
                          <span>{model.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {model.provider}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Answer Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Câu trả lời của bạn
              </label>
              <Textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Nhập câu trả lời của bạn ở đây..."
                rows={10}
                className="resize-none"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !answer.trim() || isLoadingModels}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    Đang chấm điểm...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Gửi để chấm điểm
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        ) : (
          /* Score Result Display */
          <div className="space-y-4">
            {/* Score Card */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Kết quả chấm điểm</span>
                  <Badge variant={getScoreBadgeVariant(scoreResult.score)} className="text-lg px-3 py-1">
                    {scoreResult.score}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={scoreResult.score} className="h-3 mb-4" />
                <p className={`text-lg font-semibold ${getScoreColor(scoreResult.score)}`}>
                  {scoreResult.score >= 80
                    ? "Xuất sắc!"
                    : scoreResult.score >= 60
                      ? "Khá tốt"
                      : scoreResult.score >= 40
                        ? "Cần cải thiện"
                        : "Cần học thêm"}
                </p>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card className="border-slate-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Nhận xét</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">{scoreResult.feedback}</p>
              </CardContent>
            </Card>

            {/* Strengths */}
            {scoreResult.strengths && scoreResult.strengths.length > 0 && (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Điểm mạnh
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scoreResult.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-green-800">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Improvements */}
            {scoreResult.improvements && scoreResult.improvements.length > 0 && (
              <Card className="border-orange-200 bg-orange-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                    <Lightbulb className="w-5 h-5" />
                    Cần cải thiện
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {scoreResult.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start gap-2 text-orange-800">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Sample Answer */}
            {scoreResult.sampleAnswer && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                    <Lightbulb className="w-5 h-5" />
                    Câu trả lời mẫu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MarkdownContent content={scoreResult.sampleAnswer} className="text-blue-800" />
                </CardContent>
              </Card>
            )}

            {/* Follow-up Chat Section */}
            <Collapsible open={chatOpen} onOpenChange={setChatOpen}>
              <Card className="border-purple-200 bg-purple-50/50">
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-2 cursor-pointer hover:bg-purple-100/50 transition-colors rounded-t-xl">
                    <CardTitle className="text-base flex items-center justify-between text-purple-700">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Hỏi thêm AI để hiểu rõ hơn
                      </div>
                      {chatOpen ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    {/* Chat Messages */}
                    {chatMessages.length > 0 && (
                      <div className="max-h-60 overflow-y-auto mb-3 space-y-3 p-3 bg-white rounded-lg border border-purple-100">
                        {chatMessages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                                msg.role === "user"
                                  ? "bg-purple-600 text-white"
                                  : "bg-slate-100 text-slate-800"
                              }`}
                            >
                              {msg.role === "assistant" ? (
                                <MarkdownContent content={msg.content} />
                              ) : (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                    )}

                    {/* Input Area */}
                    <div className="flex gap-2">
                      <Input
                        value={followUpInput}
                        onChange={(e) => setFollowUpInput(e.target.value)}
                        placeholder="Ví dụ: Giải thích rõ hơn về phần X..."
                        className="flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendFollowUp();
                          }
                        }}
                        disabled={isSendingChat}
                      />
                      <Button
                        size="icon"
                        onClick={handleSendFollowUp}
                        disabled={!followUpInput.trim() || isSendingChat}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {isSendingChat ? (
                          <Spinner className="w-4 h-4" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Try Again Button */}
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setScoreResult(null)}>
                Thử lại
              </Button>
              <Button onClick={() => onOpenChange(false)}>Đóng</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
