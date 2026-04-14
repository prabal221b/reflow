"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  Smartphone,
  BarChart3,
  Settings,
  Zap,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/focus", label: "Focus", icon: Target },
  { href: "/workday", label: "Workday", icon: Calendar },
  { href: "/social", label: "Social", icon: Smartphone },
  { href: "/metrics", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const MOBILE_NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/focus", label: "Focus", icon: Target },
  { href: "/social", label: "Social", icon: Smartphone },
  { href: "/metrics", label: "Progress", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-[var(--sidebar-width)] lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 border-r border-[var(--border)] bg-[var(--card)]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-[var(--border)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--primary)]">
          <Zap className="h-4 w-4 text-[var(--primary-foreground)]" strokeWidth={2} />
        </div>
        <span className="text-lg font-semibold tracking-tight">Reflow</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-sm lg:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-medium transition-colors rounded-lg min-w-[56px]",
                isActive
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)]"
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={isActive ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
