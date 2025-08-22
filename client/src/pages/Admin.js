import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Users, 
  FileText, 
  MapPin, 
  CheckSquare, 
  Activity,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  UserCheck,
  UserX,
  Search,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showCountyChecklists, setShowCountyChecklists] = useState(false);
  const [selectedCounty, setSelectedCounty] = useState(null);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    company: '',
    role: 'user'
  });

  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if user is admin


  // Fetch users
  const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery(
    ['admin-users', searchTerm, roleFilter, statusFilter],
    () => adminAPI.getUsers({ search: searchTerm, role: roleFilter, isActive: statusFilter }),
    {
      onError: (error) => {
        console.error('Failed to fetch users:', error);
        toast.error('Failed to fetch users');
      }
    }
  );

  // Fetch system stats
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery(
    'admin-stats',
    () => adminAPI.getStats(),
    {
      onError: (error) => {
        console.error('Failed to fetch stats:', error);
        toast.error('Failed to fetch system stats');
      }
    }
  );

  // Fetch recent activity
  const { data: activityData, isLoading: activityLoading, error: activityError } = useQuery(
    'admin-activity',
    () => adminAPI.getActivity({ limit: 10 }),
    {
      onError: (error) => {
        console.error('Failed to fetch activity:', error);
        toast.error('Failed to fetch recent activity');
      }
    }
  );

  // Fetch counties for checklist management
  const { data: countiesData, isLoading: countiesLoading, error: countiesError } = useQuery(
    'admin-counties',
    () => adminAPI.getCounties(),
    {
      enabled: showCountyChecklists,
      onError: (error) => {
        console.error('Failed to fetch counties:', error);
        toast.error('Failed to fetch counties');
      }
    }
  );

  // Delete user mutation
  const deleteUserMutation = useMutation(
    (userId) => adminAPI.deleteUser(userId),
    {
      onSuccess: () => {
        toast.success('User deleted successfully');
        queryClient.invalidateQueries('admin-users');
        queryClient.invalidateQueries('admin-stats');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete user');
      }
    }
  );

  // Toggle user status mutation
  const toggleUserStatusMutation = useMutation(
    ({ userId, isActive }) => adminAPI.updateUser(userId, { isActive }),
    {
      onSuccess: () => {
        toast.success('User status updated successfully');
        queryClient.invalidateQueries('admin-users');
        queryClient.invalidateQueries('admin-stats');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update user status');
      }
    }
  );

  // Create user mutation
  const createUserMutation = useMutation(
    (userData) => adminAPI.createUser(userData),
    {
      onSuccess: () => {
        toast.success('User created successfully');
        setIsCreatingUser(false);
        setNewUserData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          company: '',
          role: 'user'
        });
        queryClient.invalidateQueries('admin-users');
        queryClient.invalidateQueries('admin-stats');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create user');
      }
    }
  );

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  const handleDeleteUser = (userId) => {
    console.log('Delete user clicked:', userId);
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      console.log('Confirming delete for user:', userId);
      deleteUserMutation.mutate(userId);
    }
  };

  const handleToggleUserStatus = (userId, currentStatus) => {
    console.log('Toggle status clicked:', userId, currentStatus);
    toggleUserStatusMutation.mutate({ userId, isActive: !currentStatus });
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    createUserMutation.mutate(newUserData);
  };

  const handleCountyChecklistClick = (county) => {
    setSelectedCounty(county);
    setShowCountyChecklists(true);
  };

  const users = usersData?.users || [];
  const stats = statsData || {};
  const activity = activityData || {};

  // Debug logging
  console.log('Admin component data:', {
    usersData,
    statsData,
    activityData,
    users,
    stats,
    activity,
    user: user // from useAuth
  });

  if (usersLoading || statsLoading || activityLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          System administration and user management
        </p>
      </div>

      {/* Error Display */}
      {(usersError || statsError || activityError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">API Errors</h3>
              <div className="mt-2 text-sm text-red-700">
                {usersError && <p>Users: {usersError.message}</p>}
                {statsError && <p>Stats: {statsError.message}</p>}
                {activityError && <p>Activity: {activityError.message}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.users?.total || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Permits
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.permits?.total || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Counties
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.counties || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckSquare className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Checklists
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.checklists || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">User Management</h3>
            <button
              onClick={() => {
                console.log('Add User button clicked');
                setIsCreatingUser(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="label">Search Users</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  className="input pl-10"
                  placeholder="Search by name, email, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="label">Role</label>
              <select
                id="role"
                className="input"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="label">Status</label>
              <select
                id="status"
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="overflow-hidden">
          {users.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || roleFilter || statusFilter 
                  ? 'Try adjusting your filters'
                  : 'No users available.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {users.map((user) => (
                <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                            {user.role === 'admin' ? (
                              <Shield className="h-5 w-5 text-primary-600" />
                            ) : (
                              <Users className="h-5 w-5 text-primary-600" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user.email}
                          </p>
                          {user.company && (
                            <p className="text-xs text-gray-400 truncate">
                              {user.company}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-primary-600 hover:text-primary-500 p-1 rounded-md hover:bg-primary-50"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                          className={`p-1 rounded-md hover:bg-gray-50 ${
                            user.isActive 
                              ? 'text-red-600 hover:text-red-700' 
                              : 'text-green-600 hover:text-green-700'
                          }`}
                          title={user.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* County Checklist Management Section */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">County Checklist Management</h3>
            <button
              onClick={() => setShowCountyChecklists(!showCountyChecklists)}
              className="btn-primary"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Manage Checklists
            </button>
          </div>
        </div>
        
        {showCountyChecklists && (
          <div className="p-6">
            {countiesLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-500">Loading counties...</p>
              </div>
            ) : countiesError ? (
              <div className="text-center py-8 text-red-600">
                <p>Error loading counties. Please try again.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {countiesData?.counties?.map((county) => (
                  <div 
                    key={county.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleCountyChecklistClick(county)}
                  >
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{county.name}</h4>
                        <p className="text-sm text-gray-500">
                          {county.checklists?.length || 0} checklist items
                        </p>
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No counties found</h3>
                    <p className="mt-1 text-sm text-gray-500">Counties will appear here once loaded.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Creation Form */}
      {isCreatingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label htmlFor="email" className="label">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="label">Password</label>
                  <input
                    id="password"
                    type="password"
                    className="input"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="firstName" className="label">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    className="input"
                    value={newUserData.firstName}
                    onChange={(e) => setNewUserData({...newUserData, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="label">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    className="input"
                    value={newUserData.lastName}
                    onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="company" className="label">Company</label>
                  <input
                    id="company"
                    type="text"
                    className="input"
                    value={newUserData.company}
                    onChange={(e) => setNewUserData({...newUserData, company: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="role" className="label">Role</label>
                  <select
                    id="role"
                    className="input"
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                    disabled={createUserMutation.isLoading}
                  >
                    {createUserMutation.isLoading ? 'Creating...' : 'Create User'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreatingUser(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activity.recentPermits?.map((permit) => (
              <div key={permit.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    New permit created: {permit.projectName}
                  </p>
                  <p className="text-sm text-gray-500">
                    by {permit.user?.firstName} {permit.user?.lastName}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(permit.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
