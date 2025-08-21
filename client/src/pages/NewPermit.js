import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { permitsAPI, countiesAPI } from '../services/api';
import { 
  FileText, 
  MapPin, 
  Building2, 
  DollarSign,
  Save,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const NewPermit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: countiesData } = useQuery('counties', () =>
    countiesAPI.getAll()
  );

  const counties = countiesData?.counties || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      projectType: 'residential',
      estimatedCost: ''
    }
  });

  const projectType = watch('projectType');

  const createPermitMutation = useMutation(
    (permitData) => permitsAPI.create(permitData),
    {
      onSuccess: (data) => {
        toast.success('Permit created successfully!');
        queryClient.invalidateQueries('permits');
        navigate(`/permits/${data.permit.id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to create permit');
      }
    }
  );

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await createPermitMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  const projectTypes = [
    { value: 'residential', label: 'Residential', description: 'Single-family homes, apartments, etc.' },
    { value: 'commercial', label: 'Commercial', description: 'Office buildings, retail spaces, etc.' },
    { value: 'industrial', label: 'Industrial', description: 'Factories, warehouses, etc.' },
    { value: 'renovation', label: 'Renovation', description: 'Existing building modifications' },
    { value: 'new_construction', label: 'New Construction', description: 'Building from ground up' }
  ];

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
              <h1 className="text-3xl font-bold text-gray-900">New Permit</h1>
              <p className="mt-2 text-gray-600">
                Create a new construction permit application
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="projectName" className="label">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                id="projectName"
                type="text"
                className={`input ${errors.projectName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter project name"
                {...register('projectName', {
                  required: 'Project name is required',
                  minLength: {
                    value: 3,
                    message: 'Project name must be at least 3 characters'
                  }
                })}
              />
              {errors.projectName && (
                <p className="mt-1 text-sm text-red-600">{errors.projectName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="projectAddress" className="label">
                Project Address <span className="text-red-500">*</span>
              </label>
              <textarea
                id="projectAddress"
                rows={3}
                className={`input ${errors.projectAddress ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter full project address"
                {...register('projectAddress', {
                  required: 'Project address is required'
                })}
              />
              {errors.projectAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.projectAddress.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="projectType" className="label">
                  Project Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="projectType"
                  className={`input ${errors.projectType ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  {...register('projectType', {
                    required: 'Project type is required'
                  })}
                >
                  {projectTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {projectType && (
                  <p className="mt-1 text-sm text-gray-500">
                    {projectTypes.find(t => t.value === projectType)?.description}
                  </p>
                )}
                {errors.projectType && (
                  <p className="mt-1 text-sm text-red-600">{errors.projectType.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="estimatedCost" className="label">
                  Estimated Cost
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="estimatedCost"
                    type="number"
                    step="0.01"
                    min="0"
                    className={`input pl-10 ${errors.estimatedCost ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="0.00"
                    {...register('estimatedCost', {
                      min: {
                        value: 0,
                        message: 'Cost must be positive'
                      }
                    })}
                  />
                </div>
                {errors.estimatedCost && (
                  <p className="mt-1 text-sm text-red-600">{errors.estimatedCost.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* County Selection */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">County & Location</h3>
          </div>
          <div className="p-6">
            <div>
              <label htmlFor="countyId" className="label">
                County <span className="text-red-500">*</span>
              </label>
              <select
                id="countyId"
                className={`input ${errors.countyId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                {...register('countyId', {
                  required: 'County selection is required'
                })}
              >
                <option value="">Select a county</option>
                {counties.map(county => (
                  <option key={county.id} value={county.id}>
                    {county.name}, {county.state}
                  </option>
                ))}
              </select>
              {errors.countyId && (
                <p className="mt-1 text-sm text-red-600">{errors.countyId.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Additional Details</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="description" className="label">
                Project Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="input"
                placeholder="Describe your project in detail..."
                {...register('description')}
              />
            </div>

            <div>
              <label htmlFor="notes" className="label">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                className="input"
                placeholder="Any additional notes or special requirements..."
                {...register('notes')}
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/permits')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Create Permit
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPermit;
