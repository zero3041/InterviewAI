import { AnswerScoreDialog } from "@/components/AnswerScoreDialog";
import { AppShell, InlineStatus, MetricTile, Surface } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useBookmarksApi } from "@/hooks/useBookmarksApi";
import { useHistoryApi } from "@/hooks/useHistoryApi";
import { useQuestions, useTechnologies, type Question } from "@/hooks/useQuestionsApi";
import {
  BookMarked,
  Bookmark,
  BookmarkCheck,
  History,
  MessageCircle,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";

export default function QuestionsPage() {
  const { level, techId } = useParams<{ level: string; techId?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<{
    text: string;
    number: number;
    id: number;
  } | null>(null);

  const currentTechId = techId || "java-springboot";
  const { technologies } = useTechnologies();
  const { categories, totalQuestions, levelLabel, isLoading, error } = useQuestions(
    currentTechId,
    level || null
  );
  const { hasHistory, refetch: refetchHistory } = useHistoryApi();
  const { isBookmarked, toggleBookmark } = useBookmarksApi();

  const currentTech = technologies.find((item) => item.id === currentTechId);
  const technologyName = currentTech?.name || "Lập trình";

  useEffect(() => {
    if (selectedCategory === null && Object.keys(categories).length > 0) {
      setSelectedCategory(Object.keys(categories)[0]);
    }
  }, [categories, selectedCategory]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery) {
      return categories;
    }

    const result: Record<string, Record<string, Question[]>> = {};

    Object.entries(categories).forEach(([categoryName, subcategories]) => {
      const filteredSubcategories: Record<string, Question[]> = {};

      Object.entries(subcategories).forEach(([subcategoryName, questions]) => {
        const filtered = questions.filter((question) =>
          question.text.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filtered.length > 0) {
          filteredSubcategories[subcategoryName] = filtered;
        }
      });

      if (Object.keys(filteredSubcategories).length > 0) {
        result[categoryName] = filteredSubcategories;
      }
    });

    return result;
  }, [searchQuery, categories]);

  useEffect(() => {
    if (selectedCategory && !filteredCategories[selectedCategory]) {
      setSelectedCategory(Object.keys(filteredCategories)[0] ?? null);
    }
  }, [filteredCategories, selectedCategory]);

  const displayedCategory = selectedCategory ? filteredCategories[selectedCategory] : null;
  const filteredQuestionCount = useMemo(
    () =>
      Object.values(filteredCategories).reduce(
        (sum, subcategories) =>
          sum +
          Object.values(subcategories).reduce((innerSum, group) => innerSum + group.length, 0),
        0
      ),
    [filteredCategories]
  );
  const categoryCount = Object.keys(filteredCategories).length;
  const backLink = techId ? `/tech/${techId}` : "/";

  const openAnswerDialog = (question: Question) => {
    setSelectedQuestion({ text: question.text, number: question.questionNumber, id: question.id });
    setAnswerDialogOpen(true);
  };

  const handleToggleBookmark = async (questionId: number) => {
    await toggleBookmark(questionId);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error || !level || (level !== "junior" && level !== "middle")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="surface-card w-full max-w-xl p-8 text-center">
          <p className="mb-4 font-display text-3xl font-semibold tracking-[-0.05em] text-foreground">
            Invalid level or technology selected
          </p>
          <p className="mb-6 text-sm leading-6 text-muted-foreground">
            {error || "Route này không trỏ tới level hợp lệ."}
          </p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      eyebrow="Question library"
      title={`${technologyName} ${levelLabel.toLowerCase()} library.`}
      description="Screen này gom hai ý trong Stitch: khám phá câu hỏi và thư viện câu hỏi ôn tập. Search, category rail, bookmark và answer dialog đều đã chuyển lên cùng language dark editorial."
      actions={
        <>
          <Link href={backLink}>
            <Button variant="outline">Back to stack</Button>
          </Link>
          <Link href={`/tech/${currentTechId}/test/${level}`}>
            <Button>
              <Sparkles className="size-4" />
              Timed test
            </Button>
          </Link>
        </>
      }
      heroMeta={
        <>
          <div className="surface-inset flex items-center gap-3 px-4 py-3 lg:col-span-2">
            <Search className="size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm câu hỏi, khái niệm, hoặc chủ đề..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <MetricTile
            label="Filtered bank"
            value={filteredQuestionCount}
            caption={`${categoryCount} categories đang hiển thị sau khi lọc.`}
            icon={BookMarked}
            tone="primary"
          />
        </>
      }
      aside={
        <>
          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">Category rail</p>
              <div className="space-y-2">
                {Object.entries(filteredCategories).map(([categoryName, subcategories]) => {
                  const questionCount = Object.values(subcategories).reduce(
                    (sum, items) => sum + items.length,
                    0
                  );

                  return (
                    <button
                      key={categoryName}
                      onClick={() => setSelectedCategory(categoryName)}
                      className="surface-inset flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                    >
                      <span
                        className={
                          selectedCategory === categoryName
                            ? "font-semibold text-foreground"
                            : "text-sm text-muted-foreground"
                        }
                      >
                        {categoryName}
                      </span>
                      <Badge variant={selectedCategory === categoryName ? "default" : "outline"}>
                        {questionCount}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          </Surface>

          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">Library signal</p>
              <InlineStatus label="Questions in level" value={`${totalQuestions}`} tone="neutral" />
              <InlineStatus
                label="Search state"
                value={searchQuery ? "Filtered" : "Full bank"}
                tone="warm"
              />
              <InlineStatus label="Bookmark bridge" value="Live" tone="success" />
            </div>
          </Surface>
        </>
      }
    >
      {displayedCategory ? (
        <div className="space-y-6">
          {Object.entries(displayedCategory).map(([subcategoryName, subcategoryQuestions]) => (
            <Surface key={subcategoryName}>
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="editorial-kicker">Subcategory</p>
                    <h2 className="text-2xl font-semibold text-foreground">{subcategoryName}</h2>
                  </div>
                  <Badge variant="outline">{subcategoryQuestions.length} prompts</Badge>
                </div>

                <div className="space-y-3">
                  {subcategoryQuestions.map((question) => {
                    const questionBookmarked = isBookmarked(question.id);
                    const questionHasHistory = hasHistory(question.id);

                    return (
                      <div
                        key={question.id}
                        className="surface-inset flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="question-index">{question.questionNumber}</span>
                            {questionHasHistory ? (
                              <Badge variant="secondary">
                                <History className="size-3" />
                                Reviewed
                              </Badge>
                            ) : null}
                            {questionBookmarked ? (
                              <Badge>
                                <BookmarkCheck className="size-3" />
                                Saved
                              </Badge>
                            ) : null}
                          </div>
                          <p className="text-sm leading-7 text-foreground">{question.text}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openAnswerDialog(question)}>
                            <MessageCircle className="size-4" />
                            Trả lời
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggleBookmark(question.id)}
                            title={questionBookmarked ? "Remove bookmark" : "Add bookmark"}
                          >
                            {questionBookmarked ? (
                              <BookmarkCheck className="size-4 text-[var(--primary)]" />
                            ) : (
                              <Bookmark className="size-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Surface>
          ))}
        </div>
      ) : (
        <Surface>
          <div className="surface-inset space-y-4 p-8 text-center">
            <p className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
              No questions matched this filter
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Xoá search hoặc chọn category khác để mở lại library.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          </div>
        </Surface>
      )}

      {selectedQuestion && (
        <AnswerScoreDialog
          open={answerDialogOpen}
          onOpenChange={setAnswerDialogOpen}
          question={selectedQuestion.text}
          questionNumber={selectedQuestion.number}
          questionId={selectedQuestion.id}
          technology={technologyName}
          techId={currentTechId}
          level={level || "junior"}
          onHistorySaved={() => {
            refetchHistory();
          }}
        />
      )}
    </AppShell>
  );
}
