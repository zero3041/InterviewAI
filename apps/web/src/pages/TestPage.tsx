import { AppShell, InlineStatus, MetricTile, Surface } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useQuestions, useTechnologies, type Question } from "@/hooks/useQuestionsApi";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Clock3,
  Loader2,
  RotateCcw,
  Send,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";

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

function getScoreBadgeVariant(score: number): "default" | "secondary" | "destructive" {
  if (score >= 80) {
    return "default";
  }

  if (score >= 60) {
    return "secondary";
  }

  return "destructive";
}

function getScoreTextClass(score: number) {
  if (score >= 80) {
    return "text-emerald-300";
  }

  if (score >= 60) {
    return "text-[var(--tertiary)]";
  }

  return "text-rose-200";
}

function getScoreSurfaceClass(score: number) {
  if (score >= 80) {
    return "bg-[linear-gradient(180deg,rgba(45,212,191,0.2),rgba(8,13,28,0.96))]";
  }

  if (score >= 60) {
    return "bg-[linear-gradient(180deg,rgba(255,182,149,0.18),rgba(8,13,28,0.96))]";
  }

  return "bg-[linear-gradient(180deg,rgba(251,113,133,0.18),rgba(8,13,28,0.96))]";
}

function formatTime(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function TestPage() {
  const { techId, level } = useParams<{ techId: string; level: string }>();
  const { technologies } = useTechnologies();
  const currentTech = technologies.find((item) => item.id === techId);
  const technologyName = currentTech?.name || "Lập trình";
  const currentTechId = techId || "java-springboot";
  const isValidLevel = level === "junior" || level === "middle";

  const { questions: allQuestions, isLoading: isLoadingQuestions } = useQuestions(
    currentTechId,
    isValidLevel ? level : null
  );

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

  useEffect(() => {
    if (allQuestions.length > 0 && testQuestions.length === 0) {
      const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
      setTestQuestions(shuffled.slice(0, Math.min(20, shuffled.length)));
    }
  }, [allQuestions, testQuestions.length]);

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await apiFetch("/models");
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setModels(data.models ?? []);
        setSelectedModel(data.defaultModel ?? "");
      } catch (fetchError) {
        console.error("Failed to fetch models:", fetchError);
      } finally {
        setIsLoadingModels(false);
      }
    }

    fetchModels();
  }, []);

  useEffect(() => {
    if (results && viewingResult === null && results.results.length > 0) {
      setViewingResult(0);
    }
  }, [results, viewingResult]);

  if (isLoadingQuestions) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-[var(--primary)]" />
          <p className="text-muted-foreground">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  if (!isValidLevel) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="surface-card w-full max-w-xl p-8 text-center">
          <p className="mb-4 font-display text-3xl font-semibold tracking-[-0.05em] text-foreground">
            Invalid level
          </p>
          <p className="mb-6 text-sm leading-6 text-muted-foreground">
            Route test này chỉ hỗ trợ `junior` và `middle`.
          </p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).filter((key) => answers[Number(key)]?.trim()).length;
  const progress = testQuestions.length > 0 ? (answeredCount / testQuestions.length) * 100 : 0;
  const elapsedTime = formatTime(Date.now() - startTime);
  const activeResultIndex = viewingResult ?? 0;
  const activeResult = results?.results[activeResultIndex] ?? null;

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
      const response = await apiFetch("/score-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: testQuestions.map((question, index) => ({
            question: question.text,
            answer: answers[index] || "",
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
    } catch (submitError) {
      console.error("Submit error:", submitError);
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

  if (results && activeResult) {
    return (
      <AppShell
        eyebrow="Batch score"
        title={`${technologyName} ${level === "junior" ? "foundation" : "systems"} test results.`}
        description="Màn hình này gộp thiết lập bài test, luyện tập và kết quả AI scoring vào một flow liên tục. Layout tối ưu cho so điểm từng câu thay vì chỉ show trung bình tổng."
        actions={
          <>
            <Link href={`/tech/${techId}`}>
              <Button variant="outline">Back to stack</Button>
            </Link>
            <Button onClick={resetTest}>
              <RotateCcw className="size-4" />
              Retake
            </Button>
          </>
        }
        heroMeta={
          <>
            <MetricTile
              label="Average score"
              value={`${Math.round(results.averageScore)}/100`}
              caption="Điểm trung bình của cả batch câu trả lời."
              icon={Trophy}
              tone="primary"
            />
            <MetricTile
              label="Pass rate"
              value={`${results.results.filter((result) => result.score >= 60).length}/${testQuestions.length}`}
              caption="Số câu đạt ngưỡng 60 điểm trở lên."
              icon={CheckCircle}
              tone="success"
            />
            <MetricTile
              label="Elapsed time"
              value={elapsedTime}
              caption="Thời gian từ lúc bắt đầu đến khi nhận batch critique."
              icon={Clock3}
              tone="warm"
            />
          </>
        }
        aside={
          <>
            <Surface>
              <div className="space-y-4">
                <p className="editorial-kicker">Question heatmap</p>
                <div className="grid grid-cols-5 gap-2">
                  {results.results.map((result, index) => (
                    <button
                      key={`${result.questionIndex}-${index}`}
                      onClick={() => setViewingResult(index)}
                      className={cn(
                        "surface-inset px-2 py-3 text-center transition-transform hover:-translate-y-0.5",
                        getScoreSurfaceClass(result.score),
                        activeResultIndex === index && "ring-2 ring-[rgba(195,192,255,0.36)]"
                      )}
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {index + 1}
                      </p>
                      <p className={cn("font-display text-xl font-semibold", getScoreTextClass(result.score))}>
                        {result.score}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </Surface>

            <Surface>
              <div className="space-y-4">
                <p className="editorial-kicker">Batch signal</p>
                <InlineStatus label="Model" value={selectedModel || "Unknown"} tone="neutral" />
                <InlineStatus label="Question count" value={`${testQuestions.length}`} tone="primary" />
                <InlineStatus
                  label="Overall status"
                  value={results.averageScore >= 60 ? "Passable" : "Needs revision"}
                  tone={results.averageScore >= 60 ? "success" : "warm"}
                />
              </div>
            </Surface>
          </>
        }
      >
        {results.overallFeedback ? (
          <Surface>
            <div className="space-y-4">
              <div>
                <p className="editorial-kicker">Overall critique</p>
                <h2 className="text-2xl font-semibold text-foreground">Batch-level readout</h2>
              </div>
              <div className="surface-inset p-5">
                <p className="text-sm leading-7 text-muted-foreground">{results.overallFeedback}</p>
              </div>
            </div>
          </Surface>
        ) : null}

        <Surface>
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="editorial-kicker">Focused review</p>
                <h2 className="text-2xl font-semibold text-foreground">
                  Question {activeResultIndex + 1}
                </h2>
              </div>
              <Badge variant={getScoreBadgeVariant(activeResult.score)}>{activeResult.score}/100</Badge>
            </div>

            <div className="surface-inset space-y-3 p-5">
              <p className="editorial-kicker">Prompt</p>
              <p className="text-sm leading-7 text-foreground">{testQuestions[activeResultIndex]?.text}</p>
            </div>

            <div className="surface-inset space-y-3 p-5">
              <p className="editorial-kicker">Your answer</p>
              <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                {answers[activeResultIndex] || "(Không có câu trả lời)"}
              </p>
            </div>

            <div className="surface-inset space-y-3 p-5">
              <p className="editorial-kicker">AI critique</p>
              <p className="text-sm leading-7 text-muted-foreground">{activeResult.feedback}</p>
            </div>

            {activeResult.strengths?.length > 0 ? (
              <div className="surface-inset bg-[linear-gradient(180deg,rgba(45,212,191,0.18),rgba(8,13,28,0.96))] p-5">
                <p className="editorial-kicker">Strengths</p>
                <ul className="mt-3 space-y-2">
                  {activeResult.strengths.map((strength) => (
                    <li key={strength} className="text-sm leading-6 text-emerald-100">
                      • {strength}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {activeResult.improvements?.length > 0 ? (
              <div className="surface-inset bg-[linear-gradient(180deg,rgba(255,182,149,0.18),rgba(8,13,28,0.96))] p-5">
                <p className="editorial-kicker">Needs work</p>
                <ul className="mt-3 space-y-2">
                  {activeResult.improvements.map((improvement) => (
                    <li key={improvement} className="text-sm leading-6 text-amber-50">
                      • {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Surface>
      </AppShell>
    );
  }

  return (
    <AppShell
      eyebrow="Timed test"
      title={`${technologyName} ${level === "junior" ? "foundation" : "systems"} drill.`}
      description="Thiết lập bài test và practice view được hợp nhất thành một route. Chọn model, trả lời đủ batch câu hỏi, rồi để AI chấm điểm toàn bộ trong một lần."
      actions={
        <>
          <Link href={`/tech/${techId}`}>
            <Button variant="outline">Back to stack</Button>
          </Link>
          <Button variant="outline" onClick={resetTest}>
            <RotateCcw className="size-4" />
            Reshuffle
          </Button>
        </>
      }
      heroMeta={
        <>
          <MetricTile
            label="Answered"
            value={`${answeredCount}/${testQuestions.length || 0}`}
            caption="Số câu đã có nội dung trả lời."
            icon={CheckCircle}
            tone="primary"
          />
          <MetricTile
            label="Progress"
            value={`${Math.round(progress)}%`}
            caption="Tiến độ hoàn thành batch hiện tại."
            icon={Sparkles}
            tone="success"
          />
          <MetricTile
            label="Elapsed"
            value={elapsedTime}
            caption="Thời gian làm bài đang trôi từ lúc route được mở."
            icon={Clock3}
            tone="warm"
          />
        </>
      }
      aside={
        <>
          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">Scoring engine</p>
              {isLoadingModels ? (
                <div className="surface-inset flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground">
                  <Spinner className="size-4" />
                  Loading models...
                </div>
              ) : (
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} · {model.provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <InlineStatus label="Question count" value={`${testQuestions.length}`} tone="neutral" />
              <InlineStatus
                label="Submit readiness"
                value={answeredCount === testQuestions.length && testQuestions.length > 0 ? "Ready" : "Incomplete"}
                tone={answeredCount === testQuestions.length && testQuestions.length > 0 ? "success" : "warm"}
              />
            </div>
          </Surface>

          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">Batch submit</p>
              {error ? (
                <div className="surface-inset flex items-start gap-3 px-4 py-3 text-sm text-rose-200">
                  <AlertCircle className="mt-0.5 size-4" />
                  <span>{error}</span>
                </div>
              ) : null}
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={isSubmitting || answeredCount < testQuestions.length || testQuestions.length === 0}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="size-4" />
                    Đang chấm bài...
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    Nộp bài ({answeredCount}/{testQuestions.length})
                  </>
                )}
              </Button>
            </div>
          </Surface>
        </>
      }
    >
      <Surface>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="editorial-kicker">Navigator</p>
              <h2 className="text-2xl font-semibold text-foreground">Question grid</h2>
            </div>
            <Badge variant="outline">{testQuestions.length} prompts</Badge>
          </div>

          <div className="grid grid-cols-5 gap-2 md:grid-cols-10">
            {testQuestions.map((question, index) => {
              const hasAnswer = !!answers[index]?.trim();

              return (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestion(index)}
                  className={cn(
                    "surface-inset px-2 py-3 text-center transition-transform hover:-translate-y-0.5",
                    currentQuestion === index && "ring-2 ring-[rgba(195,192,255,0.36)]",
                    hasAnswer &&
                      currentQuestion !== index &&
                      "bg-[linear-gradient(180deg,rgba(45,212,191,0.18),rgba(8,13,28,0.96))]"
                  )}
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {index + 1}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {hasAnswer ? "Done" : "Open"}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </Surface>

      {testQuestions[currentQuestion] ? (
        <Surface>
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="question-index">{currentQuestion + 1}</span>
                  <Badge variant="outline">
                    Câu {currentQuestion + 1}/{testQuestions.length}
                  </Badge>
                </div>
                <p className="text-sm leading-7 text-foreground">{testQuestions[currentQuestion].text}</p>
              </div>
            </div>

            <Textarea
              value={answers[currentQuestion] || ""}
              onChange={(event) => handleAnswerChange(currentQuestion, event.target.value)}
              placeholder="Nhập câu trả lời của bạn..."
              rows={10}
              className="resize-none"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Batch completion</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>

            <div className="flex flex-wrap justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentQuestion((prev) => Math.min(testQuestions.length - 1, prev + 1))
                }
                disabled={currentQuestion === testQuestions.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        </Surface>
      ) : null}
    </AppShell>
  );
}
