import React, { useState, useEffect } from 'react';
import { fetchStockChartData } from '../services/api';

const TIMEFRAMES = ['1D', '1W', '1M', '1Y', '5Y', 'ALL'];

export const StockChart = ({ symbol, initialPrice, dayChange, dayChangePercent }) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [stats, setStats] = useState({
    price: initialPrice || 0,
    change: dayChange || 0,
    changePercent: dayChangePercent || 0,
    high: 0,
    low: 0
  });

  useEffect(() => {
    let isMounted = true;
    const loadChart = async () => {
      setLoading(true);
      try {
        const res = await fetchStockChartData(symbol, timeframe);
        if (isMounted && res.success && res.data) {
          const points = res.data.chartData || [];
          setChartData(points);

          if (res.data.stats) {
            setStats({
              price: res.data.stats.currentPrice || initialPrice,
              change: res.data.stats.dayChange || dayChange,
              changePercent: res.data.stats.dayChangePercent || dayChangePercent,
              high: res.data.stats.high,
              low: res.data.stats.low
            });
          }
        }
      } catch (err) {
        console.error('Error fetching stock chart:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (symbol) {
      loadChart();
    }

    return () => {
      isMounted = false;
    };
  }, [symbol, timeframe, initialPrice, dayChange, dayChangePercent]);

  const isPositive = stats.change >= 0;
  const strokeColor = isPositive ? '#10B981' : '#EF4444';
  const fillColor = isPositive ? '#10B981' : '#EF4444';

  // SVG Chart calculation calculations
  const width = 800;
  const height = 280;
  const padding = 30;

  const prices = chartData.map((d) => d.price || d.close || 0);
  const minPrice = prices.length ? Math.min(...prices) * 0.995 : 0;
  const maxPrice = prices.length ? Math.max(...prices) * 1.005 : 100;
  const priceRange = maxPrice - minPrice || 1;

  const points = chartData.map((d, index) => {
    const x = padding + (index / (chartData.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - (((d.price || d.close) - minPrice) / priceRange) * (height - padding * 2);
    return { x, y, data: d };
  });

  const pathD = points.length
    ? `M ${points[0].x} ${points[0].y} ` +
      points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;
  const displayPrice = activePoint ? activePoint.data.price : stats.price;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-150 shadow-sm space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-navy-950">
              ₹{Number(displayPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {isPositive ? '▲' : '▼'} {Math.abs(stats.change || 0).toFixed(2)} ({Math.abs(stats.changePercent || 0).toFixed(2)}%)
            </span>
          </div>
          <div className="text-xs text-gray-400 font-medium mt-1">
            {activePoint ? `Selected Date: ${activePoint.data.date}` : `Real-time updates • ${symbol} (NSE)`}
          </div>
        </div>

        {/* Timeframe Selector Buttons */}
        <div className="flex items-center bg-gray-100 p-1 rounded-2xl gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeframe === tf
                  ? 'bg-navy-950 text-white shadow-sm'
                  : 'text-gray-600 hover:text-navy-950 hover:bg-gray-200/60'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Vector Area Chart */}
      <div className="h-72 w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
              <span className="text-xs text-gray-400 font-semibold">Loading Market Chart...</span>
            </div>
          </div>
        ) : null}

        {chartData.length === 0 && !loading ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm font-medium">
            No chart data available for timeframe {timeframe}.
          </div>
        ) : (
          <div className="w-full h-full relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-visible"
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id={`area-grad-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={fillColor} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#F3F4F6" strokeDasharray="4 4" />
              <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#F3F4F6" strokeDasharray="4 4" />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#F3F4F6" strokeDasharray="4 4" />

              {/* Area Fill */}
              {areaD && <path d={areaD} fill={`url(#area-grad-${symbol})`} />}

              {/* Smooth Line Path */}
              {pathD && <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />}

              {/* Hover Interactivity Overlay */}
              {points.map((p, idx) => (
                <rect
                  key={idx}
                  x={p.x - (width / points.length) / 2}
                  y={0}
                  width={width / points.length}
                  height={height}
                  fill="transparent"
                  onMouseEnter={() => setHoverIndex(idx)}
                  className="cursor-pointer"
                />
              ))}

              {/* Active Hover Point Circle & Crosshair */}
              {activePoint && (
                <g>
                  <line
                    x1={activePoint.x}
                    y1={padding}
                    x2={activePoint.x}
                    y2={height - padding}
                    stroke="#9CA3AF"
                    strokeDasharray="3 3"
                  />
                  <circle
                    cx={activePoint.x}
                    cy={activePoint.y}
                    r="6"
                    fill={strokeColor}
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                </g>
              )}
            </svg>

            {/* Floating Tooltip */}
            {activePoint && (
              <div
                className="absolute bg-navy-950 text-white text-xs p-3 rounded-xl shadow-2xl border border-navy-800 space-y-1 pointer-events-none z-30 transform -translate-x-1/2"
                style={{
                  left: `${(activePoint.x / width) * 100}%`,
                  top: '10px'
                }}
              >
                <div className="text-gray-400 font-medium">{activePoint.data.date}</div>
                <div className="text-sm font-extrabold text-white">
                  ₹{Number(activePoint.data.price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                {activePoint.data.volume && (
                  <div className="text-gray-300 text-[10px]">
                    Vol: {Number(activePoint.data.volume).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* High/Low Progress Bar */}
      {stats.high && stats.low ? (
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
          <div>
            <span className="text-gray-400">Day Low:</span>{' '}
            <span className="font-extrabold text-navy-950">₹{stats.low}</span>
          </div>
          <div className="flex-1 mx-4 bg-gray-100 rounded-full h-1.5 relative overflow-hidden">
            <div
              className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    ((displayPrice - stats.low) / (stats.high - stats.low || 1)) * 100
                  )
                )}%`
              }}
            ></div>
          </div>
          <div>
            <span className="text-gray-400">Day High:</span>{' '}
            <span className="font-extrabold text-navy-950">₹{stats.high}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
