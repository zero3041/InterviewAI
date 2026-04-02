import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Atom,
  Bookmark,
  BookOpenText,
  Code,
  Code2,
  Coffee,
  FileCode2,
  History,
  LayoutDashboard,
  LockKeyhole,
  Map,
  Server,
  Settings2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Link, useLocation } from "wouter";

type ShellNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  demo?: boolean;
};

const shellNavItems: ShellNavItem[] = [
  { href: "/", label: "Trang chủ", icon: Code2 },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, demo: true },
  { href: "/study-plan", label: "Lộ trình", icon: Map, demo: true },
  { href: "/history", label: "Lịch sử", icon: History },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/settings", label: "Thiết lập", icon: Settings2, demo: true },
];

const technologyIconMap: Record<string, LucideIcon> = {
  atom: Atom,
  coffee: Coffee,
  code: Code,
  "file-code": FileCode2,
  server: Server,
};

const technologyToneMap: Record<string, string> = {
  blue:
    "bg-[radial-gradient(circle_at_top,rgba(195,192,255,0.2),transparent_55%),linear-gradient(180deg,rgba(79,70,229,0.2),rgba(8,13,28,0.95))] text-[var(--primary)]",
  green:
    "bg-[radial-gradient(circle_at_top,rgba(94,234,212,0.16),transparent_55%),linear-gradient(180deg,rgba(16,185,129,0.16),rgba(8,13,28,0.95))] text-emerald-300",
  orange:
    "bg-[radial-gradient(circle_at_top,rgba(255,182,149,0.18),transparent_55%),linear-gradient(180deg,rgba(251,146,60,0.18),rgba(8,13,28,0.95))] text-[var(--tertiary)]",
  purple:
    "bg-[radial-gradient(circle_at_top,rgba(167,139,250,0.18),transparent_55%),linear-gradient(180deg,rgba(124,58,237,0.18),rgba(8,13,28,0.95))] text-violet-300",
  red:
    "bg-[radial-gradient(circle_at_top,rgba(252,165,165,0.18),transparent_55%),linear-gradient(180deg,rgba(239,68,68,0.18),rgba(8,13,28,0.95))] text-rose-300",
  slate:
    "bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.18),transparent_55%),linear-gradient(180deg,rgba(71,85,105,0.18),rgba(8,13,28,0.95))] text-slate-200",
};

function isActivePath(location: string, href: string) {
  if (href === "/") {
    return location === "/";
  }

  return location === href || location.startsWith(`${href}/`);
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "demo-pill inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.32em]",
        className
      )}
    >
      Demo
    </span>
  );
}

export function Surface({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section className={cn("surface-panel p-6 lg:p-7", className)} {...props}>
      {children}
    </section>
  );
}

type MetricTileProps = {
  label: string;
  value: string | number;
  caption?: string;
  icon?: LucideIcon;
  tone?: "primary" | "warm" | "success" | "neutral";
};

const metricToneMap = {
  primary:
    "bg-[linear-gradient(180deg,rgba(79,70,229,0.2),rgba(8,13,28,0.9))] text-[var(--primary)]",
  warm:
    "bg-[linear-gradient(180deg,rgba(255,182,149,0.2),rgba(8,13,28,0.9))] text-[var(--tertiary)]",
  success:
    "bg-[linear-gradient(180deg,rgba(45,212,191,0.2),rgba(8,13,28,0.9))] text-emerald-300",
  neutral:
    "bg-[linear-gradient(180deg,rgba(148,163,184,0.16),rgba(8,13,28,0.9))] text-slate-200",
} satisfies Record<NonNullable<MetricTileProps["tone"]>, string>;

export function MetricTile({
  label,
  value,
  caption,
  icon: Icon,
  tone = "primary",
}: MetricTileProps) {
  return (
    <div className="surface-inset flex h-full flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
          <div className="font-display text-3xl font-semibold tracking-[-0.06em] text-foreground">
            {value}
          </div>
        </div>
        {Icon ? (
          <span
            className={cn(
              "flex size-11 items-center justify-center rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
              metricToneMap[tone]
            )}
          >
            <Icon className="size-5" />
          </span>
        ) : null}
      </div>
      {caption ? <p className="text-sm leading-6 text-muted-foreground">{caption}</p> : null}
    </div>
  );
}

type AppShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  heroMeta?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function AppShell({
  eyebrow,
  title,
  description,
  actions,
  heroMeta,
  aside,
  children,
  className,
}: AppShellProps) {
  const [location] = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.26),transparent_45%),radial-gradient(circle_at_top_right,rgba(255,182,149,0.2),transparent_35%)]" />

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[rgba(4,9,22,0.72)] backdrop-blur-xl">
        <div className="container flex min-h-20 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-[1.25rem] bg-[radial-gradient(circle_at_top,rgba(195,192,255,0.3),transparent_55%),linear-gradient(135deg,#1a2550,#091125)] text-[var(--primary)] shadow-[0_22px_45px_rgba(79,70,229,0.22)]">
                <Code2 className="size-5" />
              </span>
              <div className="hidden sm:block">
                <p className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground">
                  Synthetix Code
                </p>
                <p className="font-display text-lg font-semibold tracking-[-0.04em] text-foreground">
                  Interview Platform
                </p>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-2 xl:flex">
            {shellNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(location, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-pill"
                  data-active={active ? "true" : "false"}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                  {item.demo ? <DemoBadge className="ml-1" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                <LockKeyhole className="size-4" />
                Đăng nhập
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">
                <Sparkles className="size-4" />
                Open Cockpit
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className={cn("container relative z-10 py-8 lg:py-10", className)}>
        <div className={cn("grid gap-6", aside && "xl:grid-cols-[minmax(0,1fr)_22rem]")}>
          <div className="space-y-6">
            <Surface className="surface-panel--hero overflow-hidden">
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl space-y-4">
                    {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
                    <h1 className="hero-title text-foreground">{title}</h1>
                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground lg:text-base">
                      {description}
                    </p>
                  </div>

                  {actions ? (
                    <div className="flex flex-wrap items-center gap-3 lg:max-w-sm lg:justify-end">
                      {actions}
                    </div>
                  ) : null}
                </div>

                {heroMeta ? <div className="grid gap-4 lg:grid-cols-3">{heroMeta}</div> : null}
              </div>
            </Surface>

            {children}
          </div>

          {aside ? <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">{aside}</aside> : null}
        </div>
      </main>
    </div>
  );
}

type TechnologyAvatarProps = {
  icon?: string;
  color?: string;
  className?: string;
};

export function TechnologyAvatar({
  icon = "code",
  color = "blue",
  className,
}: TechnologyAvatarProps) {
  const Icon = technologyIconMap[icon] ?? Code2;
  const tone = technologyToneMap[color] ?? technologyToneMap.blue;

  return (
    <span
      className={cn(
        "flex size-14 items-center justify-center rounded-[1.4rem] shadow-[0_20px_40px_rgba(2,6,23,0.32)]",
        tone,
        className
      )}
    >
      <Icon className="size-6" />
    </span>
  );
}

export function InlineStatus({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "primary" | "warm" | "success" | "neutral";
}) {
  return (
    <div className="surface-inset flex items-center justify-between gap-4 px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
          tone === "primary" && "bg-[rgba(79,70,229,0.18)] text-[var(--primary)]",
          tone === "warm" && "bg-[rgba(255,182,149,0.16)] text-[var(--tertiary)]",
          tone === "success" && "bg-[rgba(45,212,191,0.16)] text-emerald-300",
          tone === "neutral" && "bg-white/6 text-slate-200"
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function DashboardShortcut({
  href,
  icon: Icon,
  title,
  description,
  demo,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  demo?: boolean;
}) {
  return (
    <Link href={href} className="surface-inset group flex items-start gap-4 p-5 transition-transform duration-200 hover:-translate-y-1">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-[rgba(79,70,229,0.14)] text-[var(--primary)] transition-colors group-hover:bg-[rgba(79,70,229,0.22)]">
        <Icon className="size-5" />
      </span>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-semibold tracking-[-0.04em] text-foreground">
            {title}
          </h3>
          {demo ? <DemoBadge /> : null}
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
}

export const dashboardShortcuts = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    title: "Dashboard cá nhân",
    description: "Tổng quan session, tiến độ và chỉ số sẵn sàng theo chuẩn giao diện Stitch.",
    demo: true,
  },
  {
    href: "/study-plan",
    icon: Map,
    title: "Lộ trình học",
    description: "Trang demo cho flow study plan và review cadence khi backend chưa có planner.",
    demo: true,
  },
  {
    href: "/settings",
    icon: Settings2,
    title: "Thiết lập AI",
    description: "Trang demo cho preferences, scoring profile và command center configuration.",
    demo: true,
  },
  {
    href: "/login",
    icon: BookOpenText,
    title: "Đăng nhập",
    description: "Mô phỏng screen auth để hoàn thiện bộ screen Stitch trên frontend hiện tại.",
    demo: true,
  },
] as const;
