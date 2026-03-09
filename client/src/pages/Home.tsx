import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Code2, BookOpen, Zap, Target } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <Code2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Java Spring Boot Interview Guide</h1>
            </div>
            <Link href="/bookmarks">
              <Button variant="outline" size="sm" className="border-slate-200">
                📌 Bookmarks
              </Button>
            </Link>
          </div>
          <p className="text-slate-600">Comprehensive reference for interview preparation</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Master Java Spring Boot Interviews</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore 850+ carefully curated interview questions spanning Junior and Middle developer levels. 
            Search, filter, and learn at your own pace.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">850+</div>
                <p className="text-slate-600">Interview Questions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">2</div>
                <p className="text-slate-600">Experience Levels</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">12+</div>
                <p className="text-slate-600">Topic Categories</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Junior Level */}
          <Link href="/questions/junior">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-slate-200 h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-xl">Junior Developer</CardTitle>
                </div>
                <CardDescription>1 Year Experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Master the fundamentals of Java Core, Spring Boot basics, SQL, and essential development tools.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BookOpen className="w-4 h-4" />
                    <span>390+ Questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Zap className="w-4 h-4" />
                    <span>5 Categories</span>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Middle Level */}
          <Link href="/questions/middle">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow border-slate-200 h-full">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-emerald-600" />
                  <CardTitle className="text-xl">Middle Developer</CardTitle>
                </div>
                <CardDescription>2+ Years Experience</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 mb-4">
                  Deep dive into advanced topics: Microservices, Security, Performance, System Design, and more.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <BookOpen className="w-4 h-4" />
                    <span>460+ Questions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Zap className="w-4 h-4" />
                    <span>7 Categories</span>
                  </div>
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">🔍 Full-Text Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Instantly search across all questions to find exactly what you need.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">📂 Organized by Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Questions are neatly categorized by Java Core, Spring, Database, and more.
              </p>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">⭐ Bookmark Favorites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Save important questions for quick reference during your preparation.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <p className="text-center text-slate-600 text-sm">
            © 2026 Java Spring Boot Interview Guide. Comprehensive interview preparation resource.
          </p>
        </div>
      </footer>
    </div>
  );
}
