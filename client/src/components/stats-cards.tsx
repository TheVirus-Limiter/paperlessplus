import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface DocumentStats {
  totalDocs: number;
  expiringDocs: number;
  categories: number;
}

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<DocumentStats>({
    queryKey: ["/api/documents/stats"],
  });

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
