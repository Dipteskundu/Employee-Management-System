"use client";

import { useEffect, useCallback } from "react";

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const isInput = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
      if (isInput) return;

      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : true;
        const altMatch = shortcut.alt ? event.altKey : true;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}

export const defaultShortcuts: ShortcutConfig[] = [
  {
    key: "k",
    ctrl: true,
    description: "Focus search",
    action: () => {
      const searchInput = document.querySelector('input[placeholder="Search..."]') as HTMLInputElement;
      if (searchInput) searchInput.focus();
    },
  },
  {
    key: "1",
    ctrl: true,
    description: "Go to Dashboard",
    action: () => window.location.href = "/employee",
  },
  {
    key: "2",
    ctrl: true,
    description: "Go to Attendance",
    action: () => window.location.href = "/employee/attendance",
  },
  {
    key: "3",
    ctrl: true,
    description: "Go to History",
    action: () => window.location.href = "/employee/history",
  },
];
