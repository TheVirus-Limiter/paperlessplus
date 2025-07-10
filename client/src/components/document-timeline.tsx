import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Image, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { format, parseISO, isValid, differenceInDays, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from "date-fns";
import { documentDB } from "@/lib/db";
import { CATEGORIES } from "@shared/schema";

interface TimelineDocument {
  id: number;
  title: string;
  location: string;
  category: string;
  urgencyTags: string[];
  expirationDate?: Date;
  imageData?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TimelineGroup {
  month: Date;
  documents: TimelineDocument[];
}

interface DocumentTimelineProps {
  onDocumentClick?: (doc: TimelineDocument) => void;
}

export default function DocumentTimeline({ onDocumentClick }: DocumentTimelineProps) {
  const [documents, setDocuments] = useState<TimelineDocument[]>([]);
  const [timelineGroups, setTimelineGroups] = useState<TimelineGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [filterBy, setFilterBy] = useState<'created' | 'expires'>('created');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (documents.length > 0) {
      generateTimeline();
    }
  }, [documents, filterBy, selectedCategory]);

  const loadDocuments = async () => {
    try {
      const docs = await documentDB.getAllDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents for timeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeline = () => {
    let filteredDocs = documents;

    // Filter by category
    if (selectedCategory !== 'all') {
      filteredDocs = documents.filter(doc => doc.category === selectedCategory);
    }

    // Filter out documents without relevant dates
    if (filterBy === 'expires') {
      filteredDocs = filteredDocs.filter(doc => doc.expirationDate);
    }

    // Group by month based on filter type
    const groups: Map<string, TimelineDocument[]> = new Map();
    
    filteredDocs.forEach(doc => {
      const relevantDate = filterBy === 'expires' && doc.expirationDate 
        ? new Date(doc.expirationDate)
        : new Date(doc.createdAt);
      
      if (!isValid(relevantDate)) return;
      
      const monthKey = format(startOfMonth(relevantDate), 'yyyy-MM');
      
      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(doc);
    });

    // Convert to timeline groups and sort
    const timelineData: TimelineGroup[] = Array.from(groups.entries())
      .map(([monthKey, docs]) => ({
        month: parseISO(monthKey + '-01'),
        documents: docs.sort((a, b) => {
          const dateA = filterBy === 'expires' && a.expirationDate 
            ? new Date(a.expirationDate) 
            : new Date(a.createdAt);
          const dateB = filterBy === 'expires' && b.expirationDate 
            ? new Date(b.expirationDate) 
            : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        })
      }))
      .sort((a, b) => b.month.getTime() - a.month.getTime());

    setTimelineGroups(timelineData);

    // Auto-expand recent months
    const recentMonths = new Set(
      timelineData.slice(0, 3).map(group => format(group.month, 'yyyy-MM'))
    );
    setExpandedMonths(recentMonths);
  };

  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      'id': '🆔',
      'legal': '⚖️', 
      'medical': '🏥',
      'financial': '💰'
    };
    return iconMap[category] || '📄';
  };

  const getCategoryColor = (category: string) => {
    const colorMap: Record<string, string> = {
      'id': 'bg-blue-600',
      'legal': 'bg-green-600', 
      'medical': 'bg-purple-600',
      'financial': 'bg-orange-600'
    };
    return colorMap[category] || 'bg-slate-600';
  };

  const getUrgencyBadgeColor = (tags: string[]) => {
    if (tags.includes('expires-soon')) return 'bg-red-600 text-white';
    if (tags.includes('renewal-due')) return 'bg-orange-600 text-white';
    if (tags.includes('need-for-taxes')) return 'bg-yellow-600 text-black';
    return 'bg-slate-600 text-white';
  };

  const isDocumentExpiring = (doc: TimelineDocument) => {
    if (!doc.expirationDate) return false;
    const daysUntilExpiry = differenceInDays(new Date(doc.expirationDate), new Date());
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-700 animate-pulse rounded-lg h-24"></div>
        ))}
      </div>
    );
  }

  if (timelineGroups.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Timeline Data</h3>
          <p className="text-slate-400">
            {filterBy === 'expires' 
              ? 'No documents have expiration dates set'
              : 'No documents found'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <Clock className="h-5 w-5" />
            Document Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1">
              <Button
                variant={filterBy === 'created' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('created')}
                className={`text-xs ${
                  filterBy === 'created' 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'border-slate-400 text-white hover:bg-slate-700'
                }`}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Created
              </Button>
              <Button
                variant={filterBy === 'expires' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterBy('expires')}
                className={`text-xs ${
                  filterBy === 'expires' 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'border-slate-400 text-white hover:bg-slate-700'
                }`}
              >
                <Clock className="h-3 w-3 mr-1" />
                Expires
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-1">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
              className={`text-xs ${
                selectedCategory === 'all' 
                  ? 'bg-slate-600 text-white hover:bg-slate-700' 
                  : 'border-slate-400 text-white hover:bg-slate-700'
              }`}
            >
              All
            </Button>
            {[
              { id: 'id', name: 'ID', icon: '🆔', color: 'bg-blue-600' },
              { id: 'legal', name: 'Legal', icon: '⚖️', color: 'bg-green-600' },
              { id: 'medical', name: 'Medical', icon: '🏥', color: 'bg-purple-600' },
              { id: 'financial', name: 'Financial', icon: '💰', color: 'bg-orange-600' }
            ].map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={`text-xs ${
                  selectedCategory === category.id 
                    ? `${category.color} text-white hover:${category.color}` 
                    : 'border-slate-400 text-white hover:bg-slate-700'
                }`}
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-3">
        {timelineGroups.map((group) => {
          const monthKey = format(group.month, 'yyyy-MM');
          const isExpanded = expandedMonths.has(monthKey);
          
          return (
            <Card key={monthKey} className="bg-slate-800 border-slate-700">
              <CardHeader 
                className="pb-2 cursor-pointer hover:bg-slate-700/50 transition-colors"
                onClick={() => toggleMonth(monthKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {format(group.month, 'MMM yyyy')}
                    </div>
                    <Badge className="bg-slate-600 text-white text-xs">
                      {group.documents.length} {group.documents.length === 1 ? 'document' : 'documents'}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {group.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                        onClick={() => onDocumentClick?.(doc)}
                      >
                        {/* Date indicator */}
                        <div className="flex-shrink-0 text-center">
                          <div className="text-xs text-slate-400">
                            {format(
                              filterBy === 'expires' && doc.expirationDate 
                                ? new Date(doc.expirationDate) 
                                : new Date(doc.createdAt),
                              'MMM d'
                            )}
                          </div>
                          <div className={`w-3 h-3 rounded-full mt-1 ${getCategoryColor(doc.category)}`} />
                        </div>

                        {/* Document info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-white truncate">
                                {getCategoryIcon(doc.category)} {doc.title}
                              </h4>
                              <p className="text-xs text-slate-400 truncate">
                                {doc.location}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {doc.imageData && (
                                <Image className="h-3 w-3 text-blue-400" />
                              )}
                              {isDocumentExpiring(doc) && (
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              )}
                            </div>
                          </div>

                          {/* Urgency tags */}
                          {doc.urgencyTags.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {doc.urgencyTags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  className={`text-xs px-2 py-0 ${getUrgencyBadgeColor(doc.urgencyTags)}`}
                                >
                                  {tag.replace(/-/g, ' ')}
                                </Badge>
                              ))}
                              {doc.urgencyTags.length > 2 && (
                                <Badge className="text-xs px-2 py-0 bg-slate-600 text-white">
                                  +{doc.urgencyTags.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}

                          {/* Expiration info for created timeline */}
                          {filterBy === 'created' && doc.expirationDate && (
                            <div className="text-xs text-slate-400 mt-1">
                              Expires {format(new Date(doc.expirationDate), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}