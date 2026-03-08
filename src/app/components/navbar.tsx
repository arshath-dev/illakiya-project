import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useAuth } from "./AuthContext";

export function Navbar({ title }: { title: string }) {
  const { dark, toggle } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-[20px] lg:text-[24px]">{title}</h1>
          <p className="text-[13px] text-muted-foreground hidden sm:block">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl hover:bg-accent transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-border">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center text-white text-[13px]">
              {user?.name?.split(" ").map((n) => n[0]).join("").substring(0, 2) || "U"}
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px]">{user?.name || "User"}</p>
              <p className="text-[11px] text-muted-foreground capitalize">{user?.role || "Role"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
