import { useState, useMemo, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, Bookmark, BookmarkCheck, MessageCircle } from "lucide-react";
import { AnswerScoreDialog } from "@/components/AnswerScoreDialog";
import { getLevelData, normalizeToCategories, countQuestions, type Question } from "@/lib/questionsData";

export default function QuestionsPage() {
  const { level, techId } = useParams<{ level: string; techId?: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<{ text: string; number: number } | null>(null);

  // Determine back link based on techId
  const backLink = techId ? `/tech/${techId}` : "/";

  // Get data for the current tech and level
  const currentTechId = techId || "java-springboot";
  const levelData = (level === "junior" || level === "middle") ? getLevelData(currentTechId, level) : null;

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bookmarkedQuestions");
    if (saved) {
      setBookmarkedQuestions(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save bookmarks to localStorage
  const toggleBookmark = (questionId: string) => {
    const updated = new Set(bookmarkedQuestions);
    if (updated.has(questionId)) {
      updated.delete(questionId);
    } else {
      updated.add(questionId);
    }
    setBookmarkedQuestions(updated);
    localStorage.setItem("bookmarkedQuestions", JSON.stringify(Array.from(updated)));
  };

  // Open answer dialog for a question
  const openAnswerDialog = (question: { text: string; number: number }) => {
    setSelectedQuestion(question);
    setAnswerDialogOpen(true);
  };

  if (!levelData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <p className="text-slate-600 mb-4">Invalid level or technology selected</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categorizedData = normalizeToCategories(levelData);
  const categories = Object.entries(categorizedData);

  // Initialize selected category
  if (selectedCategory === null && categories.length > 0) {
    setSelectedCategory(categories[0][0]);
  }

  // Filter questions based on search query
  const filteredQuestions = useMemo(() => {
    const result: Record<string, Record<string, Question[]>> = {};

    Object.entries(categorizedData).forEach(([categoryName, subcategories]) => {
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
  }, [searchQuery, categorizedData]);

  const displayCategories = searchQuery ? filteredQuestions : categorizedData;
  const displayedCategory = selectedCategory && displayCategories[selectedCategory];

  // Count total questions
  const totalQuestions = countQuestions(levelData);

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
            <h1 className="text-2xl font-bold text-slate-900 flex-1">
              {levelData.level}
            </h1>
            <div className="text-sm text-slate-600">
              {totalQuestions} câu hỏi
            </div>
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
                  {Object.keys(displayCategories).map((categoryName) => (
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
                          const questionId = `${selectedCategory}-${subcategoryName}-${question.number}`;
                          const isBookmarked = bookmarkedQuestions.has(questionId);

                          return (
                            <div
                              key={question.number}
                              className="pb-4 border-b border-slate-200 last:border-b-0 last:pb-0"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-block w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
                                      {question.number}
                                    </span>
                                    <p className="text-slate-900 font-medium">{question.text}</p>
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
                                    onClick={() => toggleBookmark(questionId)}
                                    className="p-2 hover:bg-slate-100 rounded-md transition-colors"
                                    title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                                  >
                                    {isBookmarked ? (
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
        />
      )}
    </div>
  );
}
