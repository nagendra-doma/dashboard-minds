import React from 'react';
import ReactSlider from 'react-slider';
import { format, addHours, differenceInHours } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, RotateCcw } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

export function TimelineSlider() {
  const {
    timeRange,
    isRangeMode,
    setTimeRange,
    setRangeMode,
  } = useDashboardStore();

  const totalHours = differenceInHours(timeRange.end, timeRange.start);
  const currentHourIndex = differenceInHours(timeRange.current, timeRange.start);

  const handleSingleSliderChange = (value: number) => {
    const newCurrent = addHours(timeRange.start, value);
    setTimeRange({ current: newCurrent });
  };

  const handleRangeSliderChange = (values: number[]) => {
    const [startHours, endHours] = values;
    const newStart = addHours(timeRange.start, startHours);
    const newEnd = addHours(timeRange.start, endHours);
    const newCurrent = addHours(timeRange.start, startHours + (endHours - startHours) / 2);
    
    setTimeRange({
      start: newStart,
      end: newEnd,
      current: newCurrent,
    });
  };

  const resetToToday = () => {
    const today = new Date();
    const fifteenDaysAgo = new Date(today);
    fifteenDaysAgo.setDate(today.getDate() - 15);
    const fifteenDaysFromNow = new Date(today);
    fifteenDaysFromNow.setDate(today.getDate() + 15);

    setTimeRange({
      start: fifteenDaysAgo,
      end: fifteenDaysFromNow,
      current: today,
    });
  };

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Timeline Control</h2>
              <p className="text-sm text-muted-foreground">
                Navigate through 30 days of data (15 days before/after today)
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={!isRangeMode ? "default" : "secondary"} className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {isRangeMode ? 'Range Mode' : 'Single Point'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={resetToToday}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={!isRangeMode ? "default" : "outline"}
            size="sm"
            onClick={() => setRangeMode(false)}
            className="flex-1"
          >
            Single Point
          </Button>
          <Button
            variant={isRangeMode ? "default" : "outline"}
            size="sm"
            onClick={() => setRangeMode(true)}
            className="flex-1"
          >
            Time Range
          </Button>
        </div>

        {/* Slider */}
        <div className="px-4 py-6">
          {isRangeMode ? (
            <ReactSlider
              className="timeline-slider"
              thumbClassName="timeline-thumb"
              trackClassName="timeline-track"
              min={0}
              max={totalHours}
              value={[0, totalHours]}
              onChange={handleRangeSliderChange}
              pearling
              minDistance={1}
              renderThumb={(props, state) => (
                <div {...props} className="timeline-thumb">
                  <div className="thumb-label">
                    {format(addHours(timeRange.start, state.valueNow), 'MMM dd, HH:mm')}
                  </div>
                </div>
              )}
            />
          ) : (
            <ReactSlider
              className="timeline-slider"
              thumbClassName="timeline-thumb"
              trackClassName="timeline-track"
              min={0}
              max={totalHours}
              value={currentHourIndex}
              onChange={handleSingleSliderChange}
              renderThumb={(props, state) => (
                <div {...props} className="timeline-thumb">
                  <div className="thumb-label">
                    {format(addHours(timeRange.start, state.valueNow), 'MMM dd, HH:mm')}
                  </div>
                </div>
              )}
            />
          )}
        </div>

        {/* Current Selection Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="font-medium text-muted-foreground">Start</div>
            <div className="text-foreground">
              {format(timeRange.start, 'MMM dd, yyyy HH:mm')}
            </div>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="font-medium text-primary">Current</div>
            <div className="text-foreground font-medium">
              {format(timeRange.current, 'MMM dd, yyyy HH:mm')}
            </div>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="font-medium text-muted-foreground">End</div>
            <div className="text-foreground">
              {format(timeRange.end, 'MMM dd, yyyy HH:mm')}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .timeline-slider {
          width: 100%;
          height: 8px;
          position: relative;
        }

        .timeline-track {
          position: absolute;
          height: 8px;
          border-radius: 4px;
          background: hsl(var(--timeline-track));
          top: 0;
        }

        .timeline-track.timeline-track-0 {
          background: hsl(var(--timeline-range));
        }

        .timeline-thumb {
          position: absolute;
          width: 20px;
          height: 20px;
          background: hsl(var(--timeline-thumb));
          border: 2px solid hsl(var(--background));
          border-radius: 50%;
          cursor: pointer;
          top: -6px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.2s ease;
        }

        .timeline-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .timeline-thumb:focus {
          outline: none;
          box-shadow: 0 0 0 2px hsl(var(--ring));
        }

        .thumb-label {
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          background: hsl(var(--popover));
          color: hsl(var(--popover-foreground));
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border: 1px solid hsl(var(--border));
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
        }

        .timeline-thumb:hover .thumb-label,
        .timeline-thumb:focus .thumb-label {
          opacity: 1;
        }

        .thumb-label::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 4px solid transparent;
          border-top-color: hsl(var(--popover));
        }
        `
      }} />
    </Card>
  );
}