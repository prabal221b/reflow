import {
  Globe,
  MessageCircle,
  Send,
  Newspaper,
  type LucideIcon,
  Video,
  Hash,
  Briefcase,
  AtSign,
} from "lucide-react";
import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

const PLATFORM_ICONS: Record<Platform, LucideIcon> = {
  instagram: AtSign,
  twitter: Hash,
  youtube: Video,
  reddit: Globe,
  whatsapp: MessageCircle,
  telegram: Send,
  tiktok: Globe,
  linkedin: Briefcase,
  news: Newspaper,
  other: Globe,
};

const PLATFORM_COLORS: Record<Platform, string> = {
  instagram: "text-pink-500",
  twitter: "text-sky-500",
  youtube: "text-red-500",
  reddit: "text-orange-500",
  whatsapp: "text-green-500",
  telegram: "text-blue-500",
  tiktok: "text-gray-700 dark:text-gray-300",
  linkedin: "text-blue-600",
  news: "text-amber-600",
  other: "text-gray-500",
};

interface PlatformIconProps {
  platform: Platform;
  size?: number;
  className?: string;
  colored?: boolean;
}

export function PlatformIcon({
  platform,
  size = 20,
  className,
  colored = true,
}: PlatformIconProps) {
  const Icon = PLATFORM_ICONS[platform] || Globe;
  return (
    <Icon
      size={size}
      className={cn(colored && PLATFORM_COLORS[platform], className)}
      strokeWidth={1.5}
    />
  );
}
