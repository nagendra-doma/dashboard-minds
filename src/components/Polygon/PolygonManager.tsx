import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, 
  MapPin, 
  Thermometer,
  Calendar,
  Activity 
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export function PolygonManager() {
  const { polygons, removePolygon, dataSources } = useDashboardStore();
  const { toast } = useToast();

  const handleDeletePolygon = (id: string, name: string) => {
    removePolygon(id);
    toast({
      title: "Polygon Deleted",
      description: `${name} has been removed from the map.`,
    });
  };

  const getDataSourceName = (dataSourceId: string) => {
    const dataSource = dataSources.find(ds => ds.id === dataSourceId);
    return dataSource?.name || 'Unknown';
  };

  if (polygons.length === 0) {
    return (
      <Card className="p-8 text-center bg-card border-border">
        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-full w-fit mx-auto">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">No Polygons</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Draw polygons on the map to start analyzing data
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Polygon Analysis</h3>
            <p className="text-sm text-muted-foreground">
              {polygons.length} polygon{polygons.length !== 1 ? 's' : ''} created
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {polygons.map((polygon) => (
          <div key={polygon.id} className="p-4">
            <div className="space-y-3">
              {/* Polygon Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded border border-border flex-shrink-0"
                    style={{ backgroundColor: polygon.color }}
                  />
                  <div>
                    <h4 className="font-medium text-foreground">{polygon.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {polygon.coordinates.length} points
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePolygon(polygon.id, polygon.name)}
                  className="p-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Polygon Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Data Source:</span>
                </div>
                <div className="col-span-1 sm:col-span-1 lg:col-span-3">
                  <Badge variant="outline" className="text-xs">
                    {getDataSourceName(polygon.dataSourceId)}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Current Value:</span>
                </div>
                <div className="col-span-1 sm:col-span-1 lg:col-span-3">
                  {polygon.currentValue !== undefined ? (
                    <span className="font-medium text-foreground">
                      {polygon.currentValue}°C
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">Loading...</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                </div>
                <div className="col-span-1 sm:col-span-1 lg:col-span-3">
                  <span className="text-foreground">
                    {format(polygon.createdAt, 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              </div>

              {/* Coordinates Preview */}
              <details className="group">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  View Coordinates ({polygon.coordinates.length} points)
                </summary>
                <div className="mt-2 p-3 bg-muted/30 rounded-lg text-xs font-mono">
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {polygon.coordinates.map((coord, index) => (
                      <div key={index} className="text-muted-foreground">
                        {index + 1}: [{coord[0].toFixed(6)}, {coord[1].toFixed(6)}]
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}