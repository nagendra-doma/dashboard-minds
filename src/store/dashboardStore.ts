import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface ColorRule {
  operator: '=' | '<' | '>' | '<=' | '>=';
  value: number;
  color: string;
  label: string;
}

export interface DataSource {
  id: string;
  name: string;
  field: string;
  colorRules: ColorRule[];
  apiEndpoint?: string;
}

export interface Polygon {
  id: string;
  name: string;
  coordinates: [number, number][];
  dataSourceId: string;
  color: string;
  currentValue?: number;
  createdAt: Date;
}

export interface TimeRange {
  start: Date;
  end: Date;
  current: Date;
}

interface DashboardState {
  // Timeline state
  timeRange: TimeRange;
  isRangeMode: boolean;
  
  // Polygon state
  polygons: Polygon[];
  isDrawingMode: boolean;
  currentDrawingPoints: [number, number][];
  
  // Data sources
  dataSources: DataSource[];
  selectedDataSourceId: string;
  
  // Map state
  mapCenter: [number, number];
  mapZoom: number;
  
  // UI state
  sidebarOpen: boolean;
  loading: boolean;
  
  // Actions
  setTimeRange: (timeRange: Partial<TimeRange>) => void;
  setRangeMode: (isRange: boolean) => void;
  
  addPolygon: (polygon: Omit<Polygon, 'id' | 'createdAt'>) => void;
  removePolygon: (id: string) => void;
  updatePolygonColor: (id: string, color: string) => void;
  updatePolygonValue: (id: string, value: number) => void;
  
  setDrawingMode: (enabled: boolean) => void;
  addDrawingPoint: (point: [number, number]) => void;
  clearDrawingPoints: () => void;
  
  addDataSource: (dataSource: Omit<DataSource, 'id'>) => void;
  updateDataSource: (id: string, dataSource: Partial<DataSource>) => void;
  setSelectedDataSource: (id: string) => void;
  
  setMapCenter: (center: [number, number]) => void;
  setMapZoom: (zoom: number) => void;
  
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
}

// Default data sources
const defaultDataSources: DataSource[] = [
  {
    id: 'open-meteo-temperature',
    name: 'Temperature (°C)',
    field: 'temperature_2m',
    colorRules: [
      { operator: '<', value: 10, color: '#3b82f6', label: 'Cold' },
      { operator: '>=', value: 10, color: '#22c55e', label: 'Mild' },
      { operator: '>=', value: 25, color: '#ef4444', label: 'Hot' },
    ],
    apiEndpoint: 'https://archive-api.open-meteo.com/v1/archive'
  }
];

// Calculate 30-day window (15 days before and after today)
const today = new Date();
const fifteenDaysAgo = new Date(today);
fifteenDaysAgo.setDate(today.getDate() - 15);
const fifteenDaysFromNow = new Date(today);
fifteenDaysFromNow.setDate(today.getDate() + 15);

export const useDashboardStore = create<DashboardState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        timeRange: {
          start: fifteenDaysAgo,
          end: fifteenDaysFromNow,
          current: today,
        },
        isRangeMode: false,
        
        polygons: [],
        isDrawingMode: false,
        currentDrawingPoints: [],
        
        dataSources: defaultDataSources,
        selectedDataSourceId: defaultDataSources[0].id,
        
        mapCenter: [52.52, 13.41], // Berlin
        mapZoom: 10,
        
        sidebarOpen: true,
        loading: false,
        
        // Actions
        setTimeRange: (timeRange) =>
          set((state) => ({
            timeRange: { ...state.timeRange, ...timeRange },
          })),
        
        setRangeMode: (isRange) => set({ isRangeMode: isRange }),
        
        addPolygon: (polygon) =>
          set((state) => ({
            polygons: [
              ...state.polygons,
              {
                ...polygon,
                id: `polygon-${Date.now()}`,
                createdAt: new Date(),
              },
            ],
          })),
        
        removePolygon: (id) =>
          set((state) => ({
            polygons: state.polygons.filter((p) => p.id !== id),
          })),
        
        updatePolygonColor: (id, color) =>
          set((state) => ({
            polygons: state.polygons.map((p) =>
              p.id === id ? { ...p, color } : p
            ),
          })),
        
        updatePolygonValue: (id, value) =>
          set((state) => ({
            polygons: state.polygons.map((p) =>
              p.id === id ? { ...p, currentValue: value } : p
            ),
          })),
        
        setDrawingMode: (enabled) =>
          set({
            isDrawingMode: enabled,
            currentDrawingPoints: enabled ? [] : get().currentDrawingPoints,
          }),
        
        addDrawingPoint: (point) =>
          set((state) => ({
            currentDrawingPoints: [...state.currentDrawingPoints, point],
          })),
        
        clearDrawingPoints: () => set({ currentDrawingPoints: [] }),
        
        addDataSource: (dataSource) =>
          set((state) => ({
            dataSources: [
              ...state.dataSources,
              { ...dataSource, id: `datasource-${Date.now()}` },
            ],
          })),
        
        updateDataSource: (id, dataSource) =>
          set((state) => ({
            dataSources: state.dataSources.map((ds) =>
              ds.id === id ? { ...ds, ...dataSource } : ds
            ),
          })),
        
        setSelectedDataSource: (id) => set({ selectedDataSourceId: id }),
        
        setMapCenter: (center) => set({ mapCenter: center }),
        setMapZoom: (zoom) => set({ mapZoom: zoom }),
        
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        setLoading: (loading) => set({ loading: loading }),
      }),
      {
        name: 'dashboard-store',
        partialize: (state) => ({
          polygons: state.polygons,
          dataSources: state.dataSources,
          mapCenter: state.mapCenter,
          mapZoom: state.mapZoom,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    ),
    { name: 'dashboard-store' }
  )
);