import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { permitsAPI } from '../services/api';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { data: permitsData, isLoading } = useQuery('permits', () =>
    permitsAPI.getAll({ limit: 100 })
  );

  const permits = permitsData?.permits || [];
  const totalPermits = permits.length;
  const draftPermits = permits.filter(p => p.status === 'draft').length;
  const submittedPermits = permits.filter(p => p.status === 'submitted').length;
  const underReviewPermits = permits.filter(p => p.status === 'under_review').length;
  const approvedPermits = permits.filter(p => p.status === 'approved').length;
  const rejectedPermits = permits.filter(p => p.status === 'rejected').length;
  const completedPermits = permits.filter(p => p.status === 'completed').length;

  const recentPermits = permits.slice(0, 5);

  const stats = [
    {
      name: 'Total Permits',
      value: totalPermits,
      icon: FileText,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      name: 'Draft',
      value: draftPermits,
      icon: Clock,
      color: 'bg-gray-500',
      textColor: 'text-gray-600'
    },
    {
      name: 'Under Review',
      value: underReviewPermits,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      name: 'Approved',
      value: approvedPermits,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      under_review: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || colors.draft;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's an overview of your permit packages.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${stat.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stat.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/permits/new"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <Plus className="w-6 h-6 text-primary-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Create New Permit</h4>
                <p className="text-sm text-gray-500">Start a new permit application</p>
              </div>
            </Link>
            
            <Link
              to="/permits"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <FileText className="w-6 h-6 text-primary-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">View All Permits</h4>
                <p className="text-sm text-gray-500">Manage your permit packages</p>
              </div>
            </Link>
            
            <Link
              to="/counties"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200"
            >
              <MapPin className="w-6 h-6 text-primary-600 mr-3" />
              <div>
                <h4 className="font-medium text-gray-900">Browse Counties</h4>
                <p className="text-sm text-gray-500">Find county requirements</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Permits */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Permits</h3>
            <Link
              to="/permits"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="overflow-hidden">
          {recentPermits.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No permits yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first permit package.
              </p>
              <div className="mt-6">
                <Link
                  to="/permits/new"
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Permit
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentPermits.map((permit) => (
                <div key={permit.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {permit.projectName}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(permit.status)}`}>
                          {permit.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {permit.county?.name}, {permit.county?.state}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(permit.createdAt), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1" />
                          {permit.files?.length || 0} files
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <Link
                        to={`/permits/${permit.id}`}
                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
