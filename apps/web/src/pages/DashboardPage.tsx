import {
  AppShell,
  DemoBadge,
  InlineStatus,
  MetricTile,
  Surface,
  dashboardShortcuts,
} from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBookmarksApi } from "@/hooks/useBookmarksApi";
import { useHistoryApi } from "@/hooks/useHistoryApi";
import {
  Activity,
  ArrowRight,
  BookMarked,
  BrainCircuit,
  CalendarClock,
  ChevronRight,
  LayoutDashboard,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { Link } from "wouter";

const demoFocusLanes = [
  {
    title: "Core language systems",
    detail: "Variable scope, asynchronous flow, data mutation contracts.",
    progress: "Phase 1 / 3",
  },
  {
    title: "Framework interviews",
    detail: "Rendering pipeline, hooks mental model, server state boundaries.",
    progress: "Phase 2 / 3",
  },
  {
    title: "Mock defense rounds",
    detail: "Timed answers, AI critique loops, rebuttal and refinement.",
    progress: "Phase 3 / 3",
  },
];

export default function DashboardPage() {
  const { history, getStats } = useHistoryApi();
  const { bookmarks } = useBookmarksApi();
  const stats = getStats();
  const recentEntries = history.slice(0, 4);

  return (
    <AppShell
      eyebrow="Dashboard"
      title="Personal command cockpit for interview readiness."
      description="Dashboard này gom dữ liệu thật từ lịch sử và bookmark hiện có, rồi đặt chúng vào cùng workspace TechLab để bạn nhìn ra nhịp luyện tập của mình."
      actions={
        <>
          <DemoBadge />
          <Link href="/study-plan">
            <Button variant="outline">
              <CalendarClock className="size-4" />
              Study plan
            </Button>
          </Link>
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
            label="Total sessions"
            value={stats.totalAnswers}
            caption="Số câu trả lời đã được AI chấm trong session hiện tại."
            icon={LayoutDashboard}
          />
          <MetricTile
            label="Average score"
            value={`${stats.avgScore}/100`}
            caption="Điểm trung bình hiện có, dùng để định tuyến phase ôn tập kế tiếp."
            icon={Target}
            tone="success"
          />
          <MetricTile
            label="Bookmarks"
            value={bookmarks.length}
            caption="Câu hỏi được đánh dấu để quay lại trong warm-up hoặc deep review."
            icon={BookMarked}
            tone="warm"
          />
        </>
      }
      aside={
        <>
          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">System readiness</p>
              <InlineStatus
                label="AI scoring loop"
                value={history.length > 0 ? "Live" : "Waiting"}
                tone={history.length > 0 ? "success" : "neutral"}
              />
              <InlineStatus
                label="Review cadence"
                value={bookmarks.length > 0 ? "Bookmarks armed" : "Needs curation"}
                tone={bookmarks.length > 0 ? "primary" : "warm"}
              />
              <InlineStatus label="Planner engine" value="Preview mode" tone="warm" />
            </div>
          </Surface>

          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">Workspace links</p>
              {dashboardShortcuts.slice(1, 4).map((shortcut) => (
                <Link
                  key={shortcut.href}
                  href={shortcut.href}
                  className="surface-inset flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div>
                    <p className="font-display text-base font-semibold tracking-[-0.04em] text-foreground">
                      {shortcut.title}
                    </p>
                    <p className="text-xs leading-5 text-muted-foreground">{shortcut.description}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </Surface>
        </>
      }
    >
      <Surface>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="editorial-kicker">Mission board</p>
              <h2 className="text-2xl font-semibold text-foreground">
                Focus lanes from the TechLab dashboard
              </h2>
            </div>
            <Badge variant="outline">Preview workspace</Badge>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {demoFocusLanes.map((lane) => (
              <div key={lane.title} className="surface-inset space-y-4 p-5">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
                    {lane.title}
                  </p>
                  <Badge>{lane.progress}</Badge>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{lane.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Surface>

      <Surface>
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="editorial-kicker">Recent signal</p>
              <h2 className="text-2xl font-semibold text-foreground">Latest scored answers</h2>
            </div>
            <Link href="/history">
              <Button variant="outline">
                <Activity className="size-4" />
                Open history
              </Button>
            </Link>
          </div>

          {recentEntries.length === 0 ? (
            <div className="surface-inset space-y-3 p-6">
              <p className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
                No graded answers yet
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Làm ít nhất một câu hỏi hoặc một test để dashboard này chuyển từ empty state sang live state.
              </p>
              <Link href="/">
                <Button>
                  <ArrowRight className="size-4" />
                  Start a stack
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="surface-inset flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{entry.techId}</Badge>
                      <Badge variant="secondary">{entry.level}</Badge>
                    </div>
                    <p className="font-medium text-foreground">{entry.questionText}</p>
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {entry.userAnswer}
                    </p>
                  </div>
                  <div className="surface-inset flex min-w-32 flex-col items-center justify-center gap-1 px-4 py-3 text-center">
                    <span className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      Score
                    </span>
                    <span className="font-display text-3xl font-semibold tracking-[-0.06em] text-foreground">
                      {entry.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Surface>

      <Surface>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="surface-inset p-5">
            <BrainCircuit className="mb-4 size-5 text-[var(--primary)]" />
            <p className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
              Planner states
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Placeholder structure cho lộ trình học, phase review và checkpoint logic.
            </p>
          </div>
          <div className="surface-inset p-5">
            <CalendarClock className="mb-4 size-5 text-[var(--tertiary)]" />
            <p className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
              Session ritual
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Giao diện đã sẵn nhịp mở app, warm-up, deep practice và review loop.
            </p>
          </div>
          <div className="surface-inset p-5">
            <Trophy className="mb-4 size-5 text-emerald-300" />
            <p className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
              Progress language
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Dùng cùng token, typography và tonal layers để khi backend thật vào không phải redesign lại.
            </p>
          </div>
        </div>
      </Surface>
    </AppShell>
  );
}
