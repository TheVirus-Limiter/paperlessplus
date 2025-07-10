function App() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-3xl mb-4">Welcome to Paperless+</h1>
        <p className="mb-6">Your privacy-focused document tracker</p>
        <div className="space-y-4">
          <a 
            href="/api/auth/google" 
            className="block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Continue with Google
          </a>
          <a 
            href="/auth" 
            className="block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Continue with Email
          </a>
        </div>
        <p className="text-sm text-slate-400 mt-6">
          Privacy-focused • Secure • Simple
        </p>
      </div>
    </div>
  );
}

export default App;
