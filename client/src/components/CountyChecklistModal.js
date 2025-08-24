import React, { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  CheckSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../services/api';

const CountyChecklistModal = ({ county, isOpen, onClose }) => {
  const [checklists, setChecklists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    category: 'general',
    projectTypes: [],
    estimatedCost: 0,
    processingTime: 'Unknown',
    isActive: true,
    order: 0
  });
  const [showNewForm, setShowNewForm] = useState(false);

  const queryClient = useQueryClient();

  const fetchChecklists = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await adminAPI.getCountyChecklists(county.id);
      setChecklists(response.checklists || []);
    } catch (error) {
      console.error('Failed to fetch checklists:', error);
      toast.error('Failed to fetch checklists');
    } finally {
      setIsLoading(false);
    }
  }, [county?.id]);

  // Fetch checklists when modal opens
  useEffect(() => {
    if (isOpen && county) {
      fetchChecklists();
    }
  }, [isOpen, county, fetchChecklists]);

  // Create new checklist item
  const createChecklistMutation = useMutation(
    (checklistData) => adminAPI.createCountyChecklist(county.id, checklistData),
    {
      onSuccess: () => {
        toast.success('Checklist item created successfully');
        fetchChecklists();
        setShowNewForm(false);
        setNewItem({
          name: '',
          description: '',
          category: 'general',
          projectTypes: [],
          estimatedCost: 0,
          processingTime: 'Unknown',
          isActive: true,
          order: 0
        });
        queryClient.invalidateQueries('admin-counties');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create checklist item');
      }
    }
  );

  // Update checklist item
  const updateChecklistMutation = useMutation(
    ({ checklistId, data }) => adminAPI.updateChecklist(checklistId, data),
    {
      onSuccess: () => {
        toast.success('Checklist item updated successfully');
        setEditingItem(null);
        fetchChecklists();
        queryClient.invalidateQueries('admin-counties');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to update checklist item');
      }
    }
  );

  // Delete checklist item
  const deleteChecklistMutation = useMutation(
    (checklistId) => adminAPI.deleteChecklist(checklistId),
    {
      onSuccess: () => {
        toast.success('Checklist item deleted successfully');
        fetchChecklists();
        queryClient.invalidateQueries('admin-counties');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to delete checklist item');
      }
    }
  );

  const handleCreateChecklist = (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) {
      toast.error('Checklist name is required');
      return;
    }
    
    // Set order to end of list
    const maxOrder = checklists.length > 0 ? Math.max(...checklists.map(c => c.order)) : 0;
    createChecklistMutation.mutate({
      ...newItem,
      order: maxOrder + 1
    });
  };

  const handleUpdateChecklist = (e) => {
    e.preventDefault();
    if (!editingItem.name.trim()) {
      toast.error('Checklist name is required');
      return;
    }
    
    updateChecklistMutation.mutate({
      checklistId: editingItem.id,
      data: editingItem
    });
  };

  const handleDeleteChecklist = (checklistId) => {
    if (window.confirm('Are you sure you want to delete this checklist item? This action cannot be undone.')) {
      deleteChecklistMutation.mutate(checklistId);
    }
  };

  const handleEditClick = (checklist) => {
    setEditingItem({ ...checklist });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };



  if (!isOpen || !county) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Manage Checklists for {county.name}
            </h2>
            <p className="text-gray-600 mt-1">
              Add, edit, and organize checklist items for this county
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Add New Checklist Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showNewForm ? 'Cancel' : 'Add New Checklist Item'}
          </button>
        </div>

        {/* New Checklist Form */}
        {showNewForm && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Checklist Item</h3>
            <form onSubmit={handleCreateChecklist} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Name *</label>
                <input
                  type="text"
                  className="input"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Enter checklist item name"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="label">Description</label>
                <textarea
                  className="input"
                  rows="3"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Enter description"
                />
              </div>
              
              <div>
                <label className="label">Category</label>
                <select
                  className="input"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  <option value="general">General</option>
                  <option value="structural">Structural</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="environmental">Environmental</option>
                  <option value="zoning">Zoning</option>
                </select>
              </div>
              
              <div>
                <label className="label">Estimated Cost ($)</label>
                <input
                  type="number"
                  className="input"
                  value={newItem.estimatedCost}
                  onChange={(e) => setNewItem({ ...newItem, estimatedCost: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="label">Processing Time</label>
                <input
                  type="text"
                  className="input"
                  value={newItem.processingTime}
                  onChange={(e) => setNewItem({ ...newItem, processingTime: e.target.value })}
                  placeholder="e.g., 2-3 weeks"
                />
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    checked={newItem.isActive}
                    onChange={(e) => setNewItem({ ...newItem, isActive: e.target.checked })}
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
              
              <div className="md:col-span-2 flex space-x-3">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={createChecklistMutation.isLoading}
                >
                  {createChecklistMutation.isLoading ? 'Creating...' : 'Create Checklist Item'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Checklists List */}
        <div className="bg-white border rounded-lg">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-500">Loading checklists...</p>
            </div>
          ) : checklists.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No checklist items</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first checklist item.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {checklists.map((checklist, index) => (
                <div key={checklist.id} className="p-6">
                  {editingItem?.id === checklist.id ? (
                    // Edit Form
                    <form onSubmit={handleUpdateChecklist} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="label">Name *</label>
                        <input
                          type="text"
                          className="input"
                          value={editingItem.name}
                          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="label">Description</label>
                        <textarea
                          className="input"
                          rows="3"
                          value={editingItem.description}
                          onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="label">Category</label>
                        <select
                          className="input"
                          value={editingItem.category}
                          onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                        >
                          <option value="general">General</option>
                          <option value="structural">Structural</option>
                          <option value="electrical">Electrical</option>
                          <option value="plumbing">Plumbing</option>
                          <option value="mechanical">Mechanical</option>
                          <option value="environmental">Environmental</option>
                          <option value="zoning">Zoning</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="label">Estimated Cost ($)</label>
                        <input
                          type="number"
                          className="input"
                          value={editingItem.estimatedCost}
                          onChange={(e) => setEditingItem({ ...editingItem, estimatedCost: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div>
                        <label className="label">Processing Time</label>
                        <input
                          type="text"
                          className="input"
                          value={editingItem.processingTime}
                          onChange={(e) => setEditingItem({ ...editingItem, processingTime: e.target.value })}
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            checked={editingItem.isActive}
                            onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                          />
                          <span className="ml-2 text-sm text-gray-700">Active</span>
                        </label>
                      </div>
                      
                      <div className="md:col-span-2 flex space-x-3">
                        <button
                          type="submit"
                          className="btn-primary"
                          disabled={updateChecklistMutation.isLoading}
                        >
                          {updateChecklistMutation.isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    // Display Mode
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0 mt-1">
                          <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-medium text-gray-900">
                              {checklist.name}
                            </h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              checklist.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {checklist.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {checklist.category}
                            </span>
                          </div>
                          
                          {checklist.description && (
                            <p className="text-gray-600 mb-3">{checklist.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            {checklist.estimatedCost > 0 && (
                              <span>Cost: ${checklist.estimatedCost.toLocaleString()}</span>
                            )}
                            {checklist.processingTime && (
                              <span>Processing: {checklist.processingTime}</span>
                            )}
                            <span>Order: {checklist.order}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditClick(checklist)}
                          className="text-primary-600 hover:text-primary-500 p-2 rounded-md hover:bg-primary-50"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteChecklist(checklist.id)}
                          className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CountyChecklistModal;
