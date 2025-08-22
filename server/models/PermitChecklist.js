module.exports = (sequelize, DataTypes) => {
  const PermitChecklist = sequelize.define('PermitChecklist', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    permitId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'permit_id', // Map to database column
      references: {
        model: 'permits',
        key: 'id'
      }
    },
    checklistId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'checklist_id', // Map to database column
      references: {
        model: 'checklists',
        key: 'id'
      }
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_completed' // Map to database column
    },
    completedDate: {
      type: DataTypes.DATE,
      field: 'completed_date' // Map to database column
    },
    notes: {
      type: DataTypes.TEXT
    },
    assignedTo: {
      type: DataTypes.UUID,
      field: 'assigned_to', // Map to database column
      references: {
        model: 'users',
        key: 'id'
      }
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'medium'
    },
    estimatedHours: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      field: 'estimated_hours', // Map to database column
      validate: {
        min: 0
      }
    },
    actualHours: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      field: 'actual_hours', // Map to database column
      validate: {
        min: 0
      }
    }
  }, {
    // Table name mapping
    tableName: 'permit_checklists',
    // Map timestamp fields to database columns
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return PermitChecklist;
};
