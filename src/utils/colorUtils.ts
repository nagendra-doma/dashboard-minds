import { ColorRule } from '@/store/dashboardStore';

export function applyColorRules(value: number, rules: ColorRule[]): string {
  // Sort rules by value to ensure proper precedence
  const sortedRules = [...rules].sort((a, b) => a.value - b.value);
  
  for (const rule of sortedRules) {
    if (evaluateRule(value, rule)) {
      return rule.color;
    }
  }
  
  // Default color if no rules match
  return '#94a3b8'; // slate-400
}

function evaluateRule(value: number, rule: ColorRule): boolean {
  switch (rule.operator) {
    case '=':
      return value === rule.value;
    case '<':
      return value < rule.value;
    case '>':
      return value > rule.value;
    case '<=':
      return value <= rule.value;
    case '>=':
      return value >= rule.value;
    default:
      return false;
  }
}

export function hexToHsl(hex: string): string {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l;
  
  l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}

export const defaultColors = [
  '#ef4444', // red-500
  '#3b82f6', // blue-500
  '#22c55e', // green-500
  '#eab308', // yellow-500
  '#a855f7', // purple-500
  '#f97316', // orange-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#ec4899', // pink-500
  '#64748b', // slate-500
];

export function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black or white for best contrast
  return luminance > 0.5 ? '#000000' : '#ffffff';
}