import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { countiesAPI } from '../services/api';
import { 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Clock,
  Search,
  Building2,
  FileText
} from 'lucide-react';

const Counties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('');

  const { data: countiesData, isLoading, error } = useQuery('counties', () =>
    countiesAPI.getAll()
  );

  const counties = countiesData?.counties || [];

  const filteredCounties = counties.filter(county => {
    const matchesSearch = county.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         county.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesState = !stateFilter || county.state === stateFilter;
    
    return matchesSearch && matchesState;
  });

  const states = [...new Set(counties.map(county => county.state))].sort();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
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
        <MapPin className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading counties</h3>
        <p className="mt-1 text-sm text-gray-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Counties</h1>
        <p className="mt-2 text-gray-600">
          Browse county information and permit requirements
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="label">Search Counties</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  className="input pl-10"
                  placeholder="Search by county or state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* State Filter */}
            <div>
              <label htmlFor="state" className="label">Filter by State</label>
              <select
                id="state"
                className="input"
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
              >
                <option value="">All States</option>
                {states.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Counties List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {filteredCounties.length} Count{filteredCounties.length !== 1 ? 'ies' : 'y'}
          </h3>
        </div>
        <div className="overflow-hidden">
          {filteredCounties.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <MapPin className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No counties found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || stateFilter 
                  ? 'Try adjusting your filters'
                  : 'No counties available.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredCounties.map((county) => (
                <div key={county.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <Building2 className="h-6 w-6 text-primary-600" />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {county.name} County
                          </h3>
                          <p className="text-sm text-gray-500">
                            {county.stateFull} ({county.state})
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {county.processingTime && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Processing Time: {county.processingTime} days
                            </span>
                          </div>
                        )}
                        {county.timezone && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Timezone: {county.timezone}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {county.website && (
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <a
                              href={county.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary-600 hover:text-primary-500 truncate"
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                        {county.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {county.phone}
                            </span>
                          </div>
                        )}
                        {county.contactEmail && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <a
                              href={`mailto:${county.contactEmail}`}
                              className="text-sm text-primary-600 hover:text-primary-500 truncate"
                            >
                              {county.contactEmail}
                            </a>
                          </div>
                        )}
                      </div>

                      {county.address && (
                        <div className="mt-4 flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-sm text-gray-600">
                            {county.address}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          county.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {county.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <button className="btn-primary">
                        <FileText className="w-4 h-4 mr-2" />
                        View Requirements
                      </button>
                      <button className="btn-secondary">
                        <MapPin className="w-4 h-4 mr-2" />
                        Get Directions
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Counties
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {counties.length}
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
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Counties
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {counties.filter(c => c.isActive).length}
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
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Avg Processing
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {counties.length > 0 
                      ? Math.round(counties.reduce((sum, c) => sum + (c.processingTime || 0), 0) / counties.length)
                      : 0
                    } days
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
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    States Covered
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {states.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Counties;
