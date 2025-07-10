import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Search from "@/pages/search";
import Reminders from "@/pages/reminders";
import Settings from "@/pages/settings";
import { documentDB } from "@/lib/db";
import BottomNavigation from "@/components/bottom-navigation";

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
          <div className="text-6xl mb-4">{slides[currentSlide].icon}</div>
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

function Router() {
  // Initialize local database  
  useEffect(() => {
    documentDB.initialize();
  }, []);

  return (
    <>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/search" component={Search} />
        <Route path="/reminders" component={Reminders} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
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

  if (showOnboarding) {
    return <OnboardingSlideshow onComplete={handleOnboardingComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
