import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Share2, ArrowLeft, ExternalLink } from "lucide-react";

// Import report components
import { BrandVisibilityCard } from "@/components/report/BrandVisibilityCard";
import { BrandReachCard } from "@/components/report/BrandReachCard";
import { TopicVisibilityMatrix } from "@/components/report/TopicVisibilityMatrix";
import { ModelVisibilityCard } from "@/components/report/ModelVisibilityCard";
import { SourcesCard } from "@/components/report/SourcesCard";
import { getComprehensiveReport } from "@/services/analysisService";

// Types for the comprehensive report data
interface ComprehensiveReportData {
  reportInfo: {
    id: string;
    brandName: string;
    brandLogo?: string;
    analysisDate: string;
    totalQueries: number;
    totalResponses: number;
  };
  brandVisibility: {
    percentage: number;
    platforms: {
      name: string;
      url: string;
      mentions: number;
      visibility: number;
    }[];
    totalPrompts: number;
    totalAppearances: number;
  };
  brandReach: {
    personasVisibility: {
      name: string;
      visibility: number;
    }[];
    topicsVisibility: {
      name: string;
      visibility: number;
    }[];
  };
  topicMatrix: {
    personas: string[];
    topics: string[];
    matrix: {
      personaName: string;
      topicName: string;
      score: number;
    }[];
  };
  modelVisibility: {
    name: string;
    visibility: number;
    logo?: string;
  }[];
  sources: {
    topSources: {
      domain: string;
      count: number;
    }[];
    sourceTypes: {
      category: string;
      count: number;
    }[];
  };
}

// Mock data - replace with actual API calls
const mockReportData: ComprehensiveReportData = {
  reportInfo: {
    id: "report-1",
    brandName: "Your Brand",
    analysisDate: new Date().toISOString().split('T')[0],
    totalQueries: 60,
    totalResponses: 1843,
  },
  brandVisibility: {
    percentage: 33,
    platforms: [
      { name: "Apple", url: "apple.com", mentions: 258, visibility: 70 },
      { name: "Spotify", url: "spotify.com", mentions: 287, visibility: 72 },
      { name: "Amazon", url: "amazon.com", mentions: 220, visibility: 58 },
      { name: "eBay", url: "ebay.com", mentions: 208, visibility: 52 },
      { name: "YouTube", url: "youtube.com", mentions: 133, visibility: 33 },
    ],
    totalPrompts: 60,
    totalAppearances: 33,
  },
  brandReach: {
    personasVisibility: [
      { name: "Workout Warrior", visibility: 54 },
      { name: "Tech-Savvy Parent", visibility: 46 },
      { name: "Nostalgic Millennial", visibility: 42 },
      { name: "Digital Social Butterfly", visibility: 32 },
      { name: "Independent Artist Enthusiast", visibility: 30 },
      { name: "Multi-tasking Commuter", visibility: 28 },
      { name: "Ambient Audio Professional", visibility: 18 },
      { name: "Global Music Explorer", visibility: 16 },
    ],
    topicsVisibility: [
      { name: "Family Music Subscription Plans", visibility: 57 },
      { name: "AI-Powered Music Streaming Services", visibility: 47 },
      { name: "Student Discount Music Services", visibility: 40 },
      { name: "Music Streaming With Podcasts", visibility: 38 },
      { name: "Best Music Streaming Apps", visibility: 36 },
      { name: "Office Music Listening Apps", visibility: 29 },
      { name: "Compare Popular Streaming Music Platforms", visibility: 24 },
      { name: "Music Apps With Curated Playlists", visibility: 23 },
      { name: "High-Quality Audio Streaming", visibility: 23 },
      { name: "How to Switch Music Streaming Services", visibility: 18 },
    ],
  },
  topicMatrix: {
    personas: ["Workout Warrior", "Tech-Savvy Parent", "Nostalgic Millennial", "Digital Social Butterfly", "Independent Artist Enthusiast", "Multi-tasking Commuter"],
    topics: ["Family Music", "AI Music Rec", "Student Disc", "Music + Pod", "Best Apps", "Office Music", "Compare", "Curated", "High Quality", "How to Switch"],
    matrix: [
      { personaName: "Workout Warrior", topicName: "Family Music", score: 90 },
      { personaName: "Workout Warrior", topicName: "AI Music Rec", score: 90 },
      { personaName: "Workout Warrior", topicName: "Student Disc", score: 40 },
      { personaName: "Workout Warrior", topicName: "Music + Pod", score: 60 },
      { personaName: "Tech-Savvy Parent", topicName: "Family Music", score: 90 },
      { personaName: "Tech-Savvy Parent", topicName: "AI Music Rec", score: 60 },
      { personaName: "Tech-Savvy Parent", topicName: "Best Apps", score: 60 },
      { personaName: "Nostalgic Millennial", topicName: "Best Apps", score: 70 },
      { personaName: "Nostalgic Millennial", topicName: "Compare", score: 60 },
      { personaName: "Digital Social Butterfly", topicName: "Music + Pod", score: 70 },
      { personaName: "Digital Social Butterfly", topicName: "Best Apps", score: 40 },
      { personaName: "Independent Artist Enthusiast", topicName: "High Quality", score: 80 },
      { personaName: "Independent Artist Enthusiast", topicName: "Curated", score: 40 },
      { personaName: "Multi-tasking Commuter", topicName: "Office Music", score: 80 },
      { personaName: "Multi-tasking Commuter", topicName: "How to Switch", score: 20 },
    ],
  },
  modelVisibility: [
    { name: "Google Gemini 1.5 Flash", visibility: 59 },
    { name: "Anthropic Claude", visibility: 30 },
    { name: "OpenAI o1", visibility: 29 },
    { name: "OpenAI o1-Mini", visibility: 28 },
    { name: "Perplexity AI Sonar", visibility: 31 },
  ],
  sources: {
    topSources: [
      { domain: "youtube.com", count: 42 },
      { domain: "support.google", count: 25 },
      { domain: "whathifi.com", count: 23 },
      { domain: "theverge.com", count: 17 },
      { domain: "apple.com", count: 17 },
      { domain: "google.com", count: 16 },
      { domain: "spotify.com", count: 15 },
      { domain: "techcrunch.com", count: 15 },
      { domain: "musicam.com", count: 15 },
      { domain: "tidal.com", count: 14 },
    ],
    sourceTypes: [
      { category: "Business Service Sites", count: 190 },
      { category: "Unknown/Other", count: 93 },
      { category: "Entertainment Sites", count: 77 },
      { category: "Blogs/Content Sites", count: 69 },
      { category: "Social Networks", count: 57 },
      { category: "Directory/Review Sites", count: 56 },
      { category: "News/Media Sites", count: 50 },
      { category: "Educational Sites", count: 47 },
      { category: "E-commerce Sites", count: 44 },
      { category: "Forums/Community Sites", count: 44 },
    ],
  },
};

