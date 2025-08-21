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
      references: {
        model: 'permits',
        key: 'id'
      }
    },
    checklistId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'checklists',
        key: 'id'
      }
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    completedDate: {
      type: DataTypes.DATE
    },
    notes: {
      type: DataTypes.TEXT
    },
    assignedTo: {
      type: DataTypes.UUID,
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
      validate: {
        min: 0
      }
    },
    actualHours: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  });

  return PermitChecklist;
};
