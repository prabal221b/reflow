"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/motion-wrapper";
import {
  Target,
  Smartphone,
  Flame,
  ArrowRight,
  Sun,
  Sparkles,
  Play,
} from "lucide-react";

interface DashboardData {
  state: string;
  userName: string;
  focusInterval: number;
  todaySummary: {
    totalFocusMinutes: number;
    sessionsCompleted: number;
    sessionsAttempted: number;
    longestSession: number;
    unplannedChecks: number;
    urgesLogged: number;
    relapses: number;
    cleanWorkStart: boolean;
  } | null;
  todayEnergy: number | null;
  todayFog: string | null;
  workStart: { firstStep: string; clean: boolean } | null;
  focusTarget: { sessions: number; minutesPerSession: number };
  hasCheckinToday: boolean;
  activeSession: {
    id: string;
    status: string;
    startedAt: string;
    plannedDuration: number;
    pausedDuration: number;
    task?: string;
  } | null;
  daysMissed: number;
}


export function DashboardClient({ data }: { data: DashboardData }) {
  const summary = data.todaySummary;
  
  // Calculate "Attention Capital" — a score out of 100 representing focus state
  const sessionsCompleted = summary?.sessionsCompleted || 0;
  const sessionsTarget = data.focusTarget.sessions || 3;
  const unplannedChecks = summary?.unplannedChecks || 0;
  
  // Basic attention logic: +30 per target session, -10 per unplanned check
  const attentionScore = Math.min(100, Math.max(0, 
    (sessionsCompleted / sessionsTarget) * 70 + (30 - unplannedChecks * 10)
  ));

  const getAttentionStatus = (score: number) => {
    if (score > 80) return { label: "Exceptional", color: "var(--success)", desc: "Your pre-frontal cortex is firing on all cylinders." };
    if (score > 50) return { label: "Stable", color: "var(--primary)", desc: "Steady focus. Keep guarding your attention." };
    if (score > 30) return { label: "Fragile", color: "var(--warning)", desc: "Brain fog rising. Time for a non-screen break?" };
    return { label: "Depleted", color: "var(--destructive)", desc: "Attention exhausted. Priority: Cognitive recovery." };
  };

  const status = getAttentionStatus(attentionScore);

  return (
    <div className="space-y-8 pb-10">
      {/* State & Attention Center */}
      <FadeIn>
        <div className="relative overflow-hidden rounded-[2rem] bg-organic-gradient p-8 text-center shadow-sm border border-[var(--border)]">
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/50 shadow-xl backdrop-blur-md dark:bg-black/20">
              <div className="relative h-14 w-14">
                <svg className="h-full w-full" viewBox="0 0 36 36">
                  <path
                    className="stroke-stone-200 dark:stroke-stone-800"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="transition-all duration-1000 ease-out"
                    stroke={status.color}
                    strokeWidth="3"
                    strokeDasharray={`${attentionScore}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold">
                  {Math.round(attentionScore)}
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold tracking-tight">
              {status.label} <span className="text-[var(--muted-foreground)] font-normal text-xl">/ Clarity</span>
            </h1>
            <p className="mt-2 max-w-[240px] text-sm text-[var(--muted-foreground)] leading-relaxed">
              {status.desc}
            </p>

            <div className="mt-8 flex gap-3">
              <Link href="/focus">
                <Button size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20">
                  <Play className="mr-2 h-4 w-4 fill-current" />
                  {data.activeSession ? "Resume Session" : "Start Focus"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* Primary Mission Card */}
      {!data.activeSession && (
        <FadeIn delay={0.1}>
          <div className="grid gap-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Current Mission</h2>
            
            {/* Work Start logic */}
            {!data.workStart ? (
              <Link href="/workday">
                <Card className="glass overflow-hidden border-dashed hover:border-[var(--primary)] transition-all group">
                  <CardContent className="flex items-center gap-4 py-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] transition-transform group-hover:scale-110">
                      <Sun className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Declare your first step</h3>
                      <p className="text-sm text-[var(--muted-foreground)]">Break the morning fog with one physical action.</p>
                    </div>
                    <ArrowRight className="ml-auto h-5 w-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)]" />
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Card className="glass border-[var(--primary)]/20 shadow-sm">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-[var(--primary)]" />
                      <span className="text-xs font-medium text-[var(--primary)] uppercase tracking-wider">Active Step</span>
                    </div>
                    <span className="text-[10px] text-[var(--muted-foreground)] underline cursor-pointer">Edit</span>
                  </div>
                  <p className="text-xl font-medium leading-tight">{data.workStart.firstStep}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </FadeIn>
      )}

      {/* Metrics of the Unseen */}
      <FadeIn delay={0.2}>
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] ml-1">Cognitive Friction</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass border-rose-500/10 hover:border-rose-500/20 transition-colors">
              <CardContent className="pt-6 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Smartphone className="h-4 w-4 text-rose-500" />
                  <span className="text-2xl font-bold">{summary?.unplannedChecks || 0}</span>
                </div>
                <p className="text-xs font-medium text-[var(--muted-foreground)]">Impulse Checks</p>
                <div className="mt-2 h-1 w-full bg-rose-500/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (summary?.unplannedChecks || 0) * 20)}%` }} 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-amber-500/10 hover:border-amber-500/20 transition-colors">
              <CardContent className="pt-6 pb-4">
                <div className="flex items-center justify-between mb-2">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <span className="text-2xl font-bold">{summary?.urgesLogged || 0}</span>
                </div>
                <p className="text-xs font-medium text-[var(--muted-foreground)]">Urges Surfed</p>
                <div className="mt-2 h-1 w-full bg-amber-500/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (summary?.urgesLogged || 0) * 15)}%` }} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </FadeIn>

      {/* Quick Nav — Sanctuary Mode */}
      <FadeIn delay={0.3}>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/social" className="group">
            <div className="glass flex items-center gap-3 rounded-2xl p-4 transition-all hover:bg-[var(--accent)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-[var(--muted-foreground)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                <Smartphone className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold">Social Sanctuary</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">Manage your windows</p>
              </div>
            </div>
          </Link>
          <Link href="/metrics" className="group">
            <div className="glass flex items-center gap-3 rounded-2xl p-4 transition-all hover:bg-[var(--accent)]">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800 text-[var(--muted-foreground)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                <Sparkles className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold">Atmosphere</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">View your focus aura</p>
              </div>
            </div>
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
