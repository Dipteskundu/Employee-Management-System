"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-8 w-8 text-muted-foreground/60 hover:text-foreground hover:bg-accent/50"
      title={`Current: ${theme}. Click to cycle.`}
    >
      {theme === "light" && <Sun className="h-[17px] w-[17px]" />}
      {theme === "dark" && <Moon className="h-[17px] w-[17px]" />}
      {theme === "system" && <Monitor className="h-[17px] w-[17px]" />}
    </Button>
  );
}
