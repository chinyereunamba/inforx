"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OAuthButtonProps {
  provider: "google";
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="currentColor"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="currentColor"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="currentColor"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const providerConfig = {
  google: {
    name: "Google",
    icon: GoogleIcon,
    bgColor: "bg-white",
    textColor: "text-slate-700",
    hoverColor: "hover:bg-slate-50",
    borderColor: "border-slate-300",
  },
};

export default function OAuthButton({
  provider,
  onClick,
  loading = false,
  disabled = false,
  className,
  type = "submit",
}: OAuthButtonProps) {
  const config = providerConfig[provider];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <button
      type={type}
      onClick={onClick || (() => {})}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-label={`Sign in with ${config.name}`}
      className={cn(
        "w-full flex items-center justify-center gap-3 px-6 py-3 rounded-lg border-2 font-medium transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-200",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transform active:scale-[0.98]",
        config.bgColor,
        config.textColor,
        config.hoverColor,
        config.borderColor,
        className
      )}
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Icon />}
      <span>Continue with {config.name}</span>
    </button>
  );
}
