interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  hourly_units: {
    time: string;
    temperature_2m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
}

export interface WeatherData {
  timestamp: string;
  temperature: number;
  latitude: number;
  longitude: number;
}

export class OpenMeteoApiService {
  private baseUrl = 'https://archive-api.open-meteo.com/v1/archive';

  async fetchWeatherData(
    latitude: number,
    longitude: number,
    startDate: Date,
    endDate: Date,
    field: string = 'temperature_2m'
  ): Promise<WeatherData[]> {
    try {
      const startDateStr = this.formatDate(startDate);
      const endDateStr = this.formatDate(endDate);
      
      const url = `${this.baseUrl}?latitude=${latitude}&longitude=${longitude}&start_date=${startDateStr}&end_date=${endDateStr}&hourly=${field}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Weather API request failed: ${response.statusText}`);
      }
      
      const data: OpenMeteoResponse = await response.json();
      
      return this.transformResponse(data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  async fetchPolygonWeatherData(
    coordinates: [number, number][],
    startDate: Date,
    endDate: Date,
    field: string = 'temperature_2m'
  ): Promise<number> {
    try {
      // Calculate centroid of polygon for API call
      const centroid = this.calculateCentroid(coordinates);
      
      const weatherData = await this.fetchWeatherData(
        centroid[1], // latitude
        centroid[0], // longitude
        startDate,
        endDate,
        field
      );
      
      // Calculate average value for the time range
      if (weatherData.length === 0) return 0;
      
      const average = weatherData.reduce((sum, data) => sum + data.temperature, 0) / weatherData.length;
      return Math.round(average * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      console.error('Error fetching polygon weather data:', error);
      return 0;
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private transformResponse(data: OpenMeteoResponse): WeatherData[] {
    const { hourly, latitude, longitude } = data;
    
    return hourly.time.map((time, index) => ({
      timestamp: time,
      temperature: hourly.temperature_2m[index] || 0,
      latitude,
      longitude,
    }));
  }

  private calculateCentroid(coordinates: [number, number][]): [number, number] {
    const x = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length;
    const y = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;
    return [x, y];
  }

  // Utility method to get current hour data
  getCurrentHourData(weatherData: WeatherData[], targetDate: Date): number {
    const targetHour = targetDate.toISOString().slice(0, 13) + ':00:00';
    const data = weatherData.find(d => d.timestamp === targetHour);
    return data?.temperature || 0;
  }

  // Utility method to get average data for a time range
  getAverageData(weatherData: WeatherData[], startDate: Date, endDate: Date): number {
    const filteredData = weatherData.filter(d => {
      const dataDate = new Date(d.timestamp);
      return dataDate >= startDate && dataDate <= endDate;
    });
    
    if (filteredData.length === 0) return 0;
    
    const average = filteredData.reduce((sum, data) => sum + data.temperature, 0) / filteredData.length;
    return Math.round(average * 10) / 10;
  }
}

export const openMeteoApi = new OpenMeteoApiService();