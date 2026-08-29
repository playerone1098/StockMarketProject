import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const ChartAnalyses = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    fetchAnalyses();
  }, [search]);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/chart-analysis/admin/all', {
        params: { search }
      });
      if (res.data.success) {
        setAnalyses(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching chart analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (symbol, deviceId) => {
    if (window.confirm(`Delete chart analysis for ${symbol}?`)) {
      try {
        await axios.delete(`/api/chart-analysis/${symbol}`, {
          params: { deviceId }
        });
        fetchAnalyses();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const uniqueSymbols = new Set(analyses.map((a) => a.symbol)).size;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">
            User Chart Analyses & Drawings
          </h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            Monitor persistent TradingView drawings, technical notes, trendlines, and target prices saved by users.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search stock symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Total Saved Analyses</span>
          <div className="text-3xl font-black text-zinc-900">{analyses.length}</div>
          <span className="text-[11px] text-zinc-500 font-medium">Persistent chart sessions retained</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Symbols Analyzed</span>
          <div className="text-3xl font-black text-blue-600">{uniqueSymbols}</div>
          <span className="text-[11px] text-zinc-500 font-medium">Active Indian stocks marked up</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Storage Duration</span>
          <div className="text-3xl font-black text-emerald-600">1+ Years</div>
          <span className="text-[11px] text-zinc-500 font-medium">Cloud & device dual persistence</span>
        </div>
      </div>

      {/* Analyses Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
          <h2 className="font-extrabold text-zinc-900 text-sm">Saved Technical Analyses Directory</h2>
          <span className="text-xs text-zinc-500 font-semibold">{analyses.length} Entries Found</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-400 font-semibold text-xs">
            Loading persistent analyses...
          </div>
        ) : analyses.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 font-semibold text-xs">
            No saved chart analyses found. Open any stock detail page to create your first persistent technical markup!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-100/70 text-zinc-600 font-bold border-b border-zinc-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Symbol</th>
                  <th className="p-4">User / Device</th>
                  <th className="p-4">Targets & Stops</th>
                  <th className="p-4">Key Levels</th>
                  <th className="p-4">Technical Notes</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-medium text-zinc-700">
                {analyses.map((item) => (
                  <tr key={item._id} className="hover:bg-zinc-50/80 transition">
                    <td className="p-4">
                      <span className="font-black text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200">
                        {item.symbol}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-zinc-500">
                      {item.user ? item.user.email : (item.deviceId || 'Guest Device')}
                    </td>
                    <td className="p-4 space-y-0.5">
                      {item.targetPrice ? (
                        <span className="block text-emerald-600 font-bold">🎯 Target: ₹{item.targetPrice}</span>
                      ) : null}
                      {item.stopLoss ? (
                        <span className="block text-rose-600 font-bold">🛑 Stop: ₹{item.stopLoss}</span>
                      ) : null}
                      {!item.targetPrice && !item.stopLoss && (
                        <span className="text-zinc-400 font-normal">Not set</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.trendlines ? item.trendlines.length : 0} Levels
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate text-zinc-600">
                      {item.notes || <span className="text-zinc-300 italic">No text notes</span>}
                    </td>
                    <td className="p-4 text-[11px] text-zinc-500">
                      {new Date(item.updatedAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedAnalysis(item)}
                        className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-lg text-[11px] transition"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleDelete(item.symbol, item.deviceId)}
                        className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-lg text-[11px] transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Analysis Inspector Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-zinc-200 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Analysis Inspector</span>
                <h3 className="text-2xl font-black text-zinc-900">{selectedAnalysis.symbol} Analysis Details</h3>
              </div>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 font-black hover:bg-zinc-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-150">
                <div>
                  <span className="text-zinc-400 block font-semibold">Stock Symbol</span>
                  <span className="text-sm font-black text-zinc-900">{selectedAnalysis.symbol}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold">User / Device</span>
                  <span className="text-xs font-mono font-bold text-zinc-800">{selectedAnalysis.user?.email || selectedAnalysis.deviceId}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold">Target Price</span>
                  <span className="text-sm font-bold text-emerald-600">{selectedAnalysis.targetPrice ? `₹${selectedAnalysis.targetPrice}` : 'Not set'}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block font-semibold">Stop Loss</span>
                  <span className="text-sm font-bold text-rose-600">{selectedAnalysis.stopLoss ? `₹${selectedAnalysis.stopLoss}` : 'Not set'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-zinc-900 mb-1">Technical Notes:</h4>
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 text-zinc-700 leading-relaxed font-medium">
                  {selectedAnalysis.notes || 'No technical notes written for this analysis.'}
                </div>
              </div>

              {selectedAnalysis.trendlines && selectedAnalysis.trendlines.length > 0 && (
                <div>
                  <h4 className="font-extrabold text-zinc-900 mb-2">Key Support & Resistance Levels:</h4>
                  <div className="space-y-2">
                    {selectedAnalysis.trendlines.map((tl, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl border border-zinc-150">
                        <span className="font-bold text-zinc-800">{tl.label || `Level ${i + 1}`}</span>
                        <span className="font-mono font-black text-blue-600">₹{tl.priceLevel} ({tl.type})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="px-6 py-2 bg-zinc-900 text-white font-bold rounded-xl text-xs hover:bg-zinc-800 transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
