import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

/// <reference types="google.maps" />
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Navigation, 
  Square, 
  RotateCcw, 
  Crosshair,
  MapPin,
  AlertTriangle 
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useToast } from '@/hooks/use-toast';

export function MapComponent() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const drawingPath = useRef<google.maps.Polyline | null>(null);
  const polygonObjects = useRef<google.maps.Polygon[]>([]);
  const { toast } = useToast();

  const {
    polygons,
    isDrawingMode,
    currentDrawingPoints,
    mapCenter,
    mapZoom,
    setDrawingMode,
    addDrawingPoint,
    clearDrawingPoints,
    addPolygon,
    selectedDataSourceId,
    dataSources,
    setMapCenter,
    setMapZoom,
  } = useDashboardStore();

  // Initialize map when API key is provided
  useEffect(() => {
    if (!googleMapsApiKey || !mapContainer.current || map.current) return;

    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: googleMapsApiKey,
          version: 'weekly',
          libraries: ['geometry', 'drawing']
        });

        await loader.load();

        map.current = new google.maps.Map(mapContainer.current!, {
          center: { lat: mapCenter[1], lng: mapCenter[0] },
          zoom: mapZoom,
          maxZoom: 15, // Lock zoom for 2 sq km resolution
          minZoom: 8,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          scaleControl: true,
          streetViewControl: false,
          rotateControl: false,
          fullscreenControl: true,
        });

        // Map event listeners
        map.current.addListener('center_changed', () => {
          if (map.current) {
            const center = map.current.getCenter();
            if (center) {
              setMapCenter([center.lng(), center.lat()]);
            }
          }
        });

        map.current.addListener('zoom_changed', () => {
          if (map.current) {
            setMapZoom(map.current.getZoom() || 10);
          }
        });

        // Click event for polygon drawing
        map.current.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (isDrawingMode && e.latLng) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            addDrawingPoint([lng, lat]);
          }
        });

        setShowApiKeyInput(false);
        toast({
          title: "Map Initialized",
          description: "Google Maps is ready for polygon drawing.",
        });

      } catch (error) {
        console.error('Error initializing map:', error);
        toast({
          title: "Map Error",
          description: "Failed to initialize Google Maps. Please check your API key.",
          variant: "destructive",
        });
      }
    };

    initializeMap();

    return () => {
      // Clean up polygons and drawing path
      polygonObjects.current.forEach(polygon => polygon.setMap(null));
      polygonObjects.current = [];
      if (drawingPath.current) {
        drawingPath.current.setMap(null);
      }
    };
  }, [googleMapsApiKey]);

  // Update drawing visualization
  useEffect(() => {
    if (!map.current) return;

    // Clean up existing drawing path
    if (drawingPath.current) {
      drawingPath.current.setMap(null);
      drawingPath.current = null;
    }

    if (isDrawingMode && currentDrawingPoints.length > 0) {
      const path = currentDrawingPoints.map(point => ({
        lat: point[1],
        lng: point[0]
      }));

      drawingPath.current = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#3b82f6',
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });

      drawingPath.current.setMap(map.current);
    }
  }, [currentDrawingPoints, isDrawingMode]);

  // Update polygons visualization
  useEffect(() => {
    if (!map.current) return;

    // Clean up existing polygons
    polygonObjects.current.forEach(polygon => polygon.setMap(null));
    polygonObjects.current = [];

    if (polygons.length > 0) {
      polygons.forEach((polygon) => {
        const path = polygon.coordinates.map(point => ({
          lat: point[1],
          lng: point[0]
        }));

        const googlePolygon = new google.maps.Polygon({
          paths: path,
          strokeColor: polygon.color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: polygon.color,
          fillOpacity: 0.35,
        });

        googlePolygon.setMap(map.current!);
        polygonObjects.current.push(googlePolygon);
      });
    }
  }, [polygons]);

  const startDrawing = () => {
    if (currentDrawingPoints.length >= 12) {
      toast({
        title: "Maximum Points Reached",
        description: "You can only add up to 12 points per polygon.",
        variant: "destructive",
      });
      return;
    }
    setDrawingMode(true);
    clearDrawingPoints();
  };

  const finishPolygon = () => {
    if (currentDrawingPoints.length < 3) {
      toast({
        title: "Insufficient Points",
        description: "A polygon needs at least 3 points.",
        variant: "destructive",
      });
      return;
    }

    const selectedDataSource = dataSources.find(ds => ds.id === selectedDataSourceId);
    if (!selectedDataSource) return;

    // Close the polygon by adding the first point at the end
    const closedCoordinates = [...currentDrawingPoints, currentDrawingPoints[0]];

    addPolygon({
      name: `Polygon ${polygons.length + 1}`,
      coordinates: closedCoordinates.slice(0, -1), // Remove duplicate last point for storage
      dataSourceId: selectedDataSourceId,
      color: selectedDataSource.colorRules[0]?.color || '#3b82f6',
    });

    setDrawingMode(false);
    clearDrawingPoints();

    toast({
      title: "Polygon Created",
      description: `New polygon created with ${currentDrawingPoints.length} points.`,
    });
  };

  const cancelDrawing = () => {
    setDrawingMode(false);
    clearDrawingPoints();
  };

  const resetMapView = () => {
    if (map.current) {
      map.current.setCenter({ lat: 52.52, lng: 13.41 }); // Berlin
      map.current.setZoom(10);
    }
  };

  if (showApiKeyInput) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center h-[500px] bg-card border-border">
        <div className="text-center space-y-6 max-w-md">
          <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground">Setup Google Maps</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Enter your Google Maps API key to initialize the interactive map
            </p>
          </div>

          <div className="space-y-4 w-full">
            <div>
              <Label htmlFor="google-maps-key">Google Maps API Key</Label>
              <Input
                id="google-maps-key"
                type="password"
                placeholder="AIzaSy..."
                value={googleMapsApiKey}
                onChange={(e) => setGoogleMapsApiKey(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <Button 
              onClick={() => googleMapsApiKey && setGoogleMapsApiKey(googleMapsApiKey)}
              disabled={!googleMapsApiKey}
              className="w-full"
            >
              Initialize Map
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Get your API key at: <span className="font-mono">console.cloud.google.com</span></p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-card border-border">
      {/* Map Controls */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Navigation className="h-3 w-3" />
              Interactive Map
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Crosshair className="h-3 w-3" />
              {polygons.length} Polygons
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {isDrawingMode ? (
              <>
                <Badge variant="default" className="gap-1 animate-pulse-soft">
                  <Square className="h-3 w-3" />
                  Drawing ({currentDrawingPoints.length}/12)
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={cancelDrawing}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={finishPolygon}
                  disabled={currentDrawingPoints.length < 3}
                >
                  Finish
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetMapView}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset View
                </Button>
                <Button 
                  size="sm" 
                  onClick={startDrawing}
                  className="gap-2"
                >
                  <Square className="h-4 w-4" />
                  Draw Polygon
                </Button>
              </>
            )}
          </div>
        </div>

        {isDrawingMode && (
          <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">
                Click on the map to add points. Minimum 3 points, maximum 12 points.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapContainer} 
          className="h-[500px] w-full"
          style={{ cursor: isDrawingMode ? 'crosshair' : 'grab' }}
        />
        
        {/* Map overlay with coordinates display */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-2 text-xs text-muted-foreground">
          Center: {mapCenter[1].toFixed(4)}, {mapCenter[0].toFixed(4)} | Zoom: {mapZoom.toFixed(1)}
        </div>
      </div>
    </Card>
  );
}