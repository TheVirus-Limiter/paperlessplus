import { useState, useEffect } from "react";
import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { documentDB } from "@/lib/db";

export default function Reminders() {
  const [expiringDocs, setExpiringDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExpiringDocs = async () => {
      try {
        const docs = await documentDB.getExpiringDocuments(90); // Get docs expiring in next 90 days
        setExpiringDocs(docs);
      } catch (error) {
        console.error('Error loading expiring documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExpiringDocs();
  }, []);

  const upcomingReminders = expiringDocs.map(doc => {
    const daysUntilExpiry = doc.expirationDate 
      ? differenceInDays(new Date(doc.expirationDate), new Date())
      : null;
    
    return { ...doc, daysUntilExpiry };
  }).sort((a, b) => (a.daysUntilExpiry || 999) - (b.daysUntilExpiry || 999));

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-slate-900 min-h-screen relative text-white">
        <Header hideSearch />
        <main className="pb-20 px-4 pt-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-700 animate-pulse rounded-lg h-24"></div>
            ))}
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-slate-900 min-h-screen relative text-white">
      <Header hideSearch />
      
      <main className="pb-20 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-6 w-6 text-purple-400" />
          <h1 className="text-xl font-semibold text-white">Reminders</h1>
        </div>

        {upcomingReminders.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white mb-2">No Upcoming Reminders</h3>
            <p className="text-slate-400 text-sm">
              You don't have any documents expiring soon
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReminders.map((doc) => (
              <Card key={doc.id} className="material-shadow bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white">{doc.title}</h3>
                    <div className="flex items-center gap-2">
                      {doc.daysUntilExpiry !== null && doc.daysUntilExpiry <= 30 && (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      )}
                      <Badge 
                        className={`text-xs ${
                          doc.daysUntilExpiry !== null && doc.daysUntilExpiry <= 30 
                            ? "bg-red-600 text-white" 
                            : "bg-slate-600 text-white"
                        }`}
                      >
                        {doc.daysUntilExpiry !== null 
                          ? doc.daysUntilExpiry <= 0 
                            ? "Expired" 
                            : `${doc.daysUntilExpiry} days`
                          : "No date set"
                        }
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-300 mb-2 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {doc.expirationDate 
                      ? `Expires ${format(new Date(doc.expirationDate), "MMM d, yyyy")}`
                      : "No expiration date"
                    }
                  </p>
                  
                  <p className="text-xs text-slate-400">
                    Location: {doc.location}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <BottomNavigation />
    </div>
  );
}
