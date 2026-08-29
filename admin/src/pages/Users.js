import React, { useState, useEffect } from 'react';
import axios from 'axios';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    firstName: '',
    lastName: '',
    phone: '',
    isActive: true
  });

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUsers(1);
  }, [search, roleFilter, statusFilter]);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: pagination.limit,
          search,
          role: roleFilter,
          status: statusFilter
        }
      });

      if (res.data.success) {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/users', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setSuccessMessage('User created successfully');
        setShowAddModal(false);
        setFormData({ username: '', email: '', password: '', role: 'user', firstName: '', lastName: '', phone: '', isActive: true });
        fetchUsers(1);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/users/${editingUser._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setSuccessMessage('User updated successfully');
        setShowEditModal(false);
        setEditingUser(null);
        fetchUsers(pagination.page);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/users/${user._id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(pagination.page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${user.username}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/users/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers(pagination.page);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      phone: user.profile?.phone || '',
      isActive: user.isActive
    });
    setShowEditModal(true);
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <span>👥 User Management System</span>
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage user accounts, roles, access permissions, and account statuses
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({ username: '', email: '', password: '', role: 'user', firstName: '', lastName: '', phone: '', isActive: true });
            setError('');
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center gap-2 self-start"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New User
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-sm font-semibold rounded-2xl">
          {successMessage}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search username, email, name..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
          />
          <svg className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl text-sm font-semibold focus:outline-none"
          >
            <option value="">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="user">Regular Users</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-zinc-50 border border-zinc-200 text-zinc-700 rounded-xl text-sm font-semibold focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-zinc-400">Loading user records...</div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-medium">No users found matching query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold uppercase text-zinc-500 tracking-wider">
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Portfolios / Watchlists</th>
                  <th className="px-4 py-3.5">Joined Date</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-sm font-medium text-zinc-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-zinc-50/80 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900">{u.username}</div>
                          <div className="text-xs text-zinc-400">
                            {u.profile?.firstName} {u.profile?.lastName}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-zinc-600">{u.email}</td>

                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-xs font-semibold text-zinc-600">
                      📊 {u.portfolioCount || 0} Portfolios | ⭐ {u.watchlistCount || 0} Watchlists
                    </td>

                    <td className="px-4 py-4 text-xs text-zinc-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-zinc-200 hover:bg-zinc-100 transition"
                          title="Toggle Status"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 hover:bg-zinc-100 text-zinc-600 rounded-lg transition"
                          title="Edit User"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                          title="Delete User"
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

        {/* Pagination */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-500 font-semibold">
          <span>Showing page {pagination.page} of {pagination.pages} ({pagination.total} total users)</span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200">
            <h3 className="text-xl font-bold text-zinc-900 mb-4">
              {showEditModal ? 'Edit User' : 'Add New User'}
            </h3>

            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={showEditModal ? handleUpdateUser : handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  {showEditModal ? 'New Password (leave empty to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!showEditModal}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm font-semibold focus:outline-none"
                  >
                    <option value="user font-semibold">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Status</label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl text-sm font-semibold focus:outline-none"
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm shadow-md"
                >
                  {showEditModal ? 'Update User' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
