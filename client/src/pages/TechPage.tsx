import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ChevronLeft, BookOpen, Zap, Target, ClipboardList } from "lucide-react";
import { useTechnologies } from "@/hooks/useQuestionsApi";

export default function TechPage() {
  const { techId } = useParams<{ techId: string }>();
  const { technologies, isLoading: techLoading, error: techError } = useTechnologies();
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  const tech = technologies.find((t) => t.id === techId);

  // Fetch question counts for each level
  useEffect(() => {
    async function fetchCounts() {
      if (!tech) return;
      
      setIsLoadingCounts(true);
      const qCounts: Record<string, number> = {};
      const cCounts: Record<string, number> = {};

      for (const level of tech.levels) {
        try {
          const response = await fetch(`/api/technologies/${techId}/questions?level=${level}`);
          if (response.ok) {
            const data = await response.json();
            qCounts[level] = data.totalQuestions || 0;
            cCounts[level] = Object.keys(data.categories || {}).length;
          }
        } catch {
          qCounts[level] = 0;
          cCounts[level] = 0;
        }
      }

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
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!tech || techError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="border-slate-200">
          <CardContent className="pt-6">
            <p className="text-slate-600 mb-4">Technology not found</p>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const levelInfo = {
    junior: {
      title: "Junior Developer",
      subtitle: "1-2 năm kinh nghiệm",
      description: "Nắm vững nền tảng cơ bản và các khái niệm thiết yếu.",
      icon: Target,
      color: "blue",
    },
    middle: {
      title: "Middle Developer",
      subtitle: "2+ năm kinh nghiệm",
      description: "Đi sâu vào các chủ đề nâng cao và best practices.",
      icon: Zap,
      color: "emerald",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" />
                Trang chủ
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{tech.name}</h1>
          <p className="text-slate-600">{tech.description}</p>
        </div>
      </header>

      {/* Content */}
      <section className="container max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Chọn cấp độ</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tech.levels.map((level) => {
            const info = levelInfo[level as keyof typeof levelInfo];
            if (!info) return null;

            const Icon = info.icon;
            const questionCount = questionCounts[level] || 0;
            const categoryCount = categoryCounts[level] || 0;

            return (
              <Card key={level} className="border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-5 h-5 text-${info.color}-600`} />
                    <CardTitle className="text-xl">{info.title}</CardTitle>
                  </div>
                  <CardDescription>{info.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-4">{info.description}</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <BookOpen className="w-4 h-4" />
                      {isLoadingCounts ? (
                        <Spinner className="w-4 h-4" />
                      ) : (
                        <span>{questionCount}+ câu hỏi</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Zap className="w-4 h-4" />
                      {isLoadingCounts ? (
                        <Spinner className="w-4 h-4" />
                      ) : (
                        <span>{categoryCount} danh mục</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/tech/${techId}/questions/${level}`} className="flex-1">
                      <Button className={`w-full bg-${info.color}-600 hover:bg-${info.color}-700`}>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Học
                      </Button>
                    </Link>
                    <Link href={`/tech/${techId}/test/${level}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Làm Test
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
