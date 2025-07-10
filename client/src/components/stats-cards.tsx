import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { documentDB } from "@/lib/db";

interface DocumentStats {
  totalDocs: number;
  expiringDocs: number;
  categories: number;
}

export default function StatsCards() {
  const [stats, setStats] = useState<DocumentStats>({ totalDocs: 0, expiringDocs: 0, categories: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const documents = await documentDB.getAllDocuments();
        const expiringDocs = await documentDB.getExpiringDocuments(30);
        const categories = new Set(documents.map(doc => doc.category));
        
        setStats({
          totalDocs: documents.length,
          expiringDocs: expiringDocs.length,
          categories: categories.size
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <section className="py-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-700 animate-pulse rounded-lg h-16"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="material-shadow bg-slate-800 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {stats?.totalDocs || 0}
            </div>
            <div className="text-xs text-slate-400">Documents</div>
          </CardContent>
        </Card>
        
        <Card className="material-shadow bg-slate-800 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">
              {stats?.expiringDocs || 0}
            </div>
            <div className="text-xs text-slate-400">Expiring</div>
          </CardContent>
        </Card>
        
        <Card className="material-shadow bg-slate-800 border-slate-700">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {stats?.categories || 0}
            </div>
            <div className="text-xs text-slate-400">Categories</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
