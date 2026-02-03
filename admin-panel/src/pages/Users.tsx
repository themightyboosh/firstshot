import { useEffect, useState } from 'react';
import { Plus, Trash2, Shield, User as UserIcon, Loader2, Key, Copy, X, BarChart, Mail, ArrowUpDown } from 'lucide-react';
import { usersApi, usageApi } from '../lib/api';
import type { User, UserUsageStats } from '../lib/types';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [generateInvite, setGenerateInvite] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [selectedUserStats, setSelectedUserStats] = useState<{ user: User, stats: UserUsageStats } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSort = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    // Handle undefined/null values
    const valA = a[key] || '';
    const valB = b[key] || '';
    
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  const openInviteModal = () => {
    setGenerateInvite(true);
    setNewUserPassword('');
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setGenerateInvite(false);
    setIsModalOpen(true);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await usersApi.getAll();
      setUsers(result.users);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const result = await usersApi.create({
        email: newUserEmail,
        password: generateInvite ? undefined : newUserPassword,
        role: newUserRole,
        displayName: newUserEmail.split('@')[0],
        generateInviteLink: generateInvite
      });
      
      setIsModalOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      setGenerateInvite(true);
      
      if (result.inviteLink) {
        setInviteLink(result.inviteLink);
      }
      
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateResetLink = async (uid: string) => {
    if (!confirm('Generate a password reset link for this user?')) return;
    try {
      const result = await usersApi.generateResetLink(uid);
      setInviteLink(result.link);
    } catch (err) {
      alert('Failed to generate link');
    }
  };

  const handleRoleToggle = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role of ${user.email} to ${newRole}?`)) return;
    
    try {
      await usersApi.updateRole(user.uid, newRole);
      // Optimistic update
      setUsers(users.map(u => u.uid === user.uid ? { ...u, role: newRole } : u));
    } catch (err) {
      alert('Failed to update role');
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await usersApi.delete(uid);
      setUsers(users.filter(u => u.uid !== uid));
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleShowStats = async (user: User) => {
    setLoadingStats(true);
    try {
      // In a real app with auth, we would fetch stats for THIS user
      // For now, if no logs exist for this UID, it returns 0s
      const stats = await usageApi.getUserStats(user.uid);
      setSelectedUserStats({ user, stats });
      setStatsModalOpen(true);
    } catch (err) {
      alert('Failed to load usage stats');
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Users</h2>
          <p className="text-gray-500">Manage app users and permissions.</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={openInviteModal}
            className="flex items-center space-x-2 border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50"
          >
            <Mail className="w-4 h-4" />
            <span>Invite User</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('email')}
              >
                <div className="flex items-center space-x-1">
                  <span>User</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('role')}
              >
                <div className="flex items-center space-x-1">
                  <span>Role</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map((user) => (
              <tr key={user.uid} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                      {user.photoURL ? (
                        <img className="h-10 w-10 rounded-full" src={user.photoURL} alt="" />
                      ) : (
                        <UserIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.displayName || 'No Name'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button 
                    onClick={() => handleGenerateResetLink(user.uid)}
                    className="text-gray-500 hover:text-gray-700"
                    title="Generate Reset Link"
                  >
                    <Key className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleShowStats(user)}
                    className="text-gray-500 hover:text-blue-600"
                    title="View Usage Stats"
                  >
                    {loadingStats && selectedUserStats?.user.uid === user.uid ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <BarChart className="w-5 h-5" />
                    )}
                  </button>
                  <button 
                    onClick={() => handleRoleToggle(user)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                  >
                    <Shield className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(user.uid)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete User"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">{generateInvite ? 'Invite User' : 'Create User'}</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                />
              </div>
              
              {!generateInvite && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    value={newUserPassword}
                    onChange={e => setNewUserPassword(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {generateInvite && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                  User will receive an invite link (generated for you to copy) to set their password.
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {generateInvite ? 'Generate Invite' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {inviteLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setInviteLink(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold mb-4">User Invite Link</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this link with the user. They can use it to set their password and sign in.
            </p>
            <div className="flex items-center space-x-2">
              <input
                readOnly
                value={inviteLink}
                className="flex-1 border rounded-lg p-2 text-sm bg-gray-50"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  alert('Copied to clipboard!');
                }}
                className="p-2 border rounded-lg hover:bg-gray-50"
                title="Copy"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      {statsModalOpen && selectedUserStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setStatsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <BarChart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">User Usage</h3>
                <p className="text-sm text-gray-500">{selectedUserStats.user.email}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Total Requests</span>
                  <p className="text-2xl font-bold text-gray-900">{selectedUserStats.stats.totalRequests}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Est. Cost</span>
                  <p className="text-2xl font-bold text-green-600">${selectedUserStats.stats.totalCost.toFixed(3)}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Activity Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Image Generations</span>
                    <span className="font-medium">{selectedUserStats.stats.breakdown.image}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Text Generations</span>
                    <span className="font-medium">{selectedUserStats.stats.breakdown.text}</span>
                  </div>
                </div>
              </div>
              
              {selectedUserStats.stats.lastActive && (
                <div className="text-xs text-gray-400 text-center pt-2">
                  Last active: {new Date(selectedUserStats.stats.lastActive).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
