"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/shared/motion-wrapper";

import { PlatformIcon } from "@/components/shared/platform-icon";
import { PLATFORMS, PLATFORM_LABELS } from "@/lib/types";
import type { Platform } from "@/lib/types";
import { scheduleSocialWindow, logUnplannedCheck, startSocialWindow, completeSocialWindow } from "@/lib/actions/social";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import { Plus, Smartphone, Clock, Check } from "lucide-react";

interface SessionData {
  id: string;
  type: string;
  status: string;
  platform: string;
  intent: string | null;
  scheduledDuration: number | null;
  actualDuration: number | null;
  actualStart: string | null;
}

export function SocialClient({ sessions }: { sessions: SessionData[] }) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Schedule form
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [startTime, setStartTime] = useState("12:30");
  const [duration, setDuration] = useState(15);
  const [intent, setIntent] = useState("");

  // Quick log form
  const [logPlatform, setLogPlatform] = useState<Platform>("instagram");
  const [logDuration, setLogDuration] = useState(5);

  const planned = sessions.filter((s) => s.type === "planned");
  const unplanned = sessions.filter((s) => s.type === "unplanned");

  const handleSchedule = async () => {
    setIsSubmitting(true);
    const result = await scheduleSocialWindow({ platform, startTime, duration, intent: intent || undefined });
    if (result.success) {
      toast.success("Window scheduled");
      setShowSchedule(false);
      setIntent("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleQuickLog = async () => {
    setIsSubmitting(true);
    const result = await logUnplannedCheck({ platform: logPlatform, duration: logDuration });
    if (result.success) {
      toast("Logged. Awareness is the first step.", { duration: 3000 });
      setShowQuickLog(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleStartWindow = async (windowId: string) => {
    const result = await startSocialWindow(windowId);
    if (result.success) {
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  const handleCompleteWindow = async (windowId: string) => {
    const result = await completeSocialWindow(windowId, 15);
    if (result.success) {
      toast.success("Window completed");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Social Media</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowQuickLog(!showQuickLog)}>
              Quick log
            </Button>
            <Button size="sm" onClick={() => setShowSchedule(!showSchedule)}>
              <Plus className="mr-1 h-3 w-3" />
              Schedule
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Schedule form */}
      {showSchedule && (
        <FadeIn>
          <Card>
            <CardHeader>
              <CardTitle>Schedule a window</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform</label>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORMS.map((p) => (
                    <button key={p} onClick={() => setPlatform(p)} className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                      platform === p ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)] hover:bg-[var(--accent)]"
                    )}>
                      <PlatformIcon platform={p} size={14} colored={platform !== p} />
                      {PLATFORM_LABELS[p]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium">Duration (min)</label>
                  <Input type="number" min={5} max={60} value={duration} onChange={(e) => setDuration(parseInt(e.target.value) || 15)} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Intent <span className="text-xs text-[var(--muted-foreground)]">(optional)</span></label>
                <Input value={intent} onChange={(e) => setIntent(e.target.value)} placeholder="e.g., Check messages, browse news" maxLength={200} />
              </div>
              <Button onClick={handleSchedule} disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Scheduling..." : "Schedule window"}
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Quick log form */}
      {showQuickLog && (
        <FadeIn>
          <Card>
            <CardHeader><CardTitle>Log unplanned check</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {PLATFORMS.map((p) => (
                  <button key={p} onClick={() => setLogPlatform(p)} className={cn(
                    "rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                    logPlatform === p ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                  )}>
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">~Duration (min)</label>
                <Input type="number" min={1} max={180} value={logDuration} onChange={(e) => setLogDuration(parseInt(e.target.value) || 5)} />
              </div>
              <Button onClick={handleQuickLog} disabled={isSubmitting} variant="outline" className="w-full">
                {isSubmitting ? "Logging..." : "Log check"}
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Planned windows */}
      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.5} />
              Planned windows
            </CardTitle>
          </CardHeader>
          <CardContent>
            {planned.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)] py-4 text-center">
                No windows scheduled today. That&apos;s okay.
              </p>
            ) : (
              <div className="space-y-3">
                {planned.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={s.platform as Platform} size={18} />
                      <div>
                        <p className="text-sm font-medium">{PLATFORM_LABELS[s.platform as Platform]}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {s.scheduledDuration}min · {s.status}
                        </p>
                      </div>
                    </div>
                    {s.status === "scheduled" && (
                      <Button size="sm" variant="outline" onClick={() => handleStartWindow(s.id)}>Start</Button>
                    )}
                    {s.status === "active" && (
                      <Button size="sm" variant="default" onClick={() => handleCompleteWindow(s.id)}>Done</Button>
                    )}
                    {s.status === "completed" && (
                      <Check className="h-4 w-4 text-[var(--success)]" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Unplanned checks */}
      {unplanned.length > 0 && (
        <FadeIn delay={0.15}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[var(--muted-foreground)]">
                <Smartphone className="h-4 w-4" strokeWidth={1.5} />
                Unplanned checks today: {unplanned.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {unplanned.map((s) => (
                  <span key={s.id} className="inline-flex items-center gap-1 rounded-lg bg-[var(--muted)] px-2 py-1 text-xs">
                    <PlatformIcon platform={s.platform as Platform} size={12} />
                    {s.actualDuration}min
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
