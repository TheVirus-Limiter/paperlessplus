import { useState, useEffect, createContext, useContext } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Search from "@/pages/search";
import Timeline from "@/pages/timeline";
import Reminders from "@/pages/reminders";
import Settings from "@/pages/settings";
import { documentDB } from "@/lib/db";
import { initializeNotificationChecks } from "@/lib/notifications";
import BottomNavigation from "@/components/bottom-navigation";
// Logo will be loaded from public folder

// Router context for shared navigation state
const RouterContext = createContext<{
  currentPath: string;
  navigate: (path: string) => void;
} | null>(null);

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
};

function OnboardingSlideshow({ onComplete }: { onComplete: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to Paperless+",
      subtitle: "Your privacy-focused document tracker",
      content: "Track important documents without scanning or uploading them. Keep your privacy intact while staying organized.",
      icon: "📋"
    },
    {
      title: "Privacy First",
      subtitle: "No files leave your device",
      content: "We only store document descriptions and locations. Your actual documents stay private on your device or wherever you keep them.",
      icon: "🔒"
    },
    {
      title: "Smart Reminders", 
      subtitle: "Never miss important dates",
      content: "Get notified before documents expire, renewals are due, or when you need them for taxes.",
      icon: "⏰"
    },
    {
      title: "Stay Organized",
      subtitle: "Find anything instantly", 
      content: "Search by category, location, or description. Filter by urgency tags and expiration dates.",
      icon: "🔍"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const skipToEnd = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="mb-6">
            <img 
              src="./logo.png" 
              alt="Paperless+ Logo" 
              className="w-24 h-24 mx-auto rounded-2xl shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
            {slides[currentSlide].title}
          </h1>
          <h2 className="text-xl text-slate-300 mb-4">
            {slides[currentSlide].subtitle}
          </h2>
          <p className="text-slate-400 leading-relaxed">
            {slides[currentSlide].content}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 mx-1 rounded-full transition-colors ${
                index === currentSlide ? 'bg-purple-400' : 'bg-slate-600'
              }`}
            />
          ))}
        </div>

        <div className="space-y-4">
          <button
            onClick={nextSlide}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            {currentSlide < slides.length - 1 ? 'Next' : 'Get Started'}
          </button>
          
          {currentSlide < slides.length - 1 && (
            <button
              onClick={skipToEnd}
              className="w-full text-slate-400 hover:text-slate-200 px-6 py-2 transition-colors duration-200"
            >
              Skip Introduction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Custom routing provider for GitHub Pages subdirectory
function RouterProvider({ children }: { children: React.ReactNode }) {
  const basePath = "/paperlessplus";
  const [currentPath, setCurrentPath] = useState(() => {
    const fullPath = window.location.pathname;
    if (fullPath.startsWith(basePath)) {
      const relativePath = fullPath.substring(basePath.length);
      return relativePath || "/";
    }
    return "/";
  });
  
  // Initialize local database and notifications
  useEffect(() => {
    documentDB.initialize();
    initializeNotificationChecks();
  }, []);

  // Handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const fullPath = window.location.pathname;
      if (fullPath.startsWith(basePath)) {
        const relativePath = fullPath.substring(basePath.length);
        setCurrentPath(relativePath || "/");
      } else {
        // Redirect to base path if not under paperlessplus
        window.history.replaceState({}, '', basePath);
        setCurrentPath("/");
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [basePath]);

  // Ensure we're on the right base path
  useEffect(() => {
    const fullPath = window.location.pathname;
    if (!fullPath.startsWith(basePath)) {
      window.history.replaceState({}, '', basePath);
      setCurrentPath("/");
    }
  }, [basePath]);

  const navigate = (path: string) => {
    const fullPath = basePath + (path === "/" ? "" : path);
    window.history.pushState({}, '', fullPath);
    setCurrentPath(path);
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('routeChange', { detail: { path } }));
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

// Router component that renders the current page
function Router() {
  const { currentPath } = useRouter();

  const renderPage = () => {
    switch (currentPath) {
      case "/":
        return <Home />;
      case "/search":
        return <Search />;
      case "/timeline":
        return <Timeline />;
      case "/reminders":
        return <Reminders />;
      case "/settings":
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      {renderPage()}
      <BottomNavigation />
    </>
  );
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('paperless-onboarding-complete');
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('paperless-onboarding-complete', 'true');
    setShowOnboarding(false);
  };

  // Check for onboarding reset
  useEffect(() => {
    const checkOnboardingStatus = () => {
      const isComplete = localStorage.getItem('paperless-onboarding-complete');
      setShowOnboarding(!isComplete);
    };
    
    // Listen for storage changes (useful for reset onboarding)
    window.addEventListener('storage', checkOnboardingStatus);
    
    return () => {
      window.removeEventListener('storage', checkOnboardingStatus);
    };
  }, []);

  if (showOnboarding) {
    return <OnboardingSlideshow onComplete={handleOnboardingComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <RouterProvider>
          <Router />
        </RouterProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
