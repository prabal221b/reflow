"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { saveWorkStart, saveDailyCheckin } from "@/lib/actions/daily-log";
import { toast } from "sonner";
import { Brain, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function WorkdayClient() {
  const [firstStep, setFirstStep] = useState("");
  const [noScroll, setNoScroll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setIsStarted] = useState(false);

  // Daily check-in
  const [energy, setEnergy] = useState<number>(0);
  const [fog, setFog] = useState<string>("");
  const [sleepDuration, setSleepDuration] = useState<string>("");
  const [showCheckin, setShowCheckin] = useState(true);
  const [checkinDone, setCheckinDone] = useState(false);

  const router = useRouter();

  const handleCheckin = async () => {
    if (!energy && !fog && !sleepDuration) return;
    
    // Optimistic Update
    setCheckinDone(true);
    setShowCheckin(false);
    setIsSubmitting(true);

    const result = await saveDailyCheckin({
      sleep: sleepDuration ? { duration: sleepDuration } : undefined,
      energy: energy || undefined,
      fog: fog || undefined,
    });
    
    if (result.success) {
      toast.success("Check-in saved");
    } else {
      setCheckinDone(false);
      setShowCheckin(true);
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleWorkStart = async () => {
    if (!firstStep.trim()) {
      toast.error("Enter your first step");
      return;
    }
    
    // Optimistic Update
    setIsStarted(true);
    toast.success("Workday started. Let's go.");
    router.push("/focus");
    setIsSubmitting(true);

    const result = await saveWorkStart({ firstStep: firstStep.trim(), noScrollCommitment: noScroll });
    if (!result.success) {
      setIsStarted(false);
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="text-2xl font-semibold">Start Your Day</h1>
        <p className="mt-1 text-[var(--muted-foreground)]">
          A clean start prevents the scroll spiral.
        </p>
      </FadeIn>

      {/* Daily energy check-in */}
      {showCheckin && !checkinDone && (
        <FadeIn delay={0.1}>
          <Card>
            <CardContent className="py-5 space-y-4">
              <p className="text-sm font-medium">Quick energy check</p>

              <div className="space-y-2">
                <label className="text-xs text-[var(--muted-foreground)]">How&apos;d you sleep?</label>
                <div className="flex flex-wrap gap-1.5">
                  {["<5h", "5-6h", "6-7h", "7-8h", "8h+"].map((d) => (
                    <button key={d} onClick={() => setSleepDuration(d)} className={cn(
                      "rounded-lg px-3 py-1.5 text-xs transition-colors",
                      sleepDuration === d ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                    )}>{d}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[var(--muted-foreground)]">Energy level</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button key={v} onClick={() => setEnergy(v)} className={cn(
                      "flex-1 rounded-lg py-2 text-sm transition-colors",
                      energy === v ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                    )}>
                      {v <= 2 ? "🔋" : v <= 4 ? "⚡" : "🔥"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-[var(--muted-foreground)]">Mental fog</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { val: "none", label: "Clear" },
                    { val: "mild", label: "Mild fog" },
                    { val: "moderate", label: "Moderate" },
                    { val: "heavy", label: "Heavy fog" },
                  ].map((f) => (
                    <button key={f.val} onClick={() => setFog(f.val)} className={cn(
                      "rounded-lg px-3 py-1.5 text-xs transition-colors",
                      fog === f.val ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                    )}>{f.label}</button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowCheckin(false)}>Skip</Button>
                <Button size="sm" onClick={handleCheckin} disabled={isSubmitting}>Save check-in</Button>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Work start flow */}
      <FadeIn delay={0.2}>
        <Card>
          <CardContent className="py-5 space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.5} />
              <p className="text-sm font-medium">What&apos;s your first visible step?</p>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              Not a big goal. The smallest concrete action that starts your work.
            </p>
            <Input
              value={firstStep}
              onChange={(e) => setFirstStep(e.target.value)}
              placeholder="e.g., Open the design doc and read the first section"
              maxLength={200}
              autoFocus
            />

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={noScroll}
                onChange={(e) => setNoScroll(e.target.checked)}
                className="rounded border-[var(--border)] accent-[var(--primary)]"
              />
              <span className="text-sm text-[var(--muted-foreground)]">
                I&apos;ll try not to scroll before my first focus block
              </span>
            </label>

            <Button onClick={handleWorkStart} disabled={isSubmitting || !firstStep.trim()} className="w-full" size="lg">
              {isSubmitting ? "Starting..." : "Start workday"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
