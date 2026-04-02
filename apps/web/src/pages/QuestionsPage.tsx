import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft, Search, Bookmark, BookmarkCheck, MessageCircle, History } from "lucide-react";
import { AnswerScoreDialog } from "@/components/AnswerScoreDialog";
import { useQuestions, useTechnologies, type Question } from "@/hooks/useQuestionsApi";
import { useHistoryApi } from "@/hooks/useHistoryApi";
import { useBookmarksApi } from "@/hooks/useBookmarksApi";

export default function QuestionsPage() {
  const { level, techId } = useParams<{ level: string; techId?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<{ text: string; number: number; id: number } | null>(null);
  const [, forceUpdate] = useState(0);

  // API hooks
  const currentTechId = techId || "java-springboot";
  const { technologies } = useTechnologies();
  const { categories, questions, totalQuestions, levelLabel, isLoading, error } = useQuestions(
    currentTechId,
    level || null
  );
  const { hasHistory } = useHistoryApi();
  const { isBookmarked, toggleBookmark } = useBookmarksApi();

  // Get technology name
  const currentTech = technologies.find((t) => t.id === currentTechId);
  const technologyName = currentTech?.name || "Lập trình";

  // Determine back link based on techId
  const backLink = techId ? `/tech/${techId}` : "/";

  // Initialize selected category when data loads
  useEffect(() => {
    if (selectedCategory === null && Object.keys(categories).length > 0) {
      setSelectedCategory(Object.keys(categories)[0]);
    }
  }, [categories, selectedCategory]);

  // Filter questions based on search query (must be before early returns)
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;

    const result: Record<string, Record<string, Question[]>> = {};

    Object.entries(categories).forEach(([categoryName, subcategories]) => {
      const filteredSubcategories: Record<string, Question[]> = {};

      Object.entries(subcategories).forEach(([subcategoryName, questions]) => {
        const filtered = questions.filter((q) =>
          q.text.toLowerCase().includes(searchQuery.toLowerCase())
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

  const displayedCategory = selectedCategory && filteredCategories[selectedCategory];

  // Open answer dialog for a question
  const openAnswerDialog = (question: Question) => {
    setSelectedQuestion({ text: question.text, number: question.questionNumber, id: question.id });
    setAnswerDialogOpen(true);
  };

  // Handle bookmark toggle
  const handleToggleBookmark = async (questionId: number) => {
    await toggleBookmark(questionId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (error || !level || (level !== "junior" && level !== "middle")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <p className="text-slate-600 mb-4">{error || "Invalid level or technology selected"}</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href={backLink}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Quay lại
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 flex-1">{levelLabel}</h1>
            <div className="text-sm text-slate-600">{totalQuestions} câu hỏi</div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card className="border-slate-200 sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.keys(filteredCategories).map((categoryName) => (
                    <button
                      key={categoryName}
                      onClick={() => setSelectedCategory(categoryName)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === categoryName
                          ? "bg-blue-100 text-blue-900 font-medium"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {categoryName}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Questions */}
          <div className="lg:col-span-3">
            {displayedCategory ? (
              <div className="space-y-6">
                {Object.entries(displayedCategory).map(([subcategoryName, questions]) => (
                  <Card key={subcategoryName} className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-600">{subcategoryName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {questions.map((question) => {
                          const questionBookmarked = isBookmarked(question.id);
                          const questionHasHistory = hasHistory(question.id);

                          return (
                            <div
                              key={question.id}
                              className="pb-4 border-b border-slate-200 last:border-b-0 last:pb-0"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
                                      {question.questionNumber}
                                    </span>
                                    <p className="text-slate-900 font-medium">{question.text}</p>
                                    {questionHasHistory && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                                        <History className="w-3 h-3" />
                                        Đã làm
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-1">
                                  <button
                                    onClick={() => openAnswerDialog(question)}
                                    className="p-2 hover:bg-blue-100 rounded-md transition-colors"
                                    title="Trả lời câu hỏi"
                                  >
                                    <MessageCircle className="w-5 h-5 text-blue-500" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleBookmark(question.id)}
                                    className="p-2 hover:bg-slate-100 rounded-md transition-colors"
                                    title={questionBookmarked ? "Remove bookmark" : "Add bookmark"}
                                  >
                                    {questionBookmarked ? (
                                      <BookmarkCheck className="w-5 h-5 text-blue-600" />
                                    ) : (
                                      <Bookmark className="w-5 h-5 text-slate-400" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-slate-200">
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-slate-600 mb-4">No questions found</p>
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="border-slate-200"
                  >
                    Clear Search
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Answer Score Dialog */}
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
          onHistorySaved={() => forceUpdate((n) => n + 1)}
        />
      )}
    </div>
  );
}
