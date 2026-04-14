"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Flame, Smartphone, X, Check, Timer } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PLATFORMS, PLATFORM_LABELS, TRIGGERS, TRIGGER_LABELS } from "@/lib/types";
import type { Platform, Trigger } from "@/lib/types";
import { logUrge, logRelapse } from "@/lib/actions/urge";
import { toast } from "sonner";

export function UrgeFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"select" | "urge" | "relapse" | "surfing">("select");
  const [selectedTrigger, setSelectedTrigger] = useState<Trigger | undefined>();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surfSeconds, setSurfSeconds] = useState(15);
  const router = useRouter();
  const surfTimerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = () => {
    setIsOpen(false);
    setMode("select");
    setSelectedTrigger(undefined);
    setSelectedPlatform(undefined);
    setSurfSeconds(15);
    if (surfTimerRef.current) clearInterval(surfTimerRef.current);
  };

  const startSurfing = () => {
    setMode("surfing");
    setSurfSeconds(15);
    surfTimerRef.current = setInterval(() => {
      setSurfSeconds((s) => {
        if (s <= 1) {
          if (surfTimerRef.current) clearInterval(surfTimerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleLogUrge = async () => {
    setIsSubmitting(true);
    const result = await logUrge({ trigger: selectedTrigger });
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Urge logged. You're building awareness.", { duration: 3000 });
      reset();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleLogRelapse = async () => {
    if (!selectedPlatform) return;
    setIsSubmitting(true);
    const result = await logRelapse({
      platform: selectedPlatform,
      estimatedDuration: 5,
      trigger: selectedTrigger,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast(result.data.recoveryMessage, {
        duration: 8000,
        action: {
          label: "3-min restart",
          onClick: () => router.push("/focus?rescue=true"),
        },
      });
      reset();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md" onClick={reset} />
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full shadow-2xl transition-all duration-500 origin-center",
          isOpen
            ? "bg-[var(--foreground)] text-[var(--background)] rotate-90 scale-110"
            : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:scale-110 active:scale-95"
        )}
      >
        {isOpen ? <X className="h-7 w-7" /> : <Flame className="h-7 w-7" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-28 right-6 z-50 w-[320px] overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[var(--card)] shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-6">
            {mode === "select" && (
              <div className="space-y-4">
                <p className="text-xl font-semibold tracking-tight">Pause & Observe</p>
                <div className="grid gap-3">
                  <Button
                    variant="default"
                    className="h-14 w-full justify-start rounded-2xl bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/10"
                    onClick={() => setMode("urge")}
                  >
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                      <Flame className="h-4 w-4 fill-current" />
                    </div>
                    <span>I feel an urge</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-14 w-full justify-start rounded-2xl hover:bg-rose-500/5 hover:text-rose-500 hover:border-rose-500/20"
                    onClick={() => setMode("relapse")}
                  >
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <span>I opened something</span>
                  </Button>
                </div>
              </div>
            )}

            {mode === "urge" && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <button onClick={() => setMode("select")} className="text-xs text-[var(--muted-foreground)] hover:underline">← Back</button>
                  <p className="text-xl font-semibold">Surf the urge?</p>
                </div>
                
                <p className="text-sm text-[var(--muted-foreground)]">
                  Wait 15 seconds. Let your brain recalibrate before you log it.
                </p>

                <div className="grid gap-3">
                  <Button className="h-12 w-full rounded-xl bg-[var(--primary)] shadow-lg" onClick={startSurfing}>
                    <Timer className="mr-2 h-4 w-4" />
                    Start Surfer (15s)
                  </Button>
                  <Button variant="ghost" className="h-10 w-full text-xs" onClick={handleLogUrge}>
                    Just log it
                  </Button>
                </div>

                <div className="pt-2">
                  <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Triggers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TRIGGERS.slice(0, 10).map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTrigger(selectedTrigger === t ? undefined : t)}
                        className={cn(
                          "rounded-lg px-2.5 py-1.5 text-[10px] transition-colors",
                          selectedTrigger === t
                            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                            : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                        )}
                      >
                        {TRIGGER_LABELS[t]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {mode === "surfing" && (
              <div className="py-10 text-center space-y-6">
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                  <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
                    <circle cx="48" cy="48" r="44" fill="none" stroke="var(--muted)" strokeWidth="4" />
                    <circle 
                      cx="48" cy="48" r="44" fill="none" stroke="var(--primary)" strokeWidth="4" 
                      strokeDasharray={276} strokeDashoffset={276 * (1 - surfSeconds / 15)}
                      className="transition-all duration-1000 ease-linear"
                    />
                  </svg>
                  <span className="text-4xl font-light tabular-nums">{surfSeconds}</span>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Stay with the breath</p>
                  <p className="text-xs text-[var(--muted-foreground)]">The dopamine spike is fading.</p>
                </div>
                {surfSeconds === 0 && (
                  <Button className="w-full animate-in zoom-in-95" onClick={handleLogUrge}>
                    <Check className="mr-2 h-4 w-4" />
                    Urge Conquered
                  </Button>
                )}
              </div>
            )}

            {mode === "relapse" && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <button onClick={() => setMode("select")} className="text-xs text-[var(--muted-foreground)] hover:underline">← Back</button>
                  <p className="text-xl font-semibold">Honest Check-in</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPlatform(p)}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-xs transition-colors",
                        selectedPlatform === p ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]" : "border-[var(--border)] hover:bg-[var(--accent)]"
                      )}
                    >
                      {PLATFORM_LABELS[p]}
                    </button>
                  ))}
                </div>
                {selectedPlatform && (
                  <Button onClick={handleLogRelapse} disabled={isSubmitting} className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white">
                    Confirm Relapse
                  </Button>
                )}
                <p className="text-[10px] text-center text-[var(--muted-foreground)]">Remember: It&apos;s data, not a judgement.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
