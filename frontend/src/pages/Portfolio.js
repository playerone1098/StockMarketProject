import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  fetchPortfolios,
  createPortfolio,
  deletePortfolio,
  addPortfolioHolding,
  updatePortfolioHolding,
  deletePortfolioHolding,
  importPortfolioStatement,
  fetchStocks
} from '../services/api';

export const Portfolio = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('');
  const [overallSummary, setOverallSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stock search suggestions for manual add
  const [stockSuggestions, setStockSuggestions] = useState([]);
  const [stockQuery, setStockQuery] = useState('');

  // Modals
  const [showAddPortfolioModal, setShowAddPortfolioModal] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  
  const [showHoldingModal, setShowHoldingModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [holdingForm, setHoldingForm] = useState({
    symbol: '',
    name: '',
    shares: '',
    avgBuyPrice: '',
    broker: 'Zerodha',
    notes: ''
  });

  // Statement CSV/Excel Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importBroker, setImportBroker] = useState('Zerodha');
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState(null);
  const [rawCsvText, setRawCsvText] = useState('');
  const [importTab, setImportTab] = useState('file'); // 'file' or 'paste'

  useEffect(() => {
    if (isAuthenticated) {
      loadPortfolios();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const res = await fetchPortfolios();
      if (res.success && res.data) {
        setPortfolios(res.data.portfolios || []);
        setOverallSummary(res.data.overallSummary);
        if (res.data.portfolios.length > 0 && !selectedPortfolioId) {
          setSelectedPortfolioId(res.data.portfolios[0]._id);
        }
      }
    } catch (err) {
      console.error('Error loading portfolios:', err);
      setError('Failed to load portfolio data.');
    } finally {
      setLoading(false);
    }
  };

  const currentPortfolio = portfolios.find(p => p._id === selectedPortfolioId) || portfolios[0];

  // Search stocks suggestions when typing symbol
  const handleStockSearch = async (query) => {
    setStockQuery(query);
    setHoldingForm(prev => ({ ...prev, symbol: query }));
    if (query.trim().length > 1) {
      try {
        const res = await fetchStocks({ search: query, limit: 5 });
        if (res.success && res.data) {
          setStockSuggestions(res.data.stocks || []);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setStockSuggestions([]);
    }
  };

  const selectSuggestedStock = (stock) => {
    setHoldingForm(prev => ({
      ...prev,
      symbol: stock.symbol,
      name: stock.companyName,
      avgBuyPrice: prev.avgBuyPrice || stock.currentPrice || ''
    }));
    setStockQuery(stock.symbol);
    setStockSuggestions([]);
  };

  // Handle Portfolio Creation
  const handleCreatePortfolio = async (e) => {
    e.preventDefault();
    if (!newPortfolioName.trim()) return;
    try {
      const res = await createPortfolio({ name: newPortfolioName });
      if (res.success) {
        setShowAddPortfolioModal(false);
        setNewPortfolioName('');
        await loadPortfolios();
        setSelectedPortfolioId(res.data.portfolio._id);
      }
    } catch (err) {
      console.error('Failed to create portfolio:', err);
    }
  };

  // Handle Delete Portfolio
  const handleDeletePortfolio = async (id) => {
    if (!window.confirm('Are you sure you want to delete this portfolio?')) return;
    try {
      await deletePortfolio(id);
      setSelectedPortfolioId('');
      await loadPortfolios();
    } catch (err) {
      console.error('Failed to delete portfolio:', err);
    }
  };

  // Save / Update Holding
  const handleSaveHolding = async (e) => {
    e.preventDefault();
    if (!holdingForm.symbol || !holdingForm.shares || holdingForm.avgBuyPrice === '') return;

    try {
      if (editingHolding) {
        await updatePortfolioHolding(currentPortfolio._id, editingHolding._id, holdingForm);
      } else {
        await addPortfolioHolding(currentPortfolio._id, holdingForm);
      }
      setShowHoldingModal(false);
      setEditingHolding(null);
      setHoldingForm({ symbol: '', name: '', shares: '', avgBuyPrice: '', broker: 'Zerodha', notes: '' });
      setStockQuery('');
      await loadPortfolios();
    } catch (err) {
      console.error('Failed to save holding:', err);
      alert(err.response?.data?.message || 'Failed to save holding');
    }
  };

  const handleEditHolding = (holding) => {
    setEditingHolding(holding);
    setHoldingForm({
      symbol: holding.symbol,
      name: holding.name || holding.companyName || '',
      shares: holding.shares,
      avgBuyPrice: holding.avgBuyPrice,
      broker: holding.broker || 'Zerodha',
      notes: holding.notes || ''
    });
    setStockQuery(holding.symbol);
    setShowHoldingModal(true);
  };

  const handleDeleteHolding = async (holdingId) => {
    if (!window.confirm('Remove this stock holding from your portfolio?')) return;
    try {
      await deletePortfolioHolding(currentPortfolio._id, holdingId);
      await loadPortfolios();
    } catch (err) {
      console.error('Failed to delete holding:', err);
    }
  };

  // Parse Raw CSV text client-side if user pastes statement
  const parseCsvStringToHoldings = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
    
    const findIndex = (keys) => {
      for (const k of keys) {
        const idx = headers.findIndex(h => h.includes(k));
        if (idx !== -1) return idx;
      }
      return -1;
    };

    const symIdx = findIndex(['symbol', 'stock', 'scrip', 'instrument', 'ticker']);
    const qtyIdx = findIndex(['qty', 'quantity', 'shares', 'sharecount', 'holdings']);
    const avgIdx = findIndex(['avgprice', 'averageprice', 'buyprice', 'avgcost', 'costprice', 'unitcost']);
    const valIdx = findIndex(['invested', 'totalcost', 'totalvalue', 'buyvalue', 'valueinrupees', 'amountinr']);

    const items = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length <= 1) continue;

      const sym = symIdx !== -1 ? parts[symIdx] : parts[0];
      const qty = parseFloat(qtyIdx !== -1 ? parts[qtyIdx] : parts[1]);
      let avg = parseFloat(avgIdx !== -1 ? parts[avgIdx] : parts[2]);
      const val = parseFloat(valIdx !== -1 ? parts[valIdx] : (parts[3] || 0));

      if (!avg && val && qty) {
        avg = val / qty;
      }

      if (sym && !isNaN(qty) && qty > 0 && !isNaN(avg) && avg > 0) {
        items.push({
          symbol: sym,
          shares: qty,
          avgBuyPrice: avg,
          broker: importBroker
        });
      }
    }
    return items;
  };

  // Handle Statement CSV / Excel Import Submit
  const handleImportStatement = async (e) => {
    e.preventDefault();
    if (!currentPortfolio) return;

    setImportLoading(true);
    setImportMessage(null);

    try {
      let res;
      if (importTab === 'file' && importFile) {
        const formData = new FormData();
        formData.append('statement', importFile);
        formData.append('brokerName', importBroker);
        res = await importPortfolioStatement(currentPortfolio._id, formData);
      } else if (rawCsvText.trim()) {
        const parsedItems = parseCsvStringToHoldings(rawCsvText);
        if (parsedItems.length === 0) {
          throw new Error('Could not detect valid stock holdings in pasted CSV.');
        }
        res = await importPortfolioStatement(currentPortfolio._id, {
          holdingsData: parsedItems,
          brokerName: importBroker
        });
      } else {
        throw new Error('Please select a CSV/Excel file or paste statement text.');
      }

      if (res.success) {
        setImportMessage({
          type: 'success',
          text: res.message || `Successfully imported holdings into ${currentPortfolio.name}`
        });
        await loadPortfolios();
        setTimeout(() => {
          setShowImportModal(false);
          setImportMessage(null);
          setImportFile(null);
          setRawCsvText('');
        }, 1800);
      }
    } catch (err) {
      console.error('Import error:', err);
      setImportMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Import failed. Check file format.'
      });
    } finally {
      setImportLoading(false);
    }
  };

  if (authLoading || (loading && isAuthenticated)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-navy-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium">Loading portfolio metrics...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-navy-950 text-white py-16 px-4">
        <div className="max-w-xl w-full bg-navy-900 border border-navy-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="w-20 h-20 bg-brand-500/10 border border-brand-500/30 rounded-3xl flex items-center justify-center mx-auto text-4xl shadow-inner">
            🔐
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold text-brand-400 uppercase tracking-widest bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
              Authentication Required
            </span>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Sign in to Access Portfolio Tracker
            </h1>
            <p className="text-sm text-gray-300 leading-relaxed max-w-md mx-auto">
              Track live equity profit & loss, manage custom portfolios, and import holding statements from Zerodha, Groww, Upstox & Angel One.
            </p>
          </div>

          <div className="bg-navy-950 border border-navy-800/80 rounded-2xl p-5 text-left text-xs text-gray-300 space-y-3">
            <div className="flex items-center gap-3 font-semibold">
              <span className="text-emerald-400 text-base">✓</span>
              <span>Real-time Live Equity P&L & Return Calculation</span>
            </div>
            <div className="flex items-center gap-3 font-semibold">
              <span className="text-emerald-400 text-base">✓</span>
              <span>1-Click Statement CSV/Excel Import (Zerodha, Groww, Upstox)</span>
            </div>
            <div className="flex items-center gap-3 font-semibold">
              <span className="text-emerald-400 text-base">✓</span>
              <span>Interactive Sector Allocation Breakdown</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-brand-500/25 transition text-center"
            >
              Sign In to Your Account →
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3.5 bg-navy-950 hover:bg-navy-800 border border-navy-800 text-gray-200 font-bold text-sm rounded-xl transition text-center"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const summary = currentPortfolio?.summary || {
    totalInvested: 0,
    currentValue: 0,
    totalPnl: 0,
    totalPnlPercent: 0,
    dayPnl: 0,
    dayPnlPercent: 0,
    holdingsCount: 0
  };

  return (
    <div className="min-h-screen bg-navy-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Portfolio Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>📊 Portfolio Tracker</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Track live equity values, profit & loss, and import statements from Zerodha, Groww & Upstox
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Portfolio selector */}
            <select
              value={selectedPortfolioId}
              onChange={(e) => setSelectedPortfolioId(e.target.value)}
              className="bg-navy-900 border border-navy-800 text-white text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:border-brand-500"
            >
              {portfolios.map(p => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.holdings?.length || 0} stocks)
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowAddPortfolioModal(true)}
              className="px-3.5 py-2.5 bg-navy-900 hover:bg-navy-800 border border-navy-800 text-sm font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Portfolio
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import CSV / Excel Statement
            </button>

            <button
              onClick={() => {
                setEditingHolding(null);
                setHoldingForm({ symbol: '', name: '', shares: '', avgBuyPrice: '', broker: 'Zerodha', notes: '' });
                setShowHoldingModal(true);
              }}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-500/20 transition flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Stock Holding
            </button>
          </div>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Portfolio Value</p>
            <h3 className="text-3xl font-black text-white mt-2">
              ₹{summary.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-gray-400 mt-2">
              Across {summary.holdingsCount} stock positions
            </p>
          </div>

          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Invested Value</p>
            <h3 className="text-3xl font-black text-gray-200 mt-2">
              ₹{summary.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-gray-400 mt-2">Initial buy cost in Rupees</p>
          </div>

          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Overall Returns (P&L)</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className={`text-3xl font-black ${summary.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {summary.totalPnl >= 0 ? '+' : ''}₹{summary.totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${summary.totalPnl >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {summary.totalPnlPercent >= 0 ? '+' : ''}{summary.totalPnlPercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Unrealized total return</p>
          </div>

          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">1-Day P&L Change</p>
            <div className="flex items-baseline gap-2 mt-2">
              <h3 className={`text-3xl font-black ${summary.dayPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {summary.dayPnl >= 0 ? '+' : ''}₹{summary.dayPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-lg ${summary.dayPnl >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {summary.dayPnlPercent >= 0 ? '+' : ''}{summary.dayPnlPercent.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Today's portfolio performance</p>
          </div>
        </div>

        {/* Sector Allocation Breakdown */}
        {currentPortfolio?.sectorAllocation?.length > 0 && (
          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>🍰 Sector Allocation</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {currentPortfolio.sectorAllocation.map((item, idx) => (
                <div key={idx} className="bg-navy-950 border border-navy-800 p-3.5 rounded-2xl">
                  <p className="text-xs font-bold text-gray-400 truncate">{item.sector}</p>
                  <p className="text-base font-black text-brand-400 mt-1">{item.percentage}%</p>
                  <p className="text-xs text-gray-500 mt-0.5">₹{item.value.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Holdings Table */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="px-6 py-5 border-b border-navy-800 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Stock Holdings ({currentPortfolio?.holdings?.length || 0})</h2>
              <p className="text-xs text-gray-400">All prices in Indian Rupees (₹ INR)</p>
            </div>
            {currentPortfolio && portfolios.length > 1 && (
              <button
                onClick={() => handleDeletePortfolio(currentPortfolio._id)}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 bg-rose-500/10 rounded-lg transition"
              >
                Delete Portfolio
              </button>
            )}
          </div>

          {(!currentPortfolio?.holdings || currentPortfolio.holdings.length === 0) ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-navy-950 border border-navy-800 text-gray-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">No stocks in this portfolio yet</h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto mt-1 mb-6">
                Add your stock holdings manually or upload your CSV / Excel holding statement from Zerodha, Groww, or Upstox.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition"
                >
                  Import Broker Statement
                </button>
                <button
                  onClick={() => setShowHoldingModal(true)}
                  className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl transition"
                >
                  Add Holding Manually
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-navy-800 text-xs font-bold text-gray-400 uppercase tracking-wider bg-navy-950/60">
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-4 py-4 text-right">Shares</th>
                    <th className="px-4 py-4 text-right">Avg Price (₹)</th>
                    <th className="px-4 py-4 text-right">Current Price (₹)</th>
                    <th className="px-4 py-4 text-right">Invested (₹)</th>
                    <th className="px-4 py-4 text-right">Current Value (₹)</th>
                    <th className="px-4 py-4 text-right">Total P&L (₹ / %)</th>
                    <th className="px-4 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800 text-sm">
                  {currentPortfolio.holdings.map((h) => (
                    <tr key={h._id || h.symbol} className="hover:bg-navy-800/50 transition">
                      <td className="px-6 py-4 font-bold">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-center font-black text-brand-400 text-xs">
                            {h.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="text-white font-extrabold flex items-center gap-2">
                              {h.symbol}
                              {h.broker && (
                                <span className="text-[10px] font-semibold text-gray-400 bg-navy-950 px-2 py-0.5 rounded-md border border-navy-800">
                                  {h.broker}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400 font-normal truncate max-w-[160px]">
                              {h.companyName || h.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-white">
                        {h.shares}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-300">
                        ₹{Number(h.avgBuyPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-white">
                        ₹{Number(h.livePrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        {h.dayChangePercent !== undefined && (
                          <div className={`text-[11px] font-semibold ${h.dayChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {h.dayChangePercent >= 0 ? '+' : ''}{h.dayChangePercent}%
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-300">
                        ₹{Number(h.investedValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 text-right font-black text-white">
                        ₹{Number(h.currentValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className={`font-black ${h.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {h.pnl >= 0 ? '+' : ''}₹{Number(h.pnl).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs font-bold ${h.pnlPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {h.pnlPercent >= 0 ? '+' : ''}{h.pnlPercent}%
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditHolding(h)}
                            className="p-1.5 hover:bg-navy-950 text-gray-400 hover:text-white rounded-lg transition"
                            title="Edit Holding"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteHolding(h._id)}
                            className="p-1.5 hover:bg-navy-950 text-gray-400 hover:text-rose-400 rounded-lg transition"
                            title="Remove Stock"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- Create Portfolio Modal --- */}
        {showAddPortfolioModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">Create New Portfolio</h3>
              <form onSubmit={handleCreatePortfolio} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Portfolio Name</label>
                  <input
                    type="text"
                    required
                    value={newPortfolioName}
                    onChange={(e) => setNewPortfolioName(e.target.value)}
                    placeholder="e.g. Long Term Wealth, Tech Portfolio"
                    className="w-full px-4 py-2.5 bg-navy-950 border border-navy-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPortfolioModal(false)}
                    className="px-4 py-2 bg-navy-950 hover:bg-navy-800 text-gray-300 font-semibold rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm shadow-md"
                  >
                    Create Portfolio
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- Add / Edit Holding Modal --- */}
        {showHoldingModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4">
                {editingHolding ? 'Edit Holding' : 'Add Stock Holding'}
              </h3>
              <form onSubmit={handleSaveHolding} className="space-y-4">
                
                {/* Symbol with auto-suggest */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Stock Symbol (NSE/BSE)</label>
                  <input
                    type="text"
                    required
                    value={stockQuery}
                    onChange={(e) => handleStockSearch(e.target.value)}
                    placeholder="Search e.g. RELIANCE, TCS, INFY, TATAMOTORS"
                    className="w-full px-4 py-2.5 bg-navy-950 border border-navy-800 rounded-xl text-white uppercase focus:outline-none focus:border-brand-500"
                  />

                  {stockSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 bg-navy-950 border border-navy-800 rounded-xl shadow-2xl max-h-48 overflow-y-auto z-20 divide-y divide-navy-800">
                      {stockSuggestions.map((s) => (
                        <div
                          key={s._id}
                          onClick={() => selectSuggestedStock(s)}
                          className="p-2.5 hover:bg-navy-800 cursor-pointer flex justify-between items-center"
                        >
                          <div>
                            <span className="font-bold text-white text-sm">{s.symbol}</span>
                            <span className="text-xs text-gray-400 ml-2">{s.companyName}</span>
                          </div>
                          <span className="text-xs font-bold text-brand-400">₹{s.currentPrice}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Share Quantity</label>
                    <input
                      type="number"
                      step="any"
                      required
                      min="0.0001"
                      value={holdingForm.shares}
                      onChange={(e) => setHoldingForm({ ...holdingForm, shares: e.target.value })}
                      placeholder="e.g. 50"
                      className="w-full px-4 py-2.5 bg-navy-950 border border-navy-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Avg Buy Price (₹ INR)</label>
                    <input
                      type="number"
                      step="any"
                      required
                      min="0"
                      value={holdingForm.avgBuyPrice}
                      onChange={(e) => setHoldingForm({ ...holdingForm, avgBuyPrice: e.target.value })}
                      placeholder="e.g. 2450.50"
                      className="w-full px-4 py-2.5 bg-navy-950 border border-navy-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Broker</label>
                    <select
                      value={holdingForm.broker}
                      onChange={(e) => setHoldingForm({ ...holdingForm, broker: e.target.value })}
                      className="w-full px-3 py-2.5 bg-navy-950 border border-navy-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    >
                      <option value="Zerodha">Zerodha</option>
                      <option value="Groww">Groww</option>
                      <option value="Upstox">Upstox</option>
                      <option value="Angel One">Angel One</option>
                      <option value="ICICI Direct">ICICI Direct</option>
                      <option value="HDFC Securities">HDFC Securities</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Notes (Optional)</label>
                    <input
                      type="text"
                      value={holdingForm.notes}
                      onChange={(e) => setHoldingForm({ ...holdingForm, notes: e.target.value })}
                      placeholder="e.g. Long term target"
                      className="w-full px-3 py-2.5 bg-navy-950 border border-navy-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowHoldingModal(false)}
                    className="px-4 py-2 bg-navy-950 hover:bg-navy-800 text-gray-300 font-semibold rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm shadow-md"
                  >
                    Save Holding
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- Statement CSV / Excel Import Modal --- */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <span>📄 Import Broker Holding Statement</span>
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Upload statement CSV/Excel from Zerodha, Groww, Upstox, Angel One, ICICI, etc.
                  </p>
                </div>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {importMessage && (
                <div className={`p-4 rounded-2xl mb-4 text-sm font-semibold flex items-center gap-3 ${
                  importMessage.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}>
                  <span>{importMessage.text}</span>
                </div>
              )}

              <div className="flex gap-2 border-b border-navy-800 mb-4">
                <button
                  onClick={() => setImportTab('file')}
                  className={`pb-2 px-3 text-sm font-bold border-b-2 transition ${
                    importTab === 'file' ? 'border-brand-500 text-brand-400' : 'border-transparent text-gray-400'
                  }`}
                >
                  📁 Upload File (.csv, .xlsx, .xls)
                </button>
                <button
                  onClick={() => setImportTab('paste')}
                  className={`pb-2 px-3 text-sm font-bold border-b-2 transition ${
                    importTab === 'paste' ? 'border-brand-500 text-brand-400' : 'border-transparent text-gray-400'
                  }`}
                >
                  📋 Paste CSV Text
                </button>
              </div>

              <form onSubmit={handleImportStatement} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Select Broker</label>
                  <select
                    value={importBroker}
                    onChange={(e) => setImportBroker(e.target.value)}
                    className="w-full px-4 py-2.5 bg-navy-950 border border-navy-800 rounded-xl text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="Zerodha">Zerodha Console Holding Statement</option>
                    <option value="Groww">Groww Stocks Holding Statement</option>
                    <option value="Upstox">Upstox Holdings Report</option>
                    <option value="Angel One">Angel One Portfolio Statement</option>
                    <option value="ICICI Direct">ICICI Direct Equity Portfolio</option>
                    <option value="HDFC Securities">HDFC Securities Holding Statement</option>
                    <option value="Custom Broker">Custom CSV / Excel</option>
                  </select>
                </div>

                {importTab === 'file' ? (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Statement File</label>
                    <input
                      type="file"
                      accept=".csv, .xlsx, .xls"
                      onChange={(e) => setImportFile(e.target.files[0])}
                      className="w-full p-3 bg-navy-950 border border-navy-800 rounded-xl text-white text-sm focus:outline-none"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Supports Zerodha Console holding Excel/CSV, Groww CSV, Upstox statement, or CSV with headers: 
                      <code className="text-brand-400 ml-1">Symbol, Quantity, Avg Price, Invested Value</code>
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">Paste CSV Contents</label>
                    <textarea
                      rows={5}
                      value={rawCsvText}
                      onChange={(e) => setRawCsvText(e.target.value)}
                      placeholder={`Symbol, Quantity, Avg Price\nRELIANCE, 25, 2450.50\nTCS, 10, 3800.00\nINFY, 40, 1420.00`}
                      className="w-full p-3 bg-navy-950 border border-navy-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-brand-500"
                    ></textarea>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3 border-t border-navy-800">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 bg-navy-950 hover:bg-navy-800 text-gray-300 font-semibold rounded-xl text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={importLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-sm shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {importLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Import Holdings Now'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
