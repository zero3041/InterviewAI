import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  Send,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Trophy,
  Clock,
  RotateCcw,
} from "lucide-react";
import { getLevelData, getAllQuestions, type Question } from "@/lib/questionsData";
import technologiesData from "@/data/technologies.json";

interface AIModel {
  id: string;
  name: string;
  provider: string;
}

interface QuestionScore {
  questionIndex: number;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface BatchScoreResponse {
  totalScore: number;
  averageScore: number;
  results: QuestionScore[];
  overallFeedback: string;
}

export default function TestPage() {
  const { techId, level } = useParams<{ techId: string; level: string }>();
  const currentTech = technologiesData.technologies.find(t => t.id === techId);
  const technologyName = currentTech?.name || "Lập trình";
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<BatchScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [startTime] = useState(Date.now());
  const [viewingResult, setViewingResult] = useState<number | null>(null);

  const isValidLevel = level === "junior" || level === "middle";
  const currentTechId = techId || "java-springboot";

  // Get all questions for the level
  const allQuestions = useMemo(() => {
    if (!isValidLevel) return [];
    const data = getLevelData(currentTechId, level as "junior" | "middle");
    if (!data) return [];
    return getAllQuestions(data);
  }, [level, isValidLevel, currentTechId]);

  // Pick 20 random questions on mount
  useEffect(() => {
    if (allQuestions.length > 0 && testQuestions.length === 0) {
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      setTestQuestions(shuffled.slice(0, Math.min(20, shuffled.length)));
    }
  }, [allQuestions, testQuestions.length]);

  // Fetch models
  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch("/api/models");
        if (response.ok) {
          const data = await response.json();
          setModels(data.models);
          setSelectedModel(data.defaultModel);
        }
      } catch (err) {
        console.error("Failed to fetch models:", err);
      } finally {
        setIsLoadingModels(false);
      }
    }
    fetchModels();
  }, []);

  if (!isValidLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <p className="text-slate-600 mb-4">Invalid level</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).filter((k) => answers[parseInt(k)]?.trim()).length;
  const progress = (answeredCount / testQuestions.length) * 100;

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const handleSubmit = async () => {
    if (answeredCount < testQuestions.length) {
      setError(`Vui lòng trả lời tất cả ${testQuestions.length} câu hỏi trước khi nộp bài.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/score-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: testQuestions.map((q, i) => ({
            question: q.text,
            answer: answers[i] || "",
          })),
          model: selectedModel,
          technology: technologyName,
        }),
      });

      if (response.ok) {
        const result: BatchScoreResponse = await response.json();
        setResults(result);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Có lỗi xảy ra khi chấm bài");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setError("Không thể kết nối đến server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetTest = () => {
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
    setTestQuestions(shuffled.slice(0, Math.min(20, shuffled.length)));
    setAnswers({});
    setResults(null);
    setCurrentQuestion(0);
    setViewingResult(null);
    setError(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    if (score >= 40) return "bg-orange-100";
    return "bg-red-100";
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Results View
  if (results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href={`/tech/${techId}`}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Quay lại
                  </Button>
                </Link>
                <h1 className="text-xl font-bold text-slate-900">Kết quả bài test</h1>
              </div>
              <Button onClick={resetTest} className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Làm lại
              </Button>
            </div>
          </div>
        </header>

        <div className="container max-w-6xl mx-auto px-4 py-8">
          {/* Summary Card */}
          <Card className="border-slate-200 mb-8">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <Trophy className={`w-12 h-12 mx-auto mb-2 ${getScoreColor(results.averageScore)}`} />
                  <div className={`text-4xl font-bold ${getScoreColor(results.averageScore)}`}>
                    {Math.round(results.averageScore)}/100
                  </div>
                  <p className="text-slate-600">Điểm trung bình</p>
                </div>
                <div>
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-blue-600" />
                  <div className="text-4xl font-bold text-blue-600">
                    {results.results.filter((r) => r.score >= 60).length}/{testQuestions.length}
                  </div>
                  <p className="text-slate-600">Câu đạt (≥60 điểm)</p>
                </div>
                <div>
                  <Clock className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                  <div className="text-4xl font-bold text-purple-600">
                    {formatTime(Date.now() - startTime)}
                  </div>
                  <p className="text-slate-600">Thời gian làm bài</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Overall Feedback */}
          {results.overallFeedback && (
            <Card className="border-blue-200 bg-blue-50/50 mb-8">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                  <Lightbulb className="w-5 h-5" />
                  Nhận xét tổng quan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-800 whitespace-pre-wrap">{results.overallFeedback}</p>
              </CardContent>
            </Card>
          )}

          {/* Questions Grid */}
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Chi tiết từng câu</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3 mb-8">
            {results.results.map((result, index) => (
              <button
                key={index}
                onClick={() => setViewingResult(index)}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  viewingResult === index
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-transparent"
                } ${getScoreBgColor(result.score)}`}
              >
                <div className="text-sm font-medium text-slate-600">Câu {index + 1}</div>
                <div className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                  {result.score}
                </div>
              </button>
            ))}
          </div>

          {/* Selected Question Detail */}
          {viewingResult !== null && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Câu {viewingResult + 1}</span>
                  <Badge
                    variant={results.results[viewingResult].score >= 60 ? "default" : "destructive"}
                    className="text-lg px-3 py-1"
                  >
                    {results.results[viewingResult].score}/100
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Question */}
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="font-medium text-slate-900">{testQuestions[viewingResult].text}</p>
                </div>

                {/* Your Answer */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Câu trả lời của bạn:</h4>
                  <div className="bg-white border rounded-lg p-4">
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {answers[viewingResult] || "(Không có câu trả lời)"}
                    </p>
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <h4 className="font-medium text-slate-700 mb-2">Nhận xét:</h4>
                  <p className="text-slate-700">{results.results[viewingResult].feedback}</p>
                </div>

                {/* Strengths */}
                {results.results[viewingResult].strengths?.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-green-700 flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4" />
                      Điểm mạnh
                    </h4>
                    <ul className="space-y-1">
                      {results.results[viewingResult].strengths.map((s, i) => (
                        <li key={i} className="text-green-800 text-sm">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {results.results[viewingResult].improvements?.length > 0 && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h4 className="font-medium text-orange-700 flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      Cần cải thiện
                    </h4>
                    <ul className="space-y-1">
                      {results.results[viewingResult].improvements.map((s, i) => (
                        <li key={i} className="text-orange-800 text-sm">• {s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // Test Taking View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href={`/tech/${techId}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ChevronLeft className="w-4 h-4" />
                  Quay lại
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Bài Test - {level === "junior" ? "Junior" : "Middle"}</h1>
                <p className="text-sm text-slate-600">{testQuestions.length} câu hỏi ngẫu nhiên</p>
              </div>
            </div>

            {/* Model Selection */}
            <div className="flex items-center gap-3">
              {isLoadingModels ? (
                <Spinner className="w-4 h-4" />
              ) : (
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Chọn model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>Tiến độ: {answeredCount}/{testQuestions.length} câu</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          {testQuestions.map((_, index) => {
            const hasAnswer = !!answers[index]?.trim();
            return (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                  currentQuestion === index
                    ? "bg-blue-600 text-white"
                    : hasAnswer
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        {/* Current Question */}
        {testQuestions[currentQuestion] && (
          <Card className="border-slate-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="inline-flex w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold items-center justify-center">
                  {currentQuestion + 1}
                </span>
                <span className="text-base font-normal text-slate-600">
                  Câu {currentQuestion + 1}/{testQuestions.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-slate-900 font-medium">{testQuestions[currentQuestion].text}</p>
              </div>

              <Textarea
                value={answers[currentQuestion] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion, e.target.value)}
                placeholder="Nhập câu trả lời của bạn..."
                rows={8}
                className="resize-none"
              />

              <div className="flex justify-between mt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                >
                  ← Câu trước
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion((prev) => Math.min(testQuestions.length - 1, prev + 1))}
                  disabled={currentQuestion === testQuestions.length - 1}
                >
                  Câu sau →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCount < testQuestions.length}
            className="gap-2 px-8"
          >
            {isSubmitting ? (
              <>
                <Spinner className="w-5 h-5" />
                Đang chấm bài...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Nộp bài ({answeredCount}/{testQuestions.length})
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
