import {
  AppShell,
  InlineStatus,
  MetricTile,
  Surface,
  TechnologyAvatar,
} from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useTechnologies } from "@/hooks/useQuestionsApi";
import { apiFetch } from "@/lib/api";
import {
  ArrowRight,
  BookOpenText,
  ClipboardList,
  Layers3,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";

const levelDetails = {
  junior: {
    title: "Foundation track",
    subtitle: "Junior readiness",
    description:
      "Nắm các nguyên lý cốt lõi, gọi tên được tradeoff cơ bản và trả lời gãy gọn trong 2-3 phút.",
    tone: "primary" as const,
  },
  middle: {
    title: "Systems track",
    subtitle: "Middle-level pressure",
    description:
      "Đi vào kiến trúc, debugging, performance và cách bạn bảo vệ quyết định kỹ thuật trước interviewer.",
    tone: "warm" as const,
  },
};

export default function TechPage() {
  const { techId } = useParams<{ techId: string }>();
  const { technologies, isLoading: techLoading, error: techError } = useTechnologies();
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  const tech = technologies.find((item) => item.id === techId);

  useEffect(() => {
    async function fetchCounts() {
      if (!tech) return;

      setIsLoadingCounts(true);
      const responses = await Promise.all(
        tech.levels.map(async (level) => {
          try {
            const response = await apiFetch(`/technologies/${techId}/questions?level=${level}`);
            if (!response.ok) {
              return { level, totalQuestions: 0, totalCategories: 0 };
            }

            const data = await response.json();
            return {
              level,
              totalQuestions: data.totalQuestions || 0,
              totalCategories: Object.keys(data.categories || {}).length,
            };
          } catch {
            return { level, totalQuestions: 0, totalCategories: 0 };
          }
        })
      );

      const qCounts: Record<string, number> = {};
      const cCounts: Record<string, number> = {};
      responses.forEach((entry) => {
        qCounts[entry.level] = entry.totalQuestions;
        cCounts[entry.level] = entry.totalCategories;
      });

      setQuestionCounts(qCounts);
      setCategoryCounts(cCounts);
      setIsLoadingCounts(false);
    }

    if (tech) {
      fetchCounts();
    }
  }, [tech, techId]);

  if (techLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!tech || techError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="surface-card w-full max-w-xl p-8 text-center">
          <p className="mb-4 font-display text-3xl font-semibold tracking-[-0.05em] text-foreground">
            Technology not found
          </p>
          <p className="mb-6 text-sm leading-6 text-muted-foreground">
            Stack này không có trong registry hiện tại hoặc route bị sai.
          </p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalAcrossLevels = useMemo(
    () => Object.values(questionCounts).reduce((sum, value) => sum + value, 0),
    [questionCounts]
  );
  const totalCategoryCount = useMemo(
    () => Object.values(categoryCounts).reduce((sum, value) => sum + value, 0),
    [categoryCounts]
  );

  return (
    <AppShell
      eyebrow="Stack briefing"
      title={`${tech.name} stack, laid out as a preparation protocol.`}
      description={tech.description}
      actions={
        <>
          <Link href="/">
            <Button variant="outline">All stacks</Button>
          </Link>
          <Link href="/study-plan">
            <Button>
              <ArrowRight className="size-4" />
              Open study plan
            </Button>
          </Link>
        </>
      }
      heroMeta={
        <>
          <div className="surface-inset flex items-center gap-4 p-5">
            <TechnologyAvatar icon={tech.icon} color={tech.color} className="size-16" />
            <div className="space-y-2">
              <p className="editorial-kicker">Selected stack</p>
              <p className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
                {tech.name}
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {tech.levels.length} interview tracks available
              </p>
            </div>
          </div>
          <MetricTile
            label="Question bank"
            value={isLoadingCounts ? "..." : `${totalAcrossLevels}+`}
            caption="Tổng câu hỏi gộp qua các level của stack này."
            icon={Layers3}
          />
          <MetricTile
            label="Category spread"
            value={isLoadingCounts ? "..." : totalCategoryCount}
            caption="Số danh mục hiện có để điều phối library và test coverage."
            icon={Trophy}
            tone="warm"
          />
        </>
      }
      aside={
        <>
          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">Readiness notes</p>
              <InlineStatus
                label="Question source"
                value={isLoadingCounts ? "Syncing" : "Live API"}
                tone={isLoadingCounts ? "neutral" : "success"}
              />
              <InlineStatus label="Track count" value={`${tech.levels.length} routes`} tone="primary" />
              <InlineStatus label="Learning plan" value="Demo supported" tone="warm" />
            </div>
          </Surface>
        </>
      }
    >
      <Surface>
        <div className="space-y-5">
          <div>
            <p className="editorial-kicker">Track selection</p>
            <h2 className="text-2xl font-semibold text-foreground">
              Choose the interview pressure you want to train against
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {tech.levels.map((level) => {
              const details = levelDetails[level as keyof typeof levelDetails];
              if (!details) {
                return null;
              }

              const questionCount = questionCounts[level] || 0;
              const categoryCount = categoryCounts[level] || 0;

              return (
                <div key={level} className="surface-inset flex h-full flex-col gap-5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <Badge variant={details.tone === "primary" ? "default" : "secondary"}>
                        {details.subtitle}
                      </Badge>
                      <h3 className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
                        {details.title}
                      </h3>
                    </div>
                    <span className="question-index">
                      {level === "junior" ? "J" : "M"}
                    </span>
                  </div>

                  <p className="text-sm leading-7 text-muted-foreground">{details.description}</p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="surface-inset px-4 py-3">
                      <p className="editorial-kicker">Questions</p>
                      <p className="mt-2 font-display text-3xl font-semibold tracking-[-0.06em] text-foreground">
                        {isLoadingCounts ? "..." : `${questionCount}+`}
                      </p>
                    </div>
                    <div className="surface-inset px-4 py-3">
                      <p className="editorial-kicker">Categories</p>
                      <p className="mt-2 font-display text-3xl font-semibold tracking-[-0.06em] text-foreground">
                        {isLoadingCounts ? "..." : categoryCount}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap gap-3">
                    <Link href={`/tech/${techId}/questions/${level}`} className="flex-1 min-w-44">
                      <Button className="w-full">
                        <BookOpenText className="size-4" />
                        Open library
                      </Button>
                    </Link>
                    <Link href={`/tech/${techId}/test/${level}`} className="flex-1 min-w-44">
                      <Button variant="outline" className="w-full">
                        <ClipboardList className="size-4" />
                        Start timed test
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Surface>
    </AppShell>
  );
}
