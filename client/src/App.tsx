import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center max-w-md mx-auto p-6">
          <h1 className="text-4xl font-bold mb-4 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text">
            Paperless+
          </h1>
          <p className="text-slate-300 mb-8">
            Your privacy-focused document tracker
          </p>
          <div className="space-y-4">
            <a 
              href="/api/auth/google" 
              className="block w-full bg-white hover:bg-gray-100 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg"
            >
              <svg className="w-5 h-5 inline mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </a>
            <a 
              href="/auth" 
              className="block w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-lg"
            >
              Continue with Email
            </a>
          </div>
          <p className="text-xs text-slate-500 mt-8">
            Privacy-focused • Secure • No file uploads
          </p>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
