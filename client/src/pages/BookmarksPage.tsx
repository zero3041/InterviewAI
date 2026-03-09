import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Search, Trash2 } from "lucide-react";
import questionsData from "@/data/questions.json";

interface Question {
  number: number;
  text: string;
}

interface BookmarkedQuestion {
  level: "junior" | "middle";
  category: string;
  subcategory: string;
  question: Question;
  questionId: string;
}

const typedQuestionsData = questionsData as any;

export default function BookmarksPage() {
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<BookmarkedQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Load bookmarks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bookmarkedQuestions");
    if (saved) {
      try {
        const bookmarkIds = JSON.parse(saved);
        const bookmarkedList: BookmarkedQuestion[] = [];

        // Iterate through all levels and categories to find bookmarked questions
        Object.entries(typedQuestionsData).forEach(([level, levelData]: [string, any]) => {
          Object.entries(levelData.categories).forEach(([category, subcategories]: [string, any]) => {
            Object.entries(subcategories).forEach(([subcategory, questions]: [string, any]) => {
              questions.forEach((question: Question) => {
                const questionId = `${category}-${subcategory}-${question.number}`;
                if (bookmarkIds.includes(questionId)) {
                  bookmarkedList.push({
                    level: level as "junior" | "middle",
                    category,
                    subcategory,
                    question,
                    questionId,
                  });
                }
              });
            });
          });
        });

        setBookmarkedQuestions(bookmarkedList);
      } catch (e) {
        console.error("Failed to load bookmarks:", e);
      }
    }
  }, []);

  // Filter questions based on search query
  const filteredQuestions = useMemo(() => {
    return bookmarkedQuestions.filter((item) =>
      item.question.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, bookmarkedQuestions]);

  // Group by level
  const groupedByLevel = useMemo(() => {
    const groups: Record<string, BookmarkedQuestion[]> = {};
    filteredQuestions.forEach((item) => {
      if (!groups[item.level]) {
        groups[item.level] = [];
      }
      groups[item.level].push(item);
    });
    return groups;
  }, [filteredQuestions]);

  const removeBookmark = (questionId: string) => {
    const saved = localStorage.getItem("bookmarkedQuestions");
    if (saved) {
      const bookmarkIds = JSON.parse(saved).filter((id: string) => id !== questionId);
      localStorage.setItem("bookmarkedQuestions", JSON.stringify(bookmarkIds));
      setBookmarkedQuestions((prev) => prev.filter((item) => item.questionId !== questionId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 flex-1">
              Bookmarked Questions
            </h1>
            <div className="text-sm text-slate-600">
              {bookmarkedQuestions.length} bookmarks
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search bookmarked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {bookmarkedQuestions.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-600 mb-4">No bookmarked questions yet</p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Start Exploring Questions
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredQuestions.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-600 mb-4">No bookmarked questions match your search</p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="border-slate-200"
              >
                Clear Search
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByLevel).map(([level, questions]) => (
              <div key={level}>
                <h2 className="text-xl font-bold text-slate-900 mb-4 capitalize">
                  {level === "junior" ? "Junior Developer" : "Middle Developer"}
                </h2>
                <div className="space-y-4">
                  {questions.map((item) => (
                    <Card key={item.questionId} className="border-slate-200">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                                {item.category}
                              </span>
                              <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                                {item.subcategory}
                              </span>
                            </div>
                            <p className="text-slate-900 font-medium">{item.question.text}</p>
                          </div>
                          <button
                            onClick={() => removeBookmark(item.questionId)}
                            className="flex-shrink-0 p-2 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove bookmark"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
