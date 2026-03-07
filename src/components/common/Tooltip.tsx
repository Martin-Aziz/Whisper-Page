import type { ReactNode } from "react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/utils/cn";

type TooltipPlacement = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  children: ReactNode;
  content: string;
  placement?: TooltipPlacement;
  shortcut?: string;
}

const placementClasses: Record<TooltipPlacement, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

/**
 * Lightweight tooltip that wraps a child element and shows a label on hover.
 * Uses pure CSS positioning (no portal) — suitable for toolbar buttons.
 * Includes optional keyboard shortcut display.
 */
export default function Tooltip({
  children,
  content,
  placement = "bottom",
  shortcut,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => { setVisible(true); }, 150);
  }

  function hide() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-[9999] pointer-events-none animate-fade-in",
            "flex items-center gap-1.5 whitespace-nowrap",
            "px-2 py-1 rounded-md text-xs font-medium",
            "bg-[var(--color-text-primary)] text-[var(--color-text-inverse)]",
            "shadow-lg",
            placementClasses[placement]
          )}
        >
          {content}
          {shortcut && (
            <kbd className="ml-1 px-1 py-0.5 rounded text-[10px] bg-white/20 font-mono">
              {shortcut}
            </kbd>
          )}
        </div>
      )}
    </div>
  );
}
