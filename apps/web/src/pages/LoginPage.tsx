import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  BrainCircuit,
  Code2,
  Eye,
  EyeOff,
  Github,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const workspaceBenefits = [
  {
    icon: BrainCircuit,
    title: "AI feedback có ngữ cảnh",
    description: "Chấm câu trả lời, chỉ rõ điểm mạnh và gợi ý vòng sửa tiếp theo.",
  },
  {
    icon: Trophy,
    title: "Dashboard tiến bộ",
    description: "Theo dõi điểm số, lịch sử luyện tập và các chủ đề cần ôn lại.",
  },
  {
    icon: Code2,
    title: "Question bank có cấu trúc",
    description: "Đi từ stack overview tới library và timed test trong cùng một flow.",
  },
];

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden flex-1 bg-[linear-gradient(135deg,#1f2a6b_0%,#111421_45%,#0a0c14_100%)] lg:flex lg:flex-col lg:justify-between lg:p-16">
        <div className="space-y-16">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white text-[#4f46e5] shadow-[0_18px_40px_rgba(255,255,255,0.16)]">
              <Sparkles className="size-5" />
            </span>
            <div>
              <p className="font-display text-2xl font-semibold tracking-[-0.05em] text-white">
                TechLab
              </p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/50">
                interview workspace
              </p>
            </div>
          </Link>

          <div className="max-w-xl space-y-10">
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/50">
                Luyện phỏng vấn kỹ thuật
              </p>
              <h1 className="font-display text-5xl font-semibold leading-[1.02] tracking-[-0.07em] text-white">
                Mở workspace để tiếp tục các vòng luyện tập của bạn
              </h1>
              <p className="text-base leading-8 text-white/65">
                Màn auth này dùng bố cục từ `techlab`, nhưng vẫn bám các route hiện có của app để
                bạn có thể vào dashboard, history và stack library ngay cả khi chưa có auth backend.
              </p>
            </div>

            <div className="space-y-6">
              {workspaceBenefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div key={benefit.title} className="flex gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white">
                      <Icon className="size-5" />
                    </span>
                    <div className="space-y-1">
                      <p className="text-lg font-semibold text-white">{benefit.title}</p>
                      <p className="text-sm leading-7 text-white/60">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.24em] text-white/35">
          <span>TechLab</span>
          <span className="size-1 rounded-full bg-white/15" />
          <span>Guest access enabled</span>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:w-[34rem] lg:px-10">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-4 text-center lg:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Workspace access
            </p>
            <div className="space-y-3">
              <h2 className="font-display text-4xl font-semibold tracking-[-0.06em] text-foreground">
                {isLogin ? "Chào mừng quay lại" : "Tạo hồ sơ luyện tập mới"}
              </h2>
              <p className="text-sm leading-7 text-muted-foreground">
                {isLogin
                  ? "Đăng nhập để tiếp tục dashboard, history và các stack bạn đang luyện."
                  : "Tạo hồ sơ để đồng bộ thói quen ôn tập, bookmark deck và model mặc định."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 justify-center">
              <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-12 justify-center">
              <Github className="size-4" />
              GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="h-px bg-white/8" />
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Hoặc tiếp tục với email
            </span>
          </div>

          <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
            {!isLogin ? (
              <div className="space-y-2">
                <label className="editorial-kicker">Tên hiển thị</label>
                <Input placeholder="TechLab Candidate" />
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="editorial-kicker">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-11" placeholder="name@example.com" type="email" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="editorial-kicker">Mật khẩu</label>
                {isLogin ? (
                  <button
                    type="button"
                    className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]"
                  >
                    Quên mật khẩu?
                  </button>
                ) : null}
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-11 pr-11"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/dashboard">
                <Button className="h-12 w-full justify-center text-sm font-semibold">
                  <ArrowRight className="size-4" />
                  {isLogin ? "Vào workspace" : "Tạo tài khoản"}
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="h-12 w-full justify-center text-sm font-semibold">
                  <ShieldCheck className="size-4" />
                  Tiếp tục dạng guest
                </Button>
              </Link>
            </div>
          </form>

          <div className="space-y-5">
            <button
              type="button"
              onClick={() => setIsLogin((value) => !value)}
              className="text-sm text-muted-foreground"
            >
              {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
              <span className="font-semibold text-[var(--primary)]">
                {isLogin ? "Đăng ký" : "Đăng nhập"}
              </span>
            </button>

            <div className="surface-inset space-y-3 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-[var(--primary)]" />
                <p className="text-sm font-semibold text-foreground">Trạng thái tích hợp</p>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Auth backend chưa được nối thật. CTA hiện dẫn vào dashboard/landing để bạn vẫn có
                thể đi xuyên suốt tất cả màn đã được tích hợp UI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
