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
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-16"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="py-4">
      <div className="grid grid-cols-3 gap-3">
        <Card className="material-shadow">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-[var(--papertrail-primary)]">
              {stats?.totalDocs || 0}
            </div>
            <div className="text-xs text-gray-500">Documents</div>
          </CardContent>
        </Card>
        
        <Card className="material-shadow">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-[var(--papertrail-secondary)]">
              {stats?.expiringDocs || 0}
            </div>
            <div className="text-xs text-gray-500">Expiring</div>
          </CardContent>
        </Card>
        
        <Card className="material-shadow">
          <CardContent className="p-3 text-center">
            <div className="text-2xl font-bold text-[var(--papertrail-success)]">
              {stats?.categories || 0}
            </div>
            <div className="text-xs text-gray-500">Categories</div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
