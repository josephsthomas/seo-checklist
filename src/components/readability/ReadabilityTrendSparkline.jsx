import { useState, useMemo, useRef } from 'react';
import { format } from 'date-fns';

/**
 * ReadabilityTrendSparkline — SVG sparkline showing score progression
 *
 * BRD References: E-CMO-03, US-2.5.2
 *
 * @param {Array} data - Array of { date, score } objects (up to 10 points, chronological)
 */
export default function ReadabilityTrendSparkline({
  data = [],
  width = 200,
  height = 50
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const svgRef = useRef(null);

  // Normalize data points
  const points = useMemo(() => {
    if (data.length < 2) return [];

    const padding = 8;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const minScore = Math.min(...data.map(d => d.score)) - 5;
    const maxScore = Math.max(...data.map(d => d.score)) + 5;
    const scoreRange = Math.max(maxScore - minScore, 10);

    return data.map((d, i) => ({
      x: padding + (i / (data.length - 1)) * chartWidth,
      y: padding + chartHeight - ((d.score - minScore) / scoreRange) * chartHeight,
      score: d.score,
      date: d.date
    }));
  }, [data, width, height]);

  // SVG path for line
  const linePath = useMemo(() => {
    if (points.length < 2) return '';
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [points]);

  // SVG path for area fill
  const areaPath = useMemo(() => {
    if (points.length < 2) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${linePath} L ${last.x} ${height - 4} L ${first.x} ${height - 4} Z`;
  }, [linePath, points, height]);

  if (data.length < 2) return null;

  const firstScore = data[0]?.score;
  const lastScore = data[data.length - 1]?.score;
  const ariaLabel = `Score trend: ${firstScore} to ${lastScore} over ${data.length} analyses`;

  return (
    <div className="relative inline-block" style={{ width, height: height + 20 }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="overflow-visible"
        aria-label={ariaLabel}
        role="img"
      >
        {/* Area fill */}
        <path
          d={areaPath}
          className="fill-teal-100/30 dark:fill-teal-800/30"
        />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-teal-500 dark:stroke-teal-400"
        />

        {/* Data points */}
        {points.map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={hoveredPoint === i ? 4 : 2.5}
            className={`transition-all duration-150 outline-none
              ${hoveredPoint === i
                ? 'fill-teal-600 dark:fill-teal-300 stroke-white dark:stroke-charcoal-800'
                : 'fill-teal-500 dark:fill-teal-400 stroke-white dark:stroke-charcoal-800'
              }`}
            strokeWidth="1.5"
            tabIndex={0}
            role="button"
            aria-label={`Score ${point.score}${point.date ? ` on ${point.date}` : ''}`}
            onMouseEnter={() => setHoveredPoint(i)}
            onMouseLeave={() => setHoveredPoint(null)}
            onFocus={() => setHoveredPoint(i)}
            onBlur={() => setHoveredPoint(null)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' && i < points.length - 1) {
                e.preventDefault();
                e.target.nextElementSibling?.focus();
              } else if (e.key === 'ArrowLeft' && i > 0) {
                e.preventDefault();
                e.target.previousElementSibling?.focus();
              }
            }}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hoveredPoint !== null && points[hoveredPoint] && (
        <div
          className="absolute z-10 px-2 py-1 bg-charcoal-800 dark:bg-charcoal-700 text-white text-xs rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{
            left: Math.min(Math.max(points[hoveredPoint].x - 40, 0), width - 80),
            top: points[hoveredPoint].y - 30
          }}
        >
          <span className="font-bold">{points[hoveredPoint].score}</span>
          <span className="text-charcoal-300 dark:text-charcoal-400 ml-1">
            {points[hoveredPoint].date
              ? format(new Date(points[hoveredPoint].date), 'MMM d, yyyy')
              : ''}
          </span>
        </div>
      )}

      {/* Screen reader data table */}
      <table className="sr-only">
        <caption>Score Trend Data</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d, i) => (
            <tr key={i}>
              <td>{d.date ? format(new Date(d.date), 'MMM d, yyyy') : `Analysis ${i + 1}`}</td>
              <td>{d.score}/100</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
