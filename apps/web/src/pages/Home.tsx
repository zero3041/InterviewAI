import {
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
import { countQuestions, getLevelData } from "@/lib/questionsData";
import {
  ArrowRight,
  BookMarked,
  BrainCircuit,
  Clock3,
  Layers3,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "wouter";

const featureCards = [
  {
    title: "Library theo level",
    description:
      "Mỗi stack được chia rõ theo track junior và middle để bạn luyện đúng mức áp lực cần thiết.",
    icon: Layers3,
  },
  {
    title: "AI chấm và phản hồi",
    description:
      "Bài trả lời được chấm điểm, nêu điểm mạnh và chỗ cần sửa để bạn không luyện kiểu mơ hồ.",
    icon: BrainCircuit,
  },
  {
    title: "Review loop",
    description:
      "Lưu câu hỏi yếu, quay lại theo bookmark deck và so lại chất lượng câu trả lời sau mỗi vòng ôn.",
    icon: BookMarked,
  },
];

export default function Home() {
  const { technologies, isLoading, error } = useTechnologies();
  const { bookmarks } = useBookmarksApi();
  const { history, getStats } = useHistoryApi();
  const stats = getStats();
  const totalQuestions = useMemo(
    () =>
      technologies.reduce((techTotal, tech) => {
        const stackTotal = tech.levels.reduce((levelTotal, level) => {
          if (level !== "junior" && level !== "middle") {
            return levelTotal;
          }

          const levelData = getLevelData(tech.id, level);
          return levelData ? levelTotal + countQuestions(levelData) : levelTotal;
        }, 0);

        return techTotal + stackTotal;
      }, 0),
    [technologies]
  );

  const defaultTech = technologies[0];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_26%),radial-gradient(circle_at_18%_18%,rgba(168,85,247,0.12),transparent_20%),linear-gradient(180deg,#050813_0%,#090d18_40%,#0a0c14_100%)]" />

      <header className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(10,12,20,0.78)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6366f1,#4f46e5)] text-white shadow-[0_18px_40px_rgba(79,70,229,0.28)]">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
                TechLab
              </p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                interview prep
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            <Link href="/dashboard" className="nav-pill" data-active="false">
              Dashboard
            </Link>
            <Link href="/history" className="nav-pill" data-active="false">
              History
            </Link>
            <Link href="/bookmarks" className="nav-pill" data-active="false">
              Bookmarks
            </Link>
            <Link href="/settings" className="nav-pill" data-active="false">
              Settings
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Workspace access
              </Button>
            </Link>
            {defaultTech ? (
              <Link href={`/tech/${defaultTech.id}`}>
                <Button size="sm">
                  <ArrowRight className="size-4" />
                  Start now
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-14 pt-16 sm:px-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:px-8">
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge className="rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[10px] uppercase tracking-[0.3em] text-white shadow-none">
                Nền tảng luyện phỏng vấn kỹ thuật
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-5xl font-display text-5xl font-semibold leading-[0.95] tracking-[-0.08em] text-foreground md:text-7xl">
                  Luyện interview như một
                  <span className="bg-gradient-to-r from-[#818cf8] via-[#a855f7] to-[#10b981] bg-clip-text text-transparent">
                    {" "}
                    command center
                  </span>
                </h1>
                <p className="max-w-3xl text-base leading-8 text-muted-foreground">
                  Dùng question library theo stack, timed tests, AI feedback và revision deck trong
                  một workspace thống nhất. UX lấy từ `techlab`, còn dữ liệu và flow luyện tập vẫn
                  chạy trên app hiện tại.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {defaultTech ? (
                  <Link href={`/tech/${defaultTech.id}`}>
                    <Button className="h-12 px-6 text-sm font-semibold">
                      <Sparkles className="size-4" />
                      Bắt đầu với {defaultTech.name}
                    </Button>
                  </Link>
                ) : null}
                <Link href="/dashboard">
                  <Button variant="outline" className="h-12 px-6 text-sm font-semibold">
                    <Target className="size-4" />
                    Mở dashboard
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <MetricTile
                label="Question bank"
                value={isLoading ? "..." : `${totalQuestions}+`}
                caption="Tổng số câu hỏi đang dùng trên các stack và level."
                icon={Layers3}
              />
              <MetricTile
                label="Active stacks"
                value={technologies.length}
                caption="Mỗi stack có library, timed test và flow review riêng."
                icon={Target}
                tone="success"
              />
              <MetricTile
                label="Average score"
                value={history.length ? `${stats.avgScore}/100` : "Cold start"}
                caption="Nếu đã luyện trước đó, đây là điểm trung bình hiện có."
                icon={Trophy}
                tone="warm"
              />
            </div>
          </div>

          <div className="space-y-6">
            <Surface className="surface-panel--hero">
              <div className="space-y-4">
                <p className="editorial-kicker">Live workspace</p>
                <InlineStatus
                  label="History engine"
                  value={history.length > 0 ? `${history.length} entries` : "Waiting"}
                  tone={history.length > 0 ? "success" : "neutral"}
                />
                <InlineStatus
                  label="Bookmarks"
                  value={bookmarks.length > 0 ? `${bookmarks.length} saved` : "Empty deck"}
                  tone={bookmarks.length > 0 ? "primary" : "warm"}
                />
                <InlineStatus
                  label="Session pace"
                  value={history.length > 0 ? "Active" : "Ready to start"}
                  tone={history.length > 0 ? "success" : "neutral"}
                />
              </div>
            </Surface>

            <Surface>
              <div className="space-y-4">
                <p className="editorial-kicker">How it works</p>
                <div className="space-y-3 text-sm leading-7 text-muted-foreground">
                  <p>1. Chọn stack và level phù hợp với buổi phỏng vấn bạn đang nhắm tới.</p>
                  <p>2. Học qua library hoặc vào timed test để chịu áp lực như thật.</p>
                  <p>3. Lưu các điểm yếu, quay lại history và bookmark để sửa theo vòng lặp.</p>
                </div>
              </div>
            </Surface>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 xl:px-8">
          <Surface>
            <div className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="editorial-kicker">Technology map</p>
                  <h2 className="font-display text-3xl font-semibold tracking-[-0.06em] text-foreground">
                    Chọn stack để mở đúng workspace luyện tập
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Mỗi route stack sẽ dẫn tới track briefing, question library và timed test tương
                  ứng với dữ liệu đã gắn trong app.
                </p>
              </div>

              {isLoading ? (
                <div className="surface-inset flex items-center justify-center gap-3 p-10 text-muted-foreground">
                  <Spinner className="size-5" />
                  <span>Đang tải danh sách stack...</span>
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
                          <Badge variant="outline">{tech.levels.length} tracks</Badge>
                        </div>
                        <div className="space-y-3">
                          <h3 className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
                            {tech.name}
                          </h3>
                          <p className="text-sm leading-7 text-muted-foreground">
                            {tech.description}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2 text-sm text-muted-foreground">
                          <span>Open stack protocol</span>
                          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Surface>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 xl:px-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <Surface>
              <div className="space-y-6">
                <div>
                  <p className="editorial-kicker">Core flows</p>
                  <h2 className="font-display text-3xl font-semibold tracking-[-0.06em] text-foreground">
                    Những luồng chính đã được kéo về cùng một UI language
                  </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {featureCards.map((feature) => {
                    const Icon = feature.icon;

                    return (
                      <div key={feature.title} className="surface-inset space-y-4 p-5">
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-[rgba(99,102,241,0.12)] text-[var(--primary)]">
                          <Icon className="size-5" />
                        </span>
                        <div className="space-y-2">
                          <h3 className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
                            {feature.title}
                          </h3>
                          <p className="text-sm leading-7 text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Surface>

            <Surface>
              <div className="space-y-4">
                <p className="editorial-kicker">Session rhythm</p>
                <div className="surface-inset space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <Clock3 className="size-4 text-[var(--primary)]" />
                    <p className="text-sm font-semibold text-foreground">Warm-up</p>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Mở library để đọc nhanh các câu hay bị vấp trước khi vào bài test.
                  </p>
                </div>
                <div className="surface-inset space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <BrainCircuit className="size-4 text-[var(--tertiary)]" />
                    <p className="text-sm font-semibold text-foreground">Pressure round</p>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Dùng timed test để đo chất lượng câu trả lời dưới áp lực thời gian thật.
                  </p>
                </div>
                <div className="surface-inset space-y-3 p-4">
                  <div className="flex items-center gap-3">
                    <BookMarked className="size-4 text-emerald-300" />
                    <p className="text-sm font-semibold text-foreground">Review</p>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Quay lại history và bookmark deck để sửa những chủ đề còn yếu.
                  </p>
                </div>
              </div>
            </Surface>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 xl:px-8">
          <Surface>
            <div className="space-y-6">
              <div>
                <p className="editorial-kicker">Screen coverage</p>
                <h2 className="font-display text-3xl font-semibold tracking-[-0.06em] text-foreground">
                  Các màn nội bộ đã được kéo vào cùng workspace
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {dashboardShortcuts.map((shortcut) => (
                  <DashboardShortcut key={shortcut.href} {...shortcut} />
                ))}
              </div>
            </div>
          </Surface>
        </section>
      </main>
    </div>
  );
}
