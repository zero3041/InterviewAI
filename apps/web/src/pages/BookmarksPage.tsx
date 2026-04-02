import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Search, Trash2, Bookmark, Loader2 } from "lucide-react";
import { useBookmarksApi, type BookmarkWithQuestion } from "@/hooks/useBookmarksApi";
import { useTechnologies } from "@/hooks/useQuestionsApi";

export default function BookmarksPage() {
  const { bookmarks, isLoading, removeBookmark } = useBookmarksApi();
  const { technologies } = useTechnologies();
  const [searchQuery, setSearchQuery] = useState("");

  // Get tech name helper
  const getTechName = (techId: string) => {
    const tech = technologies.find((t) => t.id === techId);
    return tech?.name || techId;
  };

  // Filter questions based on search query
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;
    const query = searchQuery.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.question?.text.toLowerCase().includes(query) ||
        b.question?.techId.toLowerCase().includes(query)
    );
  }, [searchQuery, bookmarks]);

  // Group by technology
  const groupedByTech = useMemo(() => {
    const groups: Record<string, BookmarkWithQuestion[]> = {};
    filteredBookmarks.forEach((bookmark) => {
      const techId = bookmark.question?.techId || "unknown";
      if (!groups[techId]) {
        groups[techId] = [];
      }
      groups[techId].push(bookmark);
    });
    return groups;
  }, [filteredBookmarks]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Đang tải bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Quay lại
              </Button>
            </Link>
            <div className="flex items-center gap-2 flex-1">
              <Bookmark className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">
                Câu hỏi đã lưu
              </h1>
            </div>
            <div className="text-sm text-slate-600">
              {bookmarks.length} bookmarks
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm câu hỏi đã lưu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {bookmarks.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="pt-12 pb-12 text-center">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Chưa có câu hỏi nào được lưu</p>
              <Link href="/">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Bắt đầu ôn tập
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : filteredBookmarks.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-600 mb-4">Không tìm thấy câu hỏi phù hợp</p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="border-slate-200"
              >
                Xóa tìm kiếm
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedByTech).map(([techId, techBookmarks]) => (
              <div key={techId}>
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  {getTechName(techId)}
                </h2>
                <div className="space-y-4">
                  {techBookmarks.map((bookmark) => (
                    <Card key={bookmark.id} className="border-slate-200 hover:border-blue-200 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {getTechName(bookmark.question?.techId || "")}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {bookmark.question?.level}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                Câu {bookmark.question?.questionNumber}
                              </Badge>
                            </div>
                            <p className="text-slate-900 font-medium">
                              {bookmark.question?.text}
                            </p>
                          </div>
                          <button
                            onClick={() => removeBookmark(bookmark.questionId)}
                            className="flex-shrink-0 p-2 hover:bg-red-50 rounded-md transition-colors"
                            title="Xóa bookmark"
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
