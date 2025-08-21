import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { permitsAPI } from '../services/api';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  Edit,
  X,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Upload
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const PermitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: permitData, isLoading, error } = useQuery(
    ['permit', id],
    () => permitsAPI.getById(id)
  );

  const permit = permitData?.permit;

  const updatePermitMutation = useMutation(
    (permitData) => permitsAPI.update(id, permitData),
    {
      onSuccess: () => {
        toast.success('Permit updated successfully!');
        queryClient.invalidateQueries(['permit', id]);
        queryClient.invalidateQueries('permits');
        setIsEditing(false);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update permit');
      }
    }
  );

  const handleUpdate = async (data) => {
    setIsUpdating(true);
    try {
      await updatePermitMutation.mutateAsync(data);
    } finally {
      setIsUpdating(false);
    }
  };

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
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !permit) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading permit</h3>
        <p className="mt-1 text-sm text-gray-500">
          {error?.message || 'Permit not found'}
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/permits')}
            className="btn-secondary"
          >
            Back to Permits
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/permits')}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{permit.projectName}</h1>
              <p className="mt-2 text-gray-600">
                Permit #{permit.permitNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(permit.status)}`}>
              {permit.status.replace('_', ' ')}
            </span>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary"
            >
              {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit className="w-4 h-4 mr-2" />}
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Project Name</label>
                  <p className="text-gray-900">{permit.projectName}</p>
                </div>
                <div>
                  <label className="label">Project Type</label>
                  <p className="text-gray-900 capitalize">{permit.projectType.replace('_', ' ')}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Project Address</label>
                  <p className="text-gray-900">{permit.projectAddress}</p>
                </div>
                {permit.estimatedCost && (
                  <div>
                    <label className="label">Estimated Cost</label>
                    <p className="text-gray-900">${parseFloat(permit.estimatedCost).toLocaleString()}</p>
                  </div>
                )}
                {permit.submissionDate && (
                  <div>
                    <label className="label">Submission Date</label>
                    <p className="text-gray-900">{format(new Date(permit.submissionDate), 'MMM dd, yyyy')}</p>
                  </div>
                )}
              </div>
              {permit.description && (
                <div>
                  <label className="label">Description</label>
                  <p className="text-gray-900">{permit.description}</p>
                </div>
              )}
              {permit.notes && (
                <div>
                  <label className="label">Notes</label>
                  <p className="text-gray-900">{permit.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Files */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Files & Documents</h3>
                <button className="btn-primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </button>
              </div>
            </div>
            <div className="p-6">
              {permit.files && permit.files.length > 0 ? (
                <div className="space-y-3">
                  {permit.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                          <p className="text-xs text-gray-500">
                            {file.fileType} • {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {file.isRequired && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                        <button className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No files uploaded</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload required documents for your permit application.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Checklist */}
          {permit.checklists && permit.checklists.length > 0 && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Requirements Checklist</h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {permit.checklists.map((checklist) => (
                    <div key={checklist.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={checklist.isCompleted}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          readOnly
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {checklist.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {checklist.category} • ${checklist.estimatedCost}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {checklist.isCompleted ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Status & Actions</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                {React.createElement(getStatusIcon(permit.status), { className: "h-5 w-5 text-gray-400" })}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(permit.status)}`}>
                  {permit.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-3">
                <button className="w-full btn-primary">
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Application
                </button>
                <button className="w-full btn-secondary">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Details
                </button>
              </div>
            </div>
          </div>

          {/* County Information */}
          {permit.county && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">County Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="label">County</label>
                  <p className="text-gray-900">{permit.county.name}, {permit.county.state}</p>
                </div>
                {permit.county.processingTime && (
                  <div>
                    <label className="label">Processing Time</label>
                    <p className="text-gray-900">{permit.county.processingTime} days</p>
                  </div>
                )}
                {permit.county.website && (
                  <div>
                    <label className="label">Website</label>
                    <a 
                      href={permit.county.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-500 text-sm"
                    >
                      Visit County Website
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(permit.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                {permit.submissionDate && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Submitted</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(permit.submissionDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
                {permit.approvalDate && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Approved</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(permit.approvalDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermitDetail;
