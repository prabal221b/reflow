"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils/date";
import { Target, Smartphone, Flame, TrendingUp, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { DailySummary } from "@/lib/types";

interface LogData {
  date: string;
  summary: DailySummary;
  energy: number | null;
  fog: string | null;
}

export function MetricsClient({ logs }: { logs: LogData[] }) {
  if (logs.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Progress</h1>
        <EmptyState
          icon={BarChart3}
          title="No data yet"
          description="Complete your first focus session and your progress will appear here."
        />
      </div>
    );
  }

  // Calculate aggregates
  const thisWeek = logs.slice(-7);
  const prevWeek = logs.slice(-14, -7);

  const totalFocusMinutes = thisWeek.reduce((sum, l) => sum + l.summary.totalFocusMinutes, 0);
  const totalSessions = thisWeek.reduce((sum, l) => sum + l.summary.sessionsCompleted, 0);
  const totalUnplanned = thisWeek.reduce((sum, l) => sum + l.summary.unplannedChecks, 0);
  const totalUrges = thisWeek.reduce((sum, l) => sum + l.summary.urgesLogged, 0);
  const longestSession = Math.max(...thisWeek.map((l) => l.summary.longestSession), 0);
  const cleanStarts = thisWeek.filter((l) => l.summary.cleanWorkStart).length;
  const daysActive = thisWeek.filter((l) => l.summary.sessionsAttempted > 0).length;

  const prevFocusMinutes = prevWeek.reduce((sum, l) => sum + l.summary.totalFocusMinutes, 0);
  const prevUnplanned = prevWeek.reduce((sum, l) => sum + l.summary.unplannedChecks, 0);

  const focusTrend = prevFocusMinutes > 0 ? Math.round(((totalFocusMinutes - prevFocusMinutes) / prevFocusMinutes) * 100) : 0;
  const checkTrend = prevUnplanned > 0 ? Math.round(((totalUnplanned - prevUnplanned) / prevUnplanned) * 100) : 0;

  // Restlessness score: urges / sessions attempted
  const sessionsAttempted = thisWeek.reduce((sum, l) => sum + l.summary.sessionsAttempted, 0);
  const restlessness = sessionsAttempted > 0 ? Math.round((totalUrges / sessionsAttempted) * 10) / 10 : 0;

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="text-2xl font-semibold">Progress</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Last 7 days</p>
      </FadeIn>

      {/* Key metrics */}
      <FadeIn delay={0.1}>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            icon={<Target className="h-4 w-4" strokeWidth={1.5} />}
            label="Focus minutes"
            value={`${totalFocusMinutes}`}
            sub={focusTrend !== 0 ? `${focusTrend > 0 ? "+" : ""}${focusTrend}% vs last week` : undefined}
            positive={focusTrend > 0}
          />
          <MetricCard
            icon={<Sparkles className="h-4 w-4" strokeWidth={1.5} />}
            label="Sessions"
            value={`${totalSessions}`}
            sub={`${longestSession}min longest`}
          />
          <MetricCard
            icon={<Smartphone className="h-4 w-4" strokeWidth={1.5} />}
            label="Unplanned checks"
            value={`${totalUnplanned}`}
            sub={checkTrend !== 0 ? `${checkTrend > 0 ? "+" : ""}${checkTrend}%` : undefined}
            positive={checkTrend < 0}
          />
          <MetricCard
            icon={<Flame className="h-4 w-4" strokeWidth={1.5} />}
            label="Restlessness"
            value={`${restlessness}`}
            sub="urges per session"
          />
        </div>
      </FadeIn>

      {/* Additional stats */}
      <FadeIn delay={0.15}>
        <Card>
          <CardContent className="py-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Clean work starts</span>
              <span className="font-medium">{cleanStarts} / {daysActive} days</span>
            </div>
            <div className="h-px bg-[var(--border)]" />
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Days active</span>
              <span className="font-medium">{daysActive} / 7</span>
            </div>
            <div className="h-px bg-[var(--border)]" />
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Total urges logged</span>
              <span className="font-medium">{totalUrges}</span>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Daily breakdown */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.5} />
              Daily breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...thisWeek].reverse().map((log) => (
                <div key={log.date} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                  <span className="text-xs text-[var(--muted-foreground)] w-16">{formatDate(log.date)}</span>
                  {/* Focus bar */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-[var(--muted)] flex-1 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[var(--primary)] transition-all"
                          style={{
                            width: `${Math.min(100, (log.summary.totalFocusMinutes / 60) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs tabular-nums w-10 text-right">
                        {log.summary.totalFocusMinutes}m
                      </span>
                    </div>
                  </div>
                  {/* Indicators */}
                  <div className="flex gap-1">
                    {log.summary.unplannedChecks > 0 && (
                      <span className="text-[10px] rounded px-1 bg-[var(--warning)]/10 text-[var(--warning)]">
                        {log.summary.unplannedChecks}📱
                      </span>
                    )}
                    {log.summary.cleanWorkStart && (
                      <span className="text-[10px]">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-1.5 text-[var(--muted-foreground)] mb-1">
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <p className="text-2xl font-semibold">{value}</p>
        {sub && (
          <p className={cn(
            "text-[10px] mt-0.5",
            positive === true ? "text-[var(--success)]" :
            positive === false ? "text-[var(--destructive)]" :
            "text-[var(--muted-foreground)]"
          )}>
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
