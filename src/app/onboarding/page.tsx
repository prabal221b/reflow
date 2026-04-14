"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { Zap, ChevronRight, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  PLATFORMS,
  PLATFORM_LABELS,
  TRIGGERS,
  TRIGGER_LABELS,
} from "@/lib/types";
import type { Platform, Trigger } from "@/lib/types";
import {
  saveOnboardingStep,
  skipOnboardingStep,
  completeOnboarding,
} from "@/lib/actions/onboarding";
import { toast } from "sonner";

const CONCERNS = [
  "Compulsive phone checking",
  "Can't start deep work",
  "Social media overuse",
  "Task switching",
  "Poor focus after 30 seconds",
  "Sleep disruption from screens",
  "Morning scroll habit",
  "General overwhelm",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Step 0: Welcome
  const [name, setName] = useState("");
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);

  // Step 1: Work pattern
  const [workPattern, setWorkPattern] = useState<string>("");
  const [peakFocus, setPeakFocus] = useState<string>("");
  const [worstFocus, setWorstFocus] = useState<string>("");

  // Step 2: Social
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [dailyUsage, setDailyUsage] = useState(3);
  const [triggers, setTriggers] = useState<Trigger[]>([]);

  // Step 3: Sleep
  const [sleepHours, setSleepHours] = useState(7);
  const [phoneInBed, setPhoneInBed] = useState<boolean | undefined>();
  const [morningEnergy, setMorningEnergy] = useState<string>("");

  const totalSteps = 5;
  const progress = ((step + 1) / totalSteps) * 100;

  const togglePlatform = (p: Platform) => {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const toggleTrigger = (t: Trigger) => {
    setTriggers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const toggleConcern = (c: string) => {
    setSelectedConcerns((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const handleNext = async () => {
    const previousStep = step;
    let isLastStep = false;
    
    // Validate current step before optimistic jump
    if (step === 0 && (!name.trim() || selectedConcerns.length === 0)) {
      toast.error("Please enter your name and select at least one concern");
      return;
    }

    // Optimistic Update (for non-final steps)
    if (step < 4) {
      setStep((s) => s + 1);
    } else {
      setIsSubmitting(true);
    }

    try {
      switch (step) {
        case 0:
          await saveOnboardingStep("welcome", { name: name.trim() });
          break;
        case 1:
          if (workPattern) {
            await saveOnboardingStep("work", { workPattern, peakFocus, worstFocus });
          } else {
            await skipOnboardingStep("work");
          }
          break;
        case 2:
          if (platforms.length > 0) {
            await saveOnboardingStep("social", {
              platforms,
              dailyUsageHours: dailyUsage,
              triggers,
            });
          } else {
            await skipOnboardingStep("social");
          }
          break;
        case 3:
          if (morningEnergy) {
            await saveOnboardingStep("sleep", {
              avgSleepHours: sleepHours,
              phoneInBed,
              morningEnergy,
            });
          } else {
            await skipOnboardingStep("sleep");
          }
          break;
        case 4: {
          const result = await completeOnboarding();
          if (result.success) {
            isLastStep = true;
            router.push("/dashboard");
          } else {
            toast.error(result.error);
            setIsSubmitting(false);
          }
          break;
        }
      }
    } catch (err) {
      console.error("Onboarding error:", err);
      toast.error("Something went wrong. Reverting step.");
      setStep(previousStep);
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    const stepNames = ["welcome", "work", "social", "sleep", "plan"];
    if (step > 0 && step < 4) {
      await skipOnboardingStep(stepNames[step]);
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--primary)]">
            <Zap className="h-4 w-4 text-[var(--primary-foreground)]" strokeWidth={2} />
          </div>
          <span className="text-lg font-semibold">Reflow</span>
        </div>

        <Progress value={progress} className="mb-8" />

        {/* Step 0: Welcome */}
        {step === 0 && (
          <FadeIn>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">Hey there 👋</h2>
                <p className="mt-2 text-[var(--muted-foreground)]">
                  Let&apos;s get a few things set up. This takes about 2 minutes.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">What should we call you?</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your first name"
                  autoFocus
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  What brought you here? <span className="text-[var(--muted-foreground)]">(select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CONCERNS.map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleConcern(c)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                        selectedConcerns.includes(c)
                          ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                          : "border-[var(--border)] hover:bg-[var(--accent)]"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Step 1: Work Pattern */}
        {step === 1 && (
          <FadeIn>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">Your work pattern</h2>
                <p className="mt-2 text-[var(--muted-foreground)]">
                  This helps us suggest focus blocks at the right times.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Work schedule</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "nine_to_five", label: "9 to 5" },
                    { val: "flexible", label: "Flexible" },
                    { val: "shift", label: "Shift work" },
                    { val: "student", label: "Student" },
                  ].map((o) => (
                    <button
                      key={o.val}
                      onClick={() => setWorkPattern(o.val)}
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm transition-colors",
                        workPattern === o.val
                          ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                          : "border-[var(--border)] hover:bg-[var(--accent)]"
                      )}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Best focus time</label>
                  <div className="space-y-1.5">
                    {["morning", "afternoon", "evening"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setPeakFocus(t)}
                        className={cn(
                          "w-full rounded-xl border px-3 py-2 text-sm capitalize transition-colors",
                          peakFocus === t
                            ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                            : "border-[var(--border)] hover:bg-[var(--accent)]"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Worst focus time</label>
                  <div className="space-y-1.5">
                    {["morning", "afternoon", "evening"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setWorstFocus(t)}
                        className={cn(
                          "w-full rounded-xl border px-3 py-2 text-sm capitalize transition-colors",
                          worstFocus === t
                            ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                            : "border-[var(--border)] hover:bg-[var(--accent)]"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Step 2: Social media */}
        {step === 2 && (
          <FadeIn>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">Social media habits</h2>
                <p className="mt-2 text-[var(--muted-foreground)]">
                  We won&apos;t judge. Honest answers help us help you better.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Which platforms do you use?</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => (
                    <button
                      key={p}
                      onClick={() => togglePlatform(p)}
                      className={cn(
                        "rounded-xl border px-3 py-2 text-sm transition-colors",
                        platforms.includes(p)
                          ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                          : "border-[var(--border)] hover:bg-[var(--accent)]"
                      )}
                    >
                      {PLATFORM_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Estimated daily usage: <strong>{dailyUsage}h</strong>
                </label>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={0.5}
                  value={dailyUsage}
                  onChange={(e) => setDailyUsage(parseFloat(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
                  <span>0h</span>
                  <span>6h</span>
                  <span>12h</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Common triggers</label>
                <div className="flex flex-wrap gap-1.5">
                  {TRIGGERS.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTrigger(t)}
                      className={cn(
                        "rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                        triggers.includes(t)
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
          </FadeIn>
        )}

        {/* Step 3: Sleep & Energy */}
        {step === 3 && (
          <FadeIn>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">Sleep & energy</h2>
                <p className="mt-2 text-[var(--muted-foreground)]">
                  This helps us understand your good and bad days.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Average sleep: <strong>{sleepHours}h</strong>
                </label>
                <input
                  type="range"
                  min={3}
                  max={10}
                  step={0.5}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone in bed?</label>
                <div className="flex gap-2">
                  {[true, false].map((v) => (
                    <button
                      key={String(v)}
                      onClick={() => setPhoneInBed(v)}
                      className={cn(
                        "flex-1 rounded-xl border px-3 py-2.5 text-sm transition-colors",
                        phoneInBed === v
                          ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                          : "border-[var(--border)] hover:bg-[var(--accent)]"
                      )}
                    >
                      {v ? "Yes" : "No"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Morning energy level</label>
                <div className="flex gap-2">
                  {["low", "medium", "high"].map((e) => (
                    <button
                      key={e}
                      onClick={() => setMorningEnergy(e)}
                      className={cn(
                        "flex-1 rounded-xl border px-3 py-2.5 text-sm capitalize transition-colors",
                        morningEnergy === e
                          ? "border-[var(--primary)] bg-[var(--primary)]/5 text-[var(--primary)]"
                          : "border-[var(--border)] hover:bg-[var(--accent)]"
                      )}
                    >
                      {e === "low" ? "🔋 Low" : e === "medium" ? "⚡ Medium" : "🔥 High"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Step 4: Plan Review */}
        {step === 4 && (
          <FadeIn>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">Your starting plan</h2>
                <p className="mt-2 text-[var(--muted-foreground)]">
                  We&apos;ve set up defaults based on your answers. You can change anything later.
                </p>
              </div>
              <Card>
                <CardContent className="space-y-4 pt-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Focus block length</span>
                    <span className="text-sm font-medium">
                      {dailyUsage >= 5 ? "5 min" : dailyUsage >= 3 ? "8 min" : "10 min"}
                    </span>
                  </div>
                  <div className="h-px bg-[var(--border)]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Daily target</span>
                    <span className="text-sm font-medium">
                      {morningEnergy === "low" ? "2 blocks" : morningEnergy === "high" ? "4 blocks" : "3 blocks"}
                    </span>
                  </div>
                  <div className="h-px bg-[var(--border)]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Progression</span>
                    <span className="text-sm font-medium">Auto (gradual)</span>
                  </div>
                  <div className="h-px bg-[var(--border)]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Social windows</span>
                    <span className="text-sm font-medium">2–3 per day suggested</span>
                  </div>
                </CardContent>
              </Card>
              <p className="text-xs text-[var(--muted-foreground)] text-center">
                Starting small is the strategy. We&apos;ll build up together.
              </p>
            </div>
          </FadeIn>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between">
          {step > 0 && step < 4 ? (
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <SkipForward className="mr-1 h-4 w-4" />
              Skip
            </Button>
          ) : (
            <div />
          )}
          <Button onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : step === 4
              ? "Start using Reflow"
              : "Continue"}
            {!isSubmitting && step < 4 && <ChevronRight className="ml-1 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
