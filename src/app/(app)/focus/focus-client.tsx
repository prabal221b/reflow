"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { useTimer } from "@/lib/hooks/use-timer";
import { useLocalBackup } from "@/lib/hooks/use-local-backup";
import { formatTimer } from "@/lib/utils/time";
import {
  startFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  completeFocusSession,
  cancelFocusSession,
} from "@/lib/actions/focus";
import { RESCUE_BLOCK_DURATIONS } from "@/lib/constants";
import {
  Play,
  Pause,
  Square,
  Check,
  RotateCcw,
  Target,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

type Phase = "launcher" | "pre_focus" | "active" | "post_focus" | "complete";

interface ActiveSessionData {
  id: string;
  status: string;
  type: string;
  startedAt: string;
  plannedDuration: number;
  pausedDuration: number;
  task?: string;
}

export function FocusClient({
  focusInterval,
  activeSession: initialSession,
}: {
  focusInterval: number;
  activeSession: ActiveSessionData | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRescue = searchParams.get("rescue") === "true";

  const { save, remove } = useLocalBackup();

  const [phase, setPhase] = useState<Phase>(initialSession ? "active" : "launcher");
  const [selectedDuration, setSelectedDuration] = useState(isRescue ? 3 : focusInterval);
  const [task, setTask] = useState(initialSession?.task || "");
  const [session, setSession] = useState<ActiveSessionData | null>(initialSession);
  const [isPaused, setIsPaused] = useState(initialSession?.status === "paused");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState<string>("");
  const [note, setNote] = useState("");
  const [sessionType, setSessionType] = useState<"regular" | "rescue">(
    isRescue ? "rescue" : "regular"
  );

  // beforeunload warning during active session
  useEffect(() => {
    if (phase === "active") {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
      };
      window.addEventListener("beforeunload", handler);
      return () => window.removeEventListener("beforeunload", handler);
    }
  }, [phase]);

  const handleStart = async () => {
    const previousPhase = phase;
    const previousSession = session;
    
    // Optimistic Update
    const tempSession: ActiveSessionData = {
      id: "temp_session",
      status: "active",
      type: sessionType,
      startedAt: new Date().toISOString(),
      plannedDuration: selectedDuration * 60,
      pausedDuration: 0,
      task: task.trim() || undefined,
    };
    
    setPhase("active");
    setSession(tempSession);
    setIsSubmitting(true);

    const result = await startFocusSession({
      duration: selectedDuration,
      task: task.trim() || undefined,
      type: sessionType,
    });

    if (result.success) {
      // Sync with real data
      const realSession: ActiveSessionData = {
        ...tempSession,
        id: result.data.sessionId,
        startedAt: result.data.startedAt,
      };
      setSession(realSession);
      save("activeSession", { id: result.data.sessionId, startedAt: result.data.startedAt });
    } else {
      // Rollback
      setPhase(previousPhase);
      setSession(previousSession);
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handlePause = async () => {
    if (!session) return;
    const previousPaused = isPaused;
    
    // Optimistic Update
    setIsPaused(true);
    
    const result = await pauseFocusSession({ sessionId: session.id });
    if (!result.success) {
      setIsPaused(previousPaused);
      toast.error(result.error);
    }
  };

  const handleResume = async () => {
    if (!session) return;
    const previousPaused = isPaused;
    
    // Optimistic Update
    setIsPaused(false);
    
    const result = await resumeFocusSession({ sessionId: session.id });
    if (!result.success) {
      setIsPaused(previousPaused);
      toast.error(result.error);
    }
  };

  const handleTimerComplete = () => {
    setPhase("post_focus");
  };

  const handleComplete = async () => {
    if (!session || !selectedRating) return;
    const previousPhase = phase;
    
    // Optimistic Update
    setPhase("complete");
    remove("activeSession");
    setIsSubmitting(true);

    const result = await completeFocusSession({
      sessionId: session.id,
      rating: selectedRating as "great" | "okay" | "struggled" | "interrupted",
      note: note.trim() || undefined,
    });

    if (result.success) {
      toast.success("Session complete. Well done.", { duration: 3000 });
    } else {
      setPhase(previousPhase);
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleCancel = async () => {
    if (!session) return;
    const previousPhase = phase;
    const previousSession = session;

    // Optimistic Update
    setPhase("launcher");
    setSession(null);
    remove("activeSession");

    const result = await cancelFocusSession({ sessionId: session.id });
    if (!result.success) {
      setPhase(previousPhase);
      setSession(previousSession);
      toast.error(result.error);
    }
  };

  const durationOptions = sessionType === "rescue"
    ? [...RESCUE_BLOCK_DURATIONS]
    : [5, 8, 10, 15, 20, 25, 30];

  return (
    <div className="space-y-6">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center gap-3">
          {phase !== "launcher" && phase !== "active" && (
            <button aria-label="Go back" onClick={() => { setPhase("launcher"); setSession(null); }} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-2xl font-semibold">
            {sessionType === "rescue" ? "Rescue Block" : "Focus Session"}
          </h1>
        </div>
      </FadeIn>

      {/* LAUNCHER PHASE */}
      {phase === "launcher" && (
        <FadeIn>
          <div className="space-y-6">
            {/* Session type toggle */}
            <div className="flex gap-2">
              <Button
                variant={sessionType === "regular" ? "default" : "outline"}
                size="sm"
                onClick={() => { setSessionType("regular"); setSelectedDuration(focusInterval); }}
              >
                Regular
              </Button>
              <Button
                variant={sessionType === "rescue" ? "default" : "outline"}
                size="sm"
                onClick={() => { setSessionType("rescue"); setSelectedDuration(3); }}
              >
                🔥 Rescue (3-5 min)
              </Button>
            </div>

            {/* Duration picker */}
            <Card>
              <CardContent className="py-6">
                <p className="text-sm text-[var(--muted-foreground)] mb-4">Duration</p>
                <div className="flex flex-wrap gap-2">
                  {durationOptions.map((d) => (
                    <button
                      key={d}
                      aria-pressed={selectedDuration === d}
                      aria-label={`${d} minutes`}
                      onClick={() => setSelectedDuration(d)}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-sm font-medium transition-colors min-w-[60px]",
                        selectedDuration === d
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                          : "border-[var(--border)] hover:bg-[var(--accent)]"
                      )}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Task input */}
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted-foreground)]">
                What will you work on? <span className="text-xs">(optional)</span>
              </label>
              <Input
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="e.g., Draft the proposal intro"
                maxLength={200}
              />
            </div>

            <Button
              onClick={() => setPhase("pre_focus")}
              size="xl"
              className="w-full"
            >
              <Target className="mr-2 h-5 w-5" />
              Ready — {selectedDuration} minutes
            </Button>
          </div>
        </FadeIn>
      )}

      {/* PRE-FOCUS RITUAL */}
      {phase === "pre_focus" && (
        <FadeIn>
          <div className="space-y-8 text-center py-8">
            <div>
              <h2 className="text-xl font-medium">Before you start</h2>
              <div className="mt-6 space-y-4 text-sm text-[var(--muted-foreground)]">
                <p>✦ Close unnecessary tabs</p>
                <p>✦ Put your phone face-down or in another room</p>
                <p>✦ Take one slow breath</p>
              </div>
            </div>

            {task && (
              <Card>
                <CardContent className="py-4">
                  <p className="text-xs text-[var(--muted-foreground)]">Working on</p>
                  <p className="mt-1 text-sm font-medium">{task}</p>
                </CardContent>
              </Card>
            )}

            <Button onClick={handleStart} disabled={isSubmitting} size="xl" className="w-full">
              {isSubmitting ? "Starting..." : "Begin focus"}
            </Button>
          </div>
        </FadeIn>
      )}

      {/* ACTIVE TIMER */}
      {phase === "active" && session && (
        <ActiveTimer
          session={session}
          isPaused={isPaused}
          onPause={handlePause}
          onResume={handleResume}
          onCancel={handleCancel}
          onComplete={handleTimerComplete}
        />
      )}

      {/* POST-FOCUS REFLECTION */}
      {phase === "post_focus" && (
        <FadeIn>
          <div className="space-y-6 text-center py-6">
            <div>
              <h2 className="text-xl font-medium">Session complete ✓</h2>
              <p className="mt-2 text-[var(--muted-foreground)]">How was that?</p>
            </div>

            <div className="flex justify-center gap-2">
              {[
                { value: "great", label: "Great", emoji: "✨" },
                { value: "okay", label: "Okay", emoji: "👍" },
                { value: "struggled", label: "Struggled", emoji: "😤" },
                { value: "interrupted", label: "Interrupted", emoji: "🔔" },
              ].map((r) => (
                <button
                  key={r.value}
                  onClick={() => setSelectedRating(r.value)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm transition-colors",
                    selectedRating === r.value
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--border)] hover:bg-[var(--accent)]"
                  )}
                >
                  <span className="text-lg">{r.emoji}</span>
                  <p className="mt-1 text-xs">{r.label}</p>
                </button>
              ))}
            </div>

            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note..."
              maxLength={500}
            />

            <Button
              onClick={handleComplete}
              disabled={!selectedRating || isSubmitting}
              size="lg"
              className="w-full"
            >
              {isSubmitting ? "Saving..." : "Save reflection"}
            </Button>
          </div>
        </FadeIn>
      )}

      {/* COMPLETE */}
      {phase === "complete" && (
        <FadeIn>
          <div className="space-y-6 text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
              <Check className="h-8 w-8 text-[var(--success)]" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-medium">Well done</h2>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Every completed session strengthens the pattern.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Dashboard
              </Button>
              <Button onClick={() => { setPhase("launcher"); setSession(null); setSelectedRating(""); setNote(""); }}>
                <RotateCcw className="mr-1 h-4 w-4" />
                Another session
              </Button>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
}

// ---- Active Timer sub-component ----
function ActiveTimer({
  session,
  isPaused,
  onPause,
  onResume,
  onCancel,
  onComplete,
}: {
  session: ActiveSessionData;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onComplete: () => void;
}) {
  const { remaining, progress } = useTimer({
    duration: session.plannedDuration,
    startedAt: new Date(session.startedAt),
    pausedDuration: session.pausedDuration,
    isPaused,
    onComplete,
  });

  const [mantraIndex, setMantraIndex] = useState(0);
  const mantras = [
    "Eyes on the work. Mind on the breath.",
    "One tiny step at a time.",
    "The urge will pass. The work remains.",
    "Distraction is just a thought. Let it float by.",
    "You are currently building a new brain.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMantraIndex((prev) => (prev + 1) % mantras.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [mantras.length]);

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <FadeIn>
      <div className="flex flex-col items-center py-8 space-y-10">
        {/* Task & Mantra */}
        <div className="text-center space-y-2 px-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--primary)]">
            {isPaused ? "Paused" : session.type === "rescue" ? "Rescue Mode" : "Deep Focus"}
          </p>
          <h2 className="text-xl font-medium tracking-tight h-8">
            {session.task || "Active Work"}
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] italic opacity-60 transition-opacity duration-1000">
            &quot;{mantras[mantraIndex]}&quot;
          </p>
        </div>

        {/* Circular timer with Breathing Effect */}
        <div className="relative group">
          {/* Breathing Aura */}
          {!isPaused && (
            <div className="absolute inset-[-10px] rounded-full bg-[var(--primary)]/5 blur-3xl animate-pulse" />
          )}
          
          <svg width="300" height="300" className="transform -rotate-90 filter drop-shadow-sm">
            {/* Background ring */}
            <circle
              cx="150"
              cy="150"
              r="120"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="4"
              className="opacity-20"
            />
            {/* Progress track */}
            <circle
              cx="150"
              cy="150"
              r="120"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-extralight tabular-nums tracking-tighter" role="timer">
              {formatTimer(remaining)}
            </span>
            <div className="mt-4 flex h-1 w-24 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-[var(--primary)] transition-all duration-1000" 
                 style={{ width: `${progress * 100}%` }}
               />
            </div>
            
            {/* Screen reader only live region */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {isPaused ? "Timer paused" : remaining === 0 ? "Session complete" : `${Math.ceil(remaining / 60)} minutes remaining`}
            </div>
          </div>
        </div>

        {/* Action Sanctuary */}
        <div className="glass rounded-[2.5rem] p-3 flex items-center gap-4 shadow-2xl">
          <AlertDialog.Root>
            <AlertDialog.Trigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Cancel session"
                className="h-14 w-14 rounded-full hover:bg-rose-500/10 hover:text-rose-500 transition-all"
              >
                <Square className="h-5 w-5 fill-current" />
              </Button>
            </AlertDialog.Trigger>
            <AlertDialog.Portal>
              <AlertDialog.Overlay className="fixed inset-0 bg-black/80 z-50 animate-in fade-in" />
              <AlertDialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full bg-[var(--card)] border-[var(--border)]">
                <AlertDialog.Title className="text-lg font-semibold">Cancel this session?</AlertDialog.Title>
                <AlertDialog.Description className="text-sm text-[var(--muted-foreground)]">
                  This will end your current session without recording a completion.
                </AlertDialog.Description>
                <div className="flex justify-end gap-3 mt-4">
                  <AlertDialog.Cancel asChild>
                    <Button variant="outline">Keep going</Button>
                  </AlertDialog.Cancel>
                  <AlertDialog.Action asChild onClick={onCancel}>
                    <Button variant="destructive">Yes, cancel</Button>
                  </AlertDialog.Action>
                </div>
              </AlertDialog.Content>
            </AlertDialog.Portal>
          </AlertDialog.Root>

          {isPaused ? (
            <Button
              size="icon"
              aria-label="Resume session"
              className="h-20 w-20 rounded-full shadow-xl hover:scale-105 transition-transform"
              onClick={onResume}
            >
              <Play className="h-8 w-8 ml-1 fill-current" />
            </Button>
          ) : (
            <Button
              size="icon"
              aria-label="Pause session"
              className="h-20 w-20 rounded-full shadow-xl hover:scale-105 transition-transform"
              onClick={onPause}
            >
              <Pause className="h-8 w-8 fill-current" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            aria-label="Complete session"
            className="h-14 w-14 rounded-full hover:bg-[var(--success)]/10 hover:text-[var(--success)] transition-all"
            onClick={onComplete}
          >
            <Check className="h-6 w-6 stroke-[3]" />
          </Button>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muted-foreground)] opacity-40">
          Reflowing your attention — {Math.round(progress * 100)}%
        </p>
      </div>
    </FadeIn>
  );
}
