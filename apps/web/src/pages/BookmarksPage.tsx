import { AppShell, InlineStatus, MetricTile, Surface } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBookmarksApi, type BookmarkWithQuestion } from "@/hooks/useBookmarksApi";
import { useTechnologies } from "@/hooks/useQuestionsApi";
import { BookMarked, Loader2, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

export default function BookmarksPage() {
  const { bookmarks, isLoading, removeBookmark } = useBookmarksApi();
  const { technologies } = useTechnologies();
  const [searchQuery, setSearchQuery] = useState("");

  const getTechName = (techId: string) => {
    const tech = technologies.find((item) => item.id === techId);
    return tech?.name || techId;
  };

  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) {
      return bookmarks;
    }

    const query = searchQuery.toLowerCase();
    return bookmarks.filter(
      (bookmark) =>
        bookmark.question?.text.toLowerCase().includes(query) ||
        bookmark.question?.techId.toLowerCase().includes(query)
    );
  }, [searchQuery, bookmarks]);

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
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-[var(--primary)]" />
          <p className="text-muted-foreground">Đang tải bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      eyebrow="Bookmark deck"
      title="Saved prompts, organized as a focused review stack."
      description="Bookmarks giờ đóng vai trò revision deck. Search, grouping theo công nghệ và thao tác xoá đều đi cùng một visual system với library và history."
      actions={
        <>
          <Link href="/history">
            <Button variant="outline">History</Button>
          </Link>
          <Link href="/">
            <Button>Back to stacks</Button>
          </Link>
        </>
      }
      heroMeta={
        <>
          <div className="surface-inset flex items-center gap-3 px-4 py-3 lg:col-span-2">
            <Search className="size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm câu hỏi đã lưu..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </div>
          <MetricTile
            label="Filtered deck"
            value={filteredBookmarks.length}
            caption={`${Object.keys(groupedByTech).length} stacks đang hiện trong deck.`}
            icon={BookMarked}
            tone="primary"
          />
        </>
      }
      aside={
        <>
          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">Deck signal</p>
              <InlineStatus label="Saved prompts" value={`${bookmarks.length}`} tone="primary" />
              <InlineStatus
                label="Search mode"
                value={searchQuery ? "Filtered" : "Full deck"}
                tone="warm"
              />
              <InlineStatus label="Review usage" value="Library companion" tone="success" />
            </div>
          </Surface>
        </>
      }
    >
      {bookmarks.length === 0 ? (
        <Surface>
          <div className="surface-inset space-y-4 p-10 text-center">
            <BookMarked className="mx-auto size-14 text-muted-foreground" />
            <p className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
              Chưa có câu hỏi nào được lưu
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Khi bạn bookmark câu hỏi trong library, chúng sẽ xuất hiện ở revision deck này.
            </p>
            <Link href="/">
              <Button>Bắt đầu ôn tập</Button>
            </Link>
          </div>
        </Surface>
      ) : filteredBookmarks.length === 0 ? (
        <Surface>
          <div className="surface-inset space-y-4 p-10 text-center">
            <p className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
              Không tìm thấy câu hỏi phù hợp
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              Thử xoá từ khoá tìm kiếm để hiện lại toàn bộ bookmark deck.
            </p>
            <Button variant="outline" onClick={() => setSearchQuery("")}>
              Xoá tìm kiếm
            </Button>
          </div>
        </Surface>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByTech).map(([techId, techBookmarks]) => (
            <Surface key={techId}>
              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="editorial-kicker">Tech group</p>
                    <h2 className="text-2xl font-semibold text-foreground">{getTechName(techId)}</h2>
                  </div>
                  <Badge variant="outline">{techBookmarks.length} prompts</Badge>
                </div>

                <div className="space-y-3">
                  {techBookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="surface-inset flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{getTechName(bookmark.question?.techId || "")}</Badge>
                          <Badge variant="secondary">{bookmark.question?.level}</Badge>
                          <Badge>Câu {bookmark.question?.questionNumber}</Badge>
                        </div>
                        <p className="text-sm leading-7 text-foreground">{bookmark.question?.text}</p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeBookmark(bookmark.questionId)}
                        title="Xóa bookmark"
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Surface>
          ))}
        </div>
      )}
    </AppShell>
  );
}
