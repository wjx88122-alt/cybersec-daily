"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  useState,
  type ReactNode,
} from "react";

export type Theme = "dark" | "system" | "light";

type ThemeContextValue = {
  /** 用户选择的偏好（dark/system/light）。 */
  theme: Theme;
  /** 实际生效的明暗（system 解析后）。 */
  resolved: "dark" | "light";
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";

function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const dark = theme === "dark" || (theme === "system" && systemPrefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

/**
 * 用 useSyncExternalStore 订阅 localStorage.theme，避免在 effect 里 setState
 * （React 19 react-hooks/set-state-in-effect 规则）。仅在 client 生效，SSR 返回 "system"。
 */
function subscribePref(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getPrefSnapshot(): string {
  if (typeof window === "undefined") return "system";
  return localStorage.getItem(STORAGE_KEY) ?? "system";
}

function getPrefServerSnapshot(): string {
  return "system";
}

/**
 * 三态主题 Provider。
 * - 偏好持久化到 localStorage（useSyncExternalStore 订阅）
 * - system 模式跟随 prefers-color-scheme 实时变化
 * - 首帧由 app/layout.tsx 内联脚本防 FOUC，这里只负责 hydrate 后同步与切换
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(
    subscribePref,
    getPrefSnapshot,
    getPrefServerSnapshot,
  ) as Theme;
  // 本地瞬时状态：用户点击切换时立即更新（不必等 storage 事件回环）
  const [override, setOverride] = useState<Theme | null>(null);
  const theme = override ?? stored;
  const resolved: "dark" | "light" =
    theme === "dark" || (theme === "system" && systemPrefersDark())
      ? "dark"
      : "light";

  // 同步 DOM + 监听系统偏好变化（副作用，不调用 setState）
  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setOverride(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* localStorage 不可用时静默降级 */
    }
  }, []);

  const value = useMemo(
    () => ({ theme, resolved, setTheme }),
    [theme, resolved, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme 必须在 <ThemeProvider> 内使用");
  }
  return ctx;
}
