import { AppShell, DemoBadge, MetricTile, Surface } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Link } from "wouter";

export default function LoginPage() {
  return (
    <AppShell
      eyebrow="Auth Demo"
      title="Access the interview cockpit with a dark editorial sign-in flow."
      description="Screen đăng nhập này hiện là demo UI để phủ đủ board Stitch. Khi auth backend có mặt, phần form này chỉ cần nối action thật thay vì rewrite visual."
      actions={
        <>
          <DemoBadge />
          <Link href="/dashboard">
            <Button variant="outline">
              <ShieldCheck className="size-4" />
              Continue as guest
            </Button>
          </Link>
        </>
      }
      heroMeta={
        <>
          <MetricTile
            label="Mode"
            value="Demo"
            caption="No credential validation yet, but interaction hierarchy is production-shaped."
            icon={LockKeyhole}
          />
          <MetricTile
            label="Session routing"
            value="Ready"
            caption="Guest flow can already move vào dashboard và practice routes hiện có."
            icon={ShieldCheck}
            tone="success"
          />
          <MetricTile
            label="Visual parity"
            value="Stitch-aligned"
            caption="Typography, tonal layering và CTA language đã match với design system mới."
            icon={Sparkles}
            tone="warm"
          />
        </>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_0.85fr]">
        <Surface>
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="editorial-kicker">Operator access</p>
              <h2 className="text-2xl font-semibold text-foreground">
                Sign in or continue into the lab
              </h2>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="editorial-kicker">Email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-11" placeholder="candidate@precisionlab.dev" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="editorial-kicker">Password</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-11" placeholder="••••••••••" type="password" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button>
                  <UserRound className="size-4" />
                  Enter cockpit
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to stacks</Button>
              </Link>
            </div>
          </div>
        </Surface>

        <Surface>
          <div className="space-y-4">
            <span className="rounded-full bg-white/7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Why this screen exists
            </span>
            <p className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
              Whole-board visual consistency before auth lands
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              Stitch có screen đăng nhập riêng. Thay vì để board bị hẫng, route này đóng vai trò façade để frontend có đủ nhịp kể chuyện sản phẩm ngay từ bây giờ.
            </p>
          </div>
        </Surface>
      </div>
    </AppShell>
  );
}
