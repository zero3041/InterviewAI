import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { CheckCircle, AlertCircle, Lightbulb, Send } from "lucide-react";
import type { ScoreResponse } from "@shared/ai-models";

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
  technology?: string;
}

export function AnswerScoreDialog({
  open,
  onOpenChange,
  question,
  questionNumber,
  technology = "lập trình",
}: AnswerScoreDialogProps) {
  const [answer, setAnswer] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [scoreResult, setScoreResult] = useState<ScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    }
  }, [open]);

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
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold items-center justify-center">
              {questionNumber}
            </span>
            <span className="text-lg">Trả lời câu hỏi</span>
          </DialogTitle>
        </DialogHeader>

        {/* Question Display */}
        <div className="bg-slate-50 rounded-lg p-4 mb-4">
          <p className="text-slate-900 font-medium">{question}</p>
        </div>

        {!scoreResult ? (
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
                  <p className="text-blue-800 whitespace-pre-wrap">{scoreResult.sampleAnswer}</p>
                </CardContent>
              </Card>
            )}

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
