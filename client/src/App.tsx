import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import { documentDB } from "@/lib/db";

// Simple local components
function BottomNavigation({ currentPath, onNavigate }: { currentPath: string; onNavigate: (path: string) => void }) {
  const navItems = [
    { path: "/", icon: "🏠", label: "Home" },
    { path: "/search", icon: "🔍", label: "Search" },
    { path: "/reminders", icon: "⏰", label: "Reminders" },
    { path: "/settings", icon: "⚙️", label: "Settings" }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-md border-t border-slate-700">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => onNavigate(item.path)}
            className={`flex flex-col items-center py-2 px-4 transition-colors ${
              currentPath === item.path ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

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

function LocalHome({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalDocs: 0, expiringDocs: 0, categories: 0 });

  useEffect(() => {
    const loadData = async () => {
      await documentDB.initialize();
      const docs = await documentDB.getAllDocuments();
      const expiring = await documentDB.getExpiringDocuments(30);
      const categories = new Set(docs.map(doc => doc.category));
      
      setDocuments(docs);
      setStats({
        totalDocs: docs.length,
        expiringDocs: expiring.length,
        categories: categories.size
      });
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-20">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
          Paperless+
        </h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stats.totalDocs}</div>
            <div className="text-xs text-slate-400">Documents</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{stats.expiringDocs}</div>
            <div className="text-xs text-slate-400">Expiring</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.categories}</div>
            <div className="text-xs text-slate-400">Categories</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            onClick={() => onNavigate("/add")}
            className="bg-purple-600 hover:bg-purple-700 rounded-lg p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="font-medium">Add Document</div>
          </button>
          <button 
            onClick={() => onNavigate("/search")}
            className="bg-slate-800 hover:bg-slate-700 rounded-lg p-4 text-center transition-colors"
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-medium">Search</div>
          </button>
        </div>

        {/* Recent Documents */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Recent Documents</h2>
          {documents.length === 0 ? (
            <div className="bg-slate-800/30 rounded-lg p-6 text-center text-slate-400">
              <div className="text-4xl mb-3">📋</div>
              <p>No documents yet</p>
              <p className="text-sm">Add your first document to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.slice(0, 5).map((doc) => (
                <div key={doc.id} className="bg-slate-800/50 rounded-lg p-4">
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-sm text-slate-400">{doc.location}</div>
                  <div className="text-xs text-purple-400 mt-1">{doc.category}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    return !localStorage.getItem('paperless-onboarding-complete');
  });
  const [currentPath, setCurrentPath] = useState("/");

  const handleOnboardingComplete = () => {
    localStorage.setItem('paperless-onboarding-complete', 'true');
    setShowOnboarding(false);
  };

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.history.pushState(null, '', path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (showOnboarding) {
    return <OnboardingSlideshow onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      <Switch>
        <Route path="/">
          <LocalHome onNavigate={handleNavigate} />
        </Route>
        <Route path="/search">
          <div className="min-h-screen bg-slate-900 text-white p-6 pb-20">
            <h1 className="text-2xl font-bold mb-6">Search Documents</h1>
            <p className="text-slate-400">Search functionality coming soon...</p>
          </div>
        </Route>
        <Route path="/reminders">
          <div className="min-h-screen bg-slate-900 text-white p-6 pb-20">
            <h1 className="text-2xl font-bold mb-6">Reminders</h1>
            <p className="text-slate-400">Reminder functionality coming soon...</p>
          </div>
        </Route>
        <Route path="/settings">
          <div className="min-h-screen bg-slate-900 text-white p-6 pb-20">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>
            <p className="text-slate-400">Settings coming soon...</p>
          </div>
        </Route>
        <Route component={NotFound} />
      </Switch>
      <BottomNavigation currentPath={currentPath} onNavigate={handleNavigate} />
    </>
  );
}

export default App;
