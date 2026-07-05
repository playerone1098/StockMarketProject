import React, { useState, useEffect } from 'react';
import api from '../utils/axios';

export const Sectors = () => {
  const [sectors, setSectors] = useState([]);
  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorDesc, setNewSectorDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSectors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/sectors');
      if (response.data.success) {
        setSectors(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch sectors. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  const handleAddSector = async (e) => {
    e.preventDefault();
    if (!newSectorName.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/sectors', { 
        name: newSectorName,
        description: newSectorDesc
      });
      if (response.data.success) {
        setSectors((prev) => [...prev, response.data.data].sort((a, b) => a.name.localeCompare(b.name)));
        setNewSectorName('');
        setNewSectorDesc('');
        setSuccess('Sector added successfully!');
        
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add sector. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSector = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the sector "${name}"?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.delete(`/sectors/${id}`);
      if (response.data.success) {
        setSectors((prev) => prev.filter((c) => c._id !== id));
        setSuccess('Sector deleted successfully!');
        
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete sector. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-navy-950 mb-8">Manage Sectors</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-xs font-bold">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-brand-50 border border-brand-200 text-brand-700 px-4 py-3 rounded-xl mb-6 text-xs font-bold">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Add Sector Form */}
        <div className="bg-white rounded-3xl border border-gray-150 p-6 h-fit shadow-sm">
          <h2 className="text-base font-bold text-navy-950 mb-4">Add New Sector</h2>
          <form onSubmit={handleAddSector} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Sector Name
              </label>
              <input
                type="text"
                value={newSectorName}
                onChange={(e) => setNewSectorName(e.target.value)}
                placeholder="e.g. Pharma & Healthcare"
                className="w-full px-3 py-2 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                value={newSectorDesc}
                onChange={(e) => setNewSectorDesc(e.target.value)}
                placeholder="Brief description of the sector..."
                rows="3"
                className="w-full px-3 py-2 border border-gray-250 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !newSectorName.trim()}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-2.5 rounded-xl text-xs transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Add Sector'}
            </button>
          </form>
        </div>

        {/* Sectors List */}
        <div className="bg-white rounded-3xl border border-gray-150 p-6 md:col-span-2 shadow-sm">
          <h2 className="text-base font-bold text-navy-950 mb-4">Active Sectors</h2>
          {sectors.length === 0 && !loading ? (
            <p className="text-gray-500 text-xs font-medium">No sectors defined in database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 font-bold uppercase">
                    <th className="pb-3">Sector Name</th>
                    <th className="pb-3">Description</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sectors.map((sector) => (
                    <tr key={sector._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-4 text-navy-950 font-bold max-w-[150px] truncate">{sector.name}</td>
                      <td className="py-4 text-gray-500 max-w-[200px] truncate">{sector.description || '—'}</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteSector(sector._id, sector.name)}
                          disabled={loading}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-bold transition"
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
      </div>
    </div>
  );
};
