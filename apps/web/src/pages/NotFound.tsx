import { AppShell, Surface } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <AppShell
      eyebrow="404"
      title="This route is outside the mapped interview board."
      description="Route này chưa tồn tại trong app hoặc path đang bị sai. Màn 404 vẫn dùng cùng shell của TechLab để không làm gãy trải nghiệm."
      actions={
        <>
          <Link href="/dashboard">
            <Button variant="outline">
              <Sparkles className="size-4" />
              Dashboard
            </Button>
          </Link>
          <Button onClick={() => setLocation("/")}>
            <Home className="size-4" />
            Go Home
          </Button>
        </>
      }
    >
      <Surface>
        <div className="surface-inset flex flex-col items-center gap-5 p-10 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-[rgba(251,113,133,0.16)] text-rose-200">
            <AlertCircle className="size-8" />
          </span>
          <div className="space-y-3">
            <p className="font-display text-5xl font-semibold tracking-[-0.08em] text-foreground">404</p>
            <p className="text-sm leading-7 text-muted-foreground">
              Page not found. Hãy quay lại trang chủ hoặc mở dashboard để tiếp tục trong workspace hiện tại.
            </p>
          </div>
        </div>
      </Surface>
    </AppShell>
  );
}
