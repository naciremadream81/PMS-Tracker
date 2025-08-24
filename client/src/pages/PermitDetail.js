import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { permitsAPI, filesAPI } from '../services/api';
import ChecklistItemWithDocuments from '../components/ChecklistItemWithDocuments';
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
import { formatDateSafely } from '../utils/dateUtils';
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

  const handleFileUpload = async (files) => {
    try {
      console.log('Starting file upload for files:', files);
      
      // Upload files one by one since the API only accepts single files
      for (const file of files) {
        console.log('Uploading file:', file.name, file.size, file.type);
        
        const metadata = {
          description: `Uploaded: ${file.name}`,
          fileType: 'document'
        };
        
        console.log('Uploading file to permit:', permit.id);
        
        await filesAPI.upload(permit.id, file, metadata);
        console.log('Upload successful for file:', file.name);
      }
      
      toast.success(`${files.length} file(s) uploaded successfully!`);
      // Refresh the permit data
      queryClient.invalidateQueries(['permit', id]);
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(error.response?.data?.error || error.message || 'Failed to upload files');
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
              {isEditing ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const updateData = {
                    projectName: formData.get('projectName'),
                    projectAddress: formData.get('projectAddress'),
                    projectType: formData.get('projectType'),
                    estimatedCost: parseFloat(formData.get('estimatedCost')) || 0,
                    description: formData.get('description'),
                    notes: formData.get('notes')
                  };
                  handleUpdate(updateData);
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Project Name</label>
                      <input
                        type="text"
                        name="projectName"
                        defaultValue={permit.projectName}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Project Type</label>
                      <select name="projectType" defaultValue={permit.projectType} className="input-field" required>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="renovation">Renovation</option>
                        <option value="new_construction">New Construction</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Project Address</label>
                      <input
                        type="text"
                        name="projectAddress"
                        defaultValue={permit.projectAddress}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="label">Estimated Cost</label>
                      <input
                        type="number"
                        name="estimatedCost"
                        defaultValue={permit.estimatedCost || ''}
                        step="0.01"
                        min="0"
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      name="description"
                      defaultValue={permit.description || ''}
                      rows="3"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">Notes</label>
                    <textarea
                      name="notes"
                      defaultValue={permit.notes || ''}
                      rows="3"
                      className="input-field"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button type="submit" className="btn-primary" disabled={isUpdating}>
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
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
                      <p className="text-gray-900">{formatDateSafely(permit.submissionDate)}</p>
                    </div>
                  )}
                </div>
              )}
              {!isEditing && permit.description && (
                <div>
                  <label className="label">Description</label>
                  <p className="text-gray-900">{permit.description}</p>
                </div>
              )}
              {!isEditing && permit.notes && (
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
                <button 
                  onClick={() => document.getElementById('fileInput').click()}
                  className="btn-primary"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </button>
                <input
                  id="fileInput"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  className="hidden"
                  onChange={(e) => {
                    console.log('File input change event:', e.target.files);
                    const files = Array.from(e.target.files);
                    console.log('Files selected:', files);
                    if (files.length > 0) {
                      handleFileUpload(files);
                    }
                  }}
                />
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
                <p className="mt-1 text-sm text-gray-600">
                  Upload required documents for each checklist item to complete your permit application.
                </p>
              </div>
              <div className="p-6">
                {/* Debug info */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  <p><strong>Debug:</strong> Found {permit.checklists.length} checklist items</p>
                  <p>First item: {JSON.stringify(permit.checklists[0], null, 2)}</p>
                </div>
                <div className="space-y-4">
                  {permit.checklists.map((checklist) => (
                    <ChecklistItemWithDocuments
                      key={checklist.id}
                      checklistItem={checklist}
                      permitId={permit.id}
                      onUpdate={() => queryClient.invalidateQueries(['permit', id])}
                      isAdmin={false}
                    />
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
              <div>
                <label className="label">Current Status</label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(permit.status)}`}>
                  {permit.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-3">
                <button className="w-full btn-primary">
                  <FileText className="w-4 h-4 mr-2" />
                  Submit Application
                </button>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full btn-secondary"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel Edit' : 'Edit Details'}
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
                      {formatDateSafely(permit.createdAt)}
                    </p>
                  </div>
                </div>
                {permit.submissionDate && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Submitted</p>
                      <p className="text-xs text-gray-500">
                        {formatDateSafely(permit.submissionDate)}
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
                        {formatDateSafely(permit.approvalDate)}
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
