"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { PlatformIcon } from "@/components/shared/platform-icon";
import { PLATFORMS, PLATFORM_LABELS, TRIGGERS, TRIGGER_LABELS } from "@/lib/types";
import type { Platform, Trigger } from "@/lib/types";
import { logUrge, logRelapse } from "@/lib/actions/urge";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { Flame, Smartphone, Heart } from "lucide-react";

export default function UrgePage() {
  const [mode, setMode] = useState<"select" | "urge" | "relapse" | "done">("select");
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | undefined>();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | undefined>();
  const [duration, setDuration] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const router = useRouter();

  const handleLogUrge = async () => {
    // Optimistic Update
    toast.success("Urge logged. Awareness is power.");
    router.push("/dashboard");
    setIsSubmitting(true);

    const result = await logUrge({ trigger: selectedTrigger });
    if (!result.success) {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleLogRelapse = async () => {
    if (!selectedPlatform) return;
    const previousMode = mode;
    
    // Optimistic Update
    setMode("done");
    setRecoveryMessage("One moment while we prepare your recovery reflection...");
    setIsSubmitting(true);

    const result = await logRelapse({
      platform: selectedPlatform,
      estimatedDuration: duration,
      trigger: selectedTrigger,
    });

    if (result.success) {
      setRecoveryMessage(result.data.recoveryMessage);
    } else {
      setMode(previousMode);
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="text-2xl font-semibold">
          {mode === "done" ? "Recovery" : "What happened?"}
        </h1>
      </FadeIn>

      {/* Selection */}
      {mode === "select" && (
        <FadeIn>
          <div className="space-y-3">
            <button
              onClick={() => setMode("urge")}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-left hover:bg-[var(--accent)]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Flame className="h-6 w-6 text-[var(--warning)]" strokeWidth={1.5} />
                <div>
                  <p className="font-medium">I felt an urge</p>
                  <p className="text-sm text-[var(--muted-foreground)]">I resisted but want to log it</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => setMode("relapse")}
              className="w-full rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-left hover:bg-[var(--accent)]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Smartphone className="h-6 w-6 text-[var(--muted-foreground)]" strokeWidth={1.5} />
                <div>
                  <p className="font-medium">I opened something</p>
                  <p className="text-sm text-[var(--muted-foreground)]">Unplanned social media use</p>
                </div>
              </div>
            </button>
          </div>
        </FadeIn>
      )}

      {/* Urge logging */}
      {mode === "urge" && (
        <FadeIn>
          <Card>
            <CardContent className="py-5 space-y-4">
              <p className="text-sm font-medium">What triggered it?</p>
              <div className="flex flex-wrap gap-2">
                {TRIGGERS.map((t) => (
                  <button key={t} onClick={() => setSelectedTrigger(selectedTrigger === t ? undefined : t)} className={cn(
                    "rounded-xl border px-3 py-2 text-sm transition-colors",
                    selectedTrigger === t ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]" : "border-[var(--border)] hover:bg-[var(--accent)]"
                  )}>
                    {TRIGGER_LABELS[t]}
                  </button>
                ))}
              </div>
              <Button onClick={handleLogUrge} disabled={isSubmitting} className="w-full" size="lg">
                {isSubmitting ? "Logging..." : "Log urge"}
              </Button>
              <p className="text-xs text-center text-[var(--muted-foreground)]">
                You resisted. That counts.
              </p>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Relapse logging */}
      {mode === "relapse" && (
        <FadeIn>
          <Card>
            <CardContent className="py-5 space-y-4">
              <p className="text-sm font-medium">Which app did you open?</p>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => (
                  <button key={p} onClick={() => setSelectedPlatform(p)} className={cn(
                    "flex items-center gap-2 rounded-xl border p-3 text-sm transition-colors",
                    selectedPlatform === p ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-[var(--border)] hover:bg-[var(--accent)]"
                  )}>
                    <PlatformIcon platform={p} size={18} />
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>

              {selectedPlatform && (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">About how long?</p>
                    <div className="flex gap-2">
                      {[1, 5, 10, 15, 30].map((d) => (
                        <button key={d} onClick={() => setDuration(d)} className={cn(
                          "flex-1 rounded-lg py-2 text-sm transition-colors",
                          duration === d ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                        )}>{d}m</button>
                      ))}
                    </div>
                  </div>

                  <p className="text-sm font-medium">Trigger? (optional)</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TRIGGERS.slice(0, 8).map((t) => (
                      <button key={t} onClick={() => setSelectedTrigger(selectedTrigger === t ? undefined : t)} className={cn(
                        "rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                        selectedTrigger === t ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                      )}>
                        {TRIGGER_LABELS[t]}
                      </button>
                    ))}
                  </div>

                  <Button onClick={handleLogRelapse} disabled={isSubmitting} className="w-full" size="lg">
                    {isSubmitting ? "Logging..." : "Log & recover"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Recovery */}
      {mode === "done" && (
        <FadeIn>
          <div className="text-center space-y-6 py-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
              <Heart className="h-8 w-8 text-[var(--primary)]" strokeWidth={1.5} />
            </div>
            <Card>
              <CardContent className="py-6">
                <p className="text-sm leading-relaxed">{recoveryMessage}</p>
              </CardContent>
            </Card>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>Dashboard</Button>
              <Button onClick={() => router.push("/focus?rescue=true")}>
                🔥 3-min rescue block
              </Button>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
