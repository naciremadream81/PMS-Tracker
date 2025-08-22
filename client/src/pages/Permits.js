import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { permitsAPI } from '../services/api';
import { 
  FileText, 
  Plus, 
  Search, 
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { formatDateSafely } from '../utils/dateUtils';

const Permits = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [countyFilter, setCountyFilter] = useState('');

  const { data: permitsData, isLoading, error } = useQuery('permits', () =>
    permitsAPI.getAll({ limit: 100 })
  );

  const permits = permitsData?.permits || [];

  const filteredPermits = permits.filter(permit => {
    const matchesSearch = permit.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permit.permitNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || permit.status === statusFilter;
    const matchesCounty = !countyFilter || permit.countyId === countyFilter;
    
    return matchesSearch && matchesStatus && matchesCounty;
  });

  const getStatusIcon = (status) => {
    const icons = {
      draft: Clock,
      submitted: FileText,
      under_review: AlertCircle,
      approved: CheckCircle,
      rejected: XCircle,
      completed: CheckCircle
    };
    return icons[status] || Clock;
  };

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
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading permits</h3>
        <p className="mt-1 text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Permits</h1>
            <p className="mt-2 text-gray-600">
              Manage your construction permit packages
            </p>
          </div>
          <Link
            to="/permits/new"
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Permit
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="label">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  className="input pl-10"
                  placeholder="Search permits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="label">Status</label>
              <select
                id="status"
                className="input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* County Filter */}
            <div>
              <label htmlFor="county" className="label">County</label>
              <select
                id="county"
                className="input"
                value={countyFilter}
                onChange={(e) => setCountyFilter(e.target.value)}
              >
                <option value="">All Counties</option>
                {/* Add county options when available */}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Permits List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filteredPermits.length} Permit{filteredPermits.length !== 1 ? 's' : ''}
          </h3>
        </div>
        <div className="overflow-hidden">
          {filteredPermits.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No permits found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter || countyFilter 
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first permit package.'
                }
              </p>
              {!searchTerm && !statusFilter && !countyFilter && (
                <div className="mt-6">
                  <Link
                    to="/permits/new"
                    className="btn-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Permit
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPermits.map((permit) => {
                const StatusIcon = getStatusIcon(permit.status);
                return (
                  <div key={permit.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className="h-5 w-5 text-gray-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {permit.projectName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {permit.permitNumber}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {permit.county?.name || 'County not specified'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDateSafely(permit.createdAt)}
                          </div>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-1" />
                            {permit.files?.length || 0} files
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(permit.status)}`}>
                          {permit.status.replace('_', ' ')}
                        </span>
                        <Link
                          to={`/permits/${permit.id}`}
                          className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Permits;

