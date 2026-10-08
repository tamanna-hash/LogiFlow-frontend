"use client";

/**
 * ThemeToggle
 *
 * A three-way toggle: Light → Dark → System.
 * Rendered as an accessible icon button with a dropdown menu.
 * Works with next-themes (storageKey: "logiflow-theme").
 *
 * Keyboard: Tab to focus, Enter/Space to open, arrows to navigate,
 *           Escape to close.
 */

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light",  label: "Light",  Icon: Sun     },
  { value: "dark",   label: "Dark",   Icon: Moon    },
  { value: "system", label: "System", Icon: Monitor },
] as const;

type ThemeValue = (typeof THEMES)[number]["value"];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  // Avoid hydration mismatch — only render the icon after mount
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const current = mounted ? (theme as ThemeValue) ?? "system" : "system";
  const isDark   = mounted && resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label={`Theme: ${current}. Click to change`}
        >
          {/* Sun icon — visible in light mode */}
          <Sun
            className={cn(
              "size-5 absolute transition-all duration-200",
              isDark ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0",
            )}
            aria-hidden="true"
          />
          {/* Moon icon — visible in dark mode */}
          <Moon
            className={cn(
              "size-5 absolute transition-all duration-200",
              isDark ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-90",
            )}
            aria-hidden="true"
          />
          {/* Screen-reader label */}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[130px]">
        {THEMES.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              current === value && "font-semibold text-primary",
            )}
            aria-current={current === value ? "true" : undefined}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
            {current === value && (
              <Check className="ml-auto size-4 text-primary" aria-hidden="true" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
