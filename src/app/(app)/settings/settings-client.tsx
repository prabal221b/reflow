"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/shared/motion-wrapper";
import { useTheme } from "@/components/providers/theme-provider";
import { updateSettings, exportUserData, deleteAccount } from "@/lib/actions/settings";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";
import {
  Target,
  Sun,
  Moon,
  Monitor,
  Download,
  Trash2,
  LogOut,
  Clock,
  Eye,
} from "lucide-react";

interface SettingsData {
  name: string;
  email: string;
  focusInterval: number;
  currentFocusInterval: number;
  focusProgression: string;
  progressionSpeed: string;
  theme: string;
  reducedMotion: boolean;
  notifications: {
    focusReminders: boolean;
    socialWindowAlerts: boolean;
    dailySummary: boolean;
  };
  timezone: string;
  workdayStart: string;
  workdayEnd: string;
  socialWindowDefaults: { duration: number; maxPerDay: number };
}

export function SettingsClient({ settings }: { settings: SettingsData }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleUpdate = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    const result = await updateSettings(data);
    if (result.success) {
      toast.success("Settings saved");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleExport = async () => {
    setIsSubmitting(true);
    const result = await exportUserData();
    if (result.success) {
      const blob = new Blob([result.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reflow-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported");
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error("Type DELETE to confirm");
      return;
    }
    setIsSubmitting(true);
    const result = await deleteAccount("DELETE");
    if (result.success) {
      await signOut({ callbackUrl: "/" });
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </FadeIn>

      {/* Profile */}
      <FadeIn delay={0.05}>
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Name</span>
              <span className="font-medium">{settings.name}</span>
            </div>
            <div className="h-px bg-[var(--border)]" />
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Email</span>
              <span className="font-medium">{settings.email}</span>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Focus Settings */}
      <FadeIn delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.5} />
              Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[var(--muted-foreground)]">Current interval</span>
                <span className="font-medium">{settings.currentFocusInterval} min</span>
              </div>
              <div className="flex gap-2">
                {[5, 8, 10, 15, 20, 25].map((d) => (
                  <button key={d} onClick={() => handleUpdate({ focusInterval: d })} className={cn(
                    "flex-1 rounded-lg py-2 text-sm transition-colors",
                    settings.focusInterval === d ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "bg-[var(--muted)]"
                  )}>{d}</button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-2">Progression</p>
              <div className="flex gap-2">
                {["auto", "manual"].map((p) => (
                  <Button key={p} variant={settings.focusProgression === p ? "default" : "outline"} size="sm"
                    onClick={() => handleUpdate({ focusProgression: p })} className="capitalize">
                    {p}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Appearance */}
      <FadeIn delay={0.15}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.5} />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-2">Theme</p>
              <div className="flex gap-2">
                {[
                  { val: "light" as const, icon: <Sun className="h-4 w-4" />, label: "Light" },
                  { val: "dark" as const, icon: <Moon className="h-4 w-4" />, label: "Dark" },
                  { val: "system" as const, icon: <Monitor className="h-4 w-4" />, label: "System" },
                ].map((t) => (
                  <Button key={t.val} variant={theme === t.val ? "default" : "outline"} size="sm" className="flex-1 gap-1"
                    onClick={() => { setTheme(t.val); handleUpdate({ theme: t.val }); }}>
                    {t.icon} {t.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Reduce motion</p>
                <p className="text-xs text-[var(--muted-foreground)]">Minimize animations</p>
              </div>
              <button
                onClick={() => {
                  const newVal = !settings.reducedMotion;
                  localStorage.setItem("reflow-reduced-motion", String(newVal));
                  handleUpdate({ reducedMotion: newVal });
                }}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  settings.reducedMotion ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                  settings.reducedMotion ? "translate-x-5" : "translate-x-0.5"
                )} />
              </button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Workday */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[var(--primary)]" strokeWidth={1.5} />
              Workday
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm text-[var(--muted-foreground)]">Start</label>
                <Input type="time" defaultValue={settings.workdayStart}
                  onBlur={(e) => handleUpdate({ workdayStart: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-[var(--muted-foreground)]">End</label>
                <Input type="time" defaultValue={settings.workdayEnd}
                  onBlur={(e) => handleUpdate({ workdayEnd: e.target.value })} />
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Data */}
      <FadeIn delay={0.25}>
        <Card>
          <CardHeader><CardTitle>Data & Privacy</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleExport} disabled={isSubmitting}>
              <Download className="h-4 w-4" /> Export all data (JSON)
            </Button>

            {!showDeleteConfirm ? (
              <Button variant="ghost" className="w-full justify-start gap-2 text-[var(--destructive)]"
                onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-4 w-4" /> Delete account
              </Button>
            ) : (
              <div className="space-y-2 p-3 rounded-xl border border-[var(--destructive)]/30 bg-[var(--destructive)]/5">
                <p className="text-sm font-medium text-[var(--destructive)]">
                  This will permanently delete all your data.
                </p>
                <Input
                  placeholder="Type DELETE to confirm"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isSubmitting || deleteConfirm !== "DELETE"}>
                    Delete forever
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </FadeIn>

      {/* Sign out */}
      <FadeIn delay={0.3}>
        <Button variant="ghost" className="w-full justify-start gap-2 text-[var(--muted-foreground)]"
          onClick={() => signOut({ callbackUrl: "/" })}>
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </FadeIn>
    </div>
  );
}
