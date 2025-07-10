import { Link } from "wouter";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto bg-slate-900 min-h-screen flex items-center justify-center px-4 text-white">
      <div className="text-center">
        <div className="text-6xl mb-4">📄</div>
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-slate-400 mb-6">
          The page you're looking for doesn't exist.
        </p>
        
        <div className="space-y-3">
          <Link href="/">
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Go Home
            </button>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="w-full text-slate-400 hover:text-slate-200 px-6 py-2 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}