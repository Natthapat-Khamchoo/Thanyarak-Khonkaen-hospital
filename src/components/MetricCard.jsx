import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function MetricCard({ 
  title, 
  value, 
  unit = '', 
  targetLabel = '', 
  status = 'pass', // pass, warn, danger
  icon: Icon,
  trendValue = null,
  trendDirection = null, // 'up', 'down', 'neutral'
  onClick
}) {
  const getStatusText = (s) => {
    switch (s) {
      case 'pass': return 'ผ่าน';
      case 'warn': return 'เฝ้าระวัง';
      case 'danger': return 'ต้องปรับปรุง';
      default: return '';
    }
  };

  return (
    <div 
      className={`kpi-card status-${status} animate-fade-in ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div>
        <div className="kpi-header">
          <span>{title}</span>
          {Icon && (
            <div className="kpi-icon-wrapper">
              <Icon size={16} />
            </div>
          )}
        </div>
        <div className="kpi-value">
          {typeof value === 'number' ? value.toLocaleString() : value}
          <span style={{ fontSize: '0.875rem', fontWeight: 500, marginLeft: '4px', color: 'var(--color-text-muted)' }}>
            {unit}
          </span>
        </div>
      </div>
      
      <div className="kpi-meta">
        <span className="kpi-target">{targetLabel}</span>
        {status && (
          <span className={`status-badge ${status}`}>
            <span style={{ fontSize: '6px' }}>●</span>
            {getStatusText(status)}
          </span>
        )}
      </div>
    </div>
  );
}
