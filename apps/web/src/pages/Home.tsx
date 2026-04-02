import {
  AppShell,
  DashboardShortcut,
  InlineStatus,
  MetricTile,
  Surface,
  TechnologyAvatar,
  dashboardShortcuts,
} from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useBookmarksApi } from "@/hooks/useBookmarksApi";
import { useHistoryApi } from "@/hooks/useHistoryApi";
import { useTechnologies } from "@/hooks/useQuestionsApi";
import { apiFetch } from "@/lib/api";
import {
  ArrowRight,
  BookMarked,
  BrainCircuit,
  Orbit,
  Sparkles,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export default function Home() {
  const { technologies, isLoading, error } = useTechnologies();
  const { bookmarks } = useBookmarksApi();
  const { history, getStats } = useHistoryApi();
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const stats = getStats();

  useEffect(() => {
    async function fetchQuestionCounts() {
      const requests = technologies.flatMap((tech) =>
        tech.levels.map(async (level) => {
          try {
            const response = await apiFetch(`/technologies/${tech.id}/questions?level=${level}`);
            if (!response.ok) {
              return 0;
            }

            const data = await response.json();
            return data.totalQuestions || 0;
          } catch {
            return 0;
          }
        })
      );

      const totals = await Promise.all(requests);
      setTotalQuestions(totals.reduce((sum, value) => sum + value, 0));
    }

    if (technologies.length > 0) {
      fetchQuestionCounts();
    } else {
      setTotalQuestions(0);
    }
  }, [technologies]);

  const defaultTech = technologies[0];

  return (
    <AppShell
      eyebrow="The Precision Lab"
      title="Technical interview preparation, rendered like an editorial control room."
      description="Toàn bộ apps/web đang được kéo về ngôn ngữ Stitch: dark, high-contrast, tonal-layered và không còn kiểu card trắng SaaS mặc định. Đây là điểm vào cho question library, timed tests, AI scoring và các screen demo còn thiếu."
      actions={
        <>
          <Link href="/dashboard">
            <Button variant="outline">
              <BrainCircuit className="size-4" />
              Dashboard demo
            </Button>
          </Link>
          {defaultTech ? (
            <Link href={`/tech/${defaultTech.id}`}>
              <Button>
                <Sparkles className="size-4" />
                Start with {defaultTech.name}
              </Button>
            </Link>
          ) : null}
        </>
      }
      heroMeta={
        <>
          <MetricTile
            label="Question bank"
            value={totalQuestions === null ? "..." : `${totalQuestions}+`}
            caption="Tổng số câu hỏi được kéo từ API công nghệ và chia theo level."
            icon={Orbit}
          />
          <MetricTile
            label="Active stacks"
            value={technologies.length}
            caption="Mỗi stack dẫn tới library, test setup và practice routes riêng."
            icon={Target}
            tone="success"
          />
          <MetricTile
            label="Live session"
            value={history.length ? `${stats.avgScore}/100` : "Cold start"}
            caption={
              history.length
                ? "Điểm trung bình hiện có từ session local."
                : "Chưa có điểm nào, sẵn sàng bắt đầu mới."
            }
            icon={BookMarked}
            tone="warm"
          />
        </>
      }
      aside={
        <>
          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">Live signal</p>
              <InlineStatus
                label="History engine"
                value={history.length > 0 ? `${history.length} answers` : "Waiting"}
                tone={history.length > 0 ? "success" : "neutral"}
              />
              <InlineStatus
                label="Bookmark deck"
                value={bookmarks.length > 0 ? `${bookmarks.length} saved` : "Empty"}
                tone={bookmarks.length > 0 ? "primary" : "warm"}
              />
              <InlineStatus label="UI migration" value="In progress" tone="warm" />
            </div>
          </Surface>

          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">Flow map</p>
              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                <p>1. Chọn stack và level.</p>
                <p>2. Khám phá question library hoặc vào timed test.</p>
                <p>3. Nhận AI critique, bookmark điểm yếu, rồi quay lại review.</p>
              </div>
            </div>
          </Surface>
        </>
      }
    >
      <Surface>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="editorial-kicker">Technology stacks</p>
              <h2 className="text-2xl font-semibold text-foreground">Choose your interview arena</h2>
            </div>
            <Badge variant="outline">No-line library</Badge>
          </div>

          {isLoading ? (
            <div className="surface-inset flex items-center justify-center gap-3 p-10 text-muted-foreground">
              <Spinner className="size-5" />
              <span>Đang kéo stack từ API...</span>
            </div>
          ) : error ? (
            <div className="surface-inset p-6 text-sm text-rose-200">{error}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {technologies.map((tech) => (
                <Link key={tech.id} href={`/tech/${tech.id}`} className="group block">
                  <div className="surface-inset flex h-full flex-col gap-5 p-5 transition-transform duration-200 group-hover:-translate-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <TechnologyAvatar icon={tech.icon} color={tech.color} />
                      <Badge variant="outline">{tech.levels.length} levels</Badge>
                    </div>
                    <div className="space-y-3">
                      <h3 className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
                        {tech.name}
                      </h3>
                      <p className="text-sm leading-7 text-muted-foreground">{tech.description}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2 text-sm text-muted-foreground">
                      <span>Library + timed test</span>
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Surface>

      <Surface>
        <div className="space-y-5">
          <div>
            <p className="editorial-kicker">Board coverage</p>
            <h2 className="text-2xl font-semibold text-foreground">
              Demo screens filling the Stitch roadmap
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {dashboardShortcuts.map((shortcut) => (
              <DashboardShortcut key={shortcut.href} {...shortcut} />
            ))}
          </div>
        </div>
      </Surface>

      <Surface>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="surface-inset p-5">
            <p className="editorial-kicker">Library-first</p>
            <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
              Explore questions without losing category context.
            </p>
          </div>
          <div className="surface-inset p-5">
            <p className="editorial-kicker">Timed pressure</p>
            <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
              Turn answer quality into score trends, not vague intuition.
            </p>
          </div>
          <div className="surface-inset p-5">
            <p className="editorial-kicker">Review loop</p>
            <p className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
              Save weak spots, return later, and compare the second answer.
            </p>
          </div>
        </div>
      </Surface>
    </AppShell>
  );
}
