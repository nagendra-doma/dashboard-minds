import { useEffect, useCallback } from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { openMeteoApi } from '@/services/openMeteoApi';
import { applyColorRules } from '@/utils/colorUtils';

export function useWeatherData() {
  const {
    polygons,
    timeRange,
    isRangeMode,
    dataSources,
    updatePolygonColor,
    updatePolygonValue,
    setLoading,
  } = useDashboardStore();

  const updatePolygonData = useCallback(async () => {
    if (polygons.length === 0) return;

    setLoading(true);

    try {
      const updatePromises = polygons.map(async (polygon) => {
        const dataSource = dataSources.find(ds => ds.id === polygon.dataSourceId);
        if (!dataSource) return;

        try {
          let averageValue: number;

          if (isRangeMode) {
            // Calculate average for the entire range
            averageValue = await openMeteoApi.fetchPolygonWeatherData(
              polygon.coordinates,
              timeRange.start,
              timeRange.end,
              dataSource.field
            );
          } else {
            // Get value for the current time point
            const currentDate = timeRange.current;
            const nextHour = new Date(currentDate);
            nextHour.setHours(currentDate.getHours() + 1);

            averageValue = await openMeteoApi.fetchPolygonWeatherData(
              polygon.coordinates,
              currentDate,
              nextHour,
              dataSource.field
            );
          }

          // Apply color rules to determine polygon color
          const newColor = applyColorRules(averageValue, dataSource.colorRules);

          // Update polygon with new data
          updatePolygonValue(polygon.id, averageValue);
          updatePolygonColor(polygon.id, newColor);

        } catch (error) {
          console.error(`Error updating polygon ${polygon.id}:`, error);
          // Keep existing values on error
        }
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating polygon data:', error);
    } finally {
      setLoading(false);
    }
  }, [
    polygons,
    timeRange,
    isRangeMode,
    dataSources,
    updatePolygonColor,
    updatePolygonValue,
    setLoading,
  ]);

  // Update data when polygons, time range, or data sources change
  useEffect(() => {
    updatePolygonData();
  }, [updatePolygonData]);

  // Debounce rapid changes to avoid excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updatePolygonData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [timeRange.current, isRangeMode]);

  return { updatePolygonData };
}

export default useWeatherData;
