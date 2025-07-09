import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, AlertTriangle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import type { Document } from "@shared/schema";

export default function Reminders() {
  const { data: expiringDocs = [], isLoading } = useQuery<Document[]>({
    queryKey: ["/api/documents/expiring"],
  });

  const upcomingReminders = expiringDocs.map(doc => {
    const daysUntilExpiry = doc.expirationDate 
      ? differenceInDays(new Date(doc.expirationDate), new Date())
      : null;
    
    return { ...doc, daysUntilExpiry };
  }).sort((a, b) => (a.daysUntilExpiry || 999) - (b.daysUntilExpiry || 999));

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen relative">
        <Header hideSearch />
        <main className="pb-20 px-4 pt-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-24"></div>
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
          <Bell className="h-6 w-6 text-[var(--papertrail-primary)]" />
          <h1 className="text-xl font-semibold text-gray-900">Reminders</h1>
        </div>

        {upcomingReminders.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Reminders</h3>
            <p className="text-gray-500 text-sm">
              You don't have any documents expiring soon
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReminders.map((doc) => (
              <Card key={doc.id} className="material-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{doc.title}</h3>
                    <div className="flex items-center gap-2">
                      {doc.daysUntilExpiry !== null && doc.daysUntilExpiry <= 30 && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <Badge 
                        variant={doc.daysUntilExpiry !== null && doc.daysUntilExpiry <= 30 ? "destructive" : "secondary"}
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
                  
                  <p className="text-sm text-gray-600 mb-2">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    {doc.expirationDate 
                      ? `Expires ${format(new Date(doc.expirationDate), "MMM d, yyyy")}`
                      : "No expiration date"
                    }
                  </p>
                  
                  <p className="text-xs text-gray-500">
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
