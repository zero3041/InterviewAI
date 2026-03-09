import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Link } from "wouter";
import { Code2, BookOpen, Zap, Coffee, Atom, FileCode2, Code, History, Server } from "lucide-react";
import { useTechnologies, type Technology } from "@/hooks/useQuestionsApi";

const iconMap: Record<string, React.ElementType> = {
  coffee: Coffee,
  atom: Atom,
  "file-code": FileCode2,
  code: Code,
  server: Server,
  zap: Zap,
};

const colorMap: Record<string, string> = {
  blue: "text-blue-600 bg-blue-100",
  green: "text-green-600 bg-green-100",
  purple: "text-purple-600 bg-purple-100",
  orange: "text-orange-600 bg-orange-100",
  red: "text-red-600 bg-red-100",
  slate: "text-slate-600 bg-slate-100",
};

export default function Home() {
  const { technologies, isLoading, error } = useTechnologies();
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Fetch total questions count
  useEffect(() => {
    async function fetchQuestionCounts() {
      let total = 0;
      for (const tech of technologies) {
        for (const level of tech.levels) {
          try {
            const response = await fetch(`/api/technologies/${tech.id}/questions?level=${level}`);
            if (response.ok) {
              const data = await response.json();
              total += data.totalQuestions || 0;
            }
          } catch {
            // Ignore errors
          }
        }
      }
      setTotalQuestions(total);
    }

    if (technologies.length > 0) {
      fetchQuestionCounts();
    }
  }, [technologies]);

  const totalTechnologies = technologies.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <Code2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Interview Prep Guide</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/history">
                <Button variant="outline" size="sm" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                  <History className="w-4 h-4 mr-1" />
                  Lịch sử
                </Button>
              </Link>
              <Link href="/bookmarks">
                <Button variant="outline" size="sm" className="border-slate-200">
                  📌 Bookmarks
                </Button>
              </Link>
            </div>
          </div>
          <p className="text-slate-600">Ôn tập phỏng vấn với AI chấm điểm</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Chuẩn Bị Phỏng Vấn Hiệu Quả</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Học và làm test với {totalQuestions}+ câu hỏi phỏng vấn. AI sẽ chấm điểm và đưa ra gợi ý chi tiết.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{totalQuestions}+</div>
                <p className="text-slate-600">Câu hỏi phỏng vấn</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">{totalTechnologies}</div>
                <p className="text-slate-600">Công nghệ</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">AI</div>
                <p className="text-slate-600">Chấm điểm tự động</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technologies */}
        <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Chọn công nghệ</h3>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner className="w-8 h-8" />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {technologies.map((tech) => {
              const Icon = iconMap[tech.icon] || Code2;
              const colorClass = colorMap[tech.color] || "text-blue-600 bg-blue-100";

              return (
                <Link key={tech.id} href={`/tech/${tech.id}`}>
                  <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 border-slate-200 h-full">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${colorClass} flex items-center justify-center mb-3`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl">{tech.name}</CardTitle>
                      <CardDescription>{tech.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <BookOpen className="w-4 h-4" />
                        <span>{tech.levels.length} cấp độ</span>
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Bắt đầu →
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">🎯 Làm Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Làm bài test 20 câu ngẫu nhiên, AI chấm điểm và phân tích chi tiết.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">📚 Học theo chủ đề</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Câu hỏi được phân loại theo chủ đề, dễ dàng ôn tập từng phần.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">🤖 AI Chấm điểm</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Trả lời và nhận feedback ngay từ AI với nhiều model để chọn.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <p className="text-center text-slate-600 text-sm">
            © 2026 Interview Prep Guide. Ôn tập phỏng vấn hiệu quả với AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
