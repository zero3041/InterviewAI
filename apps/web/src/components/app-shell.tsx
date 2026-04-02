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
};

const shellNavItems: ShellNavItem[] = [
  { href: "/", label: "Trang chủ", icon: Code2 },
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/study-plan", label: "Lộ trình", icon: Map },
  { href: "/history", label: "Lịch sử", icon: History },
  { href: "/bookmarks", label: "Đã lưu", icon: Bookmark },
  { href: "/settings", label: "Thiết lập", icon: Settings2 },
];

const topShellLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/study-plan", label: "Study plan" },
  { href: "/history", label: "History" },
  { href: "/settings", label: "Settings" },
] as const;

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
      Preview
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
  const activeNavItem = shellNavItems.find((item) => isActivePath(location, item.href)) ?? shellNavItems[0];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_24%),radial-gradient(circle_at_18%_18%,rgba(168,85,247,0.12),transparent_20%),radial-gradient(circle_at_88%_18%,rgba(16,185,129,0.08),transparent_18%),linear-gradient(180deg,#050813_0%,#090d18_38%,#0a0c14_100%)]" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/5 bg-[rgba(10,12,20,0.92)] px-6 py-7 xl:flex xl:flex-col">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#6366f1,#4f46e5)] text-white shadow-[0_18px_40px_rgba(79,70,229,0.28)]">
              <Code2 className="size-5" />
            </span>
            <div>
              <p className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
                TechLab
              </p>
              <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                Interview workspace
              </p>
            </div>
          </Link>

          <nav className="mt-10 space-y-2">
            {shellNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(location, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                    active
                      ? "bg-[rgba(99,102,241,0.14)] text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="surface-inset space-y-3 p-4">
              <p className="editorial-kicker">Workspace note</p>
              <p className="text-sm leading-6 text-muted-foreground">
                Shell này dùng UX của `techlab`, còn logic câu hỏi, lịch sử và AI scoring vẫn lấy từ app hiện tại.
              </p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full justify-center">
                <LockKeyhole className="size-4" />
                Workspace access
              </Button>
            </Link>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/5 bg-[rgba(10,12,20,0.78)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 xl:px-8">
              <div className="flex min-w-0 items-center gap-4">
                <Link href="/" className="flex items-center gap-3 xl:hidden">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#6366f1,#4f46e5)] text-white shadow-[0_14px_30px_rgba(79,70,229,0.24)]">
                    <Code2 className="size-4" />
                  </span>
                  <div>
                    <p className="font-display text-lg font-semibold tracking-[-0.04em] text-foreground">
                      TechLab
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                      interview prep
                    </p>
                  </div>
                </Link>

                <div className="hidden lg:block">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    TechLab navigation
                  </p>
                  <nav className="flex items-center gap-2">
                    {topShellLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="nav-pill"
                        data-active={isActivePath(location, item.href) ? "true" : "false"}
                      >
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="lg:hidden">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                    Active view
                  </p>
                  <p className="font-display text-lg font-semibold tracking-[-0.04em] text-foreground">
                    {activeNavItem.label}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    <BookOpenText className="size-4" />
                    All stacks
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="sm">
                    <Sparkles className="size-4" />
                    Open cockpit
                  </Button>
                </Link>
              </div>
            </div>

            <div className="border-t border-white/5 lg:hidden">
              <nav className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-6">
                {shellNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(location, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="nav-pill shrink-0"
                      data-active={active ? "true" : "false"}
                    >
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 xl:px-8">
            <div className={cn("mx-auto grid max-w-7xl gap-6", aside && "xl:grid-cols-[minmax(0,1fr)_22rem]", className)}>
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

              {aside ? (
                <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">{aside}</aside>
              ) : null}
            </div>
          </main>
        </div>
      </div>
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
    description: "Theo dõi session, điểm số và mức sẵn sàng phỏng vấn trong cùng workspace.",
    demo: true,
  },
  {
    href: "/study-plan",
    icon: Map,
    title: "Lộ trình học",
    description: "Cadence học theo tuần để đi từ ôn nền tảng đến mock interview có phản hồi.",
    demo: true,
  },
  {
    href: "/settings",
    icon: Settings2,
    title: "Thiết lập AI",
    description: "Chỉnh model mặc định, giọng phản hồi và các tuỳ chọn làm việc của bạn.",
    demo: true,
  },
  {
    href: "/login",
    icon: BookOpenText,
    title: "Workspace access",
    description: "Màn auth kiểu TechLab để mở dashboard hoặc chuyển sang chế độ guest.",
    demo: true,
  },
] as const;
