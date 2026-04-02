import { MarkdownContent } from "@/components/MarkdownContent";
import { AppShell, InlineStatus, MetricTile, Surface } from "@/components/app-shell";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHistoryApi, type HistoryEntry } from "@/hooks/useHistoryApi";
import { useTechnologies } from "@/hooks/useQuestionsApi";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CheckCircle,
  History,
  Lightbulb,
  Loader2,
  MessageCircle,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

function formatLocalDate(value: string) {
  return new Date(value).toLocaleString("vi-VN");
}

export default function HistoryPage() {
  const { history, isLoading, deleteEntry, clearHistory, getStats } = useHistoryApi();
  const { technologies } = useTechnologies();
  const [selectedTech, setSelectedTech] = useState<string>("all");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  const stats = getStats();
  const uniqueTechCount = Object.keys(stats.techCounts).length;
  const filteredHistory =
    selectedTech === "all" ? history : history.filter((entry) => entry.techId === selectedTech);
  const usedTechnologies = Array.from(new Set(history.map((entry) => entry.techId)));

  const sortedTechCounts = useMemo(
    () => Object.entries(stats.techCounts).sort((left, right) => right[1] - left[1]),
    [stats.techCounts]
  );

  const getTechName = (techId: string) => {
    const tech = technologies.find((item) => item.id === techId);
    return tech?.name || techId;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-[var(--primary)]" />
          <p className="text-muted-foreground">Đang tải lịch sử...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      eyebrow="History log"
      title="A scored record of every answer, follow-up, and revision."
      description="Lịch sử giờ được trình bày như một review desk: score trends, entry list, detail dialog và chat follow-up đều nằm trong cùng grammar tối của Stitch."
      actions={
        <>
          {history.length > 0 ? (
            <Select value={selectedTech} onValueChange={setSelectedTech}>
              <SelectTrigger className="w-52">
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
          ) : null}

          {history.length > 0 ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Trash2 className="size-4" />
                  Clear history
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
                  <AlertDialogAction onClick={clearHistory}>Xóa tất cả</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}

          <Link href="/">
            <Button>
              <Sparkles className="size-4" />
              Back to stacks
            </Button>
          </Link>
        </>
      }
      heroMeta={
        <>
          <MetricTile
            label="Total answers"
            value={stats.totalAnswers}
            caption="Số entry AI scoring được lưu trong session hiện tại."
            icon={CalendarDays}
          />
          <MetricTile
            label="Average score"
            value={`${stats.avgScore}/100`}
            caption="Điểm trung bình hiện có, useful để đọc hướng tiến bộ toàn cục."
            icon={TrendingUp}
            tone="success"
          />
          <MetricTile
            label="Active stacks"
            value={uniqueTechCount}
            caption="Số công nghệ đã từng được luyện tập trong history hiện có."
            icon={History}
            tone="warm"
          />
        </>
      }
      aside={
        <>
          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">Distribution</p>
              <InlineStatus
                label="Excellent"
                value={`${stats.scoreDistribution.excellent}`}
                tone="success"
              />
              <InlineStatus
                label="Good"
                value={`${stats.scoreDistribution.good}`}
                tone="primary"
              />
              <InlineStatus
                label="Average"
                value={`${stats.scoreDistribution.average}`}
                tone="warm"
              />
              <InlineStatus
                label="Needs work"
                value={`${stats.scoreDistribution.needsWork}`}
                tone="neutral"
              />
            </div>
          </Surface>

          {sortedTechCounts.length > 0 ? (
            <Surface>
              <div className="space-y-4">
                <p className="editorial-kicker">Most practiced</p>
                <div className="space-y-2">
                  {sortedTechCounts.map(([techId, count]) => (
                    <div
                      key={techId}
                      className="surface-inset flex items-center justify-between gap-3 px-4 py-3"
                    >
                      <span className="text-sm text-foreground">{getTechName(techId)}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </Surface>
          ) : null}
        </>
      }
    >
      {filteredHistory.length === 0 ? (
        <Surface>
          <div className="surface-inset space-y-4 p-10 text-center">
            <History className="mx-auto size-14 text-muted-foreground" />
            <p className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
              Chưa có lịch sử
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Hãy làm bài và để AI chấm điểm để review desk này có dữ liệu thật.
            </p>
            <Link href="/">
              <Button>Bắt đầu học</Button>
            </Link>
          </div>
        </Surface>
      ) : (
        <Surface>
          <div className="space-y-5">
            <div>
              <p className="editorial-kicker">Entry log</p>
              <h2 className="text-2xl font-semibold text-foreground">Scored answer archive</h2>
            </div>

            <div className="space-y-3">
              {filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="surface-inset flex cursor-pointer flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between"
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{getTechName(entry.techId)}</Badge>
                      <Badge variant="secondary">{entry.level}</Badge>
                      <Badge variant={entry.score >= 60 ? "secondary" : "destructive"}>
                        {entry.score}/100
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatLocalDate(entry.createdAt)}
                      </span>
                      {entry.chatMessages.length > 0 ? (
                        <Badge>
                          <MessageCircle className="size-3" />
                          {entry.chatMessages.length} follow-up
                        </Badge>
                      ) : null}
                    </div>
                    <p className="font-medium text-foreground">{entry.questionText}</p>
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {entry.userAnswer}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="surface-inset min-w-24 px-4 py-3 text-center">
                      <p className="editorial-kicker">Score</p>
                      <p className="mt-2 font-display text-3xl font-semibold tracking-[-0.06em] text-foreground">
                        {entry.score}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteEntry(entry.id);
                      }}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Surface>
      )}

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-5xl overflow-y-auto">
          {selectedEntry ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{getTechName(selectedEntry.techId)}</Badge>
                  <Badge variant="secondary">{selectedEntry.level}</Badge>
                  <Badge variant={selectedEntry.score >= 60 ? "secondary" : "destructive"}>
                    {selectedEntry.score}/100
                  </Badge>
                  <span className="text-sm font-normal text-muted-foreground">
                    {formatLocalDate(selectedEntry.createdAt)}
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="surface-inset space-y-3 p-5">
                  <p className="editorial-kicker">Question</p>
                  <p className="text-sm leading-7 text-foreground">{selectedEntry.questionText}</p>
                </div>

                <div className="surface-inset space-y-3 p-5">
                  <p className="editorial-kicker">Your answer</p>
                  <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                    {selectedEntry.userAnswer}
                  </p>
                </div>

                <div className="surface-inset space-y-4 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="editorial-kicker">Score profile</p>
                    <Badge variant={selectedEntry.score >= 60 ? "secondary" : "destructive"}>
                      {selectedEntry.score}/100
                    </Badge>
                  </div>
                  <Progress value={selectedEntry.score} />
                </div>

                <div className="surface-inset space-y-3 p-5">
                  <p className="editorial-kicker">Feedback</p>
                  <p className="text-sm leading-7 text-muted-foreground">{selectedEntry.feedback}</p>
                </div>

                {selectedEntry.strengths.length > 0 ? (
                  <div className="surface-inset bg-[linear-gradient(180deg,rgba(45,212,191,0.18),rgba(8,13,28,0.96))] p-5">
                    <p className="editorial-kicker">Strengths</p>
                    <ul className="mt-3 space-y-2">
                      {selectedEntry.strengths.map((strength) => (
                        <li key={strength} className="text-sm leading-6 text-emerald-100">
                          • {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {selectedEntry.improvements.length > 0 ? (
                  <div className="surface-inset bg-[linear-gradient(180deg,rgba(255,182,149,0.18),rgba(8,13,28,0.96))] p-5">
                    <p className="editorial-kicker">Needs work</p>
                    <ul className="mt-3 space-y-2">
                      {selectedEntry.improvements.map((improvement) => (
                        <li key={improvement} className="text-sm leading-6 text-amber-50">
                          • {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {selectedEntry.sampleAnswer ? (
                  <div className="surface-inset p-5">
                    <p className="editorial-kicker">Sample answer</p>
                    <div className="mt-3 text-sm leading-7 text-muted-foreground">
                      <MarkdownContent content={selectedEntry.sampleAnswer} />
                    </div>
                  </div>
                ) : null}

                {selectedEntry.chatMessages.length > 0 ? (
                  <div className="surface-inset p-5">
                    <p className="editorial-kicker">Follow-up thread</p>
                    <div className="mt-4 space-y-3">
                      {selectedEntry.chatMessages.map((message, index) => (
                        <div
                          key={`${message.role}-${index}`}
                          className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                        >
                          <div
                            className={cn(
                              "max-w-[85%] rounded-[1.2rem] px-4 py-3 text-sm leading-6",
                              message.role === "user"
                                ? "bg-[linear-gradient(135deg,var(--primary-container),var(--primary))] text-[var(--primary-foreground)]"
                                : "surface-inset text-muted-foreground"
                            )}
                          >
                            {message.role === "assistant" ? (
                              <MarkdownContent content={message.content} />
                            ) : (
                              <p className="whitespace-pre-wrap">{message.content}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
