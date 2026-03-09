import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ChevronLeft,
  History,
  Trash2,
  MessageCircle,
  CheckCircle,
  Lightbulb,
  TrendingUp,
  Calendar,
  Loader2,
} from "lucide-react";
import { useHistoryApi, type HistoryEntry } from "@/hooks/useHistoryApi";
import { useTechnologies } from "@/hooks/useQuestionsApi";
import { MarkdownContent } from "@/components/MarkdownContent";

export default function HistoryPage() {
  const { history, isLoading, deleteEntry, clearHistory, getStats } = useHistoryApi();
  const { technologies } = useTechnologies();
  const [selectedTech, setSelectedTech] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  const stats = getStats();
  const uniqueTechCount = Object.keys(stats.techCounts).length;

  // Filter history by technology
  const filteredHistory =
    selectedTech === "all"
      ? history
      : history.filter((e) => e.techId === selectedTech);

  // Get unique technologies from history
  const usedTechnologies = Array.from(new Set(history.map((e) => e.techId)));

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (
    score: number
  ): "default" | "secondary" | "destructive" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getTechName = (techId: string) => {
    const tech = technologies.find((t) => t.id === techId);
    return tech?.name || techId;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-slate-600">Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <History className="w-8 h-8 text-purple-600" />
                Lịch sử làm bài
              </h1>
              <p className="text-slate-600 mt-1">
                Xem lại các câu trả lời đã được AI chấm điểm
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa tất cả
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa lịch sử</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa toàn bộ lịch sử? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={clearHistory}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Xóa tất cả
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Stats Cards */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-700">{stats.totalAnswers}</p>
                    <p className="text-sm text-blue-600">Tổng số lần làm bài</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">{stats.avgScore}/100</p>
                    <p className="text-sm text-green-600">Điểm trung bình</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <History className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold text-purple-700">{uniqueTechCount}</p>
                    <p className="text-sm text-purple-600">Công nghệ đã học</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter */}
        {history.length > 0 && (
          <div className="mb-6">
            <Select value={selectedTech} onValueChange={setSelectedTech}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn công nghệ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả công nghệ</SelectItem>
                {usedTechnologies.map((techId) => (
                  <SelectItem key={techId} value={techId}>
                    {getTechName(techId)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <Card className="border-slate-200">
            <CardContent className="py-12 text-center">
              <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                Chưa có lịch sử
              </h3>
              <p className="text-slate-500 mb-4">
                Hãy làm bài và để AI chấm điểm để xem lịch sử tại đây
              </p>
              <Link href="/">
                <Button>Bắt đầu học</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((entry) => (
              <Card
                key={entry.id}
                className="border-slate-200 hover:border-purple-300 transition-colors cursor-pointer"
                onClick={() => setSelectedEntry(entry)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {getTechName(entry.techId)}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {entry.level}
                        </Badge>
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
                      <p className="text-slate-900 font-medium mb-1 line-clamp-1">
                        {entry.questionText}
                      </p>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {entry.userAnswer}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEntry(entry.id);
                      }}
                      className="text-slate-400 hover:text-red-500 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="sm:max-w-4xl max-w-[95vw] w-[95vw] max-h-[90vh] overflow-y-auto">
          {selectedEntry && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline">{getTechName(selectedEntry.techId)}</Badge>
                  <Badge variant="outline" className="capitalize">
                    {selectedEntry.level}
                  </Badge>
                  <span className="text-sm text-slate-500">
                    {new Date(selectedEntry.createdAt).toLocaleString("vi-VN")}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Question */}
                <Card className="border-slate-200 bg-slate-50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Câu hỏi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-900 font-medium">{selectedEntry.questionText}</p>
                  </CardContent>
                </Card>

                {/* User's Answer */}
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Câu trả lời của bạn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedEntry.userAnswer}</p>
                  </CardContent>
                </Card>

                {/* Score */}
                <Card className="border-slate-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <span>Điểm số</span>
                      <Badge
                        variant={getScoreBadgeVariant(selectedEntry.score)}
                        className="text-lg px-3 py-1"
                      >
                        {selectedEntry.score}/100
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={selectedEntry.score} className="h-3 mb-2" />
                    <p className={`text-lg font-semibold ${getScoreColor(selectedEntry.score)}`}>
                      {selectedEntry.score >= 80
                        ? "Xuất sắc!"
                        : selectedEntry.score >= 60
                          ? "Khá tốt"
                          : selectedEntry.score >= 40
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
                    <p className="text-slate-700">{selectedEntry.feedback}</p>
                  </CardContent>
                </Card>

                {/* Strengths */}
                {selectedEntry.strengths.length > 0 && (
                  <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        Điểm mạnh
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedEntry.strengths.map((s, i) => (
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
                {selectedEntry.improvements.length > 0 && (
                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                        <Lightbulb className="w-5 h-5" />
                        Cần cải thiện
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedEntry.improvements.map((imp, i) => (
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
                {selectedEntry.sampleAnswer && (
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                        <Lightbulb className="w-5 h-5" />
                        Câu trả lời mẫu
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <MarkdownContent content={selectedEntry.sampleAnswer} className="text-blue-800" />
                    </CardContent>
                  </Card>
                )}

                {/* Chat History */}
                {selectedEntry.chatMessages.length > 0 && (
                  <Card className="border-purple-200 bg-purple-50/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-purple-700">
                        <MessageCircle className="w-5 h-5" />
                        Lịch sử hỏi đáp
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedEntry.chatMessages.map((msg, i) => (
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
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
