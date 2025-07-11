import { Button } from "@/components/ui/button";
import { Home, Search, Clock, Bell, Settings } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { id: "home", label: "Home", icon: Home, path: "/" },
  { id: "search", label: "Search", icon: Search, path: "/search" },
  { id: "timeline", label: "Timeline", icon: Clock, path: "/timeline" },
  { id: "reminders", label: "Reminders", icon: Bell, path: "/reminders" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
];

export default function BottomNavigation() {
  const basePath = "/paperlessplus";
  const [currentPath, setCurrentPath] = useState(() => {
    const fullPath = window.location.pathname;
    if (fullPath.startsWith(basePath)) {
      const relativePath = fullPath.substring(basePath.length);
      return relativePath || "/";
    }
    return "/";
  });

  useEffect(() => {
    const handlePopState = () => {
      const fullPath = window.location.pathname;
      if (fullPath.startsWith(basePath)) {
        const relativePath = fullPath.substring(basePath.length);
        setCurrentPath(relativePath || "/");
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [basePath]);

  const navigate = (path: string) => {
    const fullPath = basePath + (path === "/" ? "" : path);
    window.history.pushState({}, '', fullPath);
    setCurrentPath(path);
  };

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-slate-900 border-t border-slate-700 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={`flex flex-col items-center py-1 px-3 h-auto hover:bg-slate-800/50 focus:bg-slate-800/50 focus:outline-none focus:ring-0 transition-colors ${
                isActive 
                  ? "text-purple-400 bg-slate-800/50" 
                  : "text-slate-400 hover:text-purple-400"
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? "text-purple-400" : "text-slate-400"}`} />
              <span className={`text-xs ${isActive ? "text-purple-400" : "text-slate-400"}`}>{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
