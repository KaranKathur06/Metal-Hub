'use client';

import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: any;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  sparkline?: number[];
}

export function KPICard({ title, value, change, changeLabel, icon: Icon, variant = 'default', sparkline }: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className={`ops-kpi-card ${variant}`}>
      <div className="ops-kpi-header">
        <span className="ops-kpi-title">{title}</span>
        {Icon && (
          <div className="ops-kpi-icon-wrap">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="ops-kpi-value">{value}</div>
      {(change !== undefined || changeLabel) && (
        <div className="ops-kpi-footer">
          {change !== undefined && (
            <span className={`ops-kpi-change ${isPositive ? 'up' : isNegative ? 'down' : 'neutral'}`}>
              {isPositive ? <ArrowUp className="w-3 h-3" /> : isNegative ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {Math.abs(change)}%
            </span>
          )}
          {changeLabel && <span className="ops-kpi-change-label">{changeLabel}</span>}
        </div>
      )}
      {sparkline && sparkline.length > 0 && (
        <div className="ops-kpi-sparkline">
          <svg viewBox={`0 0 ${sparkline.length * 12} 24`} className="ops-sparkline-svg">
            <polyline
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparkline.map((v, i) => `${i * 12},${24 - (v / Math.max(...sparkline)) * 20}`).join(' ')}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
