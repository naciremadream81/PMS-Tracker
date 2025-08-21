import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Building, 
  Phone, 
  Lock, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const profileForm = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      company: user?.company || '',
      phone: user?.phone || ''
    }
  });

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const onProfileSubmit = async (data) => {
    try {
      const result = await updateProfile(data);
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditingProfile(false);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      const result = await changePassword(data.currentPassword, data.newPassword);
      if (result.success) {
        toast.success('Password changed successfully!');
        setIsChangingPassword(false);
        passwordForm.reset();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="mt-2 text-gray-600">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="btn-secondary"
              >
                {isEditingProfile ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>
          <div className="p-6">
            {isEditingProfile ? (
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="label">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="firstName"
                        type="text"
                        className={`input pl-10 ${profileForm.formState.errors.firstName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="First name"
                        {...profileForm.register('firstName', {
                          required: 'First name is required',
                          minLength: {
                            value: 2,
                            message: 'First name must be at least 2 characters'
                          }
                        })}
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    {profileForm.formState.errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileForm.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="label">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="lastName"
                        type="text"
                        className={`input pl-10 ${profileForm.formState.errors.lastName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                        placeholder="Last name"
                        {...profileForm.register('lastName', {
                          required: 'Last name is required',
                          minLength: {
                            value: 2,
                            message: 'Last name must be at least 2 characters'
                          }
                        })}
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    {profileForm.formState.errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">
                        {profileForm.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="label">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      className="input pl-10 bg-gray-50"
                      value={user?.email || ''}
                      disabled
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Email address cannot be changed
                  </p>
                </div>

                <div>
                  <label htmlFor="company" className="label">
                    Company
                  </label>
                  <div className="relative">
                    <input
                      id="company"
                      type="text"
                      className={`input pl-10 ${profileForm.formState.errors.company ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Company name"
                      {...profileForm.register('company')}
                    />
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {profileForm.formState.errors.company && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileForm.formState.errors.company.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="label">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      type="tel"
                      className={`input pl-10 ${profileForm.formState.errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Phone number"
                      {...profileForm.register('phone')}
                    />
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  {profileForm.formState.errors.phone && (
                    <p className="mt-1 text-sm text-red-600">
                      {profileForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">First Name</label>
                    <p className="text-gray-900">{user?.firstName || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="label">Last Name</label>
                    <p className="text-gray-900">{user?.lastName || 'Not specified'}</p>
                  </div>
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <p className="text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <label className="label">Company</label>
                  <p className="text-gray-900">{user?.company || 'Not specified'}</p>
                </div>

                <div>
                  <label className="label">Phone Number</label>
                  <p className="text-gray-900">{user?.phone || 'Not specified'}</p>
                </div>

                <div>
                  <label className="label">Account Type</label>
                  <p className="text-gray-900 capitalize">{user?.role || 'user'}</p>
                </div>

                <div>
                  <label className="label">Member Since</label>
                  <p className="text-gray-900">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
              <button
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="btn-secondary"
              >
                {isChangingPassword ? 'Cancel' : 'Change Password'}
              </button>
            </div>
          </div>
          <div className="p-6">
            {isChangingPassword ? (
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="label">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${passwordForm.formState.errors.currentPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Current password"
                      {...passwordForm.register('currentPassword', {
                        required: 'Current password is required'
                      })}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="label">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${passwordForm.formState.errors.newPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="New password"
                      {...passwordForm.register('newPassword', {
                        required: 'New password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="label">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`input pl-10 pr-10 ${passwordForm.formState.errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Confirm new password"
                      {...passwordForm.register('confirmPassword', {
                        required: 'Please confirm your new password',
                        validate: value => value === passwordForm.watch('newPassword') || 'Passwords do not match'
                      })}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Lock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Password Security</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Keep your account secure by using a strong password and updating it regularly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
