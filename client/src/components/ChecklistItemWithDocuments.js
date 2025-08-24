import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Upload, 
  Download, 
  Trash2, 
  CheckCircle, 
  Circle, 
  FileText, 
  Eye,
  Edit,
  X,
  Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import { checklistFilesAPI } from '../services/api';

const ChecklistItemWithDocuments = ({ 
  checklistItem, 
  permitId, 
  onUpdate, 
  isAdmin = false 
}) => {
  // Debug logging
  console.log('ChecklistItemWithDocuments props:', { checklistItem, permitId, onUpdate, isAdmin });
  
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [newFileData, setNewFileData] = useState({
    description: '',
    fileType: 'document',
    isRequired: false
  });

  const queryClient = useQueryClient();

  // Fetch files for this checklist item
  const { data: filesData, isLoading: filesLoading } = useQuery(
    ['checklist-files', checklistItem.id],
    () => checklistFilesAPI.getByPermitChecklist(checklistItem.id),
    {
      enabled: !!checklistItem.id,
      onError: (error) => {
        console.error('Failed to fetch checklist files:', error);
      }
    }
  );

  const files = filesData?.files || [];

  // Upload file mutation
  const uploadFileMutation = useMutation(
    ({ permitChecklistId, file, metadata }) => 
      checklistFilesAPI.upload(permitChecklistId, file, metadata),
    {
      onSuccess: () => {
        toast.success('File uploaded successfully');
        setShowUploadForm(false);
        setUploadingFile(null);
        setNewFileData({
          description: '',
          fileType: 'document',
          isRequired: false
        });
        queryClient.invalidateQueries(['checklist-files', checklistItem.id]);
        if (onUpdate) onUpdate();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to upload file');
        setUploadingFile(null);
      }
    }
  );

  // Delete file mutation
  const deleteFileMutation = useMutation(
    (fileId) => checklistFilesAPI.delete(fileId),
    {
      onSuccess: () => {
        toast.success('File deleted successfully');
        queryClient.invalidateQueries(['checklist-files', checklistItem.id]);
        if (onUpdate) onUpdate();
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete file');
      }
    }
  );

  // Update file mutation
  const updateFileMutation = useMutation(
    ({ fileId, metadata }) => checklistFilesAPI.update(fileId, metadata),
    {
      onSuccess: () => {
        toast.success('File updated successfully');
        setEditingFile(null);
        queryClient.invalidateQueries(['checklist-files', checklistItem.id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update file');
      }
    }
  );

  // Review file mutation (admin only)
  const reviewFileMutation = useMutation(
    ({ fileId, reviewData }) => checklistFilesAPI.review(fileId, reviewData),
    {
      onSuccess: () => {
        toast.success('File review updated successfully');
        queryClient.invalidateQueries(['checklist-files', checklistItem.id]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update file review');
      }
    }
  );

  const handleFileUpload = (e) => {
    e.preventDefault();
    if (!uploadingFile) {
      toast.error('Please select a file to upload');
      return;
    }

    uploadFileMutation.mutate({
      permitChecklistId: checklistItem.id,
      file: uploadingFile,
      metadata: newFileData
    });
  };

  const handleFileDelete = (fileId) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      deleteFileMutation.mutate(fileId);
    }
  };

  const handleFileDownload = async (fileId) => {
    try {
      const response = await checklistFilesAPI.download(fileId);
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'file');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'needs_revision': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      case 'needs_revision': return 'Needs Revision';
      default: return 'Pending';
    }
  };

  // Check for required props
  if (!checklistItem) {
    console.error('No checklistItem provided to ChecklistItemWithDocuments');
    return <div>Error: No checklist item data</div>;
  }

  return (
    <div className="border rounded-lg p-4 mb-4 bg-white">
      {/* Checklist Item Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h4 className="text-lg font-medium text-gray-900">
              {checklistItem.name}
            </h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              checklistItem.isCompleted 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {checklistItem.isCompleted ? 'Complete' : 'In Progress'}
            </span>
            {checklistItem.documentsRequired && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                checklistItem.documentsComplete 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {checklistItem.documentsComplete ? 'Documents Complete' : 'Documents Required'}
              </span>
            )}
          </div>
          
          {checklistItem.description && (
            <p className="text-gray-600 mb-2">{checklistItem.description}</p>
          )}
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            {checklistItem.estimatedHours > 0 && (
              <span>Est. Hours: {checklistItem.estimatedHours}</span>
            )}
            {checklistItem.priority && (
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                checklistItem.priority === 'high' ? 'bg-red-100 text-red-800' :
                checklistItem.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {checklistItem.priority} priority
              </span>
            )}
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="btn-primary flex items-center"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Upload Form */}
      {showUploadForm && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h5 className="font-medium text-gray-900 mb-3">Upload New Document</h5>
          <form onSubmit={handleFileUpload} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="label">File</label>
                <input
                  type="file"
                  onChange={(e) => setUploadingFile(e.target.files[0])}
                  className="input"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt,.xls,.xlsx"
                  required
                />
              </div>
              
              <div>
                <label className="label">File Type</label>
                <select
                  className="input"
                  value={newFileData.fileType}
                  onChange={(e) => setNewFileData({ ...newFileData, fileType: e.target.value })}
                >
                  <option value="document">Document</option>
                  <option value="image">Image</option>
                  <option value="plan">Plan</option>
                  <option value="form">Form</option>
                  <option value="certificate">Certificate</option>
                  <option value="inspection">Inspection</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="label">Description</label>
                <input
                  type="text"
                  className="input"
                  value={newFileData.description}
                  onChange={(e) => setNewFileData({ ...newFileData, description: e.target.value })}
                  placeholder="Brief description of the file"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  checked={newFileData.isRequired}
                  onChange={(e) => setNewFileData({ ...newFileData, isRequired: e.target.checked })}
                />
                <span className="ml-2 text-sm text-gray-700">Required for completion</span>
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="btn-primary"
                disabled={uploadFileMutation.isLoading || !uploadingFile}
              >
                {uploadFileMutation.isLoading ? 'Uploading...' : 'Upload File'}
              </button>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Files List */}
      <div className="space-y-3">
        <h5 className="font-medium text-gray-900">Uploaded Documents ({files.length})</h5>
        
        {filesLoading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-sm text-gray-500">Loading files...</span>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm">No documents uploaded yet</p>
          </div>
        ) : (
          files.map((file) => (
            <div key={file.id} className="border rounded-lg p-3 bg-gray-50">
              {editingFile?.id === file.id ? (
                // Edit Form
                <form onSubmit={(e) => {
                  e.preventDefault();
                  updateFileMutation.mutate({
                    fileId: file.id,
                    metadata: editingFile
                  });
                }} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="label">Description</label>
                      <input
                        type="text"
                        className="input"
                        value={editingFile.description}
                        onChange={(e) => setEditingFile({ ...editingFile, description: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label className="label">File Type</label>
                      <select
                        className="input"
                        value={editingFile.fileType}
                        onChange={(e) => setEditingFile({ ...editingFile, fileType: e.target.value })}
                      >
                        <option value="document">Document</option>
                        <option value="image">Image</option>
                        <option value="plan">Plan</option>
                        <option value="form">Form</option>
                        <option value="certificate">Certificate</option>
                        <option value="inspection">Inspection</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button type="submit" className="btn-primary">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingFile(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Display Mode
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <FileText className="h-5 w-5 text-gray-500" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.originalName}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.reviewStatus)}`}>
                          {getStatusText(file.reviewStatus)}
                        </span>
                      </div>
                      
                      {file.description && (
                        <p className="text-sm text-gray-600">{file.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{file.fileType}</span>
                        <span>{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        <span>Uploaded by {file.uploadedByUser?.firstName} {file.uploadedByUser?.lastName}</span>
                        <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleFileDownload(file.id)}
                      className="text-primary-600 hover:text-primary-500 p-1 rounded-md hover:bg-primary-50"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setEditingFile({ ...file })}
                      className="text-gray-600 hover:text-gray-700 p-1 rounded-md hover:bg-gray-50"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleFileDelete(file.id)}
                      className="text-red-600 hover:text-red-700 p-1 rounded-md hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChecklistItemWithDocuments;
