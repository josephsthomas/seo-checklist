import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  FileText,
  BarChart3,
  Activity,
  Table as TableIcon
} from 'lucide-react';

/**
 * Report Widget Renderer
 * Renders different widget types with mock/real data
 */

export default function ReportWidgetRenderer({ widget, data }) {
  const { type, config } = widget;

  switch (type) {
    case 'metric':
      return <MetricWidget config={config} data={data} />;
    case 'chart':
      return <ChartWidget config={config} data={data} />;
    case 'table':
      return <TableWidget config={config} data={data} />;
    case 'text':
      return <TextWidget config={config} />;
    case 'divider':
      return <DividerWidget config={config} />;
    case 'summary':
      return <SummaryWidget config={config} data={data} />;
    default:
      return <PlaceholderWidget type={type} />;
  }
}

/**
 * Metric Widget - Single value with optional trend
 */
function MetricWidget({ config, data }) {
  const value = data?.value ?? '--';
  const change = data?.change;
  const trend = data?.trend;
  const label = data?.label;

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-charcoal-400';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  // Determine value color based on score
  const getValueColor = () => {
    if (typeof value !== 'number') return 'text-charcoal-900 dark:text-white';
    if (value >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (value >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="h-full p-4 flex flex-col justify-between">
      <h4 className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400 truncate">
        {config.title || 'Metric'}
      </h4>
      <div className="flex items-end justify-between">
        <div>
          <span className={`text-3xl font-bold ${getValueColor()}`}>
            {typeof value === 'number' && value <= 100 ? `${value}%` : value}
          </span>
          {label && (
            <span className="text-sm text-charcoal-400 dark:text-charcoal-500 ml-1">
              {label}
            </span>
          )}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{change}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Chart Widget - Various chart types
 */
function ChartWidget({ config, data }) {
  const chartType = config.chartType || 'bar';

  // Handle different data shapes
  const renderChart = () => {
    if (!data) {
      return (
        <div className="flex-1 flex items-center justify-center text-charcoal-400">
          <BarChart3 className="w-8 h-8" />
        </div>
      );
    }

    // Array data (categories, history, etc.)
    if (Array.isArray(data)) {
      return renderArrayChart(data, chartType);
    }

    // Object data (issues breakdown, etc.)
    if (typeof data === 'object') {
      return renderObjectChart(data, chartType);
    }

    return null;
  };

  return (
    <div className="h-full p-4 flex flex-col">
      <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-3">
        {config.title || 'Chart'}
      </h4>
      {renderChart()}
    </div>
  );
}

/**
 * Render chart from array data
 */
function renderArrayChart(data, chartType) {
  const maxValue = Math.max(...data.map(d => d.score || d.progress || d.value || 0));

  if (chartType === 'line' || chartType === 'area') {
    // Line/Area chart
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d.score || d.value || 0) / maxValue) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="flex-1 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {chartType === 'area' && (
            <polygon
              points={`0,100 ${points} 100,100`}
              fill="url(#gradient)"
              opacity="0.3"
            />
          )}
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-primary-500"
          />
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - ((d.score || d.value || 0) / maxValue) * 80;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                className="fill-primary-500"
              />
            );
          })}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" className="text-primary-500" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-primary-500" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-charcoal-400">
          {data.slice(0, 5).map((d, i) => (
            <span key={i}>{d.date || d.name}</span>
          ))}
        </div>
      </div>
    );
  }

  // Bar chart
  return (
    <div className="flex-1 flex items-end gap-2">
      {data.map((item, i) => {
        const value = item.score || item.progress || item.value || 0;
        const height = (value / maxValue) * 100;
        const color = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500';

        return (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div className="w-full flex flex-col items-center">
              <span className="text-[10px] text-charcoal-500 mb-1">{value}</span>
              <div
                className={`w-full ${color} rounded-t transition-all`}
                style={{ height: `${Math.max(height, 4)}%`, minHeight: 4 }}
              />
            </div>
            <span className="text-[10px] text-charcoal-400 mt-1 truncate max-w-full">
              {item.name?.slice(0, 8)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Render chart from object data
 */
function renderObjectChart(data, chartType) {
  const entries = Object.entries(data).filter(([, v]) => typeof v === 'number');
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  const colors = ['bg-red-500', 'bg-amber-500', 'bg-primary-500', 'bg-emerald-500', 'bg-purple-500'];

  if (chartType === 'pie' || chartType === 'donut') {
    // Pie/Donut chart simulation
    let currentAngle = 0;

    return (
      <div className="flex-1 flex items-center gap-4">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {entries.map(([key, value], i) => {
              const percentage = (value / total) * 100;
              const dashArray = percentage * 3.14159;
              const dashOffset = -currentAngle * 3.14159;
              currentAngle += percentage;

              return (
                <circle
                  key={key}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={chartType === 'donut' ? '15' : '40'}
                  strokeDasharray={`${dashArray} 314.159`}
                  strokeDashoffset={dashOffset}
                  className={colors[i % colors.length].replace('bg-', 'text-')}
                />
              );
            })}
          </svg>
          {chartType === 'donut' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-charcoal-900 dark:text-white">
                {total}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1">
          {entries.map(([key, value], i) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-sm ${colors[i % colors.length]}`} />
              <span className="text-charcoal-600 dark:text-charcoal-400 capitalize">{key}</span>
              <span className="font-medium text-charcoal-900 dark:text-white ml-auto">{value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default bar chart
  return (
    <div className="flex-1 flex items-end gap-2">
      {entries.map(([key, value], i) => {
        const height = (value / Math.max(...entries.map(([, v]) => v))) * 100;
        return (
          <div key={key} className="flex-1 flex flex-col items-center">
            <span className="text-[10px] text-charcoal-500 mb-1">{value}</span>
            <div
              className={`w-full ${colors[i % colors.length]} rounded-t`}
              style={{ height: `${Math.max(height, 4)}%`, minHeight: 4 }}
            />
            <span className="text-[10px] text-charcoal-400 mt-1 capitalize">{key}</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Table Widget - Tabular data display
 */
function TableWidget({ config, data }) {
  const rows = config.rows || 5;
  const items = Array.isArray(data) ? data.slice(0, rows) : [];

  if (items.length === 0) {
    return (
      <div className="h-full p-4 flex flex-col">
        <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-3">
          {config.title || 'Table'}
        </h4>
        <div className="flex-1 flex items-center justify-center text-charcoal-400">
          <TableIcon className="w-8 h-8" />
        </div>
      </div>
    );
  }

  // Get columns from first item
  const columns = Object.keys(items[0]);

  return (
    <div className="h-full p-4 flex flex-col">
      <h4 className="text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-3">
        {config.title || 'Table'}
      </h4>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-charcoal-200 dark:border-charcoal-700">
              {columns.map(col => (
                <th
                  key={col}
                  className="text-left py-2 px-2 text-xs font-medium text-charcoal-500 dark:text-charcoal-400 uppercase"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr
                key={i}
                className="border-b border-charcoal-100 dark:border-charcoal-700/50 last:border-0"
              >
                {columns.map(col => (
                  <td
                    key={col}
                    className="py-2 px-2 text-charcoal-700 dark:text-charcoal-300"
                  >
                    {renderCellValue(item[col], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Render cell value with formatting
 */
function renderCellValue(value, column) {
  // Priority/severity badges
  if (column === 'priority' || column === 'severity') {
    const colors = {
      high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      serious: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      moderate: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[value] || 'bg-charcoal-100 text-charcoal-700'}`}>
        {value}
      </span>
    );
  }

  // Status badges
  if (column === 'status') {
    const colors = {
      implemented: 'text-emerald-600',
      missing: 'text-red-600',
      pending: 'text-amber-600'
    };
    return (
      <span className={`flex items-center gap-1 ${colors[value] || ''}`}>
        {value === 'implemented' && <CheckCircle className="w-3 h-3" />}
        {value === 'missing' && <XCircle className="w-3 h-3" />}
        {value}
      </span>
    );
  }

  return value;
}

/**
 * Text Widget - Custom text content
 */
function TextWidget({ config }) {
  return (
    <div className="h-full p-4 flex flex-col">
      {config.title && (
        <h4 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-2">
          {config.title}
        </h4>
      )}
      <p className="text-sm text-charcoal-600 dark:text-charcoal-400 whitespace-pre-wrap">
        {config.content || 'Add text content in the settings panel.'}
      </p>
    </div>
  );
}

/**
 * Divider Widget - Section separator
 */
function DividerWidget({ config }) {
  return (
    <div className="h-full flex items-center px-4">
      {config.title ? (
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 border-t border-charcoal-300 dark:border-charcoal-600" />
          <span className="text-sm font-medium text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wide">
            {config.title}
          </span>
          <div className="flex-1 border-t border-charcoal-300 dark:border-charcoal-600" />
        </div>
      ) : (
        <div className="w-full border-t border-charcoal-300 dark:border-charcoal-600" />
      )}
    </div>
  );
}

/**
 * Summary Widget - Executive summary
 */
function SummaryWidget({ config }) {
  return (
    <div className="h-full p-4 bg-gradient-to-br from-primary-50 to-cyan-50 dark:from-primary-900/20 dark:to-cyan-900/20">
      <h4 className="text-lg font-semibold text-charcoal-900 dark:text-white mb-3 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary-500" />
        {config.title || 'Executive Summary'}
      </h4>
      <div className="space-y-2 text-sm text-charcoal-600 dark:text-charcoal-400">
        <p>
          This report provides an overview of your website&apos;s SEO health and performance metrics.
          Key findings and recommendations are summarized below.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Strong technical foundation</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Some accessibility improvements needed</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-primary-500" />
            <span>Content optimization opportunities</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-500" />
            <span>Performance trending upward</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Placeholder Widget - Unknown type fallback
 */
function PlaceholderWidget({ type }) {
  return (
    <div className="h-full p-4 flex items-center justify-center text-charcoal-400 dark:text-charcoal-500">
      <div className="text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-sm">Unknown widget type: {type}</p>
      </div>
    </div>
  );
}
