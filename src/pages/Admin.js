
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  MapPin, 
  FileText, 
  Plus,
  Trash2
} from 'lucide-react';

function Admin() {
  // All hooks at the top - unconditional
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  // All queries with enabled conditions
  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
    enabled: !!user && user.role === 'admin'
  });
  
  const countiesQuery = useQuery({
    queryKey: ['counties'],
    queryFn: () => fetch('/api/counties').then(res => res.json()),
    enabled: !!user && user.role === 'admin'
  });
  
  const checklistsQuery = useQuery({
    queryKey: ['checklists'],
    queryFn: () => fetch('/api/checklists').then(res => res.json()),
    enabled: !!user && user.role === 'admin'
  });
  
  const createUserMutation = useMutation({
    mutationFn: (userData) => fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
  });
  
  const deleteUserMutation = useMutation({
    mutationFn: (userId) => fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    })
  });
  
  // Conditional rendering after all hooks
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  // Component logic and JSX here
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      {/* Your admin dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Users section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Users</h2>
          </div>
          {/* Users content */}
        </div>
        
        {/* Counties section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <MapPin className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold">Counties</h2>
          </div>
          {/* Counties content */}
        </div>
        
        {/* Checklists section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold">Checklists</h2>
          </div>
          {/* Checklists content */}
        </div>
      </div>
    </div>
  );
}

export default Admin;
