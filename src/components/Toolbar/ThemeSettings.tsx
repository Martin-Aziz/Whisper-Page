import { useRef } from "react";
import { Sun, Moon, Laptop, Palette, RotateCcw } from "lucide-react";
import { useThemeStore, type ThemeMode } from "@/store/themeStore";
import Tooltip from "@/components/common/Tooltip";
import Button from "@/components/common/Button";
import { cn } from "@/utils/cn";

export function ThemeSettings() {
    const { theme, setTheme, customBgColor, setCustomBgColor } = useThemeStore();
    const colorInputRef = useRef<HTMLInputElement>(null);

    const themeIcons: Record<ThemeMode, React.ReactNode> = {
        light: <Sun size={15} />,
        dark: <Moon size={15} />,
        system: <Laptop size={15} />,
    };

    const themeOrder: ThemeMode[] = ["light", "dark", "system"];

    const nextTheme = () => {
        const idx = themeOrder.indexOf(theme);
        setTheme(themeOrder[(idx + 1) % themeOrder.length] ?? "system");
    };

    return (
        <>
            <Tooltip content={`Theme: ${theme}`}>
                <Button
                    className="cute-bounce"
                    variant="ghost"
                    size="sm"
                    onClick={nextTheme}
                    aria-label={`Current theme: ${theme}. Click to cycle.`}
                >
                    {themeIcons[theme]}
                </Button>
            </Tooltip>

            <div className="flex items-center gap-1 pl-1 border-l border-[var(--color-border)] ml-1">
                <Tooltip content="Custom Background">
                    <Button
                        className="cute-bounce"
                        variant="ghost"
                        size="sm"
                        onClick={() => colorInputRef.current?.click()}
                        aria-label="Custom Background Color"
                    >
                        <Palette size={15} className={cn(customBgColor && "text-[var(--color-accent)]")} />
                    </Button>
                </Tooltip>

                {customBgColor && (
                    <Tooltip content="Reset Background">
                        <Button
                            className="cute-bounce"
                            variant="ghost"
                            size="sm"
                            onClick={() => { setCustomBgColor(null); }}
                            aria-label="Reset Background Color"
                        >
                            <RotateCcw size={13} />
                        </Button>
                    </Tooltip>
                )}

                <input
                    ref={colorInputRef}
                    type="color"
                    className="sr-only"
                    value={customBgColor ?? "#ffffff"}
                    onChange={(e) => { setCustomBgColor(e.target.value); }}
                />
            </div>
        </>
    );
}
