import { AppShell, DemoBadge, InlineStatus, MetricTile, Surface } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CalendarDays,
  CheckCheck,
  Compass,
  Layers3,
  TimerReset,
} from "lucide-react";
import { Link } from "wouter";

const learningPhases = [
  {
    phase: "Week 01",
    title: "Syntax pressure and runtime intuition",
    focus: "Closures, hoisting, async queue, mutation control, defensive naming.",
  },
  {
    phase: "Week 02",
    title: "Framework narrative drills",
    focus: "Rendering pipeline, hooks mental model, data fetching, UI state boundaries.",
  },
  {
    phase: "Week 03",
    title: "Architecture and tradeoff defense",
    focus: "Folder strategy, scaling patterns, performance levers, testing surface.",
  },
  {
    phase: "Week 04",
    title: "Timed interview sprints",
    focus: "Mock rounds, score review, rebuttal, re-answer loops and confidence framing.",
  },
];

export default function StudyPlanPage() {
  return (
    <AppShell
      eyebrow="Study Plan Demo"
      title="Structured preparation cadence for the JavaScript track."
      description="Screen này bám theo Stitch board `Lộ trình học JavaScript`. Hiện tại planner chưa có backend, nên toàn bộ phase, milestone và review logic đang là frontend demo nhưng đã đúng visual language của project."
      actions={
        <>
          <DemoBadge />
          <Link href="/dashboard">
            <Button variant="outline">
              <Compass className="size-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button>
              <ArrowRight className="size-4" />
              Pick a stack
            </Button>
          </Link>
        </>
      }
      heroMeta={
        <>
          <MetricTile
            label="Duration"
            value="4 weeks"
            caption="Một cadence đủ ngắn để ship nhanh nhưng đủ dài để lặp lại feedback có hệ thống."
            icon={CalendarDays}
          />
          <MetricTile
            label="Review rhythm"
            value="3 loops"
            caption="Learn → practice → re-answer. Mỗi phase đều có checkpoint mềm trước khi sang tuần kế tiếp."
            icon={TimerReset}
            tone="warm"
          />
          <MetricTile
            label="Output"
            value="12 sprints"
            caption="Mock drills, question library sessions và timed tests chia đều trong plan."
            icon={Layers3}
            tone="success"
          />
        </>
      }
      aside={
        <>
          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">Milestone map</p>
              <InlineStatus label="Foundation lock" value="Week 01" tone="primary" />
              <InlineStatus label="Framework fluency" value="Week 02" tone="success" />
              <InlineStatus label="System narrative" value="Week 03" tone="warm" />
              <InlineStatus label="Mock pressure" value="Week 04" tone="neutral" />
            </div>
          </Surface>

          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">Implementation note</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Khi backend planner có API riêng, screen này chỉ cần bind dữ liệu vào timeline, milestone status và schedule cards hiện có.
              </p>
            </div>
          </Surface>
        </>
      }
    >
      <Surface>
        <div className="space-y-5">
          <div>
            <p className="editorial-kicker">Program phases</p>
            <h2 className="text-2xl font-semibold text-foreground">Precision-lab sequence</h2>
          </div>

          <div className="grid gap-4">
            {learningPhases.map((phase) => (
              <div
                key={phase.phase}
                className="surface-inset grid gap-5 p-5 lg:grid-cols-[9rem_minmax(0,1fr)] lg:items-start"
              >
                <div className="space-y-2">
                  <Badge>{phase.phase}</Badge>
                  <p className="text-sm leading-6 text-muted-foreground">Timed review block</p>
                </div>
                <div className="space-y-3">
                  <h3 className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
                    {phase.title}
                  </h3>
                  <p className="text-sm leading-7 text-muted-foreground">{phase.focus}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Surface>

      <Surface>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="surface-inset p-5">
            <CheckCheck className="mb-4 size-5 text-[var(--primary)]" />
            <p className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
              Daily warm-up
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              3 câu bookmarked, 1 câu random, 1 lần nói to câu trả lời để sửa nhịp và độ rõ.
            </p>
          </div>
          <div className="surface-inset p-5">
            <CheckCheck className="mb-4 size-5 text-emerald-300" />
            <p className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
              Midweek drill
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Chạy 20-question test giữa tuần để phát hiện topic tụt nhịp trước khi bước sang phase sau.
            </p>
          </div>
          <div className="surface-inset p-5">
            <CheckCheck className="mb-4 size-5 text-[var(--tertiary)]" />
            <p className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
              End-of-week retrofit
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Chọn 2 câu có điểm thấp nhất, trả lời lại sau khi đọc feedback và so chênh score.
            </p>
          </div>
        </div>
      </Surface>
    </AppShell>
  );
}
