import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  Shield, 
  Smartphone,
  CheckCircle,
  Mail,
  Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: "",
    documentTypes: [] as string[],
    reminderPreference: "30",
    privacyAgreement: false,
  });
  const { toast } = useToast();

  const steps = [
    {
      id: "welcome",
      title: "Welcome to PaperTrail",
      subtitle: "Let's set up your personal document tracker",
    },
    {
      id: "name",
      title: "What should we call you?",
      subtitle: "Help us personalize your experience",
    },
    {
      id: "purpose",
      title: "Would you like an app to remember where your important documents are?",
      subtitle: "We'll help you organize without scanning or uploading",
    },
    {
      id: "documents",
      title: "What types of documents do you need to track?",
      subtitle: "Select all that apply",
    },
    {
      id: "reminders",
      title: "When should we remind you about expiring documents?",
      subtitle: "Stay on top of renewals and deadlines",
    },
    {
      id: "privacy",
      title: "Your privacy matters",
      subtitle: "We keep everything secure and local",
    },
    {
      id: "auth",
      title: "Create your account",
      subtitle: "Choose how you'd like to sign in",
    },
  ];

  const documentOptions = [
    { id: "id", label: "ID Documents", icon: "🆔" },
    { id: "medical", label: "Medical Records", icon: "🏥" },
    { id: "financial", label: "Financial Papers", icon: "💰" },
    { id: "legal", label: "Legal Documents", icon: "⚖️" },
    { id: "insurance", label: "Insurance", icon: "🛡️" },
    { id: "education", label: "Education", icon: "🎓" },
    { id: "property", label: "Property", icon: "🏠" },
    { id: "other", label: "Other", icon: "📄" },
  ];

  const reminderOptions = [
    { value: "7", label: "7 days before" },
    { value: "30", label: "30 days before" },
    { value: "90", label: "90 days before" },
    { value: "never", label: "Never remind me" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDocumentTypeToggle = (typeId: string) => {
    setUserData(prev => ({
      ...prev,
      documentTypes: prev.documentTypes.includes(typeId)
        ? prev.documentTypes.filter(id => id !== typeId)
        : [...prev.documentTypes, typeId]
    }));
  };

  const handleAuthChoice = (method: string) => {
    // Redirect to auth page
    switch (method) {
      case 'email':
      case 'google':
        window.location.href = '/';
        break;
      case 'phone':
        toast({
          title: "Coming Soon",
          description: "Phone authentication will be available soon.",
        });
        break;
    }
  };

  const canProceed = () => {
    switch (steps[currentStep].id) {
      case "name":
        return userData.name.trim().length > 0;
      case "documents":
        return userData.documentTypes.length > 0;
      case "privacy":
        return userData.privacyAgreement;
      default:
        return true;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4" style={{ backgroundColor: 'rgb(15, 23, 42)' }}>
      <div className="max-w-md w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-slate-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content Card */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white mb-2">
              {steps[currentStep].title}
            </CardTitle>
            <p className="text-slate-400">
              {steps[currentStep].subtitle}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Welcome Step */}
            {steps[currentStep].id === "welcome" && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                  <p className="text-slate-300">
                    Track your important documents without scanning or uploading them.
                  </p>
                  <p className="text-sm text-slate-400">
                    Privacy-focused • Secure • Simple
                  </p>
                </div>
              </div>
            )}

            {/* Name Step */}
            {steps[currentStep].id === "name" && (
              <div className="space-y-4">
                <Label htmlFor="name" className="text-white">Your name</Label>
                <Input
                  id="name"
                  placeholder="Enter your first name"
                  value={userData.name}
                  onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
            )}

            {/* Purpose Step */}
            {steps[currentStep].id === "purpose" && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm text-slate-300">Track</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm text-slate-300">Secure</p>
                  </div>
                  <div className="space-y-2">
                    <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                      <Smartphone className="h-8 w-8 text-white" />
                    </div>
                    <p className="text-sm text-slate-300">Sync</p>
                  </div>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Privacy First</p>
                      <p className="text-sm text-slate-400">No scanning, no uploads. Just metadata you control.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Types Step */}
            {steps[currentStep].id === "documents" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {documentOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleDocumentTypeToggle(option.id)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        userData.documentTypes.includes(option.id)
                          ? "bg-purple-600 border-purple-500 text-white"
                          : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reminders Step */}
            {steps[currentStep].id === "reminders" && (
              <div className="space-y-4">
                {reminderOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setUserData(prev => ({ ...prev, reminderPreference: option.value }))}
                    className={`w-full p-4 rounded-lg border text-left transition-colors ${
                      userData.reminderPreference === option.value
                        ? "bg-purple-600 border-purple-500 text-white"
                        : "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* Privacy Step */}
            {steps[currentStep].id === "privacy" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-green-500" />
                    <p className="text-white font-medium">Local Storage Only</p>
                  </div>
                  <p className="text-slate-400 text-sm ml-9">
                    Your document information stays on your device. We never see or store your personal data.
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    <p className="text-white font-medium">No Document Scanning</p>
                  </div>
                  <p className="text-slate-400 text-sm ml-9">
                    We only track metadata like location and expiration dates. No sensitive content is stored.
                  </p>
                </div>
                
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData.privacyAgreement}
                    onChange={(e) => setUserData(prev => ({ ...prev, privacyAgreement: e.target.checked }))}
                    className="mt-1 h-4 w-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-300">
                    I understand that PaperTrail prioritizes my privacy and keeps my data local and secure.
                  </span>
                </label>
              </div>
            )}

            {/* Auth Step */}
            {steps[currentStep].id === "auth" && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <Button
                    onClick={() => handleAuthChoice('google')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                  
                  <Button
                    onClick={() => handleAuthChoice('email')}
                    variant="outline"
                    className="w-full border-slate-600 text-white hover:bg-slate-700 flex items-center justify-center gap-3"
                  >
                    <Mail className="h-5 w-5" />
                    Continue with Email
                  </Button>
                  
                  <Button
                    onClick={() => handleAuthChoice('phone')}
                    variant="outline"
                    className="w-full border-slate-600 text-white hover:bg-slate-700 flex items-center justify-center gap-3"
                  >
                    <Phone className="h-5 w-5" />
                    Continue with Phone
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation */}
            {steps[currentStep].id !== "auth" && (
              <div className="flex justify-between pt-6">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {currentStep === steps.length - 2 ? "Get Started" : "Next"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}