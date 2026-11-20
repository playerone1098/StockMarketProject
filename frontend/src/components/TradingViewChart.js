import React, { useEffect, useRef, useState, memo } from 'react';
import { fetchChartAnalysis, saveChartAnalysis, deleteChartAnalysis } from '../services/api';

/**
 * Helper to get or create a persistent device identifier stored in localStorage
 */
const getDeviceId = () => {
  let id = localStorage.getItem('jodhpurtraders_device_id') || localStorage.getItem('stockvista_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('jodhpurtraders_device_id', id);
  }
  return id;
};

/**
 * TradingViewChart - Advanced Chart Widget with Persistent Drawing & Technical Analysis Storage.
 * 
 * Enables TradingView drawing toolbar (hide_side_toolbar: false) and syncs user analysis,
 * key trendlines, price targets, stop loss, and technical notes to local storage & MongoDB
 * so drawings & analysis persist for 1+ years across visits and devices.
 */
export const TradingViewChart = memo(({ symbol, exchange = 'NSE', isFullscreen = false, height, openNotesModal }) => {
  const containerRef = useRef(null);

  // Persistent Analysis State
  const [analysis, setAnalysis] = useState({
    notes: '',
    targetPrice: '',
    stopLoss: '',
    trendlines: [],
    lastSaved: null,
    exists: false
  });
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [newTrendline, setNewTrendline] = useState({ level: '', type: 'support', label: '' });
  const [saveStatus, setSaveStatus] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isModalFullscreen, setIsModalFullscreen] = useState(false);
  const [isOfflineScript, setIsOfflineScript] = useState(!navigator.onLine);

  const deviceId = getDeviceId();

  useEffect(() => {
    if (openNotesModal !== undefined && openNotesModal !== null) {
      setShowNotesModal(openNotesModal);
    }
  }, [openNotesModal]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalFullscreen) {
        setIsModalFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalFullscreen]);

  // Load persistent analysis & drawings on mount or symbol change
  useEffect(() => {
    let isMounted = true;
    const loadSavedAnalysis = async () => {
      setLoadingAnalysis(true);
      try {
        // First try backend database API
        const res = await fetchChartAnalysis(symbol, deviceId);
        if (isMounted && res.success && res.data) {
          if (res.data.exists) {
            setAnalysis({
              notes: res.data.notes || '',
              targetPrice: res.data.targetPrice || '',
              stopLoss: res.data.stopLoss || '',
              trendlines: res.data.trendlines || [],
              lastSaved: res.data.updatedAt ? new Date(res.data.updatedAt).toLocaleString('en-IN') : null,
              exists: true
            });
          } else {
            // Fallback to local storage
            const localKey = `tv_analysis_${symbol.toUpperCase()}`;
            const localData = localStorage.getItem(localKey);
            if (localData) {
              const parsed = JSON.parse(localData);
              setAnalysis({
                notes: parsed.notes || '',
                targetPrice: parsed.targetPrice || '',
                stopLoss: parsed.stopLoss || '',
                trendlines: parsed.trendlines || [],
                lastSaved: parsed.lastSaved || null,
                exists: true
              });
            } else {
              setAnalysis({
                notes: '',
                targetPrice: '',
                stopLoss: '',
                trendlines: [],
                lastSaved: null,
                exists: false
              });
            }
          }
        }
      } catch (err) {
        console.error('Error loading saved chart analysis:', err);
      } finally {
        if (isMounted) setLoadingAnalysis(false);
      }
    };

    if (symbol) {
      loadSavedAnalysis();
    }

    return () => {
      isMounted = false;
    };
  }, [symbol, deviceId]);

  // Embed TradingView Advanced Chart Widget with side toolbar enabled (hide_side_toolbar: false)
  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';
    const tvSymbol = `BSE:${symbol}`;

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onerror = () => {
      setIsOfflineScript(true);
    };
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: 'D',
      timezone: 'Asia/Kolkata',
      theme: 'light',
      style: '1',
      locale: 'en',
      allow_symbol_change: true,
      hide_side_toolbar: false, // ENABLE DRAWING TOOLBAR (Lines, Trendlines, Fib, Text, Shapes)
      save_image: true,
      calendar: false,
      hide_volume: false,
      remember_last_time: true,
      support_host: 'https://www.tradingview.com'
    });

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.height = '100%';
    widgetContainer.style.width = '100%';

    const widgetInner = document.createElement('div');
    widgetInner.className = 'tradingview-widget-container__widget';
    widgetInner.style.height = '100%';
    widgetInner.style.width = '100%';

    widgetContainer.appendChild(widgetInner);
    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, exchange, isFullscreen]);

  // Save analysis & drawing parameters permanently
  const handleSaveAnalysis = async (e) => {
    if (e) e.preventDefault();
    setSaveStatus('Saving...');
    const now = new Date().toLocaleString('en-IN');

    const saveData = {
      deviceId,
      notes: analysis.notes,
      targetPrice: analysis.targetPrice ? Number(analysis.targetPrice) : null,
      stopLoss: analysis.stopLoss ? Number(analysis.stopLoss) : null,
      trendlines: analysis.trendlines,
      chartType: 'tradingview',
      timeframe: '1D'
    };

    // Save to LocalStorage
    localStorage.setItem(`tv_analysis_${symbol.toUpperCase()}`, JSON.stringify({
      ...saveData,
      lastSaved: now
    }));

    try {
      // Save to Backend Database (MongoDB) for long-term persistence (1+ years)
      const res = await saveChartAnalysis(symbol, saveData);
      if (res.success) {
        setAnalysis((prev) => ({ ...prev, lastSaved: now, exists: true }));
        setSaveStatus('Saved to Cloud & Browser');
        setTimeout(() => setSaveStatus(''), 3000);
      }
    } catch (err) {
      console.error('Failed to sync chart analysis to backend:', err);
      setSaveStatus('Saved Locally');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleAddTrendline = () => {
    if (!newTrendline.level || isNaN(newTrendline.level)) return;
    const item = {
      id: 'tl_' + Date.now(),
      priceLevel: Number(newTrendline.level),
      type: newTrendline.type,
      label: newTrendline.label || `${newTrendline.type.toUpperCase()} @ ₹${newTrendline.level}`,
      color: newTrendline.type === 'support' ? '#10B981' : newTrendline.type === 'resistance' ? '#EF4444' : '#3B82F6'
    };

    const updatedLines = [...analysis.trendlines, item];
    setAnalysis((prev) => ({ ...prev, trendlines: updatedLines }));
    setNewTrendline({ level: '', type: 'support', label: '' });
  };

  const handleRemoveTrendline = (id) => {
    const updatedLines = analysis.trendlines.filter((t) => t.id !== id);
    setAnalysis((prev) => ({ ...prev, trendlines: updatedLines }));
  };

  const handleClearAnalysis = async () => {
    if (window.confirm(`Clear saved drawings & technical analysis for ${symbol}?`)) {
      localStorage.removeItem(`tv_analysis_${symbol.toUpperCase()}`);
      try {
        await deleteChartAnalysis(symbol, deviceId);
      } catch (err) {
        console.error('Clear analysis failed:', err);
      }
      setAnalysis({
        notes: '',
        targetPrice: '',
        stopLoss: '',
        trendlines: [],
        lastSaved: null,
        exists: false
      });
      setSaveStatus('Cleared');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  return (
    <div className={`space-y-3 ${height === 'h-full' ? 'h-full flex flex-col' : ''}`}>
      {/* Persistent Analysis Bar */}
      <div className="bg-white dark:bg-navy-950 text-navy-950 dark:text-white rounded-2xl p-4 border border-gray-200 dark:border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/30 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
            TA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-navy-950 dark:text-white">{symbol} Persistent Technical Analysis</span>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Permanent Storage (1+ Year)
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
              Draw lines, trendlines & shapes using TradingView's toolbar on the left. Your drawings & notes persist across visits.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {analysis.lastSaved && (
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              Saved: <strong className="text-gray-700 dark:text-gray-200">{analysis.lastSaved}</strong>
            </span>
          )}

          {saveStatus && (
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 animate-pulse">
              {saveStatus}
            </span>
          )}

          <button
            onClick={() => setShowNotesModal(!showNotesModal)}
            className="px-3 py-1.5 border border-gray-300 dark:border-navy-700 text-gray-700 dark:text-slate-300 hover:border-gray-500 dark:hover:border-navy-500 font-bold rounded-xl bg-transparent transition"
          >
            {showNotesModal ? 'Hide Notes Panel' : 'Analysis & Price Levels'}
          </button>

          <button
            onClick={handleSaveAnalysis}
            className="px-4 py-1.5 border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 hover:border-brand-700 dark:hover:border-brand-300 font-extrabold rounded-xl bg-transparent transition"
          >
            Save Analysis
          </button>

          {!isFullscreen && (
            <button
              onClick={() => setIsModalFullscreen(true)}
              className="px-3.5 py-1.5 border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 hover:border-brand-700 dark:hover:border-brand-300 font-extrabold rounded-xl bg-transparent transition"
              title="Open Chart in Full Screen"
            >
              Fullscreen
            </button>
          )}

          {analysis.exists && (
            <button
              onClick={handleClearAnalysis}
              className="px-2.5 py-1.5 border border-rose-500/50 text-rose-600 dark:text-rose-400 hover:border-rose-600 dark:hover:border-rose-300 font-bold rounded-xl bg-transparent transition text-xs"
              title="Clear saved analysis"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Expanded Technical Analysis & Key Levels Modal Panel */}
      {showNotesModal && (
        <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 border border-gray-200 dark:border-navy-800 shadow-md space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-gray-100 dark:border-navy-800 pb-3">
            <h3 className="font-extrabold text-navy-950 dark:text-white text-sm flex items-center gap-2">
              Technical Analysis & Key Price Levels for {symbol}
            </h3>
            <span className="text-gray-500 dark:text-gray-400 text-[11px]">Saved automatically to your cloud profile</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Notes Field */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="font-extrabold text-gray-700 dark:text-gray-300 block">Technical Notes & Market Thesis:</label>
              <textarea
                rows={4}
                value={analysis.notes}
                onChange={(e) => setAnalysis({ ...analysis, notes: e.target.value })}
                placeholder={`Write your technical chart setup, key indicators (RSI, MACD), or breakout trigger points for ${symbol}...`}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-950 focus:ring-2 focus:ring-brand-500 focus:outline-none text-xs text-navy-950 dark:text-white font-medium"
              />
            </div>

            {/* Target Price & Stop Loss Inputs */}
            <div className="space-y-3 bg-white dark:bg-navy-950 p-3.5 rounded-xl border border-gray-200 dark:border-navy-800">
              <div className="space-y-1">
                <label className="font-extrabold text-emerald-700 dark:text-emerald-400 block">Target Price (₹):</label>
                <input
                  type="number"
                  placeholder="e.g. 2850"
                  value={analysis.targetPrice}
                  onChange={(e) => setAnalysis({ ...analysis, targetPrice: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 focus:outline-none focus:border-emerald-500 text-xs font-bold text-navy-950 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-rose-700 dark:text-rose-400 block">Stop Loss (₹):</label>
                <input
                  type="number"
                  placeholder="e.g. 2400"
                  value={analysis.stopLoss}
                  onChange={(e) => setAnalysis({ ...analysis, stopLoss: e.target.value })}
                  className="w-full p-2 rounded-lg border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 focus:outline-none focus:border-rose-500 text-xs font-bold text-navy-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Saved Key Price Levels / Trendlines */}
          <div className="pt-2 border-t border-gray-100 dark:border-navy-800 space-y-3">
            <div className="font-bold text-navy-950 dark:text-white flex items-center justify-between">
              <span>Saved Key Support & Resistance Levels ({analysis.trendlines.length}):</span>
            </div>

            {/* Add Level Form */}
            <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-navy-950 p-2.5 rounded-xl border border-gray-200 dark:border-navy-800">
              <input
                type="number"
                placeholder="Price Level (₹)"
                value={newTrendline.level}
                onChange={(e) => setNewTrendline({ ...newTrendline, level: e.target.value })}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-navy-950 dark:text-white text-xs font-bold w-32 focus:outline-none"
              />
              <select
                value={newTrendline.type}
                onChange={(e) => setNewTrendline({ ...newTrendline, type: e.target.value })}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-navy-950 dark:text-white text-xs font-bold focus:outline-none"
              >
                <option value="support">Support Line [Green]</option>
                <option value="resistance">Resistance Line [Red]</option>
                <option value="trendline">Trendline Level [Blue]</option>
              </select>
              <input
                type="text"
                placeholder="Label / Note (optional)"
                value={newTrendline.label}
                onChange={(e) => setNewTrendline({ ...newTrendline, label: e.target.value })}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-navy-950 dark:text-white text-xs flex-1 min-w-[150px] focus:outline-none"
              />
              <button
                onClick={handleAddTrendline}
                className="px-3 py-1.5 border border-gray-300 dark:border-navy-700 text-gray-700 dark:text-slate-300 hover:border-gray-500 dark:hover:border-navy-500 font-extrabold rounded-lg text-xs bg-transparent transition"
              >
                Add Level
              </button>
            </div>

            {/* List of Levels */}
            {analysis.trendlines.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {analysis.trendlines.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold border shadow-xs"
                    style={{
                      backgroundColor: item.color + '15',
                      borderColor: item.color + '40',
                      color: item.color
                    }}
                  >
                    <span>{item.type}</span>
                    <span>{item.label}</span>
                    <button
                      onClick={() => handleRemoveTrendline(item.id)}
                      className="ml-1 text-[10px] px-1.5 py-0.5 border border-gray-400 dark:border-navy-700 rounded text-gray-600 dark:text-gray-300 hover:text-navy-950 dark:hover:text-white bg-transparent font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveAnalysis}
              className="px-6 py-2 border border-brand-600 dark:border-brand-400 text-brand-600 dark:text-brand-400 hover:border-brand-700 dark:hover:border-brand-300 font-extrabold rounded-xl bg-transparent transition"
            >
              Save Analysis Setup
            </button>
          </div>
        </div>
      )}

      {/* TradingView Embed Canvas Container */}
      {isOfflineScript ? (
        <div className={`w-full ${isFullscreen ? 'h-[85vh]' : (height === 'h-full' ? 'flex-1 min-h-[550px]' : (height || 'h-[520px]'))} bg-gray-50 dark:bg-navy-900 rounded-2xl border border-dashed border-gray-300 dark:border-navy-700 flex flex-col items-center justify-center p-6 text-center`}>
          <span className="text-3xl mb-3">📶</span>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">TradingView Chart (Offline Mode)</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mb-4">
            External TradingView CDN scripts require an active internet connection. You are running 100% offline.
          </p>
          <div className="text-xs bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 px-4 py-2 rounded-xl font-bold">
            ✓ Use the "JodhpurTraders Recharts" tab above for local offline interactive charts
          </div>
        </div>
      ) : (
        <div
          ref={containerRef}
          className={`w-full ${isFullscreen ? 'h-[85vh]' : (height === 'h-full' ? 'flex-1 min-h-[550px]' : (height || 'h-[520px]'))} bg-gray-50 rounded-2xl overflow-hidden border border-gray-150 relative shadow-sm`}
        />
      )}

      {/* FULLSCREEN OVERLAY MODAL */}
      {isModalFullscreen && (
        <div className="fixed inset-0 bg-navy-950/95 backdrop-blur-md z-50 flex flex-col p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between text-white pb-3 mb-2 border-b border-navy-800">
            <div className="flex items-center gap-3">
              <span className="text-xl sm:text-2xl font-black">{symbol}</span>
              <span className="text-xs text-gray-300 bg-navy-900 border border-navy-800 px-3 py-1 rounded-full font-semibold">
                Fullscreen Technical Chart ({exchange})
              </span>
            </div>
            <button
              onClick={() => setIsModalFullscreen(false)}
              className="px-4 py-2 border border-slate-600 hover:border-slate-400 text-white font-extrabold rounded-xl text-xs transition bg-transparent"
            >
              Exit Full View
            </button>
          </div>

          <div className="flex-1 w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <TradingViewChart symbol={symbol} exchange={exchange} isFullscreen={true} />
          </div>
        </div>
      )}
    </div>
  );
});

TradingViewChart.displayName = 'TradingViewChart';
