import React from 'react';
import { TimelineSlider } from '@/components/Timeline/TimelineSlider';
import { MapComponent } from '@/components/Map/MapComponent';
import { DataSourceSidebar } from '@/components/Sidebar/DataSourceSidebar';
import { PolygonManager } from '@/components/Polygon/PolygonManager';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useDashboardStore } from '@/store/dashboardStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Map, 
  Database,
  Settings,
  Loader2 
} from 'lucide-react';

export function Dashboard() {
  const { loading, polygons, sidebarOpen, setSidebarOpen } = useDashboardStore();
  
  // Initialize weather data updates
  useWeatherData();

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Geospatial Data Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Interactive map visualization with temporal data analysis
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {loading && (
                <Badge variant="secondary" className="gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading data...
                </Badge>
              )}
              
              <Badge variant="outline" className="gap-1">
                <Map className="h-3 w-3" />
                {polygons.length} Polygons
              </Badge>

              {!sidebarOpen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <DataSourceSidebar />

        {/* Main Panel */}
        <div className="flex-1 flex flex-col">
          {/* Timeline */}
          <div className="p-4 border-b border-border bg-card">
            <TimelineSlider />
          </div>

          {/* Content Grid */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Map - Takes 2/3 of the width on large screens */}
            <div className="lg:col-span-2">
              <MapComponent />
            </div>

            {/* Polygon Manager - Takes 1/3 of the width on large screens */}
            <div className="lg:col-span-1">
              <PolygonManager />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}