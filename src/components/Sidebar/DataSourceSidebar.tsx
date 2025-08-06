import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Database, 
  Plus, 
  Trash2, 
  Palette,
  AlertCircle,
  Eye,
  EyeOff 
} from 'lucide-react';
import { useDashboardStore, ColorRule } from '@/store/dashboardStore';
import { defaultColors } from '@/utils/colorUtils';
import { useToast } from '@/hooks/use-toast';

export function DataSourceSidebar() {
  const {
    dataSources,
    selectedDataSourceId,
    polygons,
    sidebarOpen,
    updateDataSource,
    setSelectedDataSource,
    setSidebarOpen,
  } = useDashboardStore();

  const { toast } = useToast();
  const [newRule, setNewRule] = useState<Partial<ColorRule>>({
    operator: '>=',
    value: 0,
    color: defaultColors[0],
    label: '',
  });

  const selectedDataSource = dataSources.find(ds => ds.id === selectedDataSourceId);

  const addColorRule = () => {
    if (!selectedDataSource || !newRule.value || !newRule.label) {
      toast({
        title: "Invalid Rule",
        description: "Please fill in all fields for the color rule.",
        variant: "destructive",
      });
      return;
    }

    const rule: ColorRule = {
      operator: newRule.operator as ColorRule['operator'],
      value: newRule.value,
      color: newRule.color || defaultColors[0],
      label: newRule.label,
    };

    updateDataSource(selectedDataSource.id, {
      colorRules: [...selectedDataSource.colorRules, rule],
    });

    setNewRule({
      operator: '>=',
      value: 0,
      color: defaultColors[0],
      label: '',
    });

    toast({
      title: "Rule Added",
      description: `Color rule "${rule.label}" added successfully.`,
    });
  };

  const removeColorRule = (index: number) => {
    if (!selectedDataSource) return;

    const updatedRules = selectedDataSource.colorRules.filter((_, i) => i !== index);
    updateDataSource(selectedDataSource.id, { colorRules: updatedRules });

    toast({
      title: "Rule Removed",
      description: "Color rule removed successfully.",
    });
  };

  const getPolygonCount = (dataSourceId: string) => {
    return polygons.filter(p => p.dataSourceId === dataSourceId).length;
  };

  if (!sidebarOpen) {
    return (
      <div className="w-12 h-full bg-dashboard-sidebar-bg border-r border-border flex flex-col items-center py-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(true)}
          className="p-2"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-dashboard-sidebar-bg border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Database className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Data Sources</h2>
              <p className="text-xs text-muted-foreground">Configure visualization rules</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="p-2"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Data Source Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Active Data Source</Label>
            <Select value={selectedDataSourceId} onValueChange={setSelectedDataSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dataSources.map((ds) => (
                  <SelectItem key={ds.id} value={ds.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{ds.name}</span>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {getPolygonCount(ds.id)} polygons
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedDataSource && (
            <>
              {/* Data Source Info */}
              <Card className="p-4 bg-muted/50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedDataSource.field}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {getPolygonCount(selectedDataSource.id)} polygons
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Temperature data from Open-Meteo API
                  </p>
                </div>
              </Card>

              <Separator />

              {/* Color Rules */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium text-foreground">Color Rules</Label>
                </div>

                {/* Existing Rules */}
                <div className="space-y-2">
                  {selectedDataSource.colorRules.map((rule, index) => (
                    <Card key={index} className="p-3 bg-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded border border-border"
                            style={{ backgroundColor: rule.color }}
                          />
                          <div className="text-sm">
                            <span className="font-medium">{rule.label}</span>
                            <div className="text-muted-foreground">
                              {rule.operator} {rule.value}°C
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeColorRule(index)}
                          className="p-1 h-auto text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </Card>
                  ))}

                  {selectedDataSource.colorRules.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">No color rules defined</p>
                      <p className="text-xs">Add rules to visualize data</p>
                    </div>
                  )}
                </div>

                {/* Add New Rule */}
                <Card className="p-4 bg-muted/30 border-dashed">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Plus className="h-4 w-4" />
                      Add Color Rule
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Operator</Label>
                        <Select
                          value={newRule.operator}
                          onValueChange={(value) => setNewRule({ ...newRule, operator: value as ColorRule['operator'] })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="<">Less than (&lt;)</SelectItem>
                            <SelectItem value="<=">Less or equal (≤)</SelectItem>
                            <SelectItem value="=">Equal (=)</SelectItem>
                            <SelectItem value=">">Greater than (&gt;)</SelectItem>
                            <SelectItem value=">=">Greater or equal (≥)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Value</Label>
                        <Input
                          type="number"
                          placeholder="25"
                          value={newRule.value || ''}
                          onChange={(e) => setNewRule({ ...newRule, value: parseFloat(e.target.value) })}
                          className="h-8"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Label</Label>
                      <Input
                        placeholder="Hot weather"
                        value={newRule.label || ''}
                        onChange={(e) => setNewRule({ ...newRule, label: e.target.value })}
                        className="h-8"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Color</Label>
                      <div className="flex gap-2 mt-1">
                        {defaultColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewRule({ ...newRule, color })}
                            className={`w-6 h-6 rounded border-2 transition-all ${
                              newRule.color === color
                                ? 'border-primary scale-110'
                                : 'border-border hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={addColorRule}
                      size="sm"
                      className="w-full"
                      disabled={!newRule.value || !newRule.label}
                    >
                      Add Rule
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>Rules apply in order of value</p>
          <p>First matching rule determines color</p>
        </div>
      </div>
    </div>
  );
}
