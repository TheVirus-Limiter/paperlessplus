import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Search, Shield, Camera, Bell, Smartphone } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="glass-header sticky top-0 z-50 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">Paperless+</span>
          </div>
          <Button onClick={handleLogin} className="gradient-primary hover:opacity-90 transition-opacity">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Track Your Documents
              <br />
              <span className="text-gradient">Without Uploading</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Privacy-focused document tracking. Organize, remind, and never lose track of important papers 
              without scanning or uploading them anywhere.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6"
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 hover-lift text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-20 max-w-6xl mx-auto">
          <Card className="glass-card hover-lift border-0 modern-shadow-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Privacy First</CardTitle>
              <CardDescription>
                No file uploads. Your documents stay private. Only track metadata and locations.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover-lift border-0 modern-shadow-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-secondary flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Smart Camera</CardTitle>
              <CardDescription>
                Quick photo capture for visual reference while keeping originals secure.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover-lift border-0 modern-shadow-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Smart Search</CardTitle>
              <CardDescription>
                Instantly find documents by title, location, category, or description.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover-lift border-0 modern-shadow-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-secondary flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Smart Reminders</CardTitle>
              <CardDescription>
                Never miss expiration dates. Get timely notifications for renewals.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover-lift border-0 modern-shadow-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Smart Organization</CardTitle>
              <CardDescription>
                Auto-categorization and urgency tagging for efficient document management.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover-lift border-0 modern-shadow-md">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg gradient-secondary flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Mobile Ready</CardTitle>
              <CardDescription>
                Progressive Web App. Install on your phone for native app experience.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-20 glass-card p-8 rounded-2xl border-0 modern-shadow-lg max-w-2xl mx-auto">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Ready to get organized?</h2>
            <p className="text-muted-foreground">
              Join thousands of users who have simplified their document management.
            </p>
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6"
            >
              Start Tracking Documents
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 PaperTrail. Privacy-focused document tracking.</p>
        </div>
      </footer>
    </div>
  );
}