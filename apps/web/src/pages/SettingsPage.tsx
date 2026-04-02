import { AppShell, DemoBadge, InlineStatus, MetricTile, Surface } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/contexts/SessionContext";
import { apiFetch } from "@/lib/api";
import {
  Bot,
  Cpu,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRoundCog,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

type AIModel = {
  id: string;
  name: string;
  provider: string;
};

export default function SettingsPage() {
  const { sessionId } = useSession();
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [answerTone, setAnswerTone] = useState("direct");
  const [nickname, setNickname] = useState("Precision Candidate");

  useEffect(() => {
    async function loadModels() {
      try {
        const response = await apiFetch("/models");
        if (!response.ok) {
          return;
        }

        const data = await response.json();
        setModels(data.models ?? []);
        setSelectedModel(data.defaultModel ?? "");
      } catch {
        // Demo screen keeps working with empty model state.
      }
    }

    loadModels();
  }, []);

  return (
    <AppShell
      eyebrow="Settings Demo"
      title="Operator preferences for scoring, review style, and session posture."
      description="Đây là screen demo cho phần thiết lập tài khoản và AI workflow. UI đã sẵn để nối vào API preferences sau này, còn hiện tại giữ state cục bộ để hoàn thiện whole board Stitch."
      actions={
        <>
          <DemoBadge />
          <Link href="/dashboard">
            <Button variant="outline">
              <UserRoundCog className="size-4" />
              Dashboard
            </Button>
          </Link>
          <Button>
            <Sparkles className="size-4" />
            Save preview
          </Button>
        </>
      }
      heroMeta={
        <>
          <MetricTile
            label="Session identity"
            value={sessionId ? sessionId.slice(0, 8) : "Offline"}
            caption="Session ID hiện tại đang được frontend dùng để gắn lịch sử, bookmark và practice state."
            icon={ShieldCheck}
          />
          <MetricTile
            label="Default model"
            value={selectedModel || "Loading"}
            caption="Kéo trực tiếp từ backend `/models` để demo screen bám với stack mới."
            icon={Bot}
            tone="primary"
          />
          <MetricTile
            label="Mode"
            value="Demo UI"
            caption="Form này chưa persist server-side, nhưng layout và logic state đã sẵn."
            icon={SlidersHorizontal}
            tone="warm"
          />
        </>
      }
      aside={
        <>
          <Surface>
            <div className="space-y-4">
              <p className="editorial-kicker">Current posture</p>
              <InlineStatus label="Account backend" value="Pending" tone="warm" />
              <InlineStatus label="AI model registry" value="Live" tone="success" />
              <InlineStatus label="Preference persistence" value="Local only" tone="neutral" />
            </div>
          </Surface>
        </>
      }
    >
      <Surface>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="surface-inset space-y-4 p-5">
            <div className="flex items-center gap-2">
              <Cpu className="size-4 text-[var(--primary)]" />
              <p className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
                AI scoring defaults
              </p>
            </div>

            <div className="space-y-2">
              <label className="editorial-kicker">Primary model</label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn model mặc định" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name} · {model.provider}
                    </SelectItem>
                  ))}
                  {models.length === 0 ? (
                    <SelectItem value="demo-fallback">Demo fallback</SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="editorial-kicker">Feedback tone</label>
              <Select value={answerTone} onValueChange={setAnswerTone}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn style feedback" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct and strict</SelectItem>
                  <SelectItem value="balanced">Balanced reviewer</SelectItem>
                  <SelectItem value="mentor">Mentor mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="surface-inset space-y-4 p-5">
            <div className="flex items-center gap-2">
              <UserRoundCog className="size-4 text-[var(--tertiary)]" />
              <p className="font-display text-xl font-semibold tracking-[-0.05em] text-foreground">
                Candidate profile
              </p>
            </div>

            <div className="space-y-2">
              <label className="editorial-kicker">Display name</label>
              <Input value={nickname} onChange={(event) => setNickname(event.target.value)} />
            </div>

            <div className="surface-inset space-y-3 p-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Preview
                </span>
                <span className="text-sm text-muted-foreground">
                  How the scoring header will reference you
                </span>
              </div>
              <p className="font-display text-2xl font-semibold tracking-[-0.05em] text-foreground">
                {nickname}
              </p>
            </div>
          </div>
        </div>
      </Surface>
    </AppShell>
  );
}