export const ComprehensiveReportPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<ComprehensiveReportData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if this is a demo route
  const isDemoRoute = window.location.pathname === '/demo/report';

  useEffect(() => {
    const loadReportData = async () => {
      // For demo route, always use mock data
      if (isDemoRoute) {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
        setReportData({
          ...mockReportData,
          reportInfo: {
            ...mockReportData.reportInfo,
            id: 'demo',
          }
        });
        setLoading(false);
        return;
      }

      if (!reportId) return;
      
      setLoading(true);
      
      try {
        // Try to fetch real data from the API
        const result = await getComprehensiveReport(reportId);
        
        if (result.success) {
          setReportData(result.data);
        } else {
          console.warn('Failed to load report data, using mock data:', 'error' in result ? result.error : 'Unknown error');
          // Fall back to mock data for development/demo purposes
          setReportData({
            ...mockReportData,
            reportInfo: {
              ...mockReportData.reportInfo,
              id: reportId,
            }
          });
        }
      } catch (error) {
        console.error('Error loading report data:', error);
        // Fall back to mock data
        setReportData({
          ...mockReportData,
          reportInfo: {
            ...mockReportData.reportInfo,
            id: reportId,
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadReportData();
  }, [reportId]);

  const handleExportReport = () => {
    // Implement export functionality
    console.log("Exporting report...");
  };

  const handleShareReport = () => {
    // Implement share functionality
    console.log("Sharing report...");
  };

  const handleViewDetails = (section: string) => {
    // Navigate to detailed view
    console.log(`Viewing details for: ${section}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          <div className="grid gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!reportData) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Report Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The report you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/reports")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/reports")}
                className="p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold font-heading">
                  {reportData.reportInfo.brandName} Analysis Report
                </h1>
                <p className="text-muted-foreground">
                  Generated on {new Date(reportData.reportInfo.analysisDate).toLocaleDateString()} • 
                  {reportData.reportInfo.totalQueries} queries • 
                  {reportData.reportInfo.totalResponses} responses analyzed
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleShareReport}
              className="flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </Button>
            <Button 
              onClick={handleExportReport}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('#', '_blank')}
              className="flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Copy Report Link</span>
            </Button>
          </div>
        </div>

        {/* Report Sections */}
        <div className="space-y-8">
          {/* Brand Visibility */}
          <BrandVisibilityCard 
            data={reportData.brandVisibility}
            onViewDetails={() => handleViewDetails('brand-visibility')}
          />

          {/* Brand Reach - Only show if data exists */}
          {(reportData.brandReach.personasVisibility.length > 0 || reportData.brandReach.topicsVisibility.length > 0) && (
            <BrandReachCard 
              data={reportData.brandReach}
              onPersonaClick={(persona) => handleViewDetails(`persona-${persona.name}`)}
              onTopicClick={(topic) => handleViewDetails(`topic-${topic.name}`)}
            />
          )}

          {/* Topic Visibility Matrix - Only show if data exists */}
          {reportData.topicMatrix.matrix.length > 0 && (
            <TopicVisibilityMatrix 
              data={reportData.topicMatrix}
              onCellClick={(cell) => handleViewDetails(`matrix-${cell.personaName}-${cell.topicName}`)}
            />
          )}

          {/* Model Visibility - Only show if data exists */}
          {reportData.modelVisibility.length > 0 && (
            <ModelVisibilityCard 
              data={reportData.modelVisibility}
              onModelClick={(model) => handleViewDetails(`model-${model.name}`)}
            />
          )}

          {/* Sources - Only show if data exists */}
          {(reportData.sources.topSources.length > 0 || reportData.sources.sourceTypes.length > 0) && (
            <SourcesCard 
              data={reportData.sources}
              onSourceClick={(source) => handleViewDetails(`source-${source.domain}`)}
              onSourceTypeClick={(sourceType) => handleViewDetails(`source-type-${sourceType.category}`)}
            />
          )}

          {/* Demo notice */}
          {isDemoRoute && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Demo Report</h3>
                <p className="text-muted-foreground mb-4">
                  This is a demonstration of the comprehensive brand analysis report. 
                  Real reports will be generated from your actual AI analysis data.
                </p>
                <Button onClick={() => navigate("/setup")} className="mr-2">
                  Start Your Analysis
                </Button>
                <Button variant="outline" onClick={() => navigate("/reports")}>
                  View Real Reports
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}; 